import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { PORT, GEMINI_MODEL, GEMINI_API_KEY } from './config.js';
import { analyzeMathQuestion } from './gemini.js';
import { evaluateScene } from './evaluator.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Health tracking state updated by real test calls
let healthStatus = {
  geminiWorking: false,
  model: GEMINI_MODEL,
  error: null,
  lastChecked: null,
};

/**
 * Perform one real test call to Gemini API on startup and record exact result.
 */
async function performStartupGeminiTest() {
  console.log(`[STARTUP] Testing Gemini API connection with model: "${GEMINI_MODEL}"...`);
  if (!GEMINI_API_KEY) {
    healthStatus = {
      geminiWorking: false,
      model: GEMINI_MODEL,
      error: 'GEMINI_API_KEY is missing in server/.env',
      lastChecked: new Date().toISOString(),
    };
    console.error('[STARTUP] ❌ GEMINI_API_KEY is not defined in server/.env');
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: 'Ping: Return JSON {"status": "ok"}',
      config: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    if (text.includes('ok')) {
      healthStatus = {
        geminiWorking: true,
        model: GEMINI_MODEL,
        error: null,
        lastChecked: new Date().toISOString(),
      };
      console.log(`[STARTUP] ✅ Gemini API connected successfully! (Model: ${GEMINI_MODEL})`);
    } else {
      healthStatus = {
        geminiWorking: true,
        model: GEMINI_MODEL,
        error: null,
        lastChecked: new Date().toISOString(),
      };
      console.log(`[STARTUP] ✅ Gemini API responded: ${text.slice(0, 80)}`);
    }
  } catch (err) {
    healthStatus = {
      geminiWorking: false,
      model: GEMINI_MODEL,
      error: err.message,
      lastChecked: new Date().toISOString(),
    };
    console.error(`[STARTUP] ❌ Gemini API test call failed: ${err.message}`);
  }
}

/**
 * GET /api/health
 * Returns geminiWorking from real call (not just "key exists")
 */
app.get('/api/health', async (req, res) => {
  // If user requests explicit refresh via ?refresh=true
  if (req.query.refresh === 'true') {
    await performStartupGeminiTest();
  }
  res.json(healthStatus);
});

/**
 * POST /api/analyze
 * Body: { inputType: "text" | "image", content: string }
 */
app.post('/api/analyze', async (req, res) => {
  const { inputType, content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Content is required (either math question text or canvas base64 image).',
    });
  }

  console.log(`\n================== [NEW REQUEST: ${inputType.toUpperCase()}] ==================`);
  console.log(`Raw Question / Input: ${inputType === 'text' ? content : '[Canvas/Image Base64 Data]'}`);

  try {
    const result = await analyzeMathQuestion({ inputType, content });

    if (result.failed) {
      console.warn(`[REJECTED] Analysis could not be completed reliably: ${result.error}`);
      return res.status(422).json({
        success: false,
        errorType: result.errorType,
        message: 'This question could not be reliably solved or visualized yet.',
        partialUnderstanding: result.partialUnderstanding,
      });
    }

    const { scene, rawJson } = result;

    // Safety check: Confidence < 0.6
    if (scene.confidence < 0.6) {
      console.warn(`[SAFETY] Confidence too low (${scene.confidence}). Refusing to generate fake visual.`);
      return res.status(422).json({
        success: false,
        errorType: 'LOW_CONFIDENCE',
        message: 'This question could not be reliably solved or visualized yet.',
        understanding: scene.understanding,
      });
    }

    // Evaluate all mathjs expressions, calculations, and object coordinates
    const computed = evaluateScene(scene);

    // Logging per request per requirement:
    // "Log per request: raw question, Gemini JSON, computed values, rendered object types."
    console.log(`\n--- Gemini JSON ---`);
    console.log(JSON.stringify(rawJson, null, 2));

    console.log(`\n--- Computed Values (mathjs) ---`);
    console.log(`Final Answer:`, computed.finalAnswer);
    console.log(`Calculations:`, computed.computedCalculations);

    const renderedObjectTypes = scene.objects.map((o) => `${o.type} (#${o.id})`);
    console.log(`\n--- Rendered Object Types ---`);
    console.log(renderedObjectTypes.join(', '));
    console.log(`==================================================================\n`);

    res.json({
      success: true,
      scene: {
        ...scene,
        objects: computed.evaluatedObjects, // send evaluated objects to frontend
      },
      rawScene: scene, // preserves formula strings for exploration sliders
      computedValues: {
        finalAnswer: computed.finalAnswer,
        calculations: computed.computedCalculations,
        scope: computed.scope,
      },
    });
  } catch (err) {
    console.error(`[ERROR] /api/analyze failed:`, err.message);
    res.status(500).json({
      success: false,
      message: 'This question could not be reliably solved or visualized yet.',
      error: err.message,
    });
  }
});

/**
 * POST /api/evaluate
 * Body: { scene, parameters }
 * Evaluates mathjs expressions dynamically when sliders change
 */
app.post('/api/evaluate', (req, res) => {
  const { scene, parameters } = req.body;
  if (!scene) {
    return res.status(400).json({ error: 'Scene is required' });
  }

  const computed = evaluateScene(scene, parameters || {});
  res.json({
    success: true,
    computedValues: {
      finalAnswer: computed.finalAnswer,
      calculations: computed.computedCalculations,
      scope: computed.scope,
    },
    evaluatedObjects: computed.evaluatedObjects,
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`VisualBoard AI backend server running on http://127.0.0.1:${PORT}`);
  // Perform real startup test call to Gemini API
  await performStartupGeminiTest();
});
