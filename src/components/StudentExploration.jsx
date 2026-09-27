import React from 'react';
import { Lightbulb, Compass, RotateCcw } from 'lucide-react';

export default function StudentExploration({
  detectedConcept,
  studentValues,
  onStudentValuesChange,
}) {
  const exploration = detectedConcept?.exploration;
  const isEnabled = exploration?.enabled !== false && exploration?.parameters && exploration.parameters.length > 0;
  const prompt = exploration?.prompt || 
    'Adjust the parameters below to explore how mathematical variations transform the model and solution!';

  const parameters = exploration?.parameters || [];

  // Reset to original problem defaults
  const handleReset = () => {
    if (!onStudentValuesChange) return;
    const initialVals = {};
    parameters.forEach((p) => {
      initialVals[p.id] = p.defaultValue;
    });
    onStudentValuesChange(initialVals);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a0e1c] rounded-2xl border border-slate-800/80 p-3.5 shadow-xl relative overflow-hidden">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Student Interactive Exploration
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-mono transition-colors"
            title="Reset parameters to problem defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
            Dynamic Sandbox
          </span>
        </div>
      </div>

      {/* Guided Inquiry Prompt */}
      {prompt && (
        <div className="mb-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 text-[11px] leading-relaxed">
            <span className="font-semibold text-amber-300">Inquiry Prompt: </span>
            {prompt}
          </div>
        </div>
      )}

      {/* Dynamic Sliders based on detected parameters */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
        <div className={`grid gap-3 text-xs ${parameters.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : parameters.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {parameters.map((param) => {
            const currentVal = studentValues?.[param.id] ?? param.defaultValue;
            return (
              <div key={param.id} className="space-y-1">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-medium text-[11px] text-slate-200">{param.label}:</span>
                  <span className="font-mono text-cyan-300 font-bold text-xs bg-slate-900/90 px-2 py-0.5 rounded-md border border-cyan-800/60 shadow-sm shadow-cyan-950/40">
                    {typeof currentVal === 'number' ? currentVal.toFixed(param.step < 1 ? 2 : (Number.isInteger(currentVal) ? 0 : 2)) : currentVal}
                    {param.unit ? ` ${param.unit}` : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={currentVal}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    onStudentValuesChange?.((prev) => ({
                      ...prev,
                      [param.id]: parsed,
                    }));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                  <span>{param.min}</span>
                  <span>{param.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
