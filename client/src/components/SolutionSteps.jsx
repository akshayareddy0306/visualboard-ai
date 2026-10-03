import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  ListOrdered 
} from 'lucide-react';
import MathView from './MathView';

export default function SolutionSteps({ 
  steps = [], 
  calculations = [],
  activeStepIndex = -1, 
  onStepSelect 
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVoiceStep, setCurrentVoiceStep] = useState(-1);
  const [speechSupported, setSpeechSupported] = useState(false);

  const synthRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Handle voice-over narration of all steps sequentially
  const speakStep = (index) => {
    if (!synthRef.current || index >= steps.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentVoiceStep(-1);
      if (onStepSelect) onStepSelect(-1, []);
      return;
    }

    const step = steps[index];
    const textToSpeak = step.speech || step.text || '';
    if (!textToSpeak.trim()) {
      speakStep(index + 1);
      return;
    }

    setCurrentVoiceStep(index);
    if (onStepSelect) {
      onStepSelect(index, step.highlight || []);
    }

    // Clean latex tokens from speech text for natural listening
    const cleanSpeech = textToSpeak
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/\\cdot/g, 'times')
      .replace(/\\pi/g, 'pi')
      .replace(/[\$\{\}\\]/g, ' ')
      .replace(/\^2/g, ' squared')
      .replace(/\^3/g, ' cubed');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95; // Slightly measured teacher pace
    utterance.pitch = 1.0;

    utterance.onend = () => {
      speakStep(index + 1);
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      speakStep(index + 1);
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleStartVoice = () => {
    if (!synthRef.current || steps.length === 0) return;
    synthRef.current.cancel();
    setIsSpeaking(true);
    setIsPaused(false);
    speakStep(0);
  };

  const handlePauseVoice = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStopVoice = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentVoiceStep(-1);
    if (onStepSelect) onStepSelect(-1, []);
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-[#0e1628]/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
      {/* Header with Title and Speech Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[#FF4C4C]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Step-by-Step Derivation
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/40 text-[#FF4C4C] border border-[#FF4C4C]/30">
            {steps.length} Steps
          </span>
        </div>

        {/* Voice-Over narration controls (Hidden if browser does not support) */}
        {speechSupported && (
          <div className="flex items-center gap-2">
            {!isSpeaking ? (
              <button
                type="button"
                onClick={handleStartVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-[#FF4C4C]/50 transition-colors shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#FF4C4C]" />
                <span>Explain with voice</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={handlePauseVoice}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={handleStopVoice}
                  className="p-1 rounded text-slate-300 hover:text-rose-400 hover:bg-slate-800"
                  title="Stop"
                >
                  <Square className="w-3.5 h-3.5 text-rose-400" />
                </button>
                <span className="text-[11px] font-mono text-[#FF4C4C] animate-pulse ml-1">
                  Narrating step {currentVoiceStep + 1}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calculations Summary (if any) */}
      {calculations && calculations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {calculations.map((calc, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">{calc.label}</span>
              <span className="text-xs font-mono font-bold text-cyan-300 mt-1">
                {calc.expression} {calc.unit ? `(${calc.unit})` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Steps List - Sticking to Red (#FF4C4C) theme per requirement */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isActive = currentVoiceStep === idx || activeStepIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => onStepSelect && onStepSelect(idx, step.highlight || [])}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-950/20 border-[#FF4C4C] shadow-[0_0_15px_rgba(255,76,76,0.15)] ring-1 ring-[#FF4C4C]/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step badge in Red */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#FF4C4C] text-white shadow-md shadow-[#FF4C4C]/40'
                      : 'bg-slate-800 text-[#FF4C4C] border border-[#FF4C4C]/40'
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="text-sm text-slate-200 leading-relaxed font-sans">
                    <MathView math={step.text} inline={true} />
                  </div>

                  {step.speech && step.speech !== step.text && (
                    <div className="text-xs text-slate-400 italic">
                      "{step.speech}"
                    </div>
                  )}

                  {step.highlight && step.highlight.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>Visual focus:</span>
                      {step.highlight.map((id) => (
                        <span 
                          key={id} 
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-[#FF4C4C] border border-[#FF4C4C]/30 text-[10px]"
                        >
                          #{id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
