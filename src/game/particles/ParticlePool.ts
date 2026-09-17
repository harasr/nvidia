import { Particle, ParticleShape } from './Particle.ts';

export class ParticlePool {
  private pool: Particle[] = [];
  private activeCount: number = 0;
  private readonly maxCapacity: number;

  constructor(capacity: number = 600) {
    this.maxCapacity = capacity;
    for (let i = 0; i < capacity; i++) {
      this.pool.push(new Particle());
    }
  }

  acquire(): Particle | null {
    for (let i = 0; i < this.maxCapacity; i++) {
      if (!this.pool[i].inUse) {
        return this.pool[i];
      }
    }
    return null; // All particles in use
  }

  release(particle: Particle): void {
    particle.inUse = false;
  }

  reset(): void {
    for (let i = 0; i < this.maxCapacity; i++) {
      this.pool[i].inUse = false;
    }
  }

  update(dt: number): void {
    this.activeCount = 0;
    for (let i = 0; i < this.maxCapacity; i++) {
      if (this.pool[i].inUse) {
        const stillAlive = this.pool[i].update(dt);
        if (stillAlive) {
          this.activeCount++;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.maxCapacity; i++) {
      if (this.pool[i].inUse) {
        this.pool[i].render(ctx);
      }
    }
  }

  emitDeathExplosion(x: number, y: number, primaryColor: string = '#00F0FF'): void {
    const shardColors = [primaryColor, '#FFFFFF', '#FFE600', '#9D00FF'];
    const count = 55;

    // Shockwave ring
    const ring = this.acquire();
    if (ring) {
      ring.init(x, y, 0, 0, primaryColor, 8, 0.45, 'RING');
    }

    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      if (!p) break;

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 180 + Math.random() * 450;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = shardColors[Math.floor(Math.random() * shardColors.length)];
      const size = 3 + Math.random() * 6;
      const life = 0.5 + Math.random() * 0.45;
      const shape: ParticleShape = Math.random() < 0.4 ? 'SHARD' : 'SQUARE';

      p.init(x, y, vx, vy, color, size, life, shape);
    }
  }

  emitJumpDust(x: number, y: number, gravityDirection: 1 | -1): void {
    for (let i = 0; i < 8; i++) {
      const p = this.acquire();
      if (!p) break;

      const vx = (Math.random() - 0.5) * 160;
      const vy = (15 + Math.random() * 40) * gravityDirection;
      const color = 'rgba(0, 240, 255, 0.6)';
      const size = 2 + Math.random() * 3;
      const life = 0.25 + Math.random() * 0.2;

      p.init(x, y, vx, vy, color, size, life, 'CIRCLE');
    }
  }

  emitPadBurst(x: number, y: number, color: string): void {
    // Ring effect
    const ring = this.acquire();
    if (ring) {
      ring.init(x, y, 0, 0, color, 6, 0.35, 'RING');
    }

    for (let i = 0; i < 16; i++) {
      const p = this.acquire();
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 200;
      p.init(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        3 + Math.random() * 3,
        0.35 + Math.random() * 0.2,
        'CIRCLE'
      );
    }
  }

  emitOrbFlare(x: number, y: number, color: string): void {
    const ring = this.acquire();
    if (ring) {
      ring.init(x, y, 0, 0, color, 10, 0.4, 'RING');
    }

    for (let i = 0; i < 18; i++) {
      const p = this.acquire();
      if (!p) break;

      const angle = (Math.PI * 2 * i) / 18;
      const speed = 120 + Math.random() * 150;
      p.init(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        4,
        0.3 + Math.random() * 0.2,
        'SHARD'
      );
    }
  }

  emitPortalTransition(x: number, y: number, color: string): void {
    for (let i = 0; i < 20; i++) {
      const p = this.acquire();
      if (!p) break;

      const vx = -80 + (Math.random() - 0.5) * 160;
      const vy = (Math.random() - 0.5) * 220;
      p.init(
        x,
        y + (Math.random() - 0.5) * 40,
        vx,
        vy,
        color,
        3 + Math.random() * 4,
        0.4 + Math.random() * 0.3,
        'SQUARE'
      );
    }
  }

  emitShipThruster(x: number, y: number): void {
    const p = this.acquire();
    if (p) {
      const vx = -140 - Math.random() * 60;
      const vy = (Math.random() - 0.5) * 30;
      p.init(
        x,
        y,
        vx,
        vy,
        Math.random() < 0.5 ? '#FF007F' : '#00F0FF',
        2.5 + Math.random() * 2,
        0.2,
        'CIRCLE'
      );
    }
  }
}
