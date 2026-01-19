
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SimulationParams, Individual, DNA, Vector, GenerationStats, Obstacle } from '../types';

interface Props {
  params: SimulationParams;
  isRunning: boolean;
  onStatsUpdate: (stats: GenerationStats) => void;
  obstacles: Obstacle[];
}

export const Simulation: React.FC<Props> = ({ params, isRunning, onStatsUpdate, obstacles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [population, setPopulation] = useState<Individual[]>([]);
  const [frame, setFrame] = useState(0);
  const [generation, setGeneration] = useState(1);

  const target: Vector = { x: 300, y: 50 };
  const startPos: Vector = { x: 300, y: 550 };

  // Helper functions for vector math
  const add = (v1: Vector, v2: Vector) => ({ x: v1.x + v2.x, y: v1.y + v2.y });
  const dist = (v1: Vector, v2: Vector) => Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  const limit = (v: Vector, max: number) => {
    const mag = Math.sqrt(v.x * v.x + v.y * v.y);
    if (mag > max) {
      return { x: (v.x / mag) * max, y: (v.y / mag) * max };
    }
    return v;
  };

  // Create initial population
  const createDNA = (length: number): DNA => ({
    genes: Array.from({ length }, () => ({
      x: (Math.random() * 2 - 1) * 0.4,
      y: (Math.random() * 2 - 1) * 0.4
    }))
  });

  const createIndividual = (dna: DNA): Individual => ({
    dna,
    fitness: 0,
    position: { ...startPos },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    completed: false,
    crashed: false,
    timeToTarget: 0,
  });

  // Init
  useEffect(() => {
    const initialPop = Array.from({ length: params.populationSize }, () => 
      createIndividual(createDNA(params.lifespan))
    );
    setPopulation(initialPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.populationSize, params.lifespan]);

  // Main loop
  useEffect(() => {
    if (!isRunning) return;

    let requestRef: number;

    const animate = () => {
      setFrame(prevFrame => {
        if (prevFrame >= params.lifespan - 1) {
          evaluateAndNextGeneration();
          return 0;
        }
        return prevFrame + 1;
      });
      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, population, params.lifespan]);

  const evaluateAndNextGeneration = () => {
    // 1. Calculate fitness
    let maxFit = 0;
    let completedCount = 0;
    const evaluatedPopulation = population.map(ind => {
      const d = dist(ind.position, target);
      // Normalized fitness: closer is much better
      let fitness = Math.pow(1 / (d + 1), 2) * 1000;
      
      if (ind.completed) {
        // Bonus for time
        fitness *= (params.lifespan / (ind.timeToTarget || 1)) * 10;
        completedCount++;
      }
      if (ind.crashed) {
        fitness /= 10;
      }
      
      if (fitness > maxFit) maxFit = fitness;
      return { ...ind, fitness };
    });

    // Stats
    const totalFitness = evaluatedPopulation.reduce((acc, ind) => acc + ind.fitness, 0);
    const avgFitness = totalFitness / params.populationSize;
    onStatsUpdate({
      generation,
      avgFitness,
      maxFitness: maxFit,
      completionRate: completedCount / params.populationSize,
    });

    // 2. Selection & Mating
    const nextPop: Individual[] = [];
    
    // Sort for elitism
    evaluatedPopulation.sort((a, b) => b.fitness - a.fitness);
    
    // Add elites
    for (let i = 0; i < Math.max(2, params.populationSize * 0.1); i++) {
      nextPop.push(createIndividual(evaluatedPopulation[i].dna));
    }

    // Fill the rest with crossover
    while (nextPop.length < params.populationSize) {
      const parentA = selectParent(evaluatedPopulation, maxFit);
      const parentB = selectParent(evaluatedPopulation, maxFit);
      const childDNA = crossover(parentA.dna, parentB.dna);
      mutate(childDNA);
      nextPop.push(createIndividual(childDNA));
    }

    setPopulation(nextPop);
    setGeneration(prev => prev + 1);
  };

  const selectParent = (pop: Individual[], maxFit: number) => {
    // Tournament selection or basic probability
    let count = 0;
    while (count < 1000) { // Safety break
      const r = Math.random() * maxFit;
      const index = Math.floor(Math.random() * pop.length);
      const partner = pop[index];
      if (r < partner.fitness) return partner;
      count++;
    }
    return pop[0];
  };

  const crossover = (dnaA: DNA, dnaB: DNA): DNA => {
    const midpoint = Math.floor(Math.random() * dnaA.genes.length);
    const newGenes = dnaA.genes.map((gene, i) => (i > midpoint ? gene : dnaB.genes[i]));
    return { genes: newGenes };
  };

  const mutate = (dna: DNA) => {
    dna.genes = dna.genes.map(gene => {
      if (Math.random() < params.mutationRate) {
        return {
          x: (Math.random() * 2 - 1) * 0.4,
          y: (Math.random() * 2 - 1) * 0.4
        };
      }
      return gene;
    });
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update positions
    if (isRunning) {
      const updatedPop = population.map(ind => {
        if (ind.completed || ind.crashed) return ind;

        let acc = ind.dna.genes[frame];
        let vel = add(ind.velocity, acc);
        vel = limit(vel, 4);
        let pos = add(ind.position, vel);

        // Check bounds
        let crashed = pos.x < 0 || pos.x > 600 || pos.y < 0 || pos.y > 600;

        // Check obstacles
        if (!crashed) {
          for (const obs of obstacles) {
            if (pos.x > obs.x && pos.x < obs.x + obs.width && pos.y > obs.y && pos.y < obs.y + obs.height) {
              crashed = true;
              break;
            }
          }
        }

        // Check target
        let completed = false;
        let timeToTarget = ind.timeToTarget;
        if (dist(pos, target) < 15) {
          completed = true;
          timeToTarget = frame;
        }

        return { ...ind, position: pos, velocity: vel, crashed, completed, timeToTarget };
      });
      setPopulation(updatedPop);
    }

    // Draw
    ctx.clearRect(0, 0, 600, 600);

    // Target
    ctx.beginPath();
    ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#10b981';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Obstacles
    ctx.fillStyle = '#475569';
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Population
    population.forEach((ind, i) => {
      ctx.save();
      ctx.translate(ind.position.x, ind.position.y);
      ctx.rotate(Math.atan2(ind.velocity.y, ind.velocity.x));
      
      const opacity = ind.completed ? 1 : ind.crashed ? 0.2 : 0.6;
      const color = ind.completed ? '#10b981' : ind.crashed ? '#ef4444' : '#0ea5e9';
      
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-5, 5);
      ctx.lineTo(-5, -5);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.restore();
    });

    // Start zone label
    ctx.fillStyle = '#334155';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('STARTING POOL', startPos.x, startPos.y + 25);

  }, [population, frame, isRunning, obstacles, target]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600} 
        className="w-full max-w-[600px] h-auto bg-slate-950 rounded-xl"
      />
      <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-100 ease-linear" 
          style={{ width: `${(frame / params.lifespan) * 100}%` }}
        ></div>
      </div>
      <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
        Cycle Progress
      </div>
    </div>
  );
};
