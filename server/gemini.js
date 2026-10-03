import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL, GEMINI_API_KEY } from './config.js';
import { SceneSpecSchema } from './schema.js';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are VisualBoard AI, an advanced mathematical reasoning and scene generation engine for School and JEE Main students.
Your task is to analyze mathematical problems (typed or handwritten diagrams) and produce an interactive geometric/algebraic scene specification.

CORE PRINCIPLES (STRICT):
1. ZERO HARDCODING: Do not specialize for presets or questions. Generate a general scene specification according to the schema.
2. NEVER COMPUTE FINAL NUMBERS YOURSELF: You must never hardcode computed answers or coordinates if they depend on parameters. Instead:
   - Define variables in "parameters" (with sensible defaults, min, max, step).
   - In "calculations", provide mathjs expressions (e.g. "pi * r^2 * h / 3", "sqrt(dx^2 + dy^2)", "b^2 - 4*a*c").
   - In "finalAnswerExpression", write the mathjs formula yielding the final numerical result.
3. DYNAMIC SCENE OBJECTS:
   - Provide visual objects whose coordinates, radii, vertices, or positions can use mathjs expressions involving parameter names (e.g. radius: "r", center: [0, 0], end: ["r*cos(theta)", "r*sin(theta)"]).
4. MODE:
   - Choose "2d" for 2D algebra, trigonometry, 2D vectors, calculus curves, 2D coordinate geometry, planar shapes.
   - Choose "3d" for solids (cone, sphere, cylinder, box, prism, pyramid, frustum), 3D planes, 3D vectors, 3D coordinate geometry.
5. ASSUMPTIONS:
   - If common-sense defaults are necessary (e.g. circle center unspecified -> assume origin (0, 0); triangle base on x-axis), explicitly list them in "assumptions".
6. CONFIDENCE & RECOGNITION:
   - If handwriting or text is completely illegible or non-mathematical, set confidence < 0.5.
   - If confidence is below 0.6, the app will safely decline rather than showing a fake visual.

OUTPUT FORMAT:
You must output ONLY a valid JSON object strictly matching this JSON schema:
{
  "domain": "ALGEBRA" | "TRIGONOMETRY" | "GEOMETRY" | "CALCULUS" | "COORDINATE_GEOMETRY" | "VECTORS" | "3D_GEOMETRY",
  "understanding": "One clear line restatement of the question",
  "confidence": 0.0 to 1.0,
  "assumptions": ["string", ...],
  "parameters": [
    { "name": "r", "label": "Radius (r)", "value": 3, "min": 0.5, "max": 10, "step": 0.1 }
  ],
  "mode": "2d" | "3d",
  "objects": [
    // 2D primitives: point, segment, line, ray, vector, polygon, regular_polygon, circle, arc, sector, ellipse, parabola, hyperbola, function_graph, implicit_curve, shaded_region, angle_marker, label, axes_grid
    // 3D primitives: box, cylinder, cone, frustum, sphere, hemisphere, prism, pyramid, plane, line3d, vector3d, point3d, cutting_plane, dimension_label
  ],
  "calculations": [
    { "label": "Volume", "expression": "(1/3) * pi * r^2 * h", "unit": "cubic units" }
  ],
  "steps": [
    {
      "text": "Step explanation with LaTeX: $V = \\\\frac{1}{3}\\\\pi r^2 h$",
      "speech": "The volume of a cone is one third pi r squared h.",
      "highlight": ["cone_1", "base_circle"]
    }
  ],
  "finalAnswerExpression": "pi * r^2 * h / 3"
}
`;

/**
 * Call Gemini to analyze math question (text or image) and return validated SceneSpec.
 */
export async function analyzeMathQuestion({ inputType, content }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in server/.env.');
  }

  const promptContent = [];

  if (inputType === 'image') {
    // Process base64 image data
    let base64Data = content;
    let mimeType = 'image/png';
    if (content.includes(';base64,')) {
      const parts = content.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/png';
      base64Data = parts[1];
    }
    promptContent.push({
      inlineData: {
        mimeType,
        data: base64Data,
      },
    });
    promptContent.push(
      'Transcribe this handwritten math problem or diagram, understand its core mathematical query, and output the SceneSpec JSON.'
    );
  } else {
    promptContent.push(`Solve and visualize this mathematical problem:\n${content}`);
  }

  // First attempt call to Gemini with temperature 0
  let rawJsonText = '';
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });

    rawJsonText = response.text || '';
  } catch (apiErr) {
    console.error('Gemini API call failed:', apiErr);
    throw new Error(`Gemini API error: ${apiErr.message}`);
  }

  // Parse and validate with Zod
  let parsedJson;
  try {
    parsedJson = JSON.parse(rawJsonText);
  } catch (parseErr) {
    console.warn('Initial JSON parse failed. Retrying with repair prompt...');
    return await retryWithRepair(promptContent, rawJsonText, `JSON Parse Error: ${parseErr.message}`);
  }

  const validation = SceneSpecSchema.safeParse(parsedJson);
  if (!validation.success) {
    console.warn('Initial Zod validation failed. Attempting 1 retry with error feedback...');
    return await retryWithRepair(promptContent, rawJsonText, JSON.stringify(validation.error.format()));
  }

  return {
    rawQuestion: inputType === 'text' ? content : '[Handwritten / Canvas Image]',
    rawJson: parsedJson,
    scene: validation.data,
  };
}

/**
 * ONE retry with error feedback if schema validation fails
 */
async function retryWithRepair(originalPrompt, invalidOutput, errorFeedback) {
  try {
    const repairPrompt = [
      ...originalPrompt,
      {
        text: `Your previous response had validation errors:\n${errorFeedback}\n\nPrevious output:\n${invalidOutput}\n\nPlease correct all issues and return strictly valid JSON according to the schema.`,
      },
    ];

    const retryResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: repairPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(retryResponse.text || '');
    const validation = SceneSpecSchema.safeParse(parsedJson);

    if (!validation.success) {
      return {
        failed: true,
        errorType: 'SCHEMA_VALIDATION_FAILED',
        error: 'Validation failed after retry',
        partialUnderstanding: parsedJson?.understanding || 'Could not construct a valid scene schema.',
      };
    }

    return {
      rawQuestion: '[Repaired Prompt]',
      rawJson: parsedJson,
      scene: validation.data,
    };
  } catch (retryErr) {
    console.error('Retry failed:', retryErr);
    return {
      failed: true,
      errorType: 'RETRY_FAILED',
      error: retryErr.message,
    };
  }
}
