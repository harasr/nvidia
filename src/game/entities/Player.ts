import { GameMode, Hitbox, SpeedMultiplier } from '../../types/game.ts';
import { PHYSICS_CONFIG, PhysicsSystem } from '../physics/PhysicsSystem.ts';

export class Player {
  x: number = 100;
  y: number = 450;
  vx: number = 0;
  vy: number = 0;
  width: number = 30;
  height: number = 30;
  rotation: number = 0;
  gamemode: GameMode = GameMode.CUBE;
  gravityDirection: 1 | -1 = 1;
  isGrounded: boolean = true;
  isDead: boolean = false;
  isMini: boolean = false;
  speed: SpeedMultiplier = SpeedMultiplier.SPEED_1X;

  // Jump buffering & coyote time
  private jumpBufferTimer: number = 0;
  private coyoteTimer: number = 0;

  // Trail history
  trail: Array<{ x: number; y: number; alpha: number; size: number }> = [];

  constructor() {
    this.reset(100, 450);
  }

  reset(x: number = 100, y: number = 450): void {
    this.x = x;
    this.y = y;
    this.vx = PhysicsSystem.getHorizontalSpeed(this.speed);
    this.vy = 0;
    this.rotation = 0;
    this.gamemode = GameMode.CUBE;
    this.gravityDirection = 1;
    this.isGrounded = false;
    this.isDead = false;
    this.isMini = false;
    this.speed = SpeedMultiplier.SPEED_1X;
    this.updateDimensions();
    this.trail = [];
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
  }

  updateDimensions(): void {
    const baseSize = PHYSICS_CONFIG.BLOCK_SIZE;
    const scale = this.isMini ? PHYSICS_CONFIG.MINI_SCALE : 1.0;
    this.width = baseSize * scale;
    this.height = baseSize * scale;
  }

  getHitbox(): Hitbox {
    // Player hitbox has forgiving inset (4px) to prevent frustrating edge catches
    const inset = 4;
    return {
      x: this.x + inset,
      y: this.y + inset,
      width: this.width - inset * 2,
      height: this.height - inset * 2,
    };
  }

  update(isInputHeld: boolean, justPressed: boolean, dt: number): void {
    if (this.isDead) return;

    // Update speed
    this.vx = PhysicsSystem.getHorizontalSpeed(this.speed);
    this.x += this.vx * dt;

    // Buffer jump input (generous 180ms buffer)
    if (justPressed) {
      this.jumpBufferTimer = 0.18;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    if (this.isGrounded) {
      this.coyoteTimer = 0.14; // 140ms coyote time
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Apply Mode Physics
    switch (this.gamemode) {
      case GameMode.CUBE:
        // Handle buffered jump or hold jump
        if ((this.jumpBufferTimer > 0 || isInputHeld) && (this.isGrounded || this.coyoteTimer > 0)) {
          this.jump();
          this.jumpBufferTimer = 0;
          this.coyoteTimer = 0;
        }
        PhysicsSystem.applyCubePhysics(this, dt);
        this.y += this.vy * dt;
        break;

      case GameMode.SHIP:
        PhysicsSystem.applyShipPhysics(this, isInputHeld, dt);
        this.y += this.vy * dt;
        break;

      case GameMode.BALL:
        if (justPressed && (this.isGrounded || this.coyoteTimer > 0)) {
          this.flipGravity();
          this.isGrounded = false;
          this.coyoteTimer = 0;
        }
        PhysicsSystem.applyBallPhysics(this, dt);
        this.y += this.vy * dt;
        break;

      case GameMode.WAVE:
        PhysicsSystem.applyWavePhysics(this, isInputHeld);
        this.y += this.vy * dt;
        break;
    }

    // Update trail
    this.updateTrail(dt);
  }

  jump(forceMultiplier: number = 1.0): void {
    const baseForce = PHYSICS_CONFIG.CUBE_JUMP_FORCE;
    const miniMult = this.isMini ? PHYSICS_CONFIG.MINI_JUMP_MULTIPLIER : 1.0;
    this.vy = -baseForce * miniMult * this.gravityDirection * forceMultiplier;
    this.isGrounded = false;
  }

  flipGravity(): void {
    this.gravityDirection = (this.gravityDirection * -1) as 1 | -1;
    this.vy = 200 * this.gravityDirection; // small push away from ground
  }

  hitPad(force: number, invertGravity: boolean = false): void {
    if (invertGravity) {
      this.gravityDirection = (this.gravityDirection * -1) as 1 | -1;
    }
    const miniMult = this.isMini ? 0.9 : 1.0;
    this.vy = -force * miniMult * this.gravityDirection;
    this.isGrounded = false;
  }

  activateOrb(force: number, invertGravity: boolean = false, snapDown: boolean = false): void {
    if (snapDown) {
      // Black orb snaps down with high velocity
      this.vy = 1200 * this.gravityDirection;
      return;
    }

    if (invertGravity) {
      this.gravityDirection = (this.gravityDirection * -1) as 1 | -1;
    }

    const miniMult = this.isMini ? 0.9 : 1.0;
    this.vy = -force * miniMult * this.gravityDirection;
    this.isGrounded = false;
  }

  setGamemode(mode: GameMode): void {
    if (this.gamemode !== mode) {
      this.gamemode = mode;
      this.rotation = 0;
      this.vy = 0;
    }
  }

  setMini(mini: boolean): void {
    if (this.isMini !== mini) {
      this.isMini = mini;
      this.updateDimensions();
    }
  }

  setSpeed(speed: SpeedMultiplier): void {
    this.speed = speed;
  }

  private updateTrail(dt: number): void {
    // Add new trail position
    const sampleRate = this.gamemode === GameMode.WAVE ? 1 : 2;
    if (Math.random() < 0.9) {
      this.trail.unshift({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        alpha: 0.8,
        size: this.width * (this.gamemode === GameMode.WAVE ? 0.45 : 0.8),
      });
    }

    // Decay trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].alpha -= dt * 3.5;
      if (this.trail[i].alpha <= 0) {
        this.trail.splice(i, 1);
      }
    }

    if (this.trail.length > 25) {
      this.trail.length = 25;
    }
  }
}
