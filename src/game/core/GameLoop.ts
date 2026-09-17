export type FrameUpdateCallback = (dt: number, currentTime: number) => void;
export type FrameRenderCallback = () => void;

export class GameLoop {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private previousTime: number = 0;

  // FPS calculation
  fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdateTime: number = 0;

  private onUpdate: FrameUpdateCallback;
  private onRender: FrameRenderCallback;

  constructor(onUpdate: FrameUpdateCallback, onRender: FrameRenderCallback) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.previousTime = performance.now();
    this.lastFpsUpdateTime = this.previousTime;
    this.frameCount = 0;

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      // Delta time in seconds
      let dt = (currentTime - this.previousTime) / 1000;
      this.previousTime = currentTime;

      // Cap delta time to 0.05s (20 FPS minimum step) to prevent physics explosion on tab lag
      dt = Math.min(dt, 0.05);

      // FPS tracking
      this.frameCount++;
      if (currentTime - this.lastFpsUpdateTime >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdateTime));
        this.frameCount = 0;
        this.lastFpsUpdateTime = currentTime;
      }

      // Step 1: Update
      this.onUpdate(dt, currentTime);

      // Step 2: Render
      this.onRender();

      // Next frame
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  get running(): boolean {
    return this.isRunning;
  }
}
