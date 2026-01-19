
import React from 'react';
import { GenerationStats } from '../types';
import { Zap, Target, TrendingUp, Info } from 'lucide-react';

interface Props {
  stats?: GenerationStats;
}

export const Sidebar: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-semibold">
          <Info size={18} className="text-emerald-500" />
          <h2>How it Works</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Zap size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Genes</h4>
              <p className="text-xs text-slate-500">Each agent has DNA consisting of steering vectors that determine its path through the environment.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Target size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Fitness</h4>
              <p className="text-xs text-slate-500">Fitness is calculated by the distance to the target. Reaching the target faster awards extra points.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
              <TrendingUp size={14} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Evolution</h4>
              <p className="text-xs text-slate-500">Top performers are cloned into the next generation (Elitism), and offspring are created through crossover and mutation.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Live Best Performer</h3>
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Max Fitness</p>
              <p className="text-lg font-bold text-emerald-400">{stats?.maxFitness.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Success Rate</p>
              <p className="text-lg font-bold text-blue-400">{((stats?.completionRate || 0) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
