import { Hitbox } from '../../types/game.ts';

export function intersects(a: Hitbox, b: Hitbox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Shrinks an AABB hitbox by percentage for fair hazard collision (e.g. spikes ~15-20% smaller)
 */
export function getSpikeHitbox(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number = 0,
  marginPercent: number = 0.35 // 35% margin for forgiving triangular apex collision
): Hitbox {
  // Margin reduction for spike collision fairness
  const xMargin = width * marginPercent;
  const yMargin = height * marginPercent;

  // Rotation adjustments if upside down (180) or sideways
  if (rotation === 180) {
    return {
      x: x + xMargin / 2,
      y: y,
      width: width - xMargin,
      height: height - yMargin,
    };
  } else if (rotation === 90 || rotation === 270) {
    return {
      x: x + xMargin / 2,
      y: y + yMargin / 2,
      width: width - xMargin,
      height: height - yMargin,
    };
  }

  // Normal upright spike (tip points UP)
  return {
    x: x + xMargin / 2,
    y: y + yMargin,
    width: width - xMargin,
    height: height - yMargin,
  };
}

export function getBlockHitbox(
  x: number,
  y: number,
  width: number,
  height: number
): Hitbox {
  return { x, y, width, height };
}

export function getOrbHitbox(
  centerX: number,
  centerY: number,
  radius: number
): Hitbox {
  return {
    x: centerX - radius,
    y: centerY - radius,
    width: radius * 2,
    height: radius * 2,
  };
}
