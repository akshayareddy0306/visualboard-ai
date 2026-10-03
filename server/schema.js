import { z } from 'zod';

// Allowed mathematical domains
export const DomainEnum = z.enum([
  'ALGEBRA',
  'TRIGONOMETRY',
  'GEOMETRY',
  'CALCULUS',
  'COORDINATE_GEOMETRY',
  'VECTORS',
  '3D_GEOMETRY',
]);

// Mode for visual scene
export const ModeEnum = z.enum(['2d', '3d']);

// Parameter schema for student exploration sliders
export const ParameterSchema = z.object({
  name: z.string().describe('Variable name used in mathjs formulas, e.g. "r", "h", "a", "theta"'),
  label: z.string().describe('Human readable label for slider, e.g. "Radius (r)", "Height (h)"'),
  value: z.number().describe('Default numeric starting value'),
  min: z.number().optional().default(0),
  max: z.number().optional().default(10),
  step: z.number().optional().default(0.1),
});

// Coordinate or value that can be a number or a mathjs expression string (e.g. "r * cos(theta)")
export const MathVal = z.union([z.number(), z.string()]);

// 2D & 3D Primitive Objects Schema
export const SceneObjectSchema = z.object({
  id: z.string().describe('Unique identifier for highlighting, e.g. "p1", "base_circle", "tangent_line"'),
  type: z.enum([
    // 2D primitives
    'point',
    'segment',
    'line',
    'ray',
    'vector',
    'polygon',
    'regular_polygon',
    'circle',
    'arc',
    'sector',
    'ellipse',
    'parabola',
    'hyperbola',
    'function_graph',
    'implicit_curve',
    'shaded_region',
    'angle_marker',
    'label',
    'axes_grid',
    // 3D primitives
    'box',
    'cylinder',
    'cone',
    'frustum',
    'sphere',
    'hemisphere',
    'prism',
    'pyramid',
    'plane',
    'line3d',
    'vector3d',
    'point3d',
    'cutting_plane',
    'dimension_label',
  ]),
  label: z.string().optional(),
  color: z.string().optional(),
  stroke: z.string().optional(),
  fill: z.string().optional(),
  opacity: z.number().optional(),
  dashed: z.boolean().optional(),
  wireframe: z.boolean().optional(),
}).passthrough(); // Allow specific geometry properties (vertices, radius, center, etc.)

// Calculations list evaluated by mathjs
export const CalculationSchema = z.object({
  label: z.string().describe('Label of the computed quantity, e.g. "Discriminant", "Area", "Dot Product"'),
  expression: z.string().describe('Pure mathjs expression, e.g. "b^2 - 4*a*c", "pi * r^2 * h / 3"'),
  unit: z.string().optional().describe('Unit string, e.g. "sq units", "cubic units", "rad"'),
});

// Step-by-step reasoning step
export const StepSchema = z.object({
  text: z.string().describe('Explanation step with LaTeX math expressions'),
  speech: z.string().optional().describe('Natural speaking narration text for Web Speech API'),
  highlight: z.array(z.string()).optional().default([]).describe('Array of object IDs to highlight in visualizer'),
});

// Main Scene Specification Schema
export const SceneSpecSchema = z.object({
  domain: DomainEnum,
  understanding: z.string().min(3).describe('One-line mathematical restatement of the question'),
  confidence: z.number().min(0).max(1).describe('Model confidence score between 0 and 1'),
  assumptions: z.array(z.string()).default([]).describe('Common-sense assumptions made, e.g. "Center assumed at origin"'),
  parameters: z.array(ParameterSchema).default([]),
  mode: ModeEnum,
  objects: z.array(SceneObjectSchema).min(1, 'Scene must have at least one visual object'),
  calculations: z.array(CalculationSchema).default([]),
  steps: z.array(StepSchema).min(1, 'At least one step of explanation is required'),
  finalAnswerExpression: z.string().min(1).describe('mathjs formula yielding final answer number/expression'),
});

// SceneSpec Zod schema export
