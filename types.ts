
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface PlayerProfile {
  name: string;
  avatarColor: string;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}

export interface GameConfig {
  gravity: number;
  jumpForce: number;
  baseSpeed: number;
  speedIncrement: number;
  groundHeight: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type?: 'player' | 'obstacle' | 'particle';
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface Collectible extends Entity {
  collected: boolean;
  baseY: number;
  floatOffset: number;
  subtype: 'cane' | 'present' | 'star';
}

export interface SnowFlake {
  x: number;
  y: number;
  size: number;
  speed: number;
  swing: number;
  color?: string; // For Merry Mode confetti
}

export interface SantaState {
  active: boolean;
  x: number;
  y: number;
}

export interface Obstacle extends Entity {
  passed: boolean;
  typeId: 'bin' | 'fence' | 'car' | 'hydrant' | 'postbox' | 'cone' | 'barrier'; 
}

export interface BackgroundObject {
  x: number;
  y: number;
  type: 'house' | 'tree' | 'snowman' | 'lamp' | 'shop' | 'market_stall' | 'gingerbread_house' | 'level_sign';
  width: number;
  height: number;
  variant: number; // For random colors/styles
  levelNumber?: number; // Only for level_sign
}

export enum Theme {
  STREET_MORNING = 'STREET_MORNING',
  STREET_NIGHT = 'STREET_NIGHT',
  NEON_AVENUE = 'NEON_AVENUE',
  HYPER_SPEED = 'HYPER_SPEED',
  MERRY_MODE = 'MERRY_MODE',
}
