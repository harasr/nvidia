import { GameMode, Hitbox, SpeedMultiplier } from '../../types/game.ts';
import {
  LevelObject as ILevelObject,
  LevelObjectType,
  OrbSubtype,
  PadSubtype,
  PortalSubtype,
} from '../../types/level.ts';
import { getBlockHitbox, getOrbHitbox, getSpikeHitbox, intersects } from '../physics/AABB.ts';
import { PHYSICS_CONFIG } from '../physics/PhysicsSystem.ts';
import { Player } from './Player.ts';

export abstract class GameObject {
  id: string;
  type: LevelObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  subtype?: string;
  properties: Record<string, unknown>;

  constructor(data: ILevelObject) {
    this.id = data.id;
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.width = data.width || PHYSICS_CONFIG.BLOCK_SIZE;
    this.height = data.height || PHYSICS_CONFIG.BLOCK_SIZE;
    this.rotation = data.rotation || 0;
    this.scale = data.scale || 1.0;
    this.subtype = data.subtype;
    this.properties = data.properties || {};
  }

  abstract getHitbox(): Hitbox;
  abstract onPlayerOverlap(
    player: Player,
    inputJustPressed: boolean,
    onEffectTrigger?: (effectType: string, x: number, y: number, color: string) => void
  ): { died: boolean; activated: boolean };
}

export class BlockObject extends GameObject {
  getHitbox(): Hitbox {
    return getBlockHitbox(this.x, this.y, this.width * this.scale, this.height * this.scale);
  }

  onPlayerOverlap(
    player: Player
  ): { died: boolean; activated: boolean } {
    const pBox = player.getHitbox();
    const bBox = this.getHitbox();

    if (!intersects(pBox, bBox)) {
      return { died: false, activated: false };
    }

    // In Wave mode, hitting any solid wall is fatal
    if (player.gamemode === GameMode.WAVE) {
      return { died: true, activated: false };
    }

    // Calculate overlap depths
    const prevY = player.y - player.vy * 0.016;
    const isPlayerFalling = player.gravityDirection === 1 ? player.vy >= 0 : player.vy <= 0;

    // Normal gravity: landing on top
    if (player.gravityDirection === 1) {
      const playerBottom = pBox.y + pBox.height;
      const blockTop = bBox.y;

      // If player was previously above or close to the top of the block, land!
      if (isPlayerFalling && playerBottom - blockTop <= 18) {
        player.y = blockTop - player.height;
        player.vy = 0;
        player.isGrounded = true;
        return { died: false, activated: true };
      }
    } else {
      // Inverted gravity: landing on bottom
      const playerTop = pBox.y;
      const blockBottom = bBox.y + bBox.height;

      if (isPlayerFalling && blockBottom - playerTop <= 18) {
        player.y = blockBottom;
        player.vy = 0;
        player.isGrounded = true;
        return { died: false, activated: true };
      }
    }

    // Hitting the front/side of the block face-first is fatal
    return { died: true, activated: false };
  }
}

export class SpikeObject extends GameObject {
  getHitbox(): Hitbox {
    return getSpikeHitbox(
      this.x,
      this.y,
      this.width * this.scale,
      this.height * this.scale,
      this.rotation,
      0.22 // Hitbox is ~22% smaller than visual sprite for fair hitbox margins!
    );
  }

  onPlayerOverlap(player: Player): { died: boolean; activated: boolean } {
    const pBox = player.getHitbox();
    const sBox = this.getHitbox();

    if (intersects(pBox, sBox)) {
      return { died: true, activated: false };
    }
    return { died: false, activated: false };
  }
}

export class PadObject extends GameObject {
  getHitbox(): Hitbox {
    // Pads are thin bottom/top contact strips
    const h = (this.height * this.scale) / 3;
    const yOffset = this.rotation === 180 ? 0 : this.height * this.scale - h;
    return {
      x: this.x + 3,
      y: this.y + yOffset,
      width: this.width * this.scale - 6,
      height: h,
    };
  }

  onPlayerOverlap(
    player: Player,
    _inputJustPressed: boolean,
    onEffectTrigger?: (effectType: string, x: number, y: number, color: string) => void
  ): { died: boolean; activated: boolean } {
    const pBox = player.getHitbox();
    const padBox = this.getHitbox();

    if (!intersects(pBox, padBox)) {
      return { died: false, activated: false };
    }

    const type = (this.subtype as PadSubtype) || 'YELLOW';
    let force = PHYSICS_CONFIG.PAD_YELLOW_FORCE;
    let color = '#FFE600';
    let invert = false;

    if (type === 'PINK') {
      force = PHYSICS_CONFIG.PAD_PINK_FORCE;
      color = '#FF4694';
    } else if (type === 'RED') {
      force = PHYSICS_CONFIG.PAD_RED_FORCE;
      color = '#FF1A1A';
    } else if (type === 'GRAVITY') {
      force = 450;
      color = '#00F0FF';
      invert = true;
    }

    player.hitPad(force, invert);
    onEffectTrigger?.('PAD', this.x + this.width / 2, this.y + this.height / 2, color);
    return { died: false, activated: true };
  }
}

export class OrbObject extends GameObject {
  private hasBeenActivated: boolean = false;

  getHitbox(): Hitbox {
    const r = (this.width * this.scale) / 2 + 10; // slightly generous interaction radius
    return getOrbHitbox(this.x + this.width / 2, this.y + this.height / 2, r);
  }

  onPlayerOverlap(
    player: Player,
    inputJustPressed: boolean,
    onEffectTrigger?: (effectType: string, x: number, y: number, color: string) => void
  ): { died: boolean; activated: boolean } {
    const pBox = player.getHitbox();
    const orbBox = this.getHitbox();

    if (this.hasBeenActivated || !intersects(pBox, orbBox)) {
      return { died: false, activated: false };
    }

    // Orbs activate on jump press while inside
    if (inputJustPressed) {
      this.hasBeenActivated = true;
      const type = (this.subtype as OrbSubtype) || 'YELLOW';
      let force = PHYSICS_CONFIG.ORB_YELLOW_FORCE;
      let color = '#FFE600';
      let invert = false;
      let snapDown = false;

      if (type === 'PINK') {
        force = PHYSICS_CONFIG.ORB_PINK_FORCE;
        color = '#FF4694';
      } else if (type === 'RED') {
        force = PHYSICS_CONFIG.ORB_RED_FORCE;
        color = '#FF1A1A';
      } else if (type === 'GRAVITY') {
        force = 500;
        color = '#00F0FF';
        invert = true;
      } else if (type === 'BLACK') {
        force = 0;
        color = '#222233';
        snapDown = true;
      }

      player.activateOrb(force, invert, snapDown);
      onEffectTrigger?.('ORB', this.x + this.width / 2, this.y + this.height / 2, color);
      return { died: false, activated: true };
    }

    return { died: false, activated: false };
  }
}

export class PortalObject extends GameObject {
  private hasTransformed: boolean = false;

  getHitbox(): Hitbox {
    return {
      x: this.x + 8,
      y: this.y,
      width: Math.max(16, this.width * this.scale - 16),
      height: this.height * this.scale * 2.2, // Portals are tall gates
    };
  }

  onPlayerOverlap(
    player: Player,
    _inputJustPressed: boolean,
    onEffectTrigger?: (effectType: string, x: number, y: number, color: string) => void
  ): { died: boolean; activated: boolean } {
    const pBox = player.getHitbox();
    const portalBox = this.getHitbox();

    if (this.hasTransformed || !intersects(pBox, portalBox)) {
      return { died: false, activated: false };
    }

    this.hasTransformed = true;
    const type = (this.subtype as PortalSubtype) || 'GAMEMODE_CUBE';
    let color = '#00FF66';

    switch (type) {
      case 'GAMEMODE_CUBE':
        player.setGamemode(GameMode.CUBE);
        color = '#00FF66';
        break;
      case 'GAMEMODE_SHIP':
        player.setGamemode(GameMode.SHIP);
        color = '#FF007F';
        break;
      case 'GAMEMODE_BALL':
        player.setGamemode(GameMode.BALL);
        color = '#FF8800';
        break;
      case 'GAMEMODE_WAVE':
        player.setGamemode(GameMode.WAVE);
        color = '#00F0FF';
        break;
      case 'GRAVITY_UP':
        player.gravityDirection = -1;
        color = '#0070F3';
        break;
      case 'GRAVITY_DOWN':
        player.gravityDirection = 1;
        color = '#FFE600';
        break;
      case 'MINI_SIZE':
        player.setMini(true);
        color = '#9D00FF';
        break;
      case 'NORMAL_SIZE':
        player.setMini(false);
        color = '#00F0FF';
        break;
      case 'SPEED_0_5X':
        player.setSpeed(SpeedMultiplier.SPEED_0_5X);
        color = '#FFAA00';
        break;
      case 'SPEED_1X':
        player.setSpeed(SpeedMultiplier.SPEED_1X);
        color = '#FFE600';
        break;
      case 'SPEED_2X':
        player.setSpeed(SpeedMultiplier.SPEED_2X);
        color = '#00F0FF';
        break;
      case 'SPEED_3X':
        player.setSpeed(SpeedMultiplier.SPEED_3X);
        color = '#00FF66';
        break;
      case 'SPEED_4X':
        player.setSpeed(SpeedMultiplier.SPEED_4X);
        color = '#FF1A1A';
        break;
    }

    onEffectTrigger?.('PORTAL', this.x + this.width / 2, this.y + this.height, color);
    return { died: false, activated: true };
  }
}

// Registry and Factory Pattern
export class ObjectFactory {
  static create(raw: ILevelObject): GameObject {
    switch (raw.type) {
      case LevelObjectType.BLOCK:
        return new BlockObject(raw);
      case LevelObjectType.SPIKE:
        return new SpikeObject(raw);
      case LevelObjectType.PAD:
        return new PadObject(raw);
      case LevelObjectType.ORB:
        return new OrbObject(raw);
      case LevelObjectType.PORTAL:
        return new PortalObject(raw);
      default:
        return new BlockObject(raw);
    }
  }
}
