import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Play, Pause, Square, Sparkles } from 'lucide-react';

/**
 * Built-in Web Speech API Voice Assistant
 * Narration with synchronous step highlighting
 */
export default function VoiceAssistant({ spokenSteps = [], currentStepIndex = -1, onStepChange }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentIdxRef = useRef(-1);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  // Cleanup on unmount or when steps change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [spokenSteps]);

  const speakStep = useCallback((idx) => {
    if (!spokenSteps || idx >= spokenSteps.length) {
      setIsPlaying(false);
      setIsPaused(false);
      currentIdxRef.current = -1;
      onStepChange?.(-1);
      return;
    }

    currentIdxRef.current = idx;
    onStepChange?.(idx);

    const textToSpeak = spokenSteps[idx] || '';
    if (!textToSpeak.trim()) {
      speakStep(idx + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95; // comfortable pedagogical pacing
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      speakStep(idx + 1);
    };

    utterance.onerror = (e) => {
      // If manually canceled, do nothing; otherwise reset
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e.error);
        setIsPlaying(false);
        setIsPaused(false);
        currentIdxRef.current = -1;
        onStepChange?.(-1);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [spokenSteps, onStepChange]);

  const handlePlay = () => {
    if (!isSupported || !spokenSteps.length) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(true);
    setIsPaused(false);
    speakStep(0);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentIdxRef.current = -1;
    onStepChange?.(-1);
  };

  if (!isSupported || !spokenSteps || spokenSteps.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-900/90 border border-indigo-700/40 shadow-lg text-xs">
      <div className="flex items-center gap-1.5 text-indigo-300 font-mono font-semibold">
        <Volume2 className={`w-3.5 h-3.5 ${isPlaying && !isPaused ? 'animate-pulse text-cyan-400' : 'text-indigo-400'}`} />
        <span className="hidden sm:inline">Voice Assistant</span>
      </div>

      <div className="w-px h-4 bg-slate-800 mx-1"></div>

      {/* Play / Resume */}
      {!isPlaying || isPaused ? (
        <button
          onClick={handlePlay}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-700/50 transition-colors font-mono"
          title={isPaused ? "Resume voice explanation" : "Listen to step-by-step voice explanation"}
        >
          <Play className="w-3 h-3 fill-indigo-300" />
          <span>{isPaused ? 'Resume' : 'Explain with voice'}</span>
        </button>
      ) : (
        /* Pause */
        <button
          onClick={handlePause}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/50 transition-colors font-mono"
          title="Pause voice narration"
        >
          <Pause className="w-3 h-3 fill-amber-300" />
          <span>Pause</span>
        </button>
      )}

      {/* Stop Button */}
      {isPlaying && (
        <button
          onClick={handleStop}
          className="p-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 transition-colors"
          title="Stop voice narration"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}

      {isPlaying && !isPaused && (
        <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 animate-pulse ml-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Step {currentIdxRef.current + 1} of {spokenSteps.length}</span>
        </span>
      )}
    </div>
  );
}
