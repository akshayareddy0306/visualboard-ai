import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Box, 
  RotateCw, 
  AlertCircle, 
  ZoomIn, 
  ZoomOut, 
  Maximize2 
} from 'lucide-react';

export default function VisualizationViewport({ 
  scene, 
  isLoading, 
  error, 
  mode = '2d', 
  activeHighlight = [],
  children 
}) {
  return (
    <div className="relative w-full h-[460px] lg:h-[500px] bg-[#070A12] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Viewport Top Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-[#070A12]/95 via-[#070A12]/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 shadow-sm">
            {scene?.mode === '3d' ? (
              <>
                <Box className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300">3D Interactive Scene (OrbitControls)</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300">2D Dynamic Vector SVG</span>
              </>
            )}
          </span>

          {scene?.domain && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
              {scene.domain}
            </span>
          )}
        </div>

        {/* Viewport Badge / Indicator */}
        <div className="pointer-events-auto flex items-center gap-2">
          {scene && !isLoading && (
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded">
              {scene.objects?.length || 0} primitives rendered
            </span>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center">
        {/* Loading "AI is thinking..." State */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-[#070A12]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              {/* Outer pulsing ring */}
              <div className="w-24 h-24 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              {/* Middle reverse ring */}
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-[spin_2s_linear_infinite_reverse]" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-100 tracking-wide mb-1">
              VisualBoard AI is thinking...
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Parsing mathematical semantic structure, formulating geometric constraints, and generating exact mathjs parameters.
            </p>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Zero-hardcoding generic renderer engine</span>
            </div>
          </div>
        )}

        {/* Error / Incomplete / Fallback-Prevention Message */}
        {!isLoading && error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-[#070A12]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-rose-300 mb-2">
              {error.title || "This question could not be reliably solved or visualized yet."}
            </h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              {error.message || "To ensure mathematical correctness, VisualBoard AI refuses to display generic placeholders or fake visuals."}
            </p>
            {error.understanding && (
              <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                Partial understanding: {error.understanding}
              </div>
            )}
          </div>
        )}

        {/* Empty State: NO default fake visual! Critical safety rule! */}
        {!isLoading && !error && !scene && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-slate-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300 mb-1">
              Visual Canvas Awaiting Problem
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Type an equation or draw a geometry problem on the Teacher Board to generate an exact, dynamic visual.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">No Presets</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Generic Renderer</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">mathjs Computed</span>
            </div>
          </div>
        )}

        {/* Active Scene Container */}
        {!isLoading && !error && scene && (
          <div className="w-full h-full relative">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
