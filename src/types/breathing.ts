export interface BreathingTechnique {
  id: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  pattern: BreathingPattern;
  benefits: string[];
  color: string;
}

export interface BreathingPattern {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  cycles: number;
}

export type BreathPhase = 'idle' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'complete';

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: BreathPhase;
  currentCycle: number;
  totalCycles: number;
  phaseTimeRemaining: number;
  totalTimeRemaining: number;
}
