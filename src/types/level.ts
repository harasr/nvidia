import { GameMode, SpeedMultiplier } from './game.ts';

export enum LevelObjectType {
  BLOCK = 'BLOCK',
  SPIKE = 'SPIKE',
  PAD = 'PAD',
  ORB = 'ORB',
  PORTAL = 'PORTAL',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  DEMON = 'DEMON',
}

export type PadSubtype = 'YELLOW' | 'PINK' | 'RED' | 'GRAVITY';
export type OrbSubtype = 'YELLOW' | 'PINK' | 'RED' | 'GRAVITY' | 'BLACK';

export type PortalSubtype =
  | 'GRAVITY_UP'
  | 'GRAVITY_DOWN'
  | 'NORMAL_SIZE'
  | 'MINI_SIZE'
  | 'GAMEMODE_CUBE'
  | 'GAMEMODE_SHIP'
  | 'GAMEMODE_BALL'
  | 'GAMEMODE_WAVE'
  | 'SPEED_0_5X'
  | 'SPEED_1X'
  | 'SPEED_2X'
  | 'SPEED_3X'
  | 'SPEED_4X';

export interface LevelObject {
  id: string;
  type: LevelObjectType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number; // in degrees: 0, 90, 180, 270
  scale: number;
  subtype?: PadSubtype | OrbSubtype | PortalSubtype | string;
  properties?: Record<string, unknown>;
}

export interface LevelSettings {
  initialSpeed: SpeedMultiplier;
  initialMode: GameMode;
  initialGravity: 1 | -1;
  bpm: number;
  songTitle?: string;
  backgroundColor?: string;
  floorColor?: string;
  accentColor?: string;
  length?: number;
}

export interface LevelData {
  version: number;
  settings: LevelSettings;
  objects: LevelObject[];
}

export interface LevelMeta {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  difficulty: DifficultyLevel;
  starsReward: number;
  songTitle: string;
  bpm: number;
  plays: number;
  likes: number;
  isVerified: boolean;
  levelData: LevelData;
  createdAt: string;
}
