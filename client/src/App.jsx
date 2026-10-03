import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TeacherBoard from './components/TeacherBoard';
import VisualizationViewport from './components/VisualizationViewport';
import AnswerCard from './components/AnswerCard';
import SolutionSteps from './components/SolutionSteps';
import ExplorationSliders from './components/ExplorationSliders';

export default function App() {
  // Backend health status
  const [aiHealth, setAiHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Solving state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scene & Results state
  const [sceneSpec, setSceneSpec] = useState(null);
  const [computedFinalAnswer, setComputedFinalAnswer] = useState(null);
  const [parameterValues, setParameterValues] = useState({});
  const [activeHighlight, setActiveHighlight] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  // Health check function calling GET /api/health
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setAiHealth(data);
      } else {
        setAiHealth({ geminiWorking: false, error: `HTTP ${res.status}` });
      }
    } catch (err) {
      setAiHealth({ geminiWorking: false, error: err.message });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Handle solve request from TeacherBoard (text or image)
  const handleSolve = async ({ inputType, content }) => {
    // CRITICAL SAFETY RULE: Clear previous result when a new question starts!
    setSceneSpec(null);
    setComputedFinalAnswer(null);
    setParameterValues({});
    setActiveHighlight([]);
    setActiveStepIndex(-1);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType, content }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Specific error handling for recognition or completeness
        if (data.errorType === 'OCR_FAILED') {
          setError({
            title: 'Handwriting recognition unavailable',
            message: data.message || 'Could not reliably transcribe the written problem. Please write clearly or use Type Math mode.',
          });
        } else {
          setError({
            title: 'This question could not be reliably solved or visualized yet.',
            message: data.message || data.error || 'The system could not compute a mathematically reliable scene specification.',
            understanding: data.partialUnderstanding || data.understanding,
          });
        }
        return;
      }

      // Check completeness & confidence: if confidence < 0.6
      if (data.scene.confidence < 0.6) {
        setError({
          title: 'This question could not be reliably solved or visualized yet.',
          message: 'The model confidence was below threshold (< 0.60). No unverified visual will be shown.',
          understanding: data.scene.understanding,
        });
        return;
      }

      // Successful scene received
      const scene = data.scene;
      setSceneSpec(scene);
      
      // Initialize parameter values from scene
      const initialParams = {};
      if (scene.parameters && Array.isArray(scene.parameters)) {
        scene.parameters.forEach(p => {
          initialParams[p.name] = p.value;
        });
      }
      setParameterValues(initialParams);

      // Set computed answer from server evaluation
      setComputedFinalAnswer(data.computedValues?.finalAnswer ?? scene.finalAnswerExpression);

    } catch (err) {
      console.error('Solve error:', err);
      setError({
        title: 'Network or Server Error',
        message: err.message || 'Failed to communicate with VisualBoard AI backend.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Slider change handler
  const handleParameterChange = (name, value) => {
    setParameterValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset sliders to initial scene values
  const handleResetParameters = () => {
    if (!sceneSpec?.parameters) return;
    const initialParams = {};
    sceneSpec.parameters.forEach(p => {
      initialParams[p.name] = p.value;
    });
    setParameterValues(initialParams);
  };

  // Handle step select & highlight sync
  const handleStepSelect = (index, highlightIds) => {
    setActiveStepIndex(index);
    setActiveHighlight(highlightIds || []);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header 
        aiHealth={aiHealth} 
        onRefreshHealth={checkHealth}
        isCheckingHealth={isCheckingHealth}
      />

      {/* Main Two-Column App Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Teacher Board (5 columns on wide screens) */}
        <div className="lg:col-span-5 h-[calc(100vh-110px)] min-h-[640px] sticky top-[72px]">
          <TeacherBoard 
            onSolve={handleSolve} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right Column: Visualization, Answer, Solution Steps, Exploration Sliders (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. LARGE Visualization Area on top */}
          <VisualizationViewport
            scene={sceneSpec}
            isLoading={isLoading}
            error={error}
            mode={sceneSpec?.mode || '2d'}
            activeHighlight={activeHighlight}
          >
            {/* Viewport renderers will be mounted here in Phase 3 (2D) & Phase 4 (3D) */}
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-slate-400">
              <span className="font-mono text-xs text-cyan-400">
                [Visualization Engine Ready for Phase 3/4 Renderers]
              </span>
            </div>
          </VisualizationViewport>

          {/* 2. Final Answer Card (Red #FF4C4C theme) */}
          {sceneSpec && !error && (
            <AnswerCard
              finalAnswer={computedFinalAnswer}
              finalAnswerExpression={sceneSpec.finalAnswerExpression}
              understanding={sceneSpec.understanding}
              assumptions={sceneSpec.assumptions}
              confidence={sceneSpec.confidence}
              isCalculatedByMathjs={true}
            />
          )}

          {/* 3. Solution Steps (Red #FF4C4C theme & Voice-over) */}
          {sceneSpec && !error && sceneSpec.steps && (
            <SolutionSteps
              steps={sceneSpec.steps}
              calculations={sceneSpec.calculations}
              activeStepIndex={activeStepIndex}
              onStepSelect={handleStepSelect}
            />
          )}

          {/* 4. Student Exploration Sliders */}
          {sceneSpec && !error && sceneSpec.parameters && sceneSpec.parameters.length > 0 && (
            <ExplorationSliders
              parameters={sceneSpec.parameters}
              parameterValues={parameterValues}
              onChangeParameter={handleParameterChange}
              onResetParameters={handleResetParameters}
            />
          )}
        </div>
      </main>
    </div>
  );
}
