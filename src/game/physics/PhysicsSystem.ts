import { GameMode, SpeedMultiplier } from '../../types/game.ts';

export const BASE_SPEEDS: Record<SpeedMultiplier, number> = {
  [SpeedMultiplier.SPEED_0_5X]: 240,
  [SpeedMultiplier.SPEED_1X]: 330, // tuned for better human reaction time
  [SpeedMultiplier.SPEED_2X]: 440,
  [SpeedMultiplier.SPEED_3X]: 540,
  [SpeedMultiplier.SPEED_4X]: 660,
};

export const PHYSICS_CONFIG = {
  // Grid reference
  BLOCK_SIZE: 30,
  FLOOR_Y: 480, // Default floor Y coordinate in game canvas
  CEILING_Y: 60, // Default ceiling Y coordinate for ship/wave boundary

  // Cube physics - lighter, floatier, and responsive
  CUBE_GRAVITY: 1420,
  CUBE_JUMP_FORCE: 550,
  CUBE_TERMINAL_VELOCITY: 720,
  CUBE_ROTATION_SPEED: 410, // degrees per second in air

  // Ship physics - smooth flight & buoyancy
  SHIP_GRAVITY: 850,
  SHIP_THRUST: -1080,
  SHIP_TERMINAL_VELOCITY: 420,
  SHIP_ROTATION_LERP: 10,

  // Ball physics
  BALL_GRAVITY: 1550,
  BALL_ROLL_SPEED: 380, // degrees per second while grounded

  // Wave physics
  WAVE_ANGLE_RATIO: 1.0, // 45 degree slope: vy = vx or -vx

  // Mini mode multipliers
  MINI_SCALE: 0.7,
  MINI_JUMP_MULTIPLIER: 0.90,
  MINI_GRAVITY_MULTIPLIER: 1.10,

  // Jump pads - balanced for lighter gravity
  PAD_YELLOW_FORCE: 760,
  PAD_PINK_FORCE: 560,
  PAD_RED_FORCE: 960,

  // Orbs - balanced for lighter gravity
  ORB_YELLOW_FORCE: 580,
  ORB_PINK_FORCE: 440,
  ORB_RED_FORCE: 820,
};

export class PhysicsSystem {
  static getHorizontalSpeed(speed: SpeedMultiplier): number {
    return BASE_SPEEDS[speed] || BASE_SPEEDS[SpeedMultiplier.SPEED_1X];
  }

  static applyCubePhysics(
    player: {
      vy: number;
      isGrounded: boolean;
      rotation: number;
      gravityDirection: 1 | -1;
      isMini: boolean;
    },
    dt: number
  ): void {
    const gravMult = player.isMini ? PHYSICS_CONFIG.MINI_GRAVITY_MULTIPLIER : 1;
    const gravity = PHYSICS_CONFIG.CUBE_GRAVITY * gravMult * player.gravityDirection;

    if (!player.isGrounded) {
      player.vy += gravity * dt;
      const term = PHYSICS_CONFIG.CUBE_TERMINAL_VELOCITY;
      if (player.gravityDirection === 1) {
        player.vy = Math.min(player.vy, term);
      } else {
        player.vy = Math.max(player.vy, -term);
      }

      // Rotate while in the air
      player.rotation += PHYSICS_CONFIG.CUBE_ROTATION_SPEED * player.gravityDirection * dt;
    } else {
      // Snap rotation to nearest 90 degrees smoothly on ground
      const current = player.rotation;
      const snapped = Math.round(current / 90) * 90;
      player.rotation = player.rotation + (snapped - player.rotation) * Math.min(dt * 20, 1);
    }
  }

  static applyShipPhysics(
    player: {
      vy: number;
      rotation: number;
      gravityDirection: 1 | -1;
      isMini: boolean;
    },
    isInputHeld: boolean,
    dt: number
  ): void {
    const gravMult = player.isMini ? 1.2 : 1.0;
    const term = PHYSICS_CONFIG.SHIP_TERMINAL_VELOCITY * (player.isMini ? 1.15 : 1.0);

    if (isInputHeld) {
      // Thrust in opposite direction of gravity
      const thrust = PHYSICS_CONFIG.SHIP_THRUST * gravMult * player.gravityDirection;
      player.vy += thrust * dt;
    } else {
      // Fall with gravity
      const grav = PHYSICS_CONFIG.SHIP_GRAVITY * gravMult * player.gravityDirection;
      player.vy += grav * dt;
    }

    // Clamp vertical velocity
    player.vy = Math.max(-term, Math.min(term, player.vy));

    // Target rotation based on vertical velocity
    const targetAngle = (player.vy / term) * 45 * player.gravityDirection;
    player.rotation += (targetAngle - player.rotation) * Math.min(dt * PHYSICS_CONFIG.SHIP_ROTATION_LERP, 1);
  }

  static applyBallPhysics(
    player: {
      vy: number;
      isGrounded: boolean;
      rotation: number;
      gravityDirection: 1 | -1;
      isMini: boolean;
    },
    dt: number
  ): void {
    const gravity = PHYSICS_CONFIG.BALL_GRAVITY * player.gravityDirection;

    if (!player.isGrounded) {
      player.vy += gravity * dt;
      const term = PHYSICS_CONFIG.CUBE_TERMINAL_VELOCITY;
      if (player.gravityDirection === 1) {
        player.vy = Math.min(player.vy, term);
      } else {
        player.vy = Math.max(player.vy, -term);
      }
    }

    // Ball constantly rolls
    player.rotation += PHYSICS_CONFIG.BALL_ROLL_SPEED * player.gravityDirection * dt;
  }

  static applyWavePhysics(
    player: {
      vy: number;
      rotation: number;
      gravityDirection: 1 | -1;
      isMini: boolean;
      speed: SpeedMultiplier;
    },
    isInputHeld: boolean
  ): void {
    const hSpeed = BASE_SPEEDS[player.speed];
    const verticalMultiplier = player.isMini ? 1.35 : 1.0;
    const waveSpeed = hSpeed * verticalMultiplier;

    // In normal gravity: hold = UP (-vy), release = DOWN (+vy)
    // In reverse gravity: hold = DOWN (+vy), release = UP (-vy)
    if (player.gravityDirection === 1) {
      player.vy = isInputHeld ? -waveSpeed : waveSpeed;
      player.rotation = isInputHeld ? -45 : 45;
    } else {
      player.vy = isInputHeld ? waveSpeed : -waveSpeed;
      player.rotation = isInputHeld ? 45 : -45;
    }
  }
}
