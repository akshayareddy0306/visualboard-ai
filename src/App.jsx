import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import TeacherBoard from './components/TeacherBoard';
import VisualizerPanel from './components/VisualizerPanel';
import StudentExploration from './components/StudentExploration';
import Toolbar from './components/Toolbar';
import { SAMPLE_PROBLEMS } from './data/sampleProblems';

export default function App() {
  const teacherBoardRef = useRef(null);

  // Drawing state
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#38bdf8'); // electric cyan default
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [gridStyle, setGridStyle] = useState('dots'); // 'dots' | 'lines' | 'none'
  const [canUndo, setCanUndo] = useState(false);

  // Input Mode: 'draw' | 'type'
  const [inputMode, setInputMode] = useState('type');
  const [typedText, setTypedText] = useState('x^2 = 25');

  // AI & Visualization state from backend POST /api/analyze
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedConcept, setDetectedConcept] = useState(null);
  const [apiSource, setApiSource] = useState('');
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [isGeminiConnected, setIsGeminiConnected] = useState(false);

  // Student interactive sandbox parameters (synced with Visualizer & Sliders)
  const [studentValues, setStudentValues] = useState({});

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        setIsGeminiConnected(!!d.geminiConfigured);
      })
      .catch((err) => console.log('Backend health check:', err));
  }, []);

  // Handle Undo
  const handleUndo = () => {
    if (teacherBoardRef.current) {
      teacherBoardRef.current.undo();
      setCanUndo(teacherBoardRef.current.canUndo);
    }
  };

  // Handle Clear
  const handleClear = () => {
    if (teacherBoardRef.current) {
      teacherBoardRef.current.clear();
      setCanUndo(false);
      setDetectedConcept(null);
      setActiveSampleId(null);
      setStudentValues({});
      setTypedText('x^2 = 25');
    }
  };

  // Handle Stroke Count Changes from Canvas
  const handleStrokeCountChange = (count) => {
    setCanUndo(count > 0);
  };

  // Core API call to backend POST /api/analyze
  const analyzeInput = async (customPayload = null) => {
    setIsAnalyzing(true);
    // Clear previous results immediately to ensure no stale data lingers
    setDetectedConcept(null);
    setStudentValues({});

    try {
      let payload = customPayload;

      if (!payload) {
        if (inputMode === 'type') {
          payload = {
            inputType: 'text',
            content: typedText.trim() || '3x^2 - 7x + 2 = 0',
          };
        } else {
          // Canvas image export
          const canvasDataUrl = teacherBoardRef.current?.getCanvasDataURL();
          payload = {
            inputType: 'image',
            content: canvasDataUrl || '',
            textHint: typedText.trim() || 'x^2 = 25',
          };
        }
      }

      console.log('[VisualBoard AI] Sending to POST /api/analyze:', payload.inputType);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result = await response.json();
      console.log('[VisualBoard AI] Received structured concept:', result);

      if (result.success && result.data) {
        const concept = result.data;
        setDetectedConcept(concept);
        setApiSource(result.source || 'gemini');

        // Dynamically initialize slider values based on detected exploration parameters
        const initialVals = {};
        if (concept.exploration?.parameters) {
          concept.exploration.parameters.forEach((p) => {
            initialVals[p.id] = p.defaultValue;
          });
        }
        if (concept.visualization?.data) {
          Object.assign(initialVals, concept.visualization.data);
        }
        setStudentValues(initialVals);
      }
    } catch (err) {
      console.error('[VisualBoard AI] Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select Sample Problem Preset
  const handleSelectSample = (sampleId) => {
    setActiveSampleId(sampleId);
    const sample = SAMPLE_PROBLEMS[sampleId];
    if (!sample) return;

    setTypedText(sample.queryText);

    // If canvas has sample handwriting and in draw mode, draw it
    if (teacherBoardRef.current && sample.handwritingStrokes) {
      const strokeColor = '#38bdf8';
      setColor(strokeColor);
      teacherBoardRef.current.drawSampleStrokes(sample.handwritingStrokes, strokeColor);
      setCanUndo(true);
    }

    // Call backend API with typed text
    analyzeInput({
      inputType: 'text',
      content: sample.queryText,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-100 antialiased">
      
      {/* Header Bar */}
      <Header 
        isAnalyzing={isAnalyzing} 
        statusText={detectedConcept ? `${detectedConcept.domain || 'CONCEPT'} IDENTIFIED` : 'AI READY'} 
        isGeminiConnected={isGeminiConnected}
        onKeyConfigured={() => setIsGeminiConnected(true)}
      />

      {/* Main Workspace (Split View) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-3 sm:p-4 lg:p-5 flex flex-col gap-4">
        
        {/* Main 2-Column Split: Teacher Board | AI Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch">
          
          {/* LEFT: TEACHER BOARD (Digital Canvas / Typed Input) */}
          <div className="h-[540px] lg:h-[640px] flex flex-col">
            <TeacherBoard
              ref={teacherBoardRef}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              gridStyle={gridStyle}
              onStrokeCountChange={handleStrokeCountChange}
              onColorChange={setColor}
              inputMode={inputMode}
              setInputMode={setInputMode}
              typedText={typedText}
              setTypedText={setTypedText}
              onSubmitTyped={() => analyzeInput()}
            />
          </div>

          {/* RIGHT: AI VISUALIZER + Student Exploration Zone */}
          <div className="h-[540px] lg:h-[640px] flex flex-col gap-3">
            
            {/* Upper: AI Visualizer Panel */}
            <div className="flex-1 min-h-[380px]">
              <VisualizerPanel
                detectedConcept={detectedConcept}
                isAnalyzing={isAnalyzing}
                apiSource={apiSource}
                studentValues={studentValues}
              />
            </div>

            {/* Lower: Student Exploration Zone */}
            <div className="shrink-0">
              <StudentExploration 
                detectedConcept={detectedConcept}
                studentValues={studentValues}
                onStudentValuesChange={setStudentValues}
              />
            </div>

          </div>

        </div>

      </main>

      {/* Bottom Action Bar / Toolbar */}
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        canUndo={canUndo}
        onUndo={handleUndo}
        onClear={handleClear}
        onSelectSample={handleSelectSample}
        activeSampleId={activeSampleId}
        onVisualize={() => analyzeInput()}
        isAnalyzing={isAnalyzing}
        gridStyle={gridStyle}
        setGridStyle={setGridStyle}
      />

    </div>
  );
}
