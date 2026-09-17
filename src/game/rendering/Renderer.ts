import { GameMode } from '../../types/game.ts';
import { LevelObjectType } from '../../types/level.ts';
import { GameObject } from '../entities/LevelObject.ts';
import { Player } from '../entities/Player.ts';
import { ParticlePool } from '../particles/ParticlePool.ts';
import { PHYSICS_CONFIG } from '../physics/PhysicsSystem.ts';
import { Camera } from './Camera.ts';
import { useAuthStore } from '../../store/authStore.ts';

const SKIN_COLORS: Record<string, string> = {
  skin_default: '#00F0FF',
  skin_gold: '#FFE600',
  skin_demon: '#FF003C',
  skin_neon: '#9D00FF',
  skin_emerald: '#00FF66',
};

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Flash overlay
  flashAlpha: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Failed to obtain 2D canvas context');
    }
    this.ctx = context;
  }

  triggerFlash(alpha: number = 0.65): void {
    this.flashAlpha = alpha;
  }

  render(
    player: Player,
    objects: GameObject[],
    particles: ParticlePool,
    camera: Camera,
    beatIntensity: number,
    totalLevelLength: number,
    attempts: number,
    isPracticing: boolean = false
  ): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Decay flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - 0.05);
    }

    // 1. Clear & Background with beat reactive lighting
    this.renderBackground(ctx, camera, width, height, beatIntensity);

    // 2. Camera World Space
    camera.applyTransform(ctx);

    // Render Grid & Floor in world space
    this.renderFloorAndGrid(ctx, camera, width, height, beatIntensity);

    // Render Level Objects (cull offscreen objects for 240 FPS performance)
    const viewLeft = camera.x - 100;
    const viewRight = camera.x + camera.viewportWidth + 100;

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.x + obj.width >= viewLeft && obj.x <= viewRight) {
        this.renderObject(ctx, obj, beatIntensity);
      }
    }

    // Render Player Trail
    this.renderPlayerTrail(ctx, player);

    // Render Player
    if (!player.isDead) {
      this.renderPlayer(ctx, player);
    }

    // Render Particles
    particles.render(ctx);

    camera.restoreTransform(ctx);

    // 3. Screen Flash
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Cinematic Post-Processing & In-Game HUD overlay
    this.renderCinematicEffects(ctx, width, height, beatIntensity);
    this.renderHUD(ctx, player, totalLevelLength, attempts, isPracticing, width, height);
  }

  private renderBackground(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    width: number,
    height: number,
    beatIntensity: number
  ): void {
    // Cyberpunk gradient background pulsing on beat
    const pulseFactor = beatIntensity * 30;
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, `rgb(${10 + pulseFactor * 0.3}, ${12 + pulseFactor * 0.2}, ${30 + pulseFactor * 1.5})`);
    bgGradient.addColorStop(0.5, `rgb(${5 + pulseFactor * 0.1}, ${6 + pulseFactor * 0.1}, ${15 + pulseFactor * 0.5})`);
    bgGradient.addColorStop(1, `rgb(${0}, ${2}, ${8})`);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Dynamic God Rays (Sun beams from top)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for(let i=0; i<5; i++) {
      const rayAlpha = (Math.sin(performance.now() / 1000 + i) * 0.5 + 0.5) * 0.05 + (beatIntensity * 0.05);
      const rayGradient = ctx.createLinearGradient(0, 0, 0, height * 0.8);
      rayGradient.addColorStop(0, `rgba(0, 240, 255, ${rayAlpha})`);
      rayGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      
      const rayX = ((camera.x * 0.05 + i * 400) % (width * 2)) - width * 0.5;
      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(rayX, 0);
      ctx.lineTo(rayX + 300, 0);
      ctx.lineTo(rayX + 400 + i*100, height);
      ctx.lineTo(rayX - 100 - i*50, height);
      ctx.fill();
    }
    ctx.restore();

    // Parallax geometric background stars / cubes
    ctx.save();
    const parallaxX = camera.x * 0.18;
    const parallaxY = camera.y * 0.1;
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + beatIntensity * 0.08})`;
    ctx.lineWidth = 1;

    const bgGridSize = 90;
    const startX = -(parallaxX % bgGridSize);
    const startY = -(parallaxY % bgGridSize);

    ctx.beginPath();
    for (let x = startX; x < width; x += bgGridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y < height; y += bgGridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // MOBA Style Floating Dust / Stars
    ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + beatIntensity * 0.4})`; // Gold dust
    for (let i = 0; i < 50; i++) {
      const starX = ((i * 137 + camera.x * 0.05) % width + width) % width;
      const starY = ((i * 93 + camera.y * 0.02 - performance.now() / 50 * (i%3+1)) % height + height) % height;
      const size = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(starX, starY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle beat rings in background
    if (beatIntensity > 0.1) {
      ctx.strokeStyle = `rgba(157, 0, 255, ${beatIntensity * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.4, 180 + (1 - beatIntensity) * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderFloorAndGrid(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    _width: number,
    _height: number,
    beatIntensity: number
  ): void {
    const floorY = PHYSICS_CONFIG.FLOOR_Y;
    const viewLeft = camera.x - 60;
    const viewRight = camera.x + camera.viewportWidth + 60;

    // Glowing Neon Floor
    const floorGlow = ctx.createLinearGradient(0, floorY, 0, floorY + 120);
    floorGlow.addColorStop(0, '#101428');
    floorGlow.addColorStop(1, '#080A14');
    ctx.fillStyle = floorGlow;
    ctx.fillRect(viewLeft, floorY, viewRight - viewLeft, 600);

    // Neon floor dividing line
    const glowAlpha = 0.6 + beatIntensity * 0.4;
    ctx.strokeStyle = `rgba(0, 240, 255, ${glowAlpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(viewLeft, floorY);
    ctx.lineTo(viewRight, floorY);
    ctx.stroke();

    // Floor accent grid patterns
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    const gridSize = PHYSICS_CONFIG.BLOCK_SIZE;
    const snapLeft = Math.floor(viewLeft / gridSize) * gridSize;

    ctx.beginPath();
    for (let x = snapLeft; x < viewRight; x += gridSize) {
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, floorY + 120);
    }
    ctx.stroke();
  }

  private renderObject(
    ctx: CanvasRenderingContext2D,
    obj: GameObject,
    beatIntensity: number
  ): void {
    ctx.save();
    ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
    if (obj.rotation !== 0) {
      ctx.rotate((obj.rotation * Math.PI) / 180);
    }

    const halfW = (obj.width * obj.scale) / 2;
    const halfH = (obj.height * obj.scale) / 2;

    switch (obj.type) {
      case LevelObjectType.BLOCK:
        this.drawBlock(ctx, -halfW, -halfH, halfW * 2, halfH * 2, beatIntensity);
        break;

      case LevelObjectType.SPIKE:
        this.drawSpike(ctx, -halfW, -halfH, halfW * 2, halfH * 2);
        break;

      case LevelObjectType.PAD:
        this.drawPad(ctx, -halfW, -halfH, halfW * 2, halfH * 2, obj.subtype, beatIntensity);
        break;

      case LevelObjectType.ORB:
        this.drawOrb(ctx, halfW, obj.subtype, beatIntensity);
        break;

      case LevelObjectType.PORTAL:
        this.drawPortal(ctx, -halfW, -halfH * 2.2, halfW * 2, halfH * 4.4, obj.subtype, beatIntensity);
        break;
    }

    ctx.restore();
  }

  private drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    beatIntensity: number
  ): void {
    // Base block body
    ctx.fillStyle = '#171B2F';
    ctx.fillRect(x, y, w, h);

    // Neon edge highlight
    const strokeAlpha = 0.5 + beatIntensity * 0.4;
    ctx.strokeStyle = `rgba(0, 240, 255, ${strokeAlpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Inner bevel / geometric accent
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    // Center micro dot
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(x + w / 2 - 1.5, y + h / 2 - 1.5, 3, 3);
  }

  private drawSpike(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ): void {
    // Sharp neon danger triangle
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y); // Top apex
    ctx.lineTo(x + w, y + h); // Bottom right
    ctx.lineTo(x, y + h); // Bottom left
    ctx.closePath();

    ctx.fillStyle = '#20101C';
    ctx.fill();

    ctx.strokeStyle = '#FF0055';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner fiery core
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 6);
    ctx.lineTo(x + w - 6, y + h - 2);
    ctx.lineTo(x + 6, y + h - 2);
    ctx.closePath();
    ctx.fillStyle = '#FF5500';
    ctx.fill();
  }

  private drawPad(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    subtype?: string,
    beatIntensity: number = 0
  ): void {
    let color = '#FFE600';
    if (subtype === 'PINK') color = '#FF4694';
    if (subtype === 'RED') color = '#FF1A1A';
    if (subtype === 'GRAVITY') color = '#00F0FF';

    const padH = h * 0.35;
    const padY = y + h - padH;

    // Outer glow base
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 2, padY, w - 4, padH, [4, 4, 0, 0]);
    ctx.fill();

    // Pulsing core light
    const pulseH = padH * (0.5 + beatIntensity * 0.5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, padY + 2, w - 12, pulseH * 0.4);
  }

  private drawOrb(
    ctx: CanvasRenderingContext2D,
    radius: number,
    subtype?: string,
    beatIntensity: number = 0
  ): void {
    let color = '#FFE600';
    if (subtype === 'PINK') color = '#FF4694';
    if (subtype === 'RED') color = '#FF1A1A';
    if (subtype === 'GRAVITY') color = '#00F0FF';
    if (subtype === 'BLACK') color = '#3A3A4E';

    // Outer pulsation ring
    const ringRadius = radius * (1.1 + beatIntensity * 0.25);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glowing orb body
    const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(10, 10, 20, 0.8)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPortal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    subtype?: string,
    beatIntensity: number = 0
  ): void {
    let color = '#00FF66';
    if (subtype?.includes('SHIP')) color = '#FF007F';
    else if (subtype?.includes('BALL')) color = '#FF8800';
    else if (subtype?.includes('WAVE')) color = '#00F0FF';
    else if (subtype?.includes('GRAVITY_UP')) color = '#0070F3';
    else if (subtype?.includes('GRAVITY_DOWN')) color = '#FFE600';
    else if (subtype?.includes('MINI')) color = '#9D00FF';

    // Portal Oval Gate
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 + beatIntensity * 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Energy field
    ctx.fillStyle = `rgba(${color === '#00F0FF' ? '0,240,255' : '157,0,255'}, ${0.15 + beatIntensity * 0.15})`;
    ctx.fill();

    // Inner spinning particles
    const time = Date.now() * 0.005;
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * Math.PI * 2) / 3;
      const px = Math.cos(angle) * (w * 0.3);
      const py = Math.sin(angle) * (h * 0.35);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlayerTrail(ctx: CanvasRenderingContext2D, player: Player): void {
    const authStore = useAuthStore.getState();
    const equippedSkin = authStore.user?.equippedSkin || 'skin_default';
    const skinColor = SKIN_COLORS[equippedSkin] || SKIN_COLORS['skin_default'];

    for (let i = 0; i < player.trail.length; i++) {
      const t = player.trail[i];
      ctx.save();
      ctx.globalAlpha = t.alpha * 0.5;
      ctx.fillStyle = skinColor;

      if (player.gamemode === GameMode.WAVE) {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);
      }
      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate((player.rotation * Math.PI) / 180);

    const halfW = player.width / 2;
    const halfH = player.height / 2;

    const authStore = useAuthStore.getState();
    const equippedSkin = authStore.user?.equippedSkin || 'skin_default';
    const skinColor = SKIN_COLORS[equippedSkin] || SKIN_COLORS['skin_default'];

    switch (player.gamemode) {
      case GameMode.CUBE:
        this.drawPlayerCube(ctx, halfW, halfH, skinColor);
        break;

      case GameMode.SHIP:
        this.drawPlayerShip(ctx, halfW, halfH, skinColor);
        break;

      case GameMode.BALL:
        this.drawPlayerBall(ctx, halfW, skinColor);
        break;

      case GameMode.WAVE:
        this.drawPlayerWave(ctx, halfW, halfH, skinColor);
        break;
    }

    ctx.restore();
  }

  private drawPlayerCube(ctx: CanvasRenderingContext2D, halfW: number, halfH: number, skinColor: string): void {
    // Outer neon cube
    ctx.fillStyle = skinColor;
    ctx.fillRect(-halfW, -halfH, halfW * 2, halfH * 2);

    // Inner dark fill
    ctx.fillStyle = '#0D111E';
    ctx.fillRect(-halfW + 3.5, -halfH + 3.5, halfW * 2 - 7, halfH * 2 - 7);

    // Glowing geometric eye
    ctx.fillStyle = skinColor;
    ctx.fillRect(-halfW * 0.35, -halfH * 0.35, halfW * 0.7, halfH * 0.7);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-halfW * 0.15, -halfH * 0.15, halfW * 0.3, halfH * 0.3);
  }

  private drawPlayerShip(ctx: CanvasRenderingContext2D, halfW: number, halfH: number, skinColor: string): void {
    // Aerodynamic futuristic spaceship
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(halfW, 0); // Nose cone
    ctx.lineTo(-halfW, -halfH); // Top wing
    ctx.lineTo(-halfW * 0.5, 0); // Engine bay
    ctx.lineTo(-halfW, halfH); // Bottom wing
    ctx.closePath();
    ctx.fill();

    // Cockpit dome
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW * 0.4, halfH * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlayerBall(ctx: CanvasRenderingContext2D, radius: number, skinColor: string): void {
    // Segmented rolling disc
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#121422';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Quad spokes
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.stroke();
  }

  private drawPlayerWave(ctx: CanvasRenderingContext2D, halfW: number, halfH: number, skinColor: string): void {
    // Sharp razor dart
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(halfW * 1.2, 0); // Sharp nose
    ctx.lineTo(-halfW, -halfH * 0.8);
    ctx.lineTo(-halfW * 0.3, 0);
    ctx.lineTo(-halfW, halfH * 0.8);
    ctx.closePath();
    ctx.fill();

    // White core highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(halfW * 0.6, 0);
    ctx.lineTo(-halfW * 0.3, -halfH * 0.3);
    ctx.lineTo(-halfW * 0.3, halfH * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  private renderCinematicEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    beatIntensity: number
  ): void {
    // 1. Deep Hollywood anamorphic corner vignette
    const radius = Math.max(width, height) * 0.72;
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      radius * 0.38,
      width / 2,
      height / 2,
      radius
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.65, 'rgba(4, 5, 10, 0.30)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 2. Cinematic Letterbox Bars with Neon Edge Runners
    const barHeight = Math.max(16, Math.round(height * 0.045));

    // Top letterbox bar
    ctx.fillStyle = '#06070B';
    ctx.fillRect(0, 0, width, barHeight);
    // Glowing neon runner under top bar
    ctx.fillStyle = `rgba(0, 240, 255, ${0.3 + beatIntensity * 0.4})`;
    ctx.fillRect(0, barHeight - 1, width, 1.5);

    // Bottom letterbox bar
    ctx.fillStyle = '#06070B';
    ctx.fillRect(0, height - barHeight, width, barHeight);
    // Glowing neon runner above bottom bar
    ctx.fillStyle = `rgba(157, 0, 255, ${0.3 + beatIntensity * 0.4})`;
    ctx.fillRect(0, height - barHeight, width, 1.5);

    // 3. Cinematic "MADE BY THANH" watermark in bottom letterbox
    ctx.save();
    ctx.font = '600 10px "Chakra Petch", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 6;
    ctx.fillText('MADE BY THANH  |  WEB STUDIO', width - 20, height - barHeight + 11);
    ctx.restore();
  }

  private renderHUD(
    ctx: CanvasRenderingContext2D,
    player: Player,
    totalLength: number,
    attempts: number,
    isPracticing: boolean,
    width: number,
    height: number
  ): void {
    // 1. Top progress bar
    const progress = Math.max(0, Math.min(1, player.x / Math.max(1, totalLength)));
    const percent = Math.floor(progress * 100);

    const barWidth = Math.min(width * 0.55, 480);
    const barHeight = 8;
    const barX = (width - barWidth) / 2;
    const barY = 22;

    // Bar background
    ctx.fillStyle = 'rgba(18, 20, 32, 0.85)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bar fill with neon sheen
    if (progress > 0) {
      const fillGradient = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
      fillGradient.addColorStop(0, '#00F0FF');
      fillGradient.addColorStop(0.5, '#9D00FF');
      fillGradient.addColorStop(1, '#FFE600');
      ctx.fillStyle = fillGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * progress, barHeight, 4);
      ctx.fill();
    }

    // Percentage text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 12px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fillText(`${percent}%`, width / 2, barY - 6);
    ctx.shadowBlur = 0;

    // Attempt counter (top left)
    ctx.textAlign = 'left';
    ctx.font = '700 13px "Chakra Petch", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`ATTEMPT ${attempts}`, 24, 30);

    if (isPracticing) {
      ctx.fillStyle = '#00FF66';
      ctx.font = '700 11px "Chakra Petch", sans-serif';
      ctx.fillText('PRACTICE MODE', 24, 48);
    }

    // Cinematic Intro Title Card on level start (first 2.8s)
    const runSeconds = player.x / Math.max(1, player.vx);
    if (runSeconds < 2.8 && percent < 18) {
      const introAlpha = Math.sin((runSeconds / 2.8) * Math.PI);
      if (introAlpha > 0.05) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${introAlpha * 0.9})`;
        ctx.font = '800 22px "Chakra Petch", sans-serif';
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillText('GEOMETRY DASH', width / 2, height * 0.35);

        ctx.font = '700 11px "Chakra Petch", sans-serif';
        ctx.fillStyle = `rgba(0, 240, 255, ${introAlpha * 0.95})`;
        ctx.fillText('DIRECTED & MADE BY THANH', width / 2, height * 0.35 + 24);
        ctx.restore();
      }
    }
  }
}
