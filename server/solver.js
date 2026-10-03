import { create, all } from 'mathjs';
import { GoogleGenAI } from '@google/genai';

const math = create(all, {});

// Supported Gemini Model
export const GEMINI_SOLVER_MODEL = 'gemini-3.8-flash';

/**
 * 1. Clean the input:
 * - Join broken lines
 * - Normalize unicode math (², √, π, ≤, ≥, ≠, ×, ÷, ±, °, θ)
 */
export function cleanInput(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return '';

  let text = rawInput;

  // 1. Join broken lines (collapse multiple lines into single fluid expression)
  text = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ');

  // 2. Normalize Unicode exponents / superscripts
  const superscripts = {
    '⁰': '^0', '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4',
    '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9',
    '⁺': '^+', '⁻': '^-', 'ⁿ': '^n'
  };
  for (const [sup, repl] of Object.entries(superscripts)) {
    text = text.replaceAll(sup, repl);
  }

  // 3. Normalize square root symbols
  text = text
    .replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)')
    .replace(/√\s*([a-zA-Z0-9]+)/g, 'sqrt($1)')
    .replace(/√/g, 'sqrt')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt/g, 'sqrt');

  // 4. Normalize Pi
  text = text
    .replace(/π/g, 'pi')
    .replace(/\\pi/g, 'pi');

  // 5. Normalize inequalities
  text = text
    .replace(/≤/g, '<=')
    .replace(/\\le(q)?\b/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/\\ge(q)?\b/g, '>=')
    .replace(/≠/g, '!=')
    .replace(/\\neq\b/g, '!=');

  // 6. Normalize arithmetic operators
  text = text
    .replace(/×/g, '*')
    .replace(/\\times\b/g, '*')
    .replace(/\\cdot\b/g, '*')
    .replace(/÷/g, '/')
    .replace(/±/g, '+-')
    .replace(/\\pm\b/g, '+-');

  // 7. Greek letters & angles
  text = text
    .replace(/θ/g, 'theta')
    .replace(/\\theta\b/g, 'theta')
    .replace(/α/g, 'alpha')
    .replace(/\\alpha\b/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/\\beta\b/g, 'beta')
    .replace(/°/g, ' deg');

  // 8. Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * System prompt with strict JSON schema and worked examples for:
 * - Quadratic equation
 * - Trigonometric statement evaluation
 * - Circle geometry
 * - 3D geometry
 */
export const SOLVER_SYSTEM_INSTRUCTION = `
You are VisualBoard AI's deterministic mathematical solver.
Analyze the user's math problem and produce a strictly verified mathematical JSON specification.

SCHEMA REQUIREMENTS (Strict JSON only, no markdown, no other keys):
{
  "subject": "Mathematics",
  "topic": "string (e.g. Algebra, Trigonometry, Coordinate Geometry, 3D Geometry, Calculus)",
  "problem_type": "string (e.g. quadratic_equation, trigonometric_evaluation, circle_geometry, solid_3d, multiple_choice)",
  "given": "object or string with extracted given data",
  "find": "string explaining what needs to be solved",
  "variables": {
    "name": "valid mathjs expression string"
  },
  "checks": [
    { "label": "string", "expr": "valid boolean mathjs expression string" }
  ],
  "steps": [
    "step-by-step mathematical reasoning explanation"
  ],
  "final_answer": "exact final answer expression or string",
  "visualization": {
    "type": "PARABOLA" | "TRIG_GRAPH" | "CIRCLE" | "SOLID_3D" | "CONE" | "CYLINDER" | "SPHERE" | "STRAIGHT_LINE",
    "params": { ... }
  }
}

RULES:
1. Every entry in "variables" must be a pure MathJS-compatible expression string (e.g. "b^2 - 4*a*c", "sqrt(dx^2 + dy^2)", "pi * r^2 * h / 3").
2. "checks" must be boolean assertions evaluated by MathJS (e.g. "D >= 0", "radius > 0", "abs(term1 - 2) < 1e-4").
3. DO NOT fabricate arithmetic. MathJS will evaluate all variables and checks deterministically.
4. If options (A, B, C, D) are given, state the option letter and value in final_answer.

WORKED EXAMPLES:

--- Example 1: Quadratic Equation ---
Input: "Solve 3x^2 - 7x + 2 = 0"
Output:
{
  "subject": "Mathematics",
  "topic": "Algebra",
  "problem_type": "quadratic_equation",
  "given": { "equation": "3x^2 - 7x + 2 = 0" },
  "find": "Roots of x",
  "variables": {
    "a": "3",
    "b": "-7",
    "c": "2",
    "D": "b^2 - 4*a*c",
    "root1": "(-b - sqrt(D)) / (2*a)",
    "root2": "(-b + sqrt(D)) / (2*a)",
    "vertexX": "-b / (2*a)",
    "vertexY": "a * vertexX^2 + b * vertexX + c"
  },
  "checks": [
    { "label": "Discriminant non-negative for real roots", "expr": "D >= 0" },
    { "label": "Sum of roots equals -b/a", "expr": "abs((root1 + root2) - (-b/a)) < 1e-4" }
  ],
  "steps": [
    "Identify standard form coefficients: a = 3, b = -7, c = 2.",
    "Calculate discriminant D = b^2 - 4ac = (-7)^2 - 4(3)(2) = 25.",
    "Since D > 0, compute real roots using quadratic formula: x = (7 +- sqrt(25)) / 6.",
    "The roots are root1 = 1/3 and root2 = 2."
  ],
  "final_answer": "x = 1/3 or x = 2",
  "visualization": {
    "type": "PARABOLA",
    "params": {
      "a": 3,
      "b": -7,
      "c": 2,
      "vertex": { "x": 1.17, "y": -2.08 },
      "roots": [0.333, 2]
    }
  }
}

--- Example 2: Trigonometric Statement Evaluation ---
Input: "Evaluate 4*sin(pi/6) + 3*cos(pi/3) + tan(pi/4)"
Output:
{
  "subject": "Mathematics",
  "topic": "Trigonometry",
  "problem_type": "trigonometric_evaluation",
  "given": { "expression": "4*sin(pi/6) + 3*cos(pi/3) + tan(pi/4)" },
  "find": "Exact numerical value",
  "variables": {
    "t1": "4 * sin(pi / 6)",
    "t2": "3 * cos(pi / 3)",
    "t3": "tan(pi / 4)",
    "answer": "t1 + t2 + t3"
  },
  "checks": [
    { "label": "First term is 2", "expr": "abs(t1 - 2) < 1e-4" },
    { "label": "Second term is 1.5", "expr": "abs(t2 - 1.5) < 1e-4" },
    { "label": "Third term is 1", "expr": "abs(t3 - 1) < 1e-4" }
  ],
  "steps": [
    "Step 1: Compute sin(pi/6) = 0.5, so 4*sin(pi/6) = 2.",
    "Step 2: Compute cos(pi/3) = 0.5, so 3*cos(pi/3) = 1.5.",
    "Step 3: Compute tan(pi/4) = 1.",
    "Step 4: Sum the terms: 2 + 1.5 + 1 = 4.5."
  ],
  "final_answer": "4.5",
  "visualization": {
    "type": "TRIG_GRAPH",
    "params": {
      "func": "sin",
      "amplitude": 4,
      "frequency": 1,
      "verticalShift": 2.5
    }
  }
}

--- Example 3: Circle Geometry ---
Input: "Find the center, radius, and area of x^2 + y^2 - 6x + 8y - 11 = 0"
Output:
{
  "subject": "Mathematics",
  "topic": "Coordinate Geometry",
  "problem_type": "circle_geometry",
  "given": { "equation": "x^2 + y^2 - 6x + 8y - 11 = 0" },
  "find": "Center, radius, and area",
  "variables": {
    "g": "-6 / 2",
    "f": "8 / 2",
    "c": "-11",
    "centerX": "-g",
    "centerY": "-f",
    "rSq": "g^2 + f^2 - c",
    "radius": "sqrt(rSq)",
    "area": "pi * radius^2"
  },
  "checks": [
    { "label": "Radius squared is positive", "expr": "rSq > 0" },
    { "label": "Radius equals 6", "expr": "abs(radius - 6) < 1e-4" }
  ],
  "steps": [
    "Compare with general equation: x^2 + y^2 + 2gx + 2fy + c = 0.",
    "Determine coefficients: g = -3, f = 4, c = -11.",
    "Center is (-g, -f) = (3, -4).",
    "Radius r = sqrt(g^2 + f^2 - c) = sqrt(9 + 16 + 11) = sqrt(36) = 6.",
    "Area = pi * r^2 = 36 * pi."
  ],
  "final_answer": "Center: (3, -4), Radius: 6, Area: 36pi",
  "visualization": {
    "type": "CIRCLE",
    "params": {
      "centerX": 3,
      "centerY": -4,
      "radius": 6
    }
  }
}

--- Example 4: 3D Geometry ---
Input: "Calculate the volume and total surface area of a right circular cone with radius r = 6 cm and height h = 8 cm"
Output:
{
  "subject": "Mathematics",
  "topic": "3D Geometry",
  "problem_type": "solid_3d",
  "given": { "radius": 6, "height": 8 },
  "find": "Volume and total surface area of the cone",
  "variables": {
    "r": "6",
    "h": "8",
    "slantHeight": "sqrt(r^2 + h^2)",
    "volume": "(1/3) * pi * r^2 * h",
    "lateralArea": "pi * r * slantHeight",
    "totalArea": "pi * r * (r + slantHeight)"
  },
  "checks": [
    { "label": "Slant height is positive", "expr": "slantHeight > 0" },
    { "label": "Slant height equals 10", "expr": "abs(slantHeight - 10) < 1e-4" },
    { "label": "Volume is positive", "expr": "volume > 0" }
  ],
  "steps": [
    "Slant height l = sqrt(r^2 + h^2) = sqrt(36 + 64) = 10 cm.",
    "Volume V = (1/3)*pi*r^2*h = (1/3)*pi*(36)*(8) = 96*pi cm^3.",
    "Total surface area A = pi*r*(r + l) = pi*6*(6 + 10) = 96*pi cm^2."
  ],
  "final_answer": "Volume = 96pi cm^3, Total Surface Area = 96pi cm^2",
  "visualization": {
    "type": "CONE",
    "params": {
      "radius": 6,
      "height": 8,
      "slantHeight": 10
    }
  }
}
`;

/**
 * 2. Call Gemini and require JSON only using the schema
 */
export async function callGemini(promptText, apiKey, systemInstruction = SOLVER_SYSTEM_INSTRUCTION) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in server/.env');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_SOLVER_MODEL,
    contents: promptText,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const rawText = (response.text || '').trim();
  if (!rawText) {
    throw new Error('Gemini returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Invalid JSON returned by Gemini: ${err.message}`);
  }

  // Schema sanity check
  if (!parsed.variables || !parsed.final_answer) {
    throw new Error('Gemini response missing mandatory "variables" or "final_answer" schema fields.');
  }

  return parsed;
}

/**
 * 3. Verify with MathJS:
 * - Evaluate variables sequentially in scope
 * - Evaluate all checks
 * - Compute real numeric answer (Never trust LLM arithmetic)
 */
export function verifyWithMathJS(llmData) {
  if (!llmData || typeof llmData !== 'object') {
    return { verified: false, error: 'Invalid LLM response data structure' };
  }

  const { variables, checks, final_answer } = llmData;
  const scope = {
    pi: Math.PI,
    e: Math.E,
  };

  const computedVariables = {};
  const failedChecks = [];
  const passedChecks = [];

  // Evaluate variables
  if (variables && typeof variables === 'object') {
    for (const [varName, rawExpr] of Object.entries(variables)) {
      if (typeof rawExpr === 'number') {
        scope[varName] = rawExpr;
        computedVariables[varName] = rawExpr;
        continue;
      }
      if (typeof rawExpr !== 'string') continue;

      let cleanExpr = rawExpr
        .trim()
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\pi/g, 'pi')
        .replace(/[\$]/g, '');

      try {
        const val = math.evaluate(cleanExpr, scope);
        scope[varName] = val;
        computedVariables[varName] = typeof val === 'number'
          ? (Number.isFinite(val) ? Math.round(val * 1e6) / 1e6 : val)
          : val;
      } catch (err) {
        return {
          verified: false,
          error: `MathJS variable evaluation failed for "${varName} = ${rawExpr}": ${err.message}`,
          computedVariables,
        };
      }
    }
  }

  // Evaluate checks
  if (Array.isArray(checks)) {
    for (const check of checks) {
      if (!check || !check.expr) continue;
      let cleanCheck = check.expr
        .trim()
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\pi/g, 'pi')
        .replace(/[\$]/g, '');

      try {
        const checkResult = math.evaluate(cleanCheck, scope);
        const passed = Boolean(checkResult);
        if (passed) {
          passedChecks.push({ label: check.label || cleanCheck, expr: cleanCheck, value: checkResult });
        } else {
          failedChecks.push({ label: check.label || cleanCheck, expr: cleanCheck, value: checkResult });
        }
      } catch (err) {
        failedChecks.push({ label: check.label || cleanCheck, expr: cleanCheck, error: err.message });
      }
    }
  }

  if (failedChecks.length > 0) {
    return {
      verified: false,
      error: `MathJS arithmetic check failed: ${failedChecks.map((f) => f.label || f.expr).join('; ')}`,
      computedVariables,
      passedChecks,
      failedChecks,
    };
  }

  // Determine real numeric answer from MathJS evaluation
  let realNumericAnswer = null;
  const candidateKeys = ['answer', 'final_answer', 'result', 'volume', 'area', 'radius', 'root1', 'root2'];
  for (const k of candidateKeys) {
    if (computedVariables[k] !== undefined && typeof computedVariables[k] === 'number') {
      realNumericAnswer = computedVariables[k];
      break;
    }
  }
  if (realNumericAnswer === null) {
    const varKeys = Object.keys(computedVariables);
    if (varKeys.length > 0) {
      const lastVal = computedVariables[varKeys[varKeys.length - 1]];
      if (typeof lastVal === 'number') {
        realNumericAnswer = lastVal;
      }
    }
  }

  // Attempt to evaluate final_answer with MathJS if it's a numeric formula
  let evaluatedFinal = final_answer;
  if (typeof final_answer === 'string') {
    try {
      const cleaned = final_answer
        .replace(/^[a-zA-Z]+\s*=\s*/, '')
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\pi/g, 'pi')
        .replace(/[\$]/g, '');
      const parsedAns = math.evaluate(cleaned, scope);
      if (typeof parsedAns === 'number' && Number.isFinite(parsedAns)) {
        evaluatedFinal = Math.round(parsedAns * 1e4) / 1e4;
      }
    } catch {
      // keep final_answer as string
    }
  }

  return {
    verified: true,
    scope,
    computedVariables,
    passedChecks,
    realNumericAnswer,
    evaluatedFinal,
  };
}

/**
 * 4. Parse multiple-choice question options:
 * Matches formats like:
 * (A) 12  (B) 14  (C) 16  (D) 18
 * A) 12   B) 14   C) 16   D) 18
 * [A] 12  [B] 14  [C] 16  [D] 18
 */
export function parseMCQOptions(inputText) {
  if (!inputText || typeof inputText !== 'string') return null;

  const optRegex = /(?:^|\s|\n)(?:\(?\[?([A-D])\)?\]?[:.)\-]\s*)([^\n(]+?)(?=(?:\s*\(?\[?[A-D]\)?\]?[:.)\-]|$))/gi;
  const matches = [...inputText.matchAll(optRegex)];

  if (matches.length >= 2) {
    const options = {};
    for (const m of matches) {
      options[m[1].toUpperCase()] = m[2].trim();
    }
    return options;
  }
  return null;
}

/**
 * Main Solver Pipeline (Steps 1 - 7)
 */
export async function solveProblemPipeline(rawInput, { apiKey }) {
  // 1. Clean the input
  const cleaned = cleanInput(rawInput);
  if (!cleaned) {
    return {
      answer: null,
      steps: [],
      visualization: null,
      confidence: 'low',
      verified: false,
      error: 'Empty input provided. Cannot solve.',
    };
  }

  if (!apiKey) {
    return {
      answer: null,
      steps: [],
      visualization: null,
      confidence: 'low',
      verified: false,
      error: 'GEMINI_API_KEY is not configured in server/.env.',
    };
  }

  // 5. Run the solve twice and compare the final answers
  let run1Data, run2Data;
  try {
    const prompt1 = `Solve and output valid JSON for:\n${cleaned}`;
    const prompt2 = `Independently solve and output valid JSON for:\n${cleaned}`;

    // Run both calls
    const [res1, res2] = await Promise.all([
      callGemini(prompt1, apiKey),
      callGemini(prompt2, apiKey),
    ]);
    run1Data = res1;
    run2Data = res2;
  } catch (err) {
    console.error('[VisualBoard AI /solve] Gemini call error:', err.message);
    // 7. If anything fails, return an honest error. Never return "Solved" or hardcoded answers.
    return {
      answer: null,
      steps: [],
      visualization: null,
      confidence: 'low',
      verified: false,
      error: `Gemini API execution failed: ${err.message}`,
    };
  }

  // 3. Verify Run 1 with MathJS
  let mathJs1 = verifyWithMathJS(run1Data);
  if (!mathJs1.verified) {
    return {
      answer: null,
      steps: run1Data.steps || [],
      visualization: null,
      confidence: 'low',
      verified: false,
      error: mathJs1.error || 'MathJS verification failed on primary run.',
    };
  }

  // 3. Verify Run 2 with MathJS
  let mathJs2 = verifyWithMathJS(run2Data);

  // 4. For multiple-choice questions, evaluate each option separately with MathJS
  const mcqOptions = parseMCQOptions(cleaned);
  if (mcqOptions) {
    const optionValues = {};
    for (const [optLetter, optExpr] of Object.entries(mcqOptions)) {
      try {
        const cleanOpt = cleanInput(optExpr);
        const evalVal = math.evaluate(cleanOpt, mathJs1.scope || {});
        optionValues[optLetter] = typeof evalVal === 'number' ? evalVal : optExpr;
      } catch {
        optionValues[optLetter] = optExpr;
      }
    }

    // Determine which option matches MathJS computed value
    let mathJsMatchedOption = null;
    const computedVal = mathJs1.realNumericAnswer;
    if (typeof computedVal === 'number') {
      for (const [letter, val] of Object.entries(optionValues)) {
        if (typeof val === 'number' && Math.abs(val - computedVal) < 1e-3) {
          mathJsMatchedOption = letter;
          break;
        }
      }
    }

    // Extract LLM's chosen option
    const llmChosenMatch = (run1Data.final_answer || '').match(/\b([A-D])\b/i);
    const llmChosenOption = llmChosenMatch ? llmChosenMatch[1].toUpperCase() : null;

    // If they disagree, re-ask Gemini once, passing in the MathJS results
    if (mathJsMatchedOption && llmChosenOption && mathJsMatchedOption !== llmChosenOption) {
      console.warn(`[VisualBoard AI /solve] MCQ Disagreement: LLM picked ${llmChosenOption}, MathJS found ${mathJsMatchedOption}. Re-asking Gemini once with MathJS feedback...`);
      try {
        const reconciliationPrompt = `
The user asked: ${cleaned}

Deterministic MathJS verification computed the true answer as: ${computedVal}.
Evaluating each option with MathJS yielded:
${Object.entries(optionValues).map(([k, v]) => `Option ${k}: ${v}`).join('\n')}

MathJS verified that Option ${mathJsMatchedOption} is the correct mathematical answer, but your previous answer selected Option ${llmChosenOption}.
Please reconcile this discrepancy using the verified MathJS calculation and output strictly the corrected JSON according to the schema.
`;
        const reconciledData = await callGemini(reconciliationPrompt, apiKey);
        const reconciledMathJs = verifyWithMathJS(reconciledData);
        if (reconciledMathJs.verified) {
          run1Data = reconciledData;
          mathJs1 = reconciledMathJs;
        }
      } catch (reconcileErr) {
        console.warn('[VisualBoard AI /solve] Reconciliation call failed:', reconcileErr.message);
      }
    }
  }

  // 5. Compare the final answers of both runs
  let confidence = 'high';
  const ans1 = mathJs1.evaluatedFinal ?? run1Data.final_answer;
  const ans2 = mathJs2.evaluatedFinal ?? run2Data.final_answer;

  if (!mathJs2.verified) {
    confidence = 'low';
  } else if (typeof ans1 === 'number' && typeof ans2 === 'number') {
    if (Math.abs(ans1 - ans2) > 1e-3) {
      confidence = 'low';
    }
  } else {
    const s1 = String(ans1).toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = String(ans2).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s1 !== s2) {
      confidence = 'low';
    }
  }

  // 6. Return { answer, steps, visualization, confidence, verified: true/false }
  return {
    answer: ans1,
    steps: run1Data.steps || [],
    visualization: run1Data.visualization || null,
    confidence,
    verified: true,
    metadata: {
      subject: run1Data.subject,
      topic: run1Data.topic,
      problem_type: run1Data.problem_type,
      variables: mathJs1.computedVariables,
      passedChecks: mathJs1.passedChecks,
    },
  };
}
