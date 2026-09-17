export class GridSystem {
  static readonly GRID_SIZE: number = 30;

  static snap(value: number): number {
    return Math.round(value / GridSystem.GRID_SIZE) * GridSystem.GRID_SIZE;
  }

  static snapPoint(x: number, y: number): { x: number; y: number } {
    return {
      x: GridSystem.snap(x),
      y: GridSystem.snap(y),
    };
  }

  static screenToWorld(
    screenX: number,
    screenY: number,
    cameraX: number,
    cameraY: number,
    zoom: number = 1.0
  ): { x: number; y: number } {
    return {
      x: screenX / zoom + cameraX,
      y: screenY / zoom + cameraY,
    };
  }

  static worldToScreen(
    worldX: number,
    worldY: number,
    cameraX: number,
    cameraY: number,
    zoom: number = 1.0
  ): { x: number; y: number } {
    return {
      x: (worldX - cameraX) * zoom,
      y: (worldY - cameraY) * zoom,
    };
  }
}
