import { Shape } from "./types";

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

    // Inside rect or near border
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

    // Check distance to 4 diamond edges
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
    // Check main shaft
    if (distanceToSegment(px, py, shape.startX, shape.startY, shape.endX, shape.endY) <= threshold) {
      return true;
    }

    // Check arrowhead segments
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

  return false;
}
