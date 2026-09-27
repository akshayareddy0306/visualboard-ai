import React, { useState } from 'react';
import { Sparkles, Activity, ChevronDown, ChevronUp, Code, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';

// Visualizers
import ParabolaVisualizer from './visualizers/ParabolaVisualizer';
import TrigVisualizer from './visualizers/TrigVisualizer';
import AreaUnderCurveVisualizer from './visualizers/AreaUnderCurveVisualizer';
import CircleVisualizer from './visualizers/CircleVisualizer';
import StraightLineVisualizer from './visualizers/StraightLineVisualizer';
import Vector3DVisualizer from './visualizers/Vector3DVisualizer';
import Solid3DVisualizer from './visualizers/Solid3DVisualizer';
import Lines3DVisualizer from './visualizers/Lines3DVisualizer';
import CircleGeometryVisualizer from './visualizers/CircleGeometryVisualizer';
import RectangleVisualizer from './visualizers/RectangleVisualizer';
import SquareVisualizer from './visualizers/SquareVisualizer';
import TriangleVisualizer from './visualizers/TriangleVisualizer';
import Curved3DVisualizer from './visualizers/Curved3DVisualizer';
import HeightsDistancesVisualizer from './visualizers/HeightsDistancesVisualizer';
import DerivativeTangentVisualizer from './visualizers/DerivativeTangentVisualizer';
import ConicVisualizer from './visualizers/ConicVisualizer';
import MatrixVisualizer from './visualizers/MatrixVisualizer';
import ProbabilityVisualizer from './visualizers/ProbabilityVisualizer';
import SequenceVisualizer from './visualizers/SequenceVisualizer';
import Plane3DVisualizer from './visualizers/Plane3DVisualizer';
import PolygonVisualizer from './visualizers/PolygonVisualizer';

// Voice Assistant
import VoiceAssistant from './VoiceAssistant';

/**
 * Helper to bold/highlight key computed values, equations, and numbers in solution steps
 */
function HighlightedStep({ text }) {
  if (!text) return null;

  // Regex matches equations, numbers, metric units, and key equalities
  // e.g. x = 2, Area = 12 cm², V = 216 cm³, θ = 45°, etc.
  const parts = text.split(/([A-Za-z_]+(?:\([A-Za-z0-9_]+\))?\s*=\s*[^,;]+|\b\d+\.?\d*\s*(?:cm²|cm³|m²|m³|sq units|units|rad|°|cm|m)\b|[-+]?\b\d+\.?\d*\b|\b(?:Area|Volume|Perimeter|Diagonal|Slope|det\(A\)|Roots|θ|Δ)\b)/g);

  return (
    <span className="leading-relaxed text-[#FF4C4C]">
      {parts.map((part, idx) => {
        if (!part) return null;
        const isHighlight =
          part.includes('=') ||
          /\b\d+\.?\d*\s*(?:cm²|cm³|m²|m³|sq units|units|rad|°|cm|m)\b/.test(part) ||
          /^(?:Area|Volume|Perimeter|Diagonal|Slope|det\(A\)|Roots|θ|Δ)$/.test(part);

        if (isHighlight) {
          return (
            <span
              key={idx}
              className="text-cyan-300 font-bold bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-800/40"
            >
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

export default function VisualizerPanel({
  detectedConcept,
  isAnalyzing,
  apiSource,
  studentValues,
}) {
  const [showSteps, setShowSteps] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [speakingStepIdx, setSpeakingStepIdx] = useState(-1);

  // 1. Loading / Thinking State (Part 4 UX requirement)
  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-full bg-[#090d18] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden p-8 items-center justify-center text-center relative">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
          <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span>AI is thinking & computing...</span>
        </h3>

        <div className="mt-4 flex flex-col items-center gap-2 max-w-sm text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>1. Multimodal question understanding</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>2. Extracting exact equation & parameters</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>3. Symbolic mathematical engine solving derivation</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>4. Synthesizing programmatic geometric model</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Standby / Idle State
  if (!detectedConcept) {
    return (
      <div className="flex flex-col h-full bg-[#090d18] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0c1222] border-b border-slate-800/80 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400"></div>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-200 font-mono">
              AI Visualizer & Solver
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
            Awaiting Problem
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950/60 to-purple-950/60 border border-cyan-800/40 flex items-center justify-center mb-4 text-cyan-400 shadow-xl shadow-cyan-950/30">
            <Activity className="w-8 h-8 text-cyan-300 stroke-[1.5]" />
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-1">
            VisualBoard AI Intelligence Standby
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Enter ANY JEE Main mathematics question — handwritten on canvas or typed.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl text-left text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="text-cyan-400 font-bold mb-1">ALGEBRA</div>
              <p className="text-[10px] text-slate-400">Quadratics, matrices, AP/GP, probability</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="text-purple-400 font-bold mb-1">TRIGONOMETRY</div>
              <p className="text-[10px] text-slate-400">Harmonic waves & heights/distances</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="text-emerald-400 font-bold mb-1">CALCULUS</div>
              <p className="text-[10px] text-slate-400">Area between curves & tangents</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <div className="text-amber-400 font-bold mb-1">GEOMETRY</div>
              <p className="text-[10px] text-slate-400">2D shapes, 3D solids, vectors, planes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. AI Analysis Unavailable
  if (detectedConcept.domain === 'UNKNOWN' || detectedConcept.finalAnswer === 'AI analysis unavailable.') {
    return (
      <div className="flex flex-col h-full bg-[#090d18] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden p-6 items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h3 className="text-base font-bold text-white">AI analysis unavailable.</h3>
        <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
          The question could not be mathematically classified or resolved. Please verify the expression syntax or handwriting clarity.
        </p>
      </div>
    );
  }

  const { domain, conceptName, targetVariable, finalAnswer, steps, spokenSteps, visualization, explanation } = detectedConcept;

  // Domain badge colors
  const domainBadgeColors = {
    ALGEBRA: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    TRIGONOMETRY: 'bg-purple-950 text-purple-300 border-purple-800',
    CALCULUS: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    COORDINATE_GEOMETRY: 'bg-blue-950 text-blue-300 border-blue-800',
    VECTOR_ALGEBRA: 'bg-amber-950 text-amber-300 border-amber-800',
    '3D_GEOMETRY': 'bg-indigo-950 text-indigo-300 border-indigo-800',
    GEOMETRY: 'bg-teal-950 text-teal-300 border-teal-800',
    PROBABILITY: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800',
  };

  // Render visualization engine according to Part 2 Routing Table
  const renderVisualizationEngine = () => {
    if (!visualization || visualization.supported === false || visualization.type === 'NONE' || visualization.type === 'UNSUPPORTED') {
      return (
        <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-amber-800/40 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-3 opacity-90" />
          <h4 className="text-sm font-bold text-slate-200 mb-1 max-w-md">
            {visualization?.unsupportedMessage || 'This question could not be reliably solved or visualized yet.'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 font-mono">
            Zero-Fabrication Guard: VisualBoard AI will not invent dummy parameters or substitute superficial shapes.
          </p>
        </div>
      );
    }

    const type = visualization.type;
    const vData = visualization.data || {};

    switch (type) {
      // 1. Algebra
      case 'PARABOLA':
        return <ParabolaVisualizer data={vData} studentValues={studentValues} />;
      case 'MATRIX':
      case 'MATRIX_VISUALIZATION':
        return <MatrixVisualizer data={vData} studentValues={studentValues} />;
      case 'PROBABILITY':
      case 'PROBABILITY_VISUALIZATION':
        return <ProbabilityVisualizer data={vData} studentValues={studentValues} />;
      case 'SEQUENCES_SERIES':
        return <SequenceVisualizer data={vData} studentValues={studentValues} />;

      // 2. Trigonometry
      case 'TRIG_GRAPH':
        return <TrigVisualizer data={vData} studentValues={studentValues} />;
      case 'HEIGHTS_AND_DISTANCES':
        return <HeightsDistancesVisualizer data={vData} studentValues={studentValues} />;

      // 3. Calculus
      case 'AREA_UNDER_CURVE':
      case 'TWO_CURVES_AREA':
        return <AreaUnderCurveVisualizer data={vData} studentValues={studentValues} />;
      case 'DERIVATIVE_TANGENT':
        return <DerivativeTangentVisualizer data={vData} studentValues={studentValues} />;

      // 4. Coordinate Geometry
      case 'STRAIGHT_LINE':
        return <StraightLineVisualizer data={vData} studentValues={studentValues} />;
      case 'CIRCLE':
        return <CircleVisualizer data={vData} studentValues={studentValues} />;
      case 'ELLIPSE':
      case 'HYPERBOLA':
        return <ConicVisualizer data={vData} studentValues={studentValues} type={type} />;

      // 5. Vector Algebra & 3D Geometry
      case 'VECTOR_3D':
      case 'VECTOR_2D':
        return <Vector3DVisualizer data={vData} studentValues={studentValues} />;
      case '3D_LINES':
      case '3D_LINES_DISTANCE':
        return <Lines3DVisualizer data={vData} studentValues={studentValues} />;
      case '3D_PLANE':
        return <Plane3DVisualizer data={vData} studentValues={studentValues} />;

      // 6. Geometry (2D & 3D)
      case 'RECTANGLE':
        return <RectangleVisualizer data={vData} studentValues={studentValues} />;
      case 'SQUARE':
        return <SquareVisualizer data={vData} studentValues={studentValues} />;
      case 'TRIANGLE':
        return <TriangleVisualizer data={vData} studentValues={studentValues} />;
      case 'CIRCLE_GEOMETRY':
        return <CircleGeometryVisualizer data={vData} studentValues={studentValues} />;
      case 'POLYGON':
        return <PolygonVisualizer data={vData} studentValues={studentValues} />;
      case 'CUBE':
      case 'CUBOID':
        return <Solid3DVisualizer data={vData} studentValues={studentValues} type={type} />;
      case 'CYLINDER':
      case 'CONE':
      case 'SPHERE':
        return <Curved3DVisualizer data={vData} studentValues={studentValues} type={type} />;

      default:
        return (
          <div className="w-full h-[290px] bg-[#060a14] rounded-xl border border-slate-800/90 flex flex-col items-center justify-center p-6 text-center">
            <h4 className="text-sm font-bold text-slate-200">
              Visualization for this problem type is not yet supported.
            </h4>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d18] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-[#0c1222] border-b border-slate-800/80 select-none flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200 font-mono">
            AI Visualizer & Solver
          </span>
          <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${
            domainBadgeColors[domain] || 'bg-slate-900 text-slate-300 border-slate-700'
          }`}>
            {domain}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Part 3: Voice Assistant Control */}
          <VoiceAssistant
            spokenSteps={spokenSteps || steps}
            currentStepIndex={speakingStepIdx}
            onStepChange={setSpeakingStepIdx}
          />

          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded">
            {apiSource === 'gemini+math-engine' ? 'Gemini 3.8 Flash + MathJS Engine' : 'MathJS Symbolic Engine'}
          </span>
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              showRawJson
                ? 'bg-purple-950 text-purple-300 border border-purple-700/60'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
        
        {/* Raw JSON Inspector */}
        {showRawJson ? (
          <div className="flex-1 flex flex-col bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs overflow-auto">
            <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(detectedConcept, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            {/* 1. DEDICATED ANSWER SECTION */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-cyan-500/40 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {conceptName} {targetVariable ? `• Finding: ${targetVariable}` : ''}
                </span>
                {visualization?.supported === false ? (
                  <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Guarded</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Solved</span>
                  </span>
                )}
              </div>

              {/* Prominent Solution Box */}
              <div className="mt-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <span className="text-xs text-slate-400 block font-mono">Calculated Solution:</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#FF4C4C] font-mono tracking-wide break-words">
                    {finalAnswer}
                  </span>
                </div>
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors shrink-0 font-mono"
                >
                  <span>{showSteps ? 'Hide Steps' : 'Show Steps'}</span>
                  {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step-by-Step Derivation Breakdown with Voice Sync Highlight */}
              {showSteps && steps && steps.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 font-mono text-xs text-[#FF4C4C]">
                  {steps.map((st, i) => {
                    const isSpeakingThisStep = speakingStepIdx === i;
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-300 ${
                          isSpeakingThisStep
                            ? 'bg-cyan-950/70 border border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.01]'
                            : 'bg-slate-950/40 border border-slate-900'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors ${
                            isSpeakingThisStep ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500/70'
                          }`}
                        />
                        <HighlightedStep text={st} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. PROGRAMMATIC VISUALIZATION (HERO COMPONENT) */}
            <div className="flex-1 min-h-[290px] flex flex-col justify-center">
              {renderVisualizationEngine()}
            </div>

            {/* 3. Pedagogical Explanation */}
            {explanation && (
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <span className="text-cyan-400 font-semibold font-mono text-[11px] block mb-0.5">
                  Concept Principle:
                </span>
                {explanation}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
