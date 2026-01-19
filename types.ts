
export interface Vector {
  x: number;
  y: number;
}

export interface DNA {
  genes: Vector[];
}

export interface Individual {
  dna: DNA;
  fitness: number;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  completed: boolean;
  crashed: boolean;
  timeToTarget: number;
}

export interface GenerationStats {
  generation: number;
  avgFitness: number;
  maxFitness: number;
  completionRate: number;
}

export interface SimulationParams {
  populationSize: number;
  mutationRate: number;
  lifespan: number;
  generationCount: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}
