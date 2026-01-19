
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { GenerationStats } from '../types';

interface Props {
  data: GenerationStats[];
}

export const Charts: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-600 italic text-sm">
        Simulation must run to generate data...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Fitness Trends */}
      <div className="h-64 w-full">
        <h3 className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Fitness Progress</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="generation" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="maxFitness" 
              name="Max Fitness"
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#colorMax)" 
            />
            <Area 
              type="monotone" 
              dataKey="avgFitness" 
              name="Avg Fitness"
              stroke="#6366f1" 
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate */}
      <div className="h-64 w-full">
        <h3 className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Completion Success (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="generation" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
               formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Completion Rate']}
            />
            <Line 
              type="stepAfter" 
              dataKey="completionRate" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
