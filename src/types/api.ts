import { LevelMeta, DifficultyLevel } from './level.ts';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  stars: number;
  secretCoins: number;
  completedLevelsCount: number;
  createdLevelsCount: number;
  equippedSkin?: string;
  unlockedSkins?: string[];
}

export interface LevelProgressRecord {
  levelId: string;
  userId: string;
  percentage: number;
  attempts: number;
  bestTime: number | null;
  completed: boolean;
  starsAwarded: number;
}

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  stars: number;
  secretCoins: number;
  completedLevels: number;
}

export interface LevelLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  percentage: number;
  attempts: number;
  bestTime: number | null;
  completed: boolean;
}

export interface ScoreSubmissionPayload {
  levelId: string;
  percentage: number;
  attempts: number;
  timeElapsed: number;
  verificationToken?: string;
}

export interface ScoreSubmissionResult {
  success: boolean;
  message: string;
  starsAwarded: number;
  newPercentage: number;
  isFirstCompletion: boolean;
  verified: boolean;
}
