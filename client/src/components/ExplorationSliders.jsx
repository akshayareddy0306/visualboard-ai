import React from 'react';
import { Sliders, RotateCcw, Activity } from 'lucide-react';

export default function ExplorationSliders({ 
  parameters = [], 
  parameterValues = {}, 
  onChangeParameter, 
  onResetParameters 
}) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="bg-[#0e1628]/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Student Exploration Sliders
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            Live Math Reactivity
          </span>
        </div>

        <button
          type="button"
          onClick={onResetParameters}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Reset parameters to initial question values"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Adjust these parameters to inspect how geometry, roots, integrals, vectors, or 3D surfaces morph in real-time.
      </p>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parameters.map((param) => {
          const currentValue = parameterValues[param.name] ?? param.value;
          const min = param.min ?? 0;
          const max = param.max ?? 10;
          const step = param.step ?? 0.1;

          return (
            <div 
              key={param.name}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {param.label || param.name}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  {param.name} = {typeof currentValue === 'number' ? currentValue.toFixed(step < 0.1 ? 2 : (step < 1 ? 1 : 0)) : currentValue}
                </span>
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono w-6 text-right">
                  {min}
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={currentValue}
                  onChange={(e) => onChangeParameter(param.name, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono w-6">
                  {max}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
