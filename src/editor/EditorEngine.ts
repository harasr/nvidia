import { LevelObject, LevelObjectType } from '../types/level.ts';
import { PHYSICS_CONFIG } from '../game/physics/PhysicsSystem.ts';
import {
  AddObjectCommand,
  CommandHistory,
  DeleteObjectCommand,
  MoveObjectCommand,
  RotateObjectCommand,
} from './CommandHistory.ts';
import { GridSystem } from './GridSystem.ts';

export type EditorTool = 'SELECT' | 'PLACE' | 'MOVE' | 'DELETE' | 'PAN';

export class EditorEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  objects: LevelObject[] = [];
  history: CommandHistory = new CommandHistory();

  // View state
  cameraX: number = 0;
  cameraY: number = 0;
  zoom: number = 1.0;

  // Active Tool & Palette item
  tool: EditorTool = 'PLACE';
  activeObjectType: LevelObjectType = LevelObjectType.SPIKE;
  activeSubtype: string | undefined = undefined;
  snapEnabled: boolean = true;

  // Selection
  selectedObjectId: string | null = null;
  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private initialObjectX: number = 0;
  private initialObjectY: number = 0;
  private panStartX: number = 0;
  private panStartY: number = 0;

  // Mouse hover state
  cursorWorldX: number = 0;
  cursorWorldY: number = 0;

  private animationFrameId: number | null = null;
  private onStateChangeCallback?: () => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: () => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get canvas 2d context for Editor');
    this.ctx = context;
    this.onStateChangeCallback = onStateChange;

    this.attachEventListeners();
    this.startRenderLoop();
  }

  setObjects(objects: LevelObject[]): void {
    this.objects = [...objects];
    this.selectedObjectId = null;
    this.history.clear();
  }

  getObjects(): LevelObject[] {
    return this.objects;
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  detach(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const world = GridSystem.screenToWorld(screenX, screenY, this.cameraX, this.cameraY, this.zoom);

    // Right-click or middle click initiates PAN
    if (e.button === 2 || e.button === 1 || this.tool === 'PAN') {
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      return;
    }

    if (e.button !== 0) return; // Left click only for placement & selection

    const snapped = this.snapEnabled ? GridSystem.snapPoint(world.x, world.y) : world;

    if (this.tool === 'PLACE') {
      const newObj: LevelObject = {
        id: 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: this.activeObjectType,
        subtype: this.activeSubtype,
        x: snapped.x,
        y: snapped.y,
        rotation: 0,
        scale: 1.0,
      };

      this.history.execute(new AddObjectCommand(this.objects, newObj));
      this.selectedObjectId = newObj.id;
      this.onStateChangeCallback?.();
    } else if (this.tool === 'SELECT' || this.tool === 'MOVE') {
      // Find object under cursor
      const clicked = this.findObjectAt(world.x, world.y);
      if (clicked) {
        this.selectedObjectId = clicked.id;
        this.isDragging = true;
        this.dragStartX = world.x;
        this.dragStartY = world.y;
        this.initialObjectX = clicked.x;
        this.initialObjectY = clicked.y;
      } else {
        this.selectedObjectId = null;
      }
      this.onStateChangeCallback?.();
    } else if (this.tool === 'DELETE') {
      const clicked = this.findObjectAt(world.x, world.y);
      if (clicked) {
        this.history.execute(new DeleteObjectCommand(this.objects, clicked));
        if (this.selectedObjectId === clicked.id) {
          this.selectedObjectId = null;
        }
        this.onStateChangeCallback?.();
      }
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const world = GridSystem.screenToWorld(screenX, screenY, this.cameraX, this.cameraY, this.zoom);
    this.cursorWorldX = world.x;
    this.cursorWorldY = world.y;

    if (this.isPanning) {
      const dx = (e.clientX - this.panStartX) / this.zoom;
      const dy = (e.clientY - this.panStartY) / this.zoom;
      this.cameraX -= dx;
      this.cameraY -= dy;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      return;
    }

    if (this.isDragging && this.selectedObjectId) {
      const selected = this.objects.find((o) => o.id === this.selectedObjectId);
      if (selected) {
        const dx = world.x - this.dragStartX;
        const dy = world.y - this.dragStartY;
        let newX = this.initialObjectX + dx;
        let newY = this.initialObjectY + dy;

        if (this.snapEnabled) {
          newX = GridSystem.snap(newX);
          newY = GridSystem.snap(newY);
        }

        selected.x = newX;
        selected.y = newY;
      }
    }
  };

  private handleMouseUp = (_e: MouseEvent): void => {
    if (this.isPanning) {
      this.isPanning = false;
    }

    if (this.isDragging && this.selectedObjectId) {
      const selected = this.objects.find((o) => o.id === this.selectedObjectId);
      if (selected) {
        // Record undoable move command if position changed
        if (selected.x !== this.initialObjectX || selected.y !== this.initialObjectY) {
          const currentX = selected.x;
          const currentY = selected.y;
          selected.x = this.initialObjectX;
          selected.y = this.initialObjectY;
          this.history.execute(
            new MoveObjectCommand(selected, this.initialObjectX, this.initialObjectY, currentX, currentY)
          );
        }
      }
      this.isDragging = false;
      this.onStateChangeCallback?.();
    }
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom * zoomFactor));
    } else {
      // Scroll horizontal / vertical
      this.cameraX += e.deltaX / this.zoom;
      this.cameraY += e.deltaY / this.zoom;
    }
  };

  rotateSelected(): void {
    if (!this.selectedObjectId) return;
    const obj = this.objects.find((o) => o.id === this.selectedObjectId);
    if (!obj) return;

    const prevRot = obj.rotation;
    const newRot = (prevRot + 90) % 360;
    this.history.execute(new RotateObjectCommand(obj, prevRot, newRot));
    this.onStateChangeCallback?.();
  }

  deleteSelected(): void {
    if (!this.selectedObjectId) return;
    const obj = this.objects.find((o) => o.id === this.selectedObjectId);
    if (!obj) return;

    this.history.execute(new DeleteObjectCommand(this.objects, obj));
    this.selectedObjectId = null;
    this.onStateChangeCallback?.();
  }

  duplicateSelected(): void {
    if (!this.selectedObjectId) return;
    const obj = this.objects.find((o) => o.id === this.selectedObjectId);
    if (!obj) return;

    const clone: LevelObject = {
      ...obj,
      id: 'obj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      x: obj.x + GridSystem.GRID_SIZE,
      y: obj.y,
    };

    this.history.execute(new AddObjectCommand(this.objects, clone));
    this.selectedObjectId = clone.id;
    this.onStateChangeCallback?.();
  }

  undo(): void {
    if (this.history.undo()) {
      this.onStateChangeCallback?.();
    }
  }

  redo(): void {
    if (this.history.redo()) {
      this.onStateChangeCallback?.();
    }
  }

  private findObjectAt(x: number, y: number): LevelObject | null {
    // Search in reverse so topmost rendered object is picked first
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      const w = (obj.width || PHYSICS_CONFIG.BLOCK_SIZE) * obj.scale;
      const h = (obj.height || PHYSICS_CONFIG.BLOCK_SIZE) * obj.scale;
      if (x >= obj.x && x <= obj.x + w && y >= obj.y && y <= obj.y + h) {
        return obj;
      }
    }
    return null;
  }

  private startRenderLoop(): void {
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private render(): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Background
    ctx.fillStyle = '#0D0E15';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Apply Zoom & Camera Pan
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 1. Draw Grid lines
    this.drawGrid(ctx);

    // 2. Draw Floor
    this.drawFloor(ctx);

    // 3. Draw Placed Objects
    for (const obj of this.objects) {
      this.drawObject(ctx, obj, obj.id === this.selectedObjectId);
    }

    // 4. Draw Placement Ghost preview
    if (this.tool === 'PLACE') {
      const snapped = this.snapEnabled
        ? GridSystem.snapPoint(this.cursorWorldX, this.cursorWorldY)
        : { x: this.cursorWorldX, y: this.cursorWorldY };

      ctx.save();
      ctx.globalAlpha = 0.45;
      this.drawObject(
        ctx,
        {
          id: 'ghost',
          type: this.activeObjectType,
          subtype: this.activeSubtype,
          x: snapped.x,
          y: snapped.y,
          rotation: 0,
          scale: 1.0,
        },
        false
      );
      ctx.restore();
    }

    ctx.restore();

    // 5. Draw Editor HUD Coordinates
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px "Chakra Petch", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `POS: X ${Math.round(this.cursorWorldX)} Y ${Math.round(this.cursorWorldY)} | ZOOM: ${Math.round(this.zoom * 100)}% | OBJS: ${this.objects.length}`,
      16,
      height - 16
    );
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    const size = GridSystem.GRID_SIZE;
    const viewLeft = this.cameraX - 60;
    const viewRight = this.cameraX + this.canvas.width / this.zoom + 60;
    const viewTop = this.cameraY - 60;
    const viewBottom = this.cameraY + this.canvas.height / this.zoom + 60;

    const startX = Math.floor(viewLeft / size) * size;
    const startY = Math.floor(viewTop / size) * size;

    ctx.lineWidth = 1;

    for (let x = startX; x <= viewRight; x += size) {
      const isMajor = Math.round(x / size) % 4 === 0;
      ctx.strokeStyle = isMajor ? 'rgba(0, 240, 255, 0.22)' : 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(x, viewTop);
      ctx.lineTo(x, viewBottom);
      ctx.stroke();
    }

    for (let y = startY; y <= viewBottom; y += size) {
      const isFloor = y === PHYSICS_CONFIG.FLOOR_Y;
      ctx.strokeStyle = isFloor ? '#00F0FF' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = isFloor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(viewLeft, y);
      ctx.lineTo(viewRight, y);
      ctx.stroke();
    }
  }

  private drawFloor(ctx: CanvasRenderingContext2D): void {
    const floorY = PHYSICS_CONFIG.FLOOR_Y;
    const viewLeft = this.cameraX - 100;
    const viewRight = this.cameraX + this.canvas.width / this.zoom + 100;

    ctx.fillStyle = 'rgba(16, 20, 40, 0.9)';
    ctx.fillRect(viewLeft, floorY, viewRight - viewLeft, 600);

    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(viewLeft, floorY);
    ctx.lineTo(viewRight, floorY);
    ctx.stroke();
  }

  private drawObject(ctx: CanvasRenderingContext2D, obj: LevelObject, isSelected: boolean): void {
    const w = (obj.width || PHYSICS_CONFIG.BLOCK_SIZE) * obj.scale;
    const h = (obj.height || PHYSICS_CONFIG.BLOCK_SIZE) * obj.scale;

    ctx.save();
    ctx.translate(obj.x + w / 2, obj.y + h / 2);
    if (obj.rotation !== 0) {
      ctx.rotate((obj.rotation * Math.PI) / 180);
    }

    const halfW = w / 2;
    const halfH = h / 2;

    switch (obj.type) {
      case LevelObjectType.BLOCK:
        ctx.fillStyle = '#171B2F';
        ctx.fillRect(-halfW, -halfH, w, h);
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-halfW, -halfH, w, h);
        break;

      case LevelObjectType.SPIKE:
        ctx.beginPath();
        ctx.moveTo(0, -halfH);
        ctx.lineTo(halfW, halfH);
        ctx.lineTo(-halfW, halfH);
        ctx.closePath();
        ctx.fillStyle = '#20101C';
        ctx.fill();
        ctx.strokeStyle = '#FF0055';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;

      case LevelObjectType.PAD:
        ctx.fillStyle = obj.subtype === 'PINK' ? '#FF4694' : obj.subtype === 'GRAVITY' ? '#00F0FF' : '#FFE600';
        ctx.beginPath();
        ctx.roundRect(-halfW + 2, halfH - 10, w - 4, 10, [3, 3, 0, 0]);
        ctx.fill();
        break;

      case LevelObjectType.ORB:
        ctx.strokeStyle = obj.subtype === 'PINK' ? '#FF4694' : obj.subtype === 'GRAVITY' ? '#00F0FF' : '#FFE600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(0, 0, halfW * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case LevelObjectType.PORTAL:
        ctx.strokeStyle = obj.subtype?.includes('SHIP') ? '#FF007F' : obj.subtype?.includes('WAVE') ? '#00F0FF' : '#00FF66';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, halfW, halfH * 2.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    // Selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#FFE600';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-halfW - 3, -halfH - 3, w + 6, h + 6);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}
