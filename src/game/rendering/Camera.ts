export class Camera {
  x: number = 0;
  y: number = 0;
  zoom: number = 1.0;

  // Screen shake
  shakeIntensity: number = 0;
  shakeDuration: number = 0;
  shakeTimeLeft: number = 0;
  shakeOffsetX: number = 0;
  shakeOffsetY: number = 0;

  // Viewport
  viewportWidth: number = 960;
  viewportHeight: number = 540;

  // Smooth target following
  leadDistance: number = 240; // horizontal lead so player can see ahead

  constructor(width: number = 960, height: number = 540) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  reset(x: number = 0, y: number = 0): void {
    this.x = x;
    this.y = y;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimeLeft = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  triggerShake(intensity: number = 18, duration: number = 0.35): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimeLeft = duration;
  }

  update(targetX: number, targetY: number, dt: number): void {
    // Lead camera ahead of target horizontally
    const desiredX = targetX - this.leadDistance;
    // Damped follow vertically
    const desiredY = targetY - this.viewportHeight * 0.65;

    this.x = desiredX;
    // Smooth vertical follow
    this.y += (desiredY - this.y) * Math.min(dt * 8, 1);

    // Apply Screen Shake
    if (this.shakeTimeLeft > 0) {
      this.shakeTimeLeft -= dt;
      const progress = this.shakeTimeLeft / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * Math.max(0, progress);
      this.shakeOffsetX = (Math.random() - 0.5) * currentIntensity * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * currentIntensity * 2;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Translate with shake offset
    ctx.translate(-this.x + this.shakeOffsetX, -this.y + this.shakeOffsetY);
  }

  restoreTransform(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }
}
