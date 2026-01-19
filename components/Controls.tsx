
import React from 'react';
import { SimulationParams } from '../types';

interface Props {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  isRunning: boolean;
}

export const Controls: React.FC<Props> = ({ params, setParams, isRunning }) => {
  const handleChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <label>Mutation Rate</label>
          <span className="text-cyan-400">{(params.mutationRate * 100).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0.001"
          max="0.2"
          step="0.001"
          value={params.mutationRate}
          onChange={(e) => handleChange('mutationRate', parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <label>Population Size</label>
          <span className="text-cyan-400">{params.populationSize}</span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={params.populationSize}
          disabled={isRunning}
          onChange={(e) => handleChange('populationSize', parseInt(e.target.value))}
          className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {isRunning && <p className="text-[10px] text-slate-500 italic">Reset to change population size</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <label>DNA Lifespan (Steps)</label>
          <span className="text-cyan-400">{params.lifespan}</span>
        </div>
        <input
          type="range"
          min="50"
          max="500"
          step="10"
          value={params.lifespan}
          disabled={isRunning}
          onChange={(e) => handleChange('lifespan', parseInt(e.target.value))}
          className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Algorithm Note</h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            We use <span className="text-cyan-400 font-bold">Elitism</span> (keeping top 10%) and 
            <span className="text-cyan-400 font-bold">Tournament Selection</span> to ensure convergence while maintaining diversity.
          </p>
        </div>
      </div>
    </div>
  );
};
