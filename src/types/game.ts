export enum GameMode {
  CUBE = 'CUBE',
  SHIP = 'SHIP',
  BALL = 'BALL',
  WAVE = 'WAVE',
}

export enum SpeedMultiplier {
  SPEED_0_5X = 0.5,
  SPEED_1X = 1,
  SPEED_2X = 2,
  SPEED_3X = 3,
  SPEED_4X = 4,
}

export enum EngineState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  DEAD = 'DEAD',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  gamemode: GameMode;
  gravityDirection: 1 | -1; // 1 = down, -1 = up
  isGrounded: boolean;
  isDead: boolean;
  isMini: boolean;
  speed: SpeedMultiplier;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface GameSettings {
  showFps: boolean;
  musicVolume: number;
  sfxVolume: number;
  autoRestartDelayMs: number;
  particlesEnabled: boolean;
}

export interface PlayStats {
  attempts: number;
  percentage: number;
  bestPercentage: number;
  timeElapsed: number;
  jumpCount: number;
}
