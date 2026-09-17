import { EngineState, GameMode, SpeedMultiplier } from '../../types/game.ts';
import { LevelData } from '../../types/level.ts';
import { AudioEngine } from '../audio/AudioEngine.ts';
import { GameObject, ObjectFactory } from '../entities/LevelObject.ts';
import { Player } from '../entities/Player.ts';
import { InputManager } from '../input/InputManager.ts';
import { ParticlePool } from '../particles/ParticlePool.ts';
import { PHYSICS_CONFIG } from '../physics/PhysicsSystem.ts';
import { Camera } from '../rendering/Camera.ts';
import { Renderer } from '../rendering/Renderer.ts';
import { GameLoop } from './GameLoop.ts';

export interface GameEngineCallbacks {
  onStateChange?: (state: EngineState) => void;
  onProgressUpdate?: (percentage: number, attempts: number, timeElapsed: number) => void;
  onDeath?: (percentage: number, attempts: number) => void;
  onComplete?: (attempts: number, timeElapsed: number) => void;
  onFpsUpdate?: (fps: number) => void;
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  player: Player;
  objects: GameObject[] = [];
  camera: Camera;
  renderer: Renderer;
  audio: AudioEngine;
  input: InputManager;
  particles: ParticlePool;
  loop: GameLoop;

  state: EngineState = EngineState.IDLE;
  levelData: LevelData | null = null;
  totalLength: number = 2000;

  // Stats
  attempts: number = 1;
  timeElapsed: number = 0;
  isPracticing: boolean = false;
  practiceCheckpoint: { x: number; y: number; mode: GameMode; grav: 1 | -1; speed: SpeedMultiplier } | null = null;

  callbacks: GameEngineCallbacks = {};

  // Level start coordinates
  private startX: number = 120;
  private startY: number = PHYSICS_CONFIG.FLOOR_Y - 30;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.player = new Player();
    this.camera = new Camera(canvas.width, canvas.height);
    this.renderer = new Renderer(canvas);
    this.audio = new AudioEngine(140);
    this.input = new InputManager();
    this.particles = new ParticlePool(600);

    this.loop = new GameLoop(
      (dt, _currentTime) => this.update(dt),
      () => this.render()
    );

    this.input.attach(canvas);
  }

  loadLevel(data: LevelData): void {
    this.levelData = data;
    this.audio.setBpm(data.settings.bpm || 140);

    // Calculate level length
    let maxX = 1200;
    this.objects = data.objects.map((raw) => {
      const obj = ObjectFactory.create(raw);
      if (obj.x + obj.width > maxX) {
        maxX = obj.x + obj.width;
      }
      return obj;
    });

    this.totalLength = maxX + 400; // Extra room for victory trigger
    this.resetLevel(false);
  }

  start(): void {
    if (this.state === EngineState.PLAYING) return;
    this.state = EngineState.PLAYING;
    this.callbacks.onStateChange?.(this.state);
    this.audio.play();
    this.loop.start();
  }

  pause(): void {
    if (this.state !== EngineState.PLAYING) return;
    this.state = EngineState.PAUSED;
    this.callbacks.onStateChange?.(this.state);
    this.audio.pause();
    this.loop.stop();
  }

  resume(): void {
    if (this.state !== EngineState.PAUSED) return;
    this.state = EngineState.PLAYING;
    this.callbacks.onStateChange?.(this.state);
    this.audio.play();
    this.loop.start();
  }

  restart(): void {
    this.attempts++;
    this.resetLevel(true);
    this.state = EngineState.PLAYING;
    this.callbacks.onStateChange?.(this.state);
    this.audio.seek(0);
    this.audio.play();
    if (!this.loop.running) {
      this.loop.start();
    }
  }

  resetLevel(keepAttempts: boolean = true): void {
    if (!keepAttempts) {
      this.attempts = 1;
      this.practiceCheckpoint = null;
    }

    this.timeElapsed = 0;
    this.input.reset();
    this.particles.reset();

    if (this.isPracticing && this.practiceCheckpoint) {
      this.player.reset(this.practiceCheckpoint.x, this.practiceCheckpoint.y);
      this.player.gamemode = this.practiceCheckpoint.mode;
      this.player.gravityDirection = this.practiceCheckpoint.grav;
      this.player.speed = this.practiceCheckpoint.speed;
      this.camera.reset(this.practiceCheckpoint.x, this.practiceCheckpoint.y);
    } else {
      this.player.reset(this.startX, this.startY);
      if (this.levelData) {
        this.player.speed = this.levelData.settings.initialSpeed || SpeedMultiplier.SPEED_1X;
        this.player.gamemode = this.levelData.settings.initialMode || GameMode.CUBE;
        this.player.gravityDirection = this.levelData.settings.initialGravity || 1;
      }
      this.camera.reset(this.startX, this.startY);
    }

    // Re-instantiate objects to reset internal state (e.g. orbs and portals)
    if (this.levelData) {
      this.objects = this.levelData.objects.map((raw) => ObjectFactory.create(raw));
    }
  }

  setPracticeCheckpoint(): void {
    if (!this.isPracticing) return;
    this.practiceCheckpoint = {
      x: this.player.x,
      y: this.player.y,
      mode: this.player.gamemode,
      grav: this.player.gravityDirection,
      speed: this.player.speed,
    };
    this.particles.emitOrbFlare(this.player.x, this.player.y, '#00FF66');
  }

  clearPracticeCheckpoint(): void {
    this.practiceCheckpoint = null;
  }

  togglePractice(): void {
    this.isPracticing = !this.isPracticing;
    if (!this.isPracticing) {
      this.practiceCheckpoint = null;
    }
  }

  private update(dt: number): void {
    if (this.state !== EngineState.PLAYING) return;

    this.timeElapsed += dt;

    // 1. Process unified input
    this.input.update();
    const isHeld = this.input.isPressed;
    const justPressed = this.input.justPressed;

    // Audio SFX on jump
    if (justPressed && (this.player.isGrounded || this.player.gamemode === GameMode.BALL)) {
      this.audio.playJump();
      this.particles.emitJumpDust(this.player.x + this.player.width / 2, this.player.y + this.player.height, this.player.gravityDirection);
    }

    // Ship thruster particles
    if (this.player.gamemode === GameMode.SHIP && isHeld) {
      this.particles.emitShipThruster(this.player.x, this.player.y + this.player.height / 2);
    }

    // 2. Update player physics & movement
    this.player.update(isHeld, justPressed, dt);

    // 3. Ground & Ceiling Floor Constraints
    this.handleFloorAndCeilingCollision();

    // 4. Object Collisions & Triggers
    this.handleObjectCollisions(justPressed);

    if (this.player.isDead) {
      this.handleDeath();
      return;
    }

    // 5. Check Level Completion
    if (this.player.x >= this.totalLength) {
      this.handleLevelComplete();
      return;
    }

    // 6. Update Particles & Camera
    this.particles.update(dt);
    this.camera.update(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, dt);

    // 7. Update Beat synchronization
    const audioTime = this.audio.getCurrentTime();
    this.audio.beatManager.update(audioTime);

    // 8. Progress and FPS Callback updates
    const currentPercent = Math.min(100, Math.floor((this.player.x / this.totalLength) * 100));
    this.callbacks.onProgressUpdate?.(currentPercent, this.attempts, this.timeElapsed);
    this.callbacks.onFpsUpdate?.(this.loop.fps);
  }

  private handleFloorAndCeilingCollision(): void {
    const floorY = PHYSICS_CONFIG.FLOOR_Y;
    const ceilingY = PHYSICS_CONFIG.CEILING_Y;

    // Floor collision
    if (this.player.gravityDirection === 1) {
      if (this.player.y + this.player.height >= floorY) {
        if (this.player.gamemode === GameMode.WAVE) {
          // Wave dies on hitting ground directly
          this.player.isDead = true;
          return;
        }
        this.player.y = floorY - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    } else {
      // Inverted gravity floor ceiling
      if (this.player.y <= ceilingY) {
        if (this.player.gamemode === GameMode.WAVE) {
          this.player.isDead = true;
          return;
        }
        this.player.y = ceilingY;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    }

    // Ship & Wave boundary limits
    if (this.player.gamemode === GameMode.SHIP) {
      if (this.player.y < ceilingY) {
        this.player.y = ceilingY;
        this.player.vy = 0;
      }
    }
  }

  private handleObjectCollisions(justPressed: boolean): void {
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];

      // Broad-phase distance filter
      if (Math.abs(obj.x - this.player.x) > 120) continue;

      const result = obj.onPlayerOverlap(this.player, justPressed, (type, x, y, color) => {
        if (type === 'ORB') {
          this.audio.playOrb();
          this.particles.emitOrbFlare(x, y, color);
        } else if (type === 'PAD') {
          this.audio.playPad();
          this.particles.emitPadBurst(x, y, color);
        } else if (type === 'PORTAL') {
          this.audio.playPortal();
          this.particles.emitPortalTransition(x, y, color);
          this.renderer.triggerFlash(0.35);
        }
      });

      if (result.died) {
        this.player.isDead = true;
        break;
      }
    }
  }

  private handleDeath(): void {
    this.audio.playDeath();
    this.camera.triggerShake(22, 0.4);
    this.renderer.triggerFlash(0.75);
    this.particles.emitDeathExplosion(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.player.gamemode === GameMode.WAVE ? '#00F0FF' : '#FF007F'
    );

    const currentPercent = Math.min(100, Math.floor((this.player.x / this.totalLength) * 100));
    this.callbacks.onDeath?.(currentPercent, this.attempts);

    // Fast restart < 100ms per prompt specs!
    setTimeout(() => {
      if (this.state === EngineState.PLAYING) {
        this.restart();
      }
    }, 90);
  }

  private handleLevelComplete(): void {
    this.state = EngineState.LEVEL_COMPLETE;
    this.callbacks.onStateChange?.(this.state);
    this.audio.playWin();
    this.renderer.triggerFlash(0.9);
    this.particles.emitDeathExplosion(this.player.x, this.player.y, '#FFE600');
    this.callbacks.onComplete?.(this.attempts, this.timeElapsed);
  }

  private render(): void {
    const audioTime = this.audio.getCurrentTime();
    const beatData = this.audio.beatManager.update(audioTime);

    this.renderer.render(
      this.player,
      this.objects,
      this.particles,
      this.camera,
      beatData.beatIntensity,
      this.totalLength,
      this.attempts,
      this.isPracticing
    );
  }

  destroy(): void {
    this.loop.stop();
    this.audio.stop();
    this.input.detach();
  }
}
