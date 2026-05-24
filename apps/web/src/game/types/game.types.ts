export type GameStatus = 'idle' | 'running' | 'game-over';

export type PlayerAction = 'none' | 'jumping' | 'ducking';

export interface ScoreRecord {
  nick: string;
  score: number;
  date: string;
}

export interface Player {
  y: number;
  vy: number;
  width: number;
  height: number;
  action: PlayerAction;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  passed: boolean;
}
