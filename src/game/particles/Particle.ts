export type ParticleShape = 'CIRCLE' | 'SQUARE' | 'SHARD' | 'RING';

export class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  color: string = '#FFFFFF';
  size: number = 4;
  alpha: number = 1.0;
  life: number = 0;
  maxLife: number = 1.0;
  rotation: number = 0;
  vRot: number = 0;
  shape: ParticleShape = 'SQUARE';
  inUse: boolean = false;

  init(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    maxLife: number,
    shape: ParticleShape = 'SQUARE'
  ): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.alpha = 1.0;
    this.life = 0;
    this.maxLife = maxLife;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 12;
    this.shape = shape;
    this.inUse = true;
  }

  update(dt: number): boolean {
    if (!this.inUse) return false;

    this.life += dt;
    if (this.life >= this.maxLife) {
      this.inUse = false;
      return false;
    }

    // Motion with drag & slight gravity
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.rotation += this.vRot * dt;

    // Linear fade
    this.alpha = 1.0 - this.life / this.maxLife;
    return true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.inUse || this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.shape === 'CIRCLE') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'RING') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const currentRadius = this.size + (this.life / this.maxLife) * 30;
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shape === 'SHARD') {
      ctx.beginPath();
      ctx.moveTo(-this.size, -this.size * 1.5);
      ctx.lineTo(this.size, 0);
      ctx.lineTo(-this.size, this.size * 1.5);
      ctx.closePath();
      ctx.fill();
    } else {
      // Default SQUARE
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    ctx.restore();
  }
}
