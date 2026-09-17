import { GameMode, SpeedMultiplier } from '../types/game.ts';
import { DifficultyLevel, LevelMeta, LevelObjectType } from '../types/level.ts';

export const DEFAULT_LEVELS: LevelMeta[] = [
  {
    id: 'lvl_stereo_neon',
    title: 'Stereo Neon',
    description: 'An electric introduction to rhythm platforming. Master cube jumping and high pads!',
    creatorId: 'creator_studio',
    creatorName: 'Studio Official',
    difficulty: DifficultyLevel.EASY,
    starsReward: 1,
    songTitle: 'Stereo Overdrive',
    bpm: 140,
    plays: 1420,
    likes: 389,
    isVerified: true,
    createdAt: '2026-09-01T12:00:00Z',
    levelData: {
      version: 1,
      settings: {
        initialSpeed: SpeedMultiplier.SPEED_1X,
        initialMode: GameMode.CUBE,
        initialGravity: 1,
        bpm: 140,
        songTitle: 'Stereo Overdrive',
      },
      objects: [
        // Intro spikes - very spread out
        { id: 'sn_1', type: LevelObjectType.SPIKE, x: 600, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_2', type: LevelObjectType.SPIKE, x: 900, y: 450, rotation: 0, scale: 1 },

        // Block step
        { id: 'sn_3', type: LevelObjectType.BLOCK, x: 1300, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_4', type: LevelObjectType.BLOCK, x: 1330, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_5', type: LevelObjectType.SPIKE, x: 1330, y: 420, rotation: 0, scale: 1 },

        // Yellow pad leap
        { id: 'sn_6', type: LevelObjectType.BLOCK, x: 1800, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_7', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 1800, y: 420, rotation: 0, scale: 1 },
        { id: 'sn_8', type: LevelObjectType.SPIKE, x: 2000, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_9', type: LevelObjectType.SPIKE, x: 2300, y: 450, rotation: 0, scale: 1 },

        // High block landing
        { id: 'sn_11', type: LevelObjectType.BLOCK, x: 2700, y: 390, rotation: 0, scale: 1 },
        { id: 'sn_12', type: LevelObjectType.BLOCK, x: 2730, y: 390, rotation: 0, scale: 1 },

        // Yellow Orb
        { id: 'sn_13', type: LevelObjectType.SPIKE, x: 3100, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_14', type: LevelObjectType.ORB, subtype: 'YELLOW', x: 3130, y: 360, rotation: 0, scale: 1 },
        { id: 'sn_15', type: LevelObjectType.SPIKE, x: 3160, y: 450, rotation: 0, scale: 1 },

        // Double spike leap
        { id: 'sn_16', type: LevelObjectType.BLOCK, x: 3600, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_17', type: LevelObjectType.PAD, subtype: 'PINK', x: 3600, y: 420, rotation: 0, scale: 1 },
        { id: 'sn_18', type: LevelObjectType.SPIKE, x: 3800, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_19', type: LevelObjectType.SPIKE, x: 3830, y: 450, rotation: 0, scale: 1 },

        // Mini size portal & finale extension
        { id: 'sn_20', type: LevelObjectType.PORTAL, subtype: 'MINI_SIZE', x: 4200, y: 360, rotation: 0, scale: 1 },
        { id: 'sn_21', type: LevelObjectType.SPIKE, x: 4500, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_22', type: LevelObjectType.ORB, subtype: 'PINK', x: 4700, y: 390, rotation: 0, scale: 1 },
        { id: 'sn_23', type: LevelObjectType.PORTAL, subtype: 'NORMAL_SIZE', x: 5000, y: 360, rotation: 0, scale: 1 },
        
        { id: 'sn_e1', type: LevelObjectType.BLOCK, x: 5400, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e2', type: LevelObjectType.BLOCK, x: 5430, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e3', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 5430, y: 420, rotation: 0, scale: 1 },
        
        { id: 'sn_e4', type: LevelObjectType.BLOCK, x: 5800, y: 330, rotation: 0, scale: 1 },
        { id: 'sn_e5', type: LevelObjectType.BLOCK, x: 5830, y: 330, rotation: 0, scale: 1 },
        { id: 'sn_24', type: LevelObjectType.SPIKE, x: 6200, y: 450, rotation: 0, scale: 1 },
        
        // --- EXTENDED SECTION (The Long Journey) ---
        // Easy jumps
        { id: 'sn_e6', type: LevelObjectType.BLOCK, x: 6700, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e7', type: LevelObjectType.BLOCK, x: 6730, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e8', type: LevelObjectType.SPIKE, x: 7200, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e9', type: LevelObjectType.ORB, subtype: 'YELLOW', x: 7500, y: 360, rotation: 0, scale: 1 },
        
        // Ship section
        { id: 'sn_e10', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_SHIP', x: 7800, y: 360, rotation: 0, scale: 1 },
        { id: 'sn_e11', type: LevelObjectType.BLOCK, x: 8300, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e12', type: LevelObjectType.BLOCK, x: 8300, y: 420, rotation: 0, scale: 1 },
        { id: 'sn_e13', type: LevelObjectType.BLOCK, x: 8800, y: 90, rotation: 0, scale: 1 },
        { id: 'sn_e14', type: LevelObjectType.BLOCK, x: 8800, y: 60, rotation: 0, scale: 1 },
        { id: 'sn_e15', type: LevelObjectType.BLOCK, x: 9300, y: 270, rotation: 0, scale: 1 },
        { id: 'sn_e16', type: LevelObjectType.SPIKE, x: 9300, y: 240, rotation: 0, scale: 1 },
        { id: 'sn_e17', type: LevelObjectType.SPIKE, x: 9300, y: 300, rotation: 180, scale: 1 },
        
        // Back to Cube
        { id: 'sn_e18', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_CUBE', x: 9800, y: 360, rotation: 0, scale: 1 },
        { id: 'sn_e19', type: LevelObjectType.SPIKE, x: 10300, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e20', type: LevelObjectType.SPIKE, x: 10330, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e21', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 10800, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e22', type: LevelObjectType.BLOCK, x: 11100, y: 300, rotation: 0, scale: 1 },
        { id: 'sn_e23', type: LevelObjectType.BLOCK, x: 11130, y: 300, rotation: 0, scale: 1 },
        { id: 'sn_e24', type: LevelObjectType.ORB, subtype: 'PINK', x: 11500, y: 390, rotation: 0, scale: 1 },
        
        // Final jump
        { id: 'sn_e25', type: LevelObjectType.SPIKE, x: 11900, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e26', type: LevelObjectType.BLOCK, x: 12200, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e27', type: LevelObjectType.BLOCK, x: 12230, y: 450, rotation: 0, scale: 1 },
        { id: 'sn_e28', type: LevelObjectType.BLOCK, x: 12260, y: 450, rotation: 0, scale: 1 },
      ],
    },
  },
  {
    id: 'lvl_cyber_drift',
    title: 'Cyber Drift',
    description: 'High-speed acceleration into spaceship flight. Hold to ascend, release to dive!',
    creatorId: 'creator_studio',
    creatorName: 'Studio Official',
    difficulty: DifficultyLevel.NORMAL,
    starsReward: 2,
    songTitle: 'Cybernetic Drift',
    bpm: 120,
    plays: 890,
    likes: 245,
    isVerified: true,
    createdAt: '2026-09-05T12:00:00Z',
    levelData: {
      version: 1,
      settings: {
        initialSpeed: SpeedMultiplier.SPEED_05X,
        initialMode: GameMode.CUBE,
        initialGravity: 1,
        bpm: 120,
        songTitle: 'Cybernetic Drift',
      },
      objects: [
        // Warmup leap
        { id: 'cd_1', type: LevelObjectType.SPIKE, x: 520, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_2', type: LevelObjectType.PORTAL, subtype: 'SPEED_1X', x: 800, y: 360, rotation: 0, scale: 1 },
        { id: 'cd_3', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_SHIP', x: 1000, y: 360, rotation: 0, scale: 1 },

        // Ship cavern obstacles (spaced out)
        { id: 'cd_4', type: LevelObjectType.BLOCK, x: 1400, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_5', type: LevelObjectType.BLOCK, x: 1400, y: 420, rotation: 0, scale: 1 },
        { id: 'cd_6', type: LevelObjectType.SPIKE, x: 1400, y: 390, rotation: 0, scale: 1 },

        // Ceiling spike
        { id: 'cd_7', type: LevelObjectType.BLOCK, x: 1800, y: 60, rotation: 0, scale: 1 },
        { id: 'cd_8', type: LevelObjectType.SPIKE, x: 1800, y: 90, rotation: 180, scale: 1 },

        // Easy center pillar
        { id: 'cd_9', type: LevelObjectType.BLOCK, x: 2300, y: 270, rotation: 0, scale: 1 },
        { id: 'cd_10', type: LevelObjectType.SPIKE, x: 2300, y: 240, rotation: 0, scale: 1 },
        { id: 'cd_11', type: LevelObjectType.SPIKE, x: 2300, y: 300, rotation: 180, scale: 1 },
        
        // Extended ship part
        { id: 'cd_x1', type: LevelObjectType.BLOCK, x: 2800, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_x2', type: LevelObjectType.SPIKE, x: 2800, y: 420, rotation: 0, scale: 1 },
        { id: 'cd_x3', type: LevelObjectType.BLOCK, x: 3300, y: 60, rotation: 0, scale: 1 },
        { id: 'cd_x4', type: LevelObjectType.SPIKE, x: 3300, y: 90, rotation: 180, scale: 1 },

        // Return to Cube
        { id: 'cd_12', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_CUBE', x: 3800, y: 360, rotation: 0, scale: 1 },
        { id: 'cd_13', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 4200, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_14', type: LevelObjectType.SPIKE, x: 4500, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_15', type: LevelObjectType.SPIKE, x: 4550, y: 450, rotation: 0, scale: 1 },
        
        // Finale extension
        { id: 'cd_16', type: LevelObjectType.BLOCK, x: 4800, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_17', type: LevelObjectType.BLOCK, x: 4830, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_18', type: LevelObjectType.SPIKE, x: 5000, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_19', type: LevelObjectType.BLOCK, x: 5300, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_20', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 5300, y: 420, rotation: 0, scale: 1 },
        { id: 'cd_21', type: LevelObjectType.SPIKE, x: 5600, y: 450, rotation: 0, scale: 1 },
        
        // --- EXTENDED SECTION ---
        { id: 'cd_e1', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_SHIP', x: 6000, y: 360, rotation: 0, scale: 1 },
        { id: 'cd_e2', type: LevelObjectType.BLOCK, x: 6500, y: 150, rotation: 0, scale: 1 },
        { id: 'cd_e3', type: LevelObjectType.SPIKE, x: 6500, y: 180, rotation: 180, scale: 1 },
        
        { id: 'cd_e4', type: LevelObjectType.BLOCK, x: 7000, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e5', type: LevelObjectType.SPIKE, x: 7000, y: 420, rotation: 0, scale: 1 },
        
        { id: 'cd_e6', type: LevelObjectType.BLOCK, x: 7500, y: 250, rotation: 0, scale: 1 },
        { id: 'cd_e7', type: LevelObjectType.SPIKE, x: 7500, y: 220, rotation: 0, scale: 1 },
        { id: 'cd_e8', type: LevelObjectType.SPIKE, x: 7500, y: 280, rotation: 180, scale: 1 },

        { id: 'cd_e9', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_CUBE', x: 8000, y: 360, rotation: 0, scale: 1 },
        { id: 'cd_e10', type: LevelObjectType.SPIKE, x: 8400, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e11', type: LevelObjectType.SPIKE, x: 8800, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e12', type: LevelObjectType.SPIKE, x: 8830, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e13', type: LevelObjectType.ORB, subtype: 'YELLOW', x: 9200, y: 360, rotation: 0, scale: 1 },
        
        { id: 'cd_e14', type: LevelObjectType.BLOCK, x: 9700, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e15', type: LevelObjectType.BLOCK, x: 9730, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e16', type: LevelObjectType.SPIKE, x: 10200, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e17', type: LevelObjectType.PAD, subtype: 'PINK', x: 10500, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e18', type: LevelObjectType.BLOCK, x: 10900, y: 300, rotation: 0, scale: 1 },
        { id: 'cd_e19', type: LevelObjectType.BLOCK, x: 11200, y: 450, rotation: 0, scale: 1 },
        { id: 'cd_e20', type: LevelObjectType.BLOCK, x: 11230, y: 450, rotation: 0, scale: 1 },
      ],
    },
  },
  {
    id: 'lvl_quantum_matrix',
    title: 'Quantum Matrix',
    description: 'Master the Ball gamemode and gravity flipping with perfect rhythmic timing.',
    creatorId: 'creator_studio',
    creatorName: 'Studio Official',
    difficulty: DifficultyLevel.NORMAL,
    starsReward: 4,
    songTitle: 'Quantum Pulse',
    bpm: 125,
    plays: 620,
    likes: 195,
    isVerified: true,
    createdAt: '2026-09-08T12:00:00Z',
    levelData: {
      version: 1,
      settings: {
        initialSpeed: SpeedMultiplier.SPEED_05X,
        initialMode: GameMode.CUBE,
        initialGravity: 1,
        bpm: 125,
        songTitle: 'Quantum Pulse',
      },
      objects: [
        { id: 'qm_1', type: LevelObjectType.SPIKE, x: 650, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_2', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_BALL', x: 1000, y: 360, rotation: 0, scale: 1 },

        // Ball gravity flip corridor (very spaced out)
        { id: 'qm_3', type: LevelObjectType.SPIKE, x: 1400, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_4', type: LevelObjectType.BLOCK, x: 1400, y: 150, rotation: 0, scale: 1 },
        { id: 'qm_5', type: LevelObjectType.BLOCK, x: 1430, y: 150, rotation: 0, scale: 1 },
        { id: 'qm_6', type: LevelObjectType.BLOCK, x: 1460, y: 150, rotation: 0, scale: 1 },

        // Flip back down
        { id: 'qm_7', type: LevelObjectType.SPIKE, x: 1950, y: 180, rotation: 180, scale: 1 },
        { id: 'qm_8', type: LevelObjectType.BLOCK, x: 1950, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_9', type: LevelObjectType.BLOCK, x: 1980, y: 450, rotation: 0, scale: 1 },

        // Floating gravity orb
        { id: 'qm_10', type: LevelObjectType.ORB, subtype: 'GRAVITY', x: 2400, y: 300, rotation: 0, scale: 1 },
        { id: 'qm_11', type: LevelObjectType.SPIKE, x: 2400, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_12', type: LevelObjectType.SPIKE, x: 2800, y: 90, rotation: 180, scale: 1 },
        { id: 'qm_13', type: LevelObjectType.PAD, subtype: 'GRAVITY', x: 3100, y: 60, rotation: 180, scale: 1 },
        
        // Ball extensions
        { id: 'qm_e1', type: LevelObjectType.SPIKE, x: 3500, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_e2', type: LevelObjectType.BLOCK, x: 3500, y: 150, rotation: 0, scale: 1 },
        { id: 'qm_e3', type: LevelObjectType.BLOCK, x: 3530, y: 150, rotation: 0, scale: 1 },
        { id: 'qm_e4', type: LevelObjectType.SPIKE, x: 3900, y: 180, rotation: 180, scale: 1 },
        { id: 'qm_e5', type: LevelObjectType.BLOCK, x: 3900, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_e6', type: LevelObjectType.BLOCK, x: 3930, y: 450, rotation: 0, scale: 1 },

        // Finale
        { id: 'qm_14', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_CUBE', x: 4400, y: 360, rotation: 0, scale: 1 },
        { id: 'qm_15', type: LevelObjectType.SPIKE, x: 4800, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_16', type: LevelObjectType.SPIKE, x: 4900, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_17', type: LevelObjectType.BLOCK, x: 5300, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_18', type: LevelObjectType.BLOCK, x: 5330, y: 450, rotation: 0, scale: 1 },
        { id: 'qm_19', type: LevelObjectType.BLOCK, x: 5360, y: 450, rotation: 0, scale: 1 },
      ],
    },
  },
  {
    id: 'lvl_demon_surge',
    title: 'Demon Surge',
    description: 'Fast reflexes needed! Wave zig-zags and rapid speed portals through corridors.',
    creatorId: 'creator_studio',
    creatorName: 'Studio Official',
    difficulty: DifficultyLevel.HARD,
    starsReward: 8,
    songTitle: 'Demon Infiltration',
    bpm: 135,
    plays: 1205,
    likes: 512,
    isVerified: true,
    createdAt: '2026-09-10T12:00:00Z',
    levelData: {
      version: 1,
      settings: {
        initialSpeed: SpeedMultiplier.SPEED_1X,
        initialMode: GameMode.CUBE,
        initialGravity: 1,
        bpm: 135,
        songTitle: 'Demon Infiltration',
      },
      objects: [
        { id: 'ds_1', type: LevelObjectType.SPIKE, x: 680, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_2', type: LevelObjectType.PORTAL, subtype: 'SPEED_2X', x: 1000, y: 360, rotation: 0, scale: 1 },
        { id: 'ds_3', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_WAVE', x: 1400, y: 360, rotation: 0, scale: 1 },

        // Wave slopes and tight corridor blocks (spaced)
        { id: 'ds_4', type: LevelObjectType.BLOCK, x: 2000, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_5', type: LevelObjectType.BLOCK, x: 2000, y: 420, rotation: 0, scale: 1 },
        
        { id: 'ds_6', type: LevelObjectType.BLOCK, x: 2500, y: 180, rotation: 0, scale: 1 },
        { id: 'ds_7', type: LevelObjectType.BLOCK, x: 2500, y: 210, rotation: 0, scale: 1 },
        
        { id: 'ds_8', type: LevelObjectType.BLOCK, x: 3000, y: 390, rotation: 0, scale: 1 },
        { id: 'ds_9', type: LevelObjectType.BLOCK, x: 3000, y: 420, rotation: 0, scale: 1 },
        
        { id: 'ds_10', type: LevelObjectType.BLOCK, x: 3500, y: 240, rotation: 0, scale: 1 },
        { id: 'ds_11', type: LevelObjectType.BLOCK, x: 3500, y: 270, rotation: 0, scale: 1 },

        // Speed 3x sprint
        { id: 'ds_12', type: LevelObjectType.PORTAL, subtype: 'SPEED_3X', x: 4000, y: 360, rotation: 0, scale: 1 },
        { id: 'ds_13', type: LevelObjectType.PORTAL, subtype: 'GAMEMODE_CUBE', x: 4500, y: 360, rotation: 0, scale: 1 },
        { id: 'ds_14', type: LevelObjectType.PAD, subtype: 'RED', x: 5000, y: 450, rotation: 0, scale: 1 },
        
        // Final cube jumps
        { id: 'ds_15', type: LevelObjectType.SPIKE, x: 5500, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_16', type: LevelObjectType.SPIKE, x: 5530, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_17', type: LevelObjectType.SPIKE, x: 5560, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_18', type: LevelObjectType.ORB, subtype: 'RED', x: 6000, y: 300, rotation: 0, scale: 1 },
        
        { id: 'ds_e1', type: LevelObjectType.BLOCK, x: 6500, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_e2', type: LevelObjectType.BLOCK, x: 6530, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_e3', type: LevelObjectType.SPIKE, x: 6530, y: 420, rotation: 0, scale: 1 },
        
        { id: 'ds_e4', type: LevelObjectType.PAD, subtype: 'YELLOW', x: 7000, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_e5', type: LevelObjectType.SPIKE, x: 7300, y: 450, rotation: 0, scale: 1 },
        { id: 'ds_e6', type: LevelObjectType.SPIKE, x: 7330, y: 450, rotation: 0, scale: 1 },
      ],
    },
  },
];
