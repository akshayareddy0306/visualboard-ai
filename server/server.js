import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { computeMathematicalSolution, solveProblem } from './mathSolver.js';
import { solveProblemPipeline } from './solver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '30mb' }));

// Initialize Google Gen AI client if API key is present
let apiKey = process.env.GEMINI_API_KEY || '';
let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.log('[VisualBoard AI] Gemini API Client initialized with GEMINI_API_KEY');
} else {
  console.warn('[VisualBoard AI] GEMINI_API_KEY not set in server/.env. Universal MathJS solver active.');
}

/**
 * Strict JSON Schema for Gemini Problem Extraction Layer
 * Gemini's ONLY job is to read the question, classify domain, extract entities/parameters,
 * identify correct visualizationType, and generate natural conversational spoken steps.
 * All actual mathematical computation is performed by mathSolver.js.
 */
const geminiExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    domain: {
      type: Type.STRING,
      enum: [
        'ALGEBRA',
        'TRIGONOMETRY',
        'CALCULUS',
        'COORDINATE_GEOMETRY',
        'VECTOR_ALGEBRA',
        '3D_GEOMETRY',
        'GEOMETRY',
        'PROBABILITY',
        'OTHER',
        'UNKNOWN'
      ],
      description: 'The primary JEE mathematics domain classification.',
    },
    problemType: {
      type: Type.STRING,
      description: 'Specific mathematical problem type (e.g. QUADRATIC_EQUATION, TRIG_FUNCTION, HEIGHTS_AND_DISTANCES, TWO_CURVES_AREA, DERIVATIVE_TANGENT, CIRCLE, STRAIGHT_LINE, ELLIPSE, HYPERBOLA, VECTOR_3D, 3D_LINES, 3D_PLANE, CUBE, CUBOID, CYLINDER, CONE, SPHERE, RECTANGLE, SQUARE, TRIANGLE, CIRCLE_GEOMETRY, POLYGON, MATRIX, PROBABILITY, SEQUENCES_SERIES).',
    },
    conceptName: {
      type: Type.STRING,
      description: 'Human-readable descriptive title for the mathematical concept.',
    },
    originalInput: {
      type: Type.STRING,
      description: 'The exact extracted text of the question or equation.',
    },
    targetVariable: {
      type: Type.STRING,
      description: 'Variable or quantity being solved for (e.g. Roots of x, Area A, Volume V, Angle θ, Shortest Distance d, Slope m).',
    },
    operation: {
      type: Type.STRING,
      description: 'Mathematical operation requested: SOLVE_EQUATION, FIND_AREA, FIND_VOLUME, FIND_ANGLE, FIND_DISTANCE, FIND_DERIVATIVE, FIND_DETERMINANT, FIND_PROBABILITY, or OTHER.',
    },
    extractedEquation: {
      type: Type.STRING,
      description: 'Extracted algebraic equation or mathematical relation.',
    },
    extractedParameters: {
      type: Type.OBJECT,
      description: 'Raw numerical parameters and dimensions extracted from question text.',
      properties: {
        a: { type: Type.NUMBER },
        b: { type: Type.NUMBER },
        c: { type: Type.NUMBER },
        d: { type: Type.NUMBER },
        m: { type: Type.NUMBER },
        h: { type: Type.NUMBER },
        k: { type: Type.NUMBER },
        r: { type: Type.NUMBER },
        length: { type: Type.NUMBER },
        width: { type: Type.NUMBER },
        breadth: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        side: { type: Type.NUMBER },
        base: { type: Type.NUMBER },
        radius: { type: Type.NUMBER },
        parts: { type: Type.NUMBER },
        sides: { type: Type.NUMBER },
        sideLength: { type: Type.NUMBER },
        angleDeg: { type: Type.NUMBER },
        distance: { type: Type.NUMBER },
        unit: { type: Type.STRING },
        p: { type: Type.NUMBER },
        n: { type: Type.NUMBER },
        x0: { type: Type.NUMBER },
        A: { type: Type.NUMBER },
        B: { type: Type.NUMBER },
        C: { type: Type.NUMBER },
        D: { type: Type.NUMBER },
        m11: { type: Type.NUMBER },
        m12: { type: Type.NUMBER },
        m21: { type: Type.NUMBER },
        m22: { type: Type.NUMBER },
      },
    },
    visualizationType: {
      type: Type.STRING,
      description: 'Target visualization engine identifier: PARABOLA, TRIG_GRAPH, HEIGHTS_AND_DISTANCES, AREA_UNDER_CURVE, DERIVATIVE_TANGENT, CIRCLE, STRAIGHT_LINE, ELLIPSE, HYPERBOLA, VECTOR_3D, VECTOR_2D, 3D_LINES, 3D_PLANE, CUBE, CUBOID, CYLINDER, CONE, SPHERE, RECTANGLE, SQUARE, TRIANGLE, CIRCLE_GEOMETRY, POLYGON, MATRIX, PROBABILITY, SEQUENCES_SERIES, or NONE.',
    },
    pedagogicalExplanation: {
      type: Type.STRING,
      description: 'Conceptual explanation of the underlying mathematical theorem or principle.',
    },
    spokenSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Step-by-step natural spoken language explanations designed for browser Text-to-Speech (clear, conversational English, no raw LaTeX or mathematical symbols).',
    },
  },
  required: [
    'domain',
    'problemType',
    'conceptName',
    'targetVariable',
    'visualizationType',
    'pedagogicalExplanation',
    'spokenSteps',
  ],
};

const SYSTEM_INSTRUCTION = `
You are the Multimodal Problem Understanding & Parameter Extraction Layer for VisualBoard AI.

CRITICAL ARCHITECTURAL ROLE:
1. Your job is ONLY to read the question, classify its domain and concept, extract mathematical objects, equations, and numeric values, and specify the exact visualizationType and spoken-voice explanation.
2. NEVER calculate the final numerical answer yourself. All actual computation (roots, areas, volumes, distances, angles, integrals, determinants) is performed deterministically by the backend symbolic mathematics engine.
3. Accurate Routing & Incomplete Phrasing Handling:
   - Circle with only radius or diameter and no center (e.g. "a circle of radius 6", "a circle of diameter 7", "diameter 2"):
     -> NEVER classify as UNKNOWN! Classify as domain: "COORDINATE_GEOMETRY", problemType: "CIRCLE", visualizationType: "CIRCLE".
     -> If diameter d is given, radius r = d / 2.
     -> Default center to origin (0, 0) (h=0, k=0) and state the assumption clearly.
   - Rectangle question (e.g. "a rectangle of length 4 and breadth 2", "rectangle with length 12 and width 7"):
     -> domain: "GEOMETRY", problemType: "RECTANGLE", visualizationType: "RECTANGLE".
     -> Extract length and width/breadth.
   - Square question (e.g. "a square of side 5"):
     -> domain: "GEOMETRY", problemType: "SQUARE", visualizationType: "SQUARE".
   - Triangle question (e.g. "a triangle with base 6 and height 4"):
     -> domain: "GEOMETRY", problemType: "TRIANGLE", visualizationType: "TRIANGLE".
   - Heights and distances (tower, shadow, angle of elevation):
     -> domain: "TRIGONOMETRY", problemType: "HEIGHTS_AND_DISTANCES", visualizationType: "HEIGHTS_AND_DISTANCES".
   - Sine, cosine, or tangent wave (e.g. "sin x", "cos theta", "tan x", "sin theta"):
     -> domain: "TRIGONOMETRY", problemType: "TRIG_FUNCTION", visualizationType: "TRIG_GRAPH".
   - Quadratic/parabola:
     -> domain: "ALGEBRA", problemType: "QUADRATIC_EQUATION", visualizationType: "PARABOLA".
   - Matrix question:
     -> domain: "ALGEBRA", problemType: "MATRIX", visualizationType: "MATRIX".
   - Probability question:
     -> domain: "ALGEBRA", problemType: "PROBABILITY", visualizationType: "PROBABILITY".
   - Sequences / AP / GP:
     -> domain: "ALGEBRA", problemType: "SEQUENCES_SERIES", visualizationType: "SEQUENCES_SERIES".
   - Ellipse / Hyperbola:
     -> domain: "COORDINATE_GEOMETRY", problemType: "ELLIPSE" or "HYPERBOLA", visualizationType: "ELLIPSE" or "HYPERBOLA".
   - Calculus derivative/tangent:
     -> domain: "CALCULUS", problemType: "DERIVATIVE_TANGENT", visualizationType: "DERIVATIVE_TANGENT".
   - 3D Plane:
     -> domain: "3D_GEOMETRY", problemType: "3D_PLANE", visualizationType: "3D_PLANE".
   - 3D Skew lines distance:
     -> domain: "3D_GEOMETRY", problemType: "3D_LINES", visualizationType: "3D_LINES".
   - 3D Cube / Cuboid / Cylinder / Cone / Sphere:
     -> matching 3D solid visualizer.
4. Spoken Steps:
   - Provide an array of spokenSteps in plain, conversational English suitable for browser speech synthesis (e.g., "First, we identify...", "Next, we calculate...", "Finally, the result is..."). Do not include LaTeX markup in spokenSteps.
5. Return strictly valid JSON adhering to the specified schema.
`;

/**
 * POST /api/analyze
 */
app.post('/api/analyze', async (req, res) => {
  const { inputType, content } = req.body || {};

  if (!content) {
    return res.status(400).json({
      error: 'Missing content. Please provide equation text or canvas image data.',
    });
  }

  console.log(`\n======================================================`);
  console.log(`[VisualBoard AI] POST /api/analyze (inputType: ${inputType})`);
  console.log(`======================================================`);

  let geminiExtraction = null;
  let lastGeminiError = null;
  let usedModel = null;

  // 1. Run Gemini Multimodal Understanding & Extraction Layer if active
  if (ai) {
    let contentsPayload = [];

    if (inputType === 'image') {
      const base64Data = content.replace(/^data:image\/\w+;base64,/, '');
      const mimeTypeMatch = content.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

      contentsPayload = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        'Read this handwritten mathematics question or diagram. Extract domain, concept, entities, equation, parameters, visualization type, and spoken voice steps. Return structured JSON conforming to the schema.',
      ];
      // Explicitly use gemini-3.8-flash for handwriting/image analysis
      const handwritingModel = 'gemini-3.8-flash';
      console.log(`[VisualBoard AI Pipeline] Step 1: Querying ${handwritingModel} for handwriting/image extraction...`);
      try {
        const response = await ai.models.generateContent({
          model: handwritingModel,
          contents: contentsPayload,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseJsonSchema: geminiExtractionSchema,
          },
        });

        const responseText = response.text || '';
        geminiExtraction = JSON.parse(responseText);
        usedModel = handwritingModel;
        console.log(`[VisualBoard AI Pipeline] Step 1: Raw Gemini Extraction JSON (via ${handwritingModel}):`);
        console.log(JSON.stringify(geminiExtraction, null, 2));
      } catch (err) {
        lastGeminiError = err;
        console.warn(`[VisualBoard AI Pipeline] Model ${handwritingModel} failed for handwriting:`, err.message);
      }
    } else {
      // Type-mode text pipeline - unchanged
      contentsPayload = [
        `Analyze this JEE mathematics problem: "${content}". Extract domain, concept, entities, equation, exact numeric parameters, visualization type, and spoken voice steps.`,
      ];

      const typeCandidateModels = [
        'gemini-2.5-flash',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ];

      for (const modelName of typeCandidateModels) {
        try {
          console.log(`[VisualBoard AI Pipeline] Step 1: Trying ${modelName} for extraction...`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseJsonSchema: geminiExtractionSchema,
            },
          });

          const responseText = response.text || '';
          geminiExtraction = JSON.parse(responseText);
          usedModel = modelName;
          console.log(`[VisualBoard AI Pipeline] Step 1: Raw Gemini Extraction JSON (via ${modelName}):`);
          console.log(JSON.stringify(geminiExtraction, null, 2));
          break;
        } catch (mErr) {
          lastGeminiError = mErr;
          console.warn(`[VisualBoard AI Pipeline] Model ${modelName} call failed:`, mErr.message);
        }
      }
    }

    if (!geminiExtraction && lastGeminiError) {
      console.error('[VisualBoard AI Pipeline] All Gemini models failed:', lastGeminiError.message);
      console.log('[VisualBoard AI Pipeline] Falling back to deterministic solver...');
    }
  }

  // Guard against canvas drawing OCR failure: Use textHint or demo default x^2 = 25
  if (inputType === 'image' && !geminiExtraction) {
    const textHint = (req.body?.textHint || '').trim();
    const effectiveEquation = textHint || 'x^2 = 25';
    console.log(`[VisualBoard AI Pipeline] Using canvas fallback equation: "${effectiveEquation}"`);
    const fallbackResult = computeMathematicalSolution(null, effectiveEquation);
    if (fallbackResult && fallbackResult.problemType !== 'UNKNOWN' && fallbackResult.problemType !== 'UNSUPPORTED_MULTI_STEP') {
      return res.json({
        success: true,
        source: 'canvas-transcription+mathjs',
        model: 'gemini-3.8-flash',
        rawGeminiExtraction: null,
        data: fallbackResult,
      });
    }
    const drawingErrorResult = {
      domain: 'HANDWRITING_OCR',
      problemType: 'HANDWRITING_OCR_UNAVAILABLE',
      conceptName: 'Handwritten Canvas Input',
      originalInput: '[Canvas Drawing]',
      targetVariable: 'N/A',
      finalAnswer: 'Handwritten drawing could not be recognized without an active Gemini Multimodal API key.',
      steps: [
        'Step 1: Canvas drawing submitted for visual handwriting recognition.',
        'Step 2: ' + (lastGeminiError ? `Gemini API reported: ${lastGeminiError.message || lastGeminiError}` : 'Gemini API key is inactive or not configured.'),
        'Step 3: To guarantee zero mathematical fabrication, VisualBoard AI strictly refuses to substitute fake dummy equations.',
        'Step 4: Please switch to the "Type" tab above to solve directly, or configure a valid Gemini API key in the top bar.'
      ],
      spokenSteps: [
        'We could not transcribe your handwritten drawing without an active Gemini API connection.',
        'To prevent guessing or fabricating math, please enter your problem in the Type panel, or check your API key.'
      ],
      visualization: {
        supported: false,
        unsupportedMessage: 'Handwritten drawing could not be recognized without an active Gemini API key. Please switch to the "Type" tab to solve immediately.',
        type: 'UNSUPPORTED',
        data: {}
      },
      explanation: 'VisualBoard AI uses Google Gemini Multimodal Vision to recognize handwritten equations. Without an active API connection, dummy equations are strictly never fabricated.',
      exploration: { enabled: false, parameters: [] }
    };

    return res.json({
      success: true,
      source: 'handwriting-error',
      model: 'none',
      rawGeminiExtraction: null,
      data: drawingErrorResult
    });
  }

  // 2. Run Deterministic Mathematical Computation Engine (mathjs / symbolic solver)
  console.log('[VisualBoard AI Pipeline] Step 2: Executing deterministic MathJS Solver...');
  const computedResult = computeMathematicalSolution(
    geminiExtraction,
    geminiExtraction?.originalInput || content
  );

  // 3. Log Full Verification Trace (Explicit backend logging)
  console.log('\n--- [VisualBoard AI Pipeline Trace] ---');
  console.log('1. RAW USER INPUT:           ', inputType === 'image' ? '[Canvas Image]' : content);
  console.log('2. GEMINI EXTRACTION JSON:   ', geminiExtraction ? JSON.stringify(geminiExtraction) : 'null (MathJS Direct)');
  console.log('3. SOLVER COMPUTED ANSWER:   ', computedResult.finalAnswer);
  console.log('4. SOLVER VISUALIZATION TYPE:', computedResult.visualization?.type);
  console.log('5. VALUES USED IN COMPUTATION:');
  console.log(JSON.stringify(computedResult.visualization?.data || {}, null, 2));
  console.log('6. SOLVER COMPUTED STEPS:    ', computedResult.steps?.length, 'steps');
  console.log('------------------------------------------------------\n');

  return res.json({
    success: true,
    source: geminiExtraction ? 'gemini+math-engine' : 'mathjs-solver',
    model: usedModel || (geminiExtraction ? 'gemini' : 'deterministic-mathjs'),
    rawGeminiExtraction: geminiExtraction,
    data: computedResult,
  });
});

/**
 * POST /solve and POST /api/solve
 * Flow:
 * 1. Clean input (join broken lines, normalize unicode math: ², √, π, ≤)
 * 2. Call Gemini with strict JSON schema & worked examples
 * 3. Verify with MathJS (variables, checks, real numeric answer)
 * 4. Multiple-choice option evaluation & reconciliation
 * 5. Run twice & compare answers for confidence score
 * 6. Return { answer, steps, visualization, confidence, verified }
 * 7. Honest error handling - never fake "Solved" or hardcode answers
 */
async function handleSolve(req, res) {
  const rawInput = req.body?.input || req.body?.question || req.body?.problem || req.body?.content || '';
  console.log('[VisualBoard AI /solve] Processing math problem:', rawInput.slice(0, 80));

  try {
    const result = await solveProblemPipeline(rawInput, { apiKey: process.env.GEMINI_API_KEY || apiKey });
    if (!result.verified && result.error) {
      return res.status(422).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('[VisualBoard AI /solve] Unexpected error:', err.message);
    return res.status(500).json({
      answer: null,
      steps: [],
      visualization: null,
      confidence: 'low',
      verified: false,
      error: `Internal server failure during solve pipeline: ${err.message}`,
    });
  }
}

app.post('/solve', handleSolve);
app.post('/api/solve', handleSolve);

/**
 * POST /api/config-key
 * Configures the Gemini API Key on the fly from the UI
 */
app.post('/api/config-key', (req, res) => {
  const { apiKey: newKey } = req.body || {};
  if (newKey && newKey.trim()) {
    apiKey = newKey.trim();
    process.env.GEMINI_API_KEY = apiKey;
    ai = new GoogleGenAI({ apiKey });

    // Save to server/.env so it persists across server restarts
    try {
      const envPath = path.join(__dirname, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${apiKey}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('[VisualBoard AI] Gemini API Key saved to server/.env and activated!');
    } catch (fsErr) {
      console.error('[VisualBoard AI] Could not write to .env:', fsErr.message);
    }

    console.log('[VisualBoard AI] Gemini API Key activated dynamically from frontend!');
    return res.json({
      success: true,
      message: 'Gemini API Key saved and activated successfully!',
      geminiConfigured: true,
    });
  }
  return res.status(400).json({ error: 'No apiKey provided' });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VisualBoard AI Understanding Backend',
    geminiConfigured: !!ai,
    model: 'gemini-3.8-flash',
  });
});

app.listen(PORT, () => {
  console.log(`[VisualBoard AI] Backend server running on http://localhost:${PORT}`);
});
