import { Shape } from "./types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

function isPointInPolygon(px: number, py: number, vertices: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i]?.[0] ?? 0;
    const yi = vertices[i]?.[1] ?? 0;
    const xj = vertices[j]?.[0] ?? 0;
    const yj = vertices[j]?.[1] ?? 0;

    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointNearShape(px: number, py: number, shape: Shape, threshold = 14): boolean {
  if (shape.type === "pencil") {
    if (!shape.points || shape.points.length === 0) return false;
    if (shape.points.length === 1) {
      const p = shape.points[0];
      if (!p) return false;
      return Math.hypot(px - p.x, py - p.y) <= threshold;
    }
    for (let i = 0; i < shape.points.length - 1; i++) {
      const p1 = shape.points[i];
      const p2 = shape.points[i + 1];
      if (!p1 || !p2) continue;
      if (distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= threshold) {
        return true;
      }
    }
    return false;
  }

  if (shape.type === "rect") {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    if (
      px >= minX - threshold &&
      px <= maxX + threshold &&
      py >= minY - threshold &&
      py <= maxY + threshold
    ) {
      return true;
    }
    return false;
  }

  if (shape.type === "circle") {
    const d = Math.hypot(px - shape.centerX, py - shape.centerY);
    return d <= shape.radius + threshold;
  }

  if (shape.type === "diamond") {
    const top: [number, number] = [shape.x + shape.width / 2, shape.y];
    const right: [number, number] = [shape.x + shape.width, shape.y + shape.height / 2];
    const bottom: [number, number] = [shape.x + shape.width / 2, shape.y + shape.height];
    const left: [number, number] = [shape.x, shape.y + shape.height / 2];

    const polygon: [number, number][] = [top, right, bottom, left];
    if (isPointInPolygon(px, py, polygon)) return true;

    for (let i = 0; i < polygon.length; i++) {
      const curr = polygon[i];
      const next = polygon[(i + 1) % polygon.length];
      if (!curr || !next) continue;
      if (distanceToSegment(px, py, curr[0], curr[1], next[0], next[1]) <= threshold) {
        return true;
      }
    }
    return false;
  }

  if (shape.type === "line") {
    return distanceToSegment(px, py, shape.startX, shape.startY, shape.endX, shape.endY) <= threshold;
  }

  if (shape.type === "arrow") {
    if (distanceToSegment(px, py, shape.startX, shape.startY, shape.endX, shape.endY) <= threshold) {
      return true;
    }

    const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
    const headLen = 15;
    const leftX = shape.endX - headLen * Math.cos(angle - Math.PI / 6);
    const leftY = shape.endY - headLen * Math.sin(angle - Math.PI / 6);
    const rightX = shape.endX - headLen * Math.cos(angle + Math.PI / 6);
    const rightY = shape.endY - headLen * Math.sin(angle + Math.PI / 6);

    if (distanceToSegment(px, py, shape.endX, shape.endY, leftX, leftY) <= threshold) {
      return true;
    }
    if (distanceToSegment(px, py, shape.endX, shape.endY, rightX, rightY) <= threshold) {
      return true;
    }
    return false;
  }

  if (shape.type === "image") {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    if (
      px >= minX - threshold &&
      px <= maxX + threshold &&
      py >= minY - threshold &&
      py <= maxY + threshold
    ) {
      return true;
    }
    return false;
  }

  if (shape.type === "text") {
    const fontSize = shape.fontSize || 24;
    const lines = shape.text.split("\n");
    const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
    const width = maxLineLen * (fontSize * 0.65);
    const height = lines.length * (fontSize * 1.35);

    if (
      px >= shape.x - threshold &&
      px <= shape.x + width + threshold &&
      py >= shape.y - threshold &&
      py <= shape.y + height + threshold
    ) {
      return true;
    }
    return false;
  }

  return false;
}

export function getShapeBounds(shape: Shape): Bounds {
  if (shape.type === "pencil") {
    if (!shape.points || shape.points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }
    const xs = shape.points.map((p) => p.x);
    const ys = shape.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  if (shape.type === "rect" || shape.type === "diamond" || shape.type === "image") {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  if (shape.type === "circle") {
    const minX = shape.centerX - shape.radius;
    const maxX = shape.centerX + shape.radius;
    const minY = shape.centerY - shape.radius;
    const maxY = shape.centerY + shape.radius;
    return { minX, minY, maxX, maxY, width: shape.radius * 2, height: shape.radius * 2 };
  }

  if (shape.type === "line" || shape.type === "arrow") {
    const minX = Math.min(shape.startX, shape.endX);
    const maxX = Math.max(shape.startX, shape.endX);
    const minY = Math.min(shape.startY, shape.endY);
    const maxY = Math.max(shape.startY, shape.endY);
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  if (shape.type === "text") {
    const fontSize = shape.fontSize || 24;
    const lines = shape.text.split("\n");
    const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
    const width = maxLineLen * (fontSize * 0.65);
    const height = lines.length * (fontSize * 1.35);
    return {
      minX: shape.x,
      minY: shape.y,
      maxX: shape.x + width,
      maxY: shape.y + height,
      width,
      height,
    };
  }

  return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
}

export function isShapeInBox(
  shape: Shape,
  box: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  const b = getShapeBounds(shape);
  // Intersect test between box and shape bounds
  return !(
    b.maxX < box.minX ||
    b.minX > box.maxX ||
    b.maxY < box.minY ||
    b.minY > box.maxY
  );
}

export function moveShape(shape: Shape, dx: number, dy: number): Shape {
  if (shape.type === "pencil") {
    return {
      ...shape,
      points: shape.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
    };
  }
  if (shape.type === "rect" || shape.type === "diamond" || shape.type === "image" || shape.type === "text") {
    return {
      ...shape,
      x: shape.x + dx,
      y: shape.y + dy,
    };
  }
  if (shape.type === "circle") {
    return {
      ...shape,
      centerX: shape.centerX + dx,
      centerY: shape.centerY + dy,
    };
  }
  if (shape.type === "line" || shape.type === "arrow") {
    return {
      ...shape,
      startX: shape.startX + dx,
      startY: shape.startY + dy,
      endX: shape.endX + dx,
      endY: shape.endY + dy,
    };
  }
  return shape;
}
