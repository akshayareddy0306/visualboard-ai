import { create, all } from 'mathjs';

const math = create(all, {});

/**
 * Evaluates a single mathjs expression within a scope.
 * Returns numeric value, or formatted string if complex/matrix, or fallback if error.
 */
export function safeEvaluate(expr, scope = {}) {
  if (typeof expr === 'number') return expr;
  if (!expr || typeof expr !== 'string') return expr;

  // Clean common non-mathjs tokens or latex artifacts
  let clean = expr
    .trim()
    .replace(/\\pi/g, 'pi')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/[\$]/g, '');

  try {
    const res = math.evaluate(clean, scope);
    if (typeof res === 'number') {
      return Number.isFinite(res) ? Math.round(res * 1e6) / 1e6 : res;
    }
    if (res && typeof res.toArray === 'function') {
      return res.toArray();
    }
    return res;
  } catch (err) {
    console.warn(`mathjs eval warning for "${expr}":`, err.message);
    return expr;
  }
}

/**
 * Deeply traverses an object's geometry attributes and evaluates any mathjs string expressions.
 */
function evaluateValue(val, scope) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // If it's a numeric string or formula, evaluate it
    const trimmed = val.trim();
    // Don't evaluate hex colors or text labels
    if (trimmed.startsWith('#') || trimmed.length > 80 || /^[a-zA-Z\s]{4,}$/.test(trimmed)) {
      return val;
    }
    try {
      const evaluated = safeEvaluate(trimmed, scope);
      return typeof evaluated === 'number' ? evaluated : val;
    } catch {
      return val;
    }
  }
  if (Array.isArray(val)) {
    return val.map((item) => evaluateValue(item, scope));
  }
  if (val && typeof val === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(val)) {
      // Don't evaluate id, type, label, color, fill, stroke, text
      if (['id', 'type', 'label', 'color', 'fill', 'stroke', 'text'].includes(k)) {
        res[k] = v;
      } else {
        res[k] = evaluateValue(v, scope);
      }
    }
    return res;
  }
  return val;
}

/**
 * Main evaluation engine for VisualBoard AI.
 * Computes all calculations, final answer, and object coordinate expressions.
 */
export function evaluateScene(scene, customParamValues = {}) {
  if (!scene) return null;

  // 1. Build initial evaluation scope from parameters
  const scope = {
    pi: Math.PI,
    e: Math.E,
  };

  if (scene.parameters && Array.isArray(scene.parameters)) {
    for (const p of scene.parameters) {
      const val = customParamValues[p.name] !== undefined ? customParamValues[p.name] : p.value;
      scope[p.name] = Number(val);
    }
  }

  // 2. Evaluate sequential calculations (results enrich scope)
  const computedCalculations = [];
  if (scene.calculations && Array.isArray(scene.calculations)) {
    for (const calc of scene.calculations) {
      const val = safeEvaluate(calc.expression, scope);
      computedCalculations.push({
        label: calc.label,
        expression: calc.expression,
        value: val,
        unit: calc.unit || '',
      });
      // Allow label or sanitized identifier into scope
      const varName = calc.label.replace(/[^a-zA-Z0-9_]/g, '_');
      if (varName && typeof val === 'number') {
        scope[varName] = val;
      }
    }
  }

  // 3. Evaluate Final Answer
  let finalAnswer = null;
  if (scene.finalAnswerExpression) {
    try {
      const evaluated = safeEvaluate(scene.finalAnswerExpression, scope);
      if (typeof evaluated === 'number') {
        // Format nicely: integers as is, floats up to 4 decimal places
        finalAnswer = Number.isInteger(evaluated) ? evaluated : Math.round(evaluated * 1e4) / 1e4;
      } else {
        finalAnswer = evaluated;
      }
    } catch (err) {
      finalAnswer = scene.finalAnswerExpression;
    }
  }

  // 4. Evaluate all dynamic properties of Scene Objects
  const evaluatedObjects = (scene.objects || []).map((obj) => evaluateValue(obj, scope));

  return {
    scope,
    computedCalculations,
    finalAnswer,
    evaluatedObjects,
  };
}
