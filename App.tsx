
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Simulation } from './components/Simulation';
import { Charts } from './components/Charts';
import { Controls } from './components/Controls';
import { Sidebar } from './components/Sidebar';
import { SimulationParams, GenerationStats, Obstacle } from './types';
import { Brain, Settings2, LineChart, Play, Pause, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    populationSize: 100,
    mutationRate: 0.01,
    lifespan: 200,
    generationCount: 1,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [statsHistory, setStatsHistory] = useState<GenerationStats[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const obstacles: Obstacle[] = [
    { x: 150, y: 150, width: 300, height: 15 },
    { x: 50, y: 300, width: 250, height: 15 },
    { x: 300, y: 450, width: 250, height: 15 },
  ];

  const handleStatsUpdate = useCallback((stats: GenerationStats) => {
    setStatsHistory(prev => [...prev, stats]);
    setParams(prev => ({ ...prev, generationCount: stats.generation + 1 }));
  }, []);

  const resetSimulation = () => {
    setIsRunning(false);
    setStatsHistory([]);
    setParams(prev => ({ ...prev, generationCount: 1 }));
    setAiAnalysis("");
  };

  const runAiAnalysis = async () => {
    if (statsHistory.length < 2) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lastStats = statsHistory[statsHistory.length - 1];
      const prompt = `
        Act as a genetic algorithm expert. I am running a pathfinding simulation.
        Current Stats:
        - Generation: ${lastStats.generation}
        - Max Fitness: ${lastStats.maxFitness.toFixed(4)}
        - Avg Fitness: ${lastStats.avgFitness.toFixed(4)}
        - Completion Rate: ${(lastStats.completionRate * 100).toFixed(1)}%

        Parameters:
        - Mutation Rate: ${params.mutationRate}
        - Population Size: ${params.populationSize}

        Provide a concise 2-3 sentence analysis of the progress and suggest if I should adjust the mutation rate or population size to improve performance.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiAnalysis(response.text || "Unable to analyze at this moment.");
    } catch (err) {
      console.error(err);
      setAiAnalysis("Error communicating with AI Analyst.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Column: Simulation & Controls */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              EvolvePath
            </h1>
            <p className="text-slate-400 text-sm mt-1">Genetic Algorithm Visualizer</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                isRunning 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetSimulation}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </header>

        <main className="flex flex-col xl:flex-row gap-6">
          {/* Main Simulation Area */}
          <div className="flex-grow bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Generation</span>
                <span className="text-xl font-bold text-cyan-400">#{params.generationCount}</span>
              </div>
            </div>
            
            <Simulation 
              params={params} 
              isRunning={isRunning} 
              onStatsUpdate={handleStatsUpdate}
              obstacles={obstacles}
            />
          </div>

          {/* Controls Panel */}
          <div className="w-full xl:w-80 flex flex-col gap-6">
             <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-slate-300 font-semibold">
                <Settings2 size={18} className="text-cyan-500" />
                <h2>Evolution Parameters</h2>
              </div>
              <Controls params={params} setParams={setParams} isRunning={isRunning} />
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex-1 min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Brain size={18} className="text-purple-500" />
                  <h2>AI Analyst</h2>
                </div>
                <button
                  onClick={runAiAnalysis}
                  disabled={isAnalyzing || statsHistory.length < 2}
                  className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Analyze
                </button>
              </div>
              <div className="text-sm text-slate-400 leading-relaxed italic">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Decoding evolutionary trends...
                  </div>
                ) : aiAnalysis ? (
                  `"${aiAnalysis}"`
                ) : (
                  "Run at least 2 generations to enable AI insights."
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Right Column: Analytics Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex-1">
          <div className="flex items-center gap-2 mb-6 text-slate-300 font-semibold">
            <LineChart size={18} className="text-blue-500" />
            <h2>Performance Metrics</h2>
          </div>
          <Charts data={statsHistory} />
        </div>
        
        <Sidebar stats={statsHistory[statsHistory.length - 1]} />
      </div>
    </div>
  );
};

export default App;
