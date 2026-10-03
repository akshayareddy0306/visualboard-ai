import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, X } from 'lucide-react';

export default function Header({ 
  isAnalyzing, 
  statusText = 'AI READY',
  isGeminiConnected = false,
  onKeyConfigured
}) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);

  // Auto-sync key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('GEMINI_API_KEY');
    if (saved && saved.trim()) {
      setInputKey(saved.trim());
      fetch('/api/config-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: saved.trim() })
      })
      .then(r => r.json())
      .then(d => {
        if (d.success && onKeyConfigured) onKeyConfigured();
      })
      .catch(e => console.warn('Key auto-sync warning:', e));
    }
  }, [onKeyConfigured]);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setKeySaving(true);
    try {
      const res = await fetch('/api/config-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputKey.trim() })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('GEMINI_API_KEY', inputKey.trim());
        setKeySuccess(true);
        if (onKeyConfigured) onKeyConfigured();
        setTimeout(() => {
          setShowKeyModal(false);
          setKeySuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to configure key:', err);
    } finally {
      setKeySaving(false);
    }
  };

  return (
    <>
      <header className="w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Team Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  VISUALBOARD AI
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono">
                  PROTOTYPE v1.0
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-300 font-medium">Team VyomTech</span>
              </div>
            </div>
          </div>

          {/* Pedagogy Pipeline */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/70 text-[11px] font-medium text-slate-400">
            <span className="text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Teacher writes
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-300">AI understands</span>
            <span className="text-slate-600">→</span>
            <span className="text-indigo-300">Concept identified</span>
            <span className="text-slate-600">→</span>
            <span className="text-purple-300">Visualization generated</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-300 font-semibold">Student interacts</span>
          </div>

          {/* Right Controls: Gemini Key & AI Status */}
          <div className="flex items-center gap-3">
            {/* Gemini API Key Config Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                isGeminiConnected 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/40' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title="Connect Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isGeminiConnected ? 'Gemini 3.8 Flash' : 'Connect Gemini API'}</span>
            </button>

            {/* AI Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
              isAnalyzing 
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300' 
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAnalyzing ? 'bg-purple-400' : 'bg-emerald-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isAnalyzing ? 'bg-purple-500' : 'bg-emerald-500'
                }`}></span>
              </span>
              <span className="text-xs font-bold tracking-wider uppercase font-mono">
                {isAnalyzing ? '● AI ANALYZING...' : `● ${statusText}`}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connect Gemini Multimodal API</h3>
                <p className="text-[11px] text-slate-400 font-mono">Model: gemini-3.8-flash (via @google/genai)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Enter your Google Gemini API key below. It will be passed securely to the backend Node server and activated immediately.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste your Gemini API key..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>

              {keySuccess && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-emerald-400 text-xs flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4" />
                  <span>Gemini 3.8 Flash Connected Successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={keySaving}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md"
                >
                  {keySaving ? 'Connecting...' : 'Activate Gemini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
