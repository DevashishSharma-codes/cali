import { Shape } from "./types";

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'start' | 'end';

export interface HandlePosition {
  handle: ResizeHandle;
  x: number;
  y: number;
  cursor: string;
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
    // Also check if clicking inside the compact bounding box of the sketch
    const bounds = getShapeBounds(shape);
    if (
      bounds.width <= 40 &&
      bounds.height <= 40 &&
      px >= bounds.minX - threshold &&
      px <= bounds.maxX + threshold &&
      py >= bounds.minY - threshold &&
      py <= bounds.maxY + threshold
    ) {
      return true;
    }
    return false;
  }

  if (shape.type === "rect") {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    return (
      px >= minX - threshold &&
      px <= maxX + threshold &&
      py >= minY - threshold &&
      py <= maxY + threshold
    );
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

    return (
      px >= minX - threshold &&
      px <= maxX + threshold &&
      py >= minY - threshold &&
      py <= maxY + threshold
    );
  }

  if (shape.type === "text") {
    const fontSize = shape.fontSize || 24;
    const lines = shape.text.split("\n");
    const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
    const width = maxLineLen * (fontSize * 0.65);
    const height = lines.length * (fontSize * 1.35);

    return (
      px >= shape.x - threshold &&
      px <= shape.x + width + threshold &&
      py >= shape.y - threshold &&
      py <= shape.y + height + threshold
    );
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

export function getCombinedBounds(shapes: Shape[]): Bounds {
  if (shapes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  const allBounds = shapes.map(getShapeBounds);
  const minX = Math.min(...allBounds.map((b) => b.minX));
  const minY = Math.min(...allBounds.map((b) => b.minY));
  const maxX = Math.max(...allBounds.map((b) => b.maxX));
  const maxY = Math.max(...allBounds.map((b) => b.maxY));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function getSelectionHandles(
  bounds: Bounds,
  isSingleLineOrArrow?: boolean,
  lineShape?: Shape
): HandlePosition[] {
  const { minX, minY, maxX, maxY, width, height } = bounds;
  const midX = minX + width / 2;
  const midY = minY + height / 2;

  if (isSingleLineOrArrow && lineShape && (lineShape.type === "line" || lineShape.type === "arrow")) {
    return [
      { handle: "start", x: lineShape.startX, y: lineShape.startY, cursor: "crosshair" },
      { handle: "end", x: lineShape.endX, y: lineShape.endY, cursor: "crosshair" },
      { handle: "nw", x: minX, y: minY, cursor: "nwse-resize" },
      { handle: "ne", x: maxX, y: minY, cursor: "nesw-resize" },
      { handle: "se", x: maxX, y: maxY, cursor: "nwse-resize" },
      { handle: "sw", x: minX, y: maxY, cursor: "nesw-resize" },
    ];
  }

  return [
    { handle: "nw", x: minX, y: minY, cursor: "nwse-resize" },
    { handle: "n", x: midX, y: minY, cursor: "ns-resize" },
    { handle: "ne", x: maxX, y: minY, cursor: "nesw-resize" },
    { handle: "e", x: maxX, y: midY, cursor: "ew-resize" },
    { handle: "se", x: maxX, y: maxY, cursor: "nwse-resize" },
    { handle: "s", x: midX, y: maxY, cursor: "ns-resize" },
    { handle: "sw", x: minX, y: maxY, cursor: "nesw-resize" },
    { handle: "w", x: minX, y: midY, cursor: "ew-resize" },
  ];
}

export function isPointInsideBounds(
  px: number,
  py: number,
  bounds: Bounds,
  pad = 0
): boolean {
  return (
    px >= bounds.minX - pad &&
    px <= bounds.maxX + pad &&
    py >= bounds.minY - pad &&
    py <= bounds.maxY + pad
  );
}

export function getResizeHandleAt(
  px: number,
  py: number,
  bounds: Bounds,
  zoom: number,
  isSingleLineOrArrow?: boolean,
  lineShape?: Shape
): HandlePosition | null {
  const pad = 6 / zoom;
  const paddedBounds: Bounds = {
    minX: bounds.minX - pad,
    minY: bounds.minY - pad,
    maxX: bounds.maxX + pad,
    maxY: bounds.maxY + pad,
    width: bounds.width + pad * 2,
    height: bounds.height + pad * 2,
  };
  const handles = getSelectionHandles(paddedBounds, isSingleLineOrArrow, lineShape);
  const threshold = 10 / zoom;

  for (const h of handles) {
    if (Math.hypot(px - h.x, py - h.y) <= threshold) {
      return h;
    }
  }
  return null;
}

export function calculateNewBounds(
  origBounds: Bounds,
  handle: ResizeHandle,
  worldX: number,
  worldY: number,
  preserveAspect = false
): Bounds {
  let minX = origBounds.minX;
  let minY = origBounds.minY;
  let maxX = origBounds.maxX;
  let maxY = origBounds.maxY;

  switch (handle) {
    case "se":
      maxX = worldX;
      maxY = worldY;
      break;
    case "nw":
      minX = worldX;
      minY = worldY;
      break;
    case "ne":
      maxX = worldX;
      minY = worldY;
      break;
    case "sw":
      minX = worldX;
      maxY = worldY;
      break;
    case "n":
      minY = worldY;
      break;
    case "s":
      maxY = worldY;
      break;
    case "w":
      minX = worldX;
      break;
    case "e":
      maxX = worldX;
      break;
    default:
      break;
  }

  const finalMinX = Math.min(minX, maxX);
  const finalMaxX = Math.max(minX, maxX);
  const finalMinY = Math.min(minY, maxY);
  const finalMaxY = Math.max(minY, maxY);

  let width = Math.max(5, finalMaxX - finalMinX);
  let height = Math.max(5, finalMaxY - finalMinY);

  if (preserveAspect && origBounds.width > 0 && origBounds.height > 0) {
    const origAspect = origBounds.width / origBounds.height;
    if (width / height > origAspect) {
      width = height * origAspect;
    } else {
      height = width / origAspect;
    }
  }

  return {
    minX: finalMinX,
    minY: finalMinY,
    maxX: finalMinX + width,
    maxY: finalMinY + height,
    width,
    height,
  };
}

export function resizeShape(
  shape: Shape,
  origShape: Shape,
  origBounds: Bounds,
  newBounds: Bounds,
  handle: ResizeHandle,
  worldX: number,
  worldY: number
): Shape {
  const origW = Math.max(1, origBounds.width);
  const origH = Math.max(1, origBounds.height);
  const newW = Math.max(5, newBounds.width);
  const newH = Math.max(5, newBounds.height);

  if (shape.type === "pencil") {
    if (origShape.type !== "pencil" || !origShape.points || origShape.points.length === 0) {
      return shape;
    }
    const newPoints = origShape.points.map((p) => {
      const relX = (p.x - origBounds.minX) / origW;
      const relY = (p.y - origBounds.minY) / origH;
      return {
        x: newBounds.minX + relX * newW,
        y: newBounds.minY + relY * newH,
      };
    });

    return {
      ...shape,
      points: newPoints,
    };
  }

  if (shape.type === "rect" || shape.type === "diamond" || shape.type === "image") {
    if (origShape.type !== "rect" && origShape.type !== "diamond" && origShape.type !== "image") {
      return shape;
    }
    const relX = (origShape.x - origBounds.minX) / origW;
    const relY = (origShape.y - origBounds.minY) / origH;
    const relW = origShape.width / origW;
    const relH = origShape.height / origH;

    return {
      ...shape,
      x: Math.round(newBounds.minX + relX * newW),
      y: Math.round(newBounds.minY + relY * newH),
      width: Math.round(Math.max(5, relW * newW)),
      height: Math.round(Math.max(5, relH * newH)),
    };
  }

  if (shape.type === "circle") {
    if (origShape.type !== "circle") {
      return shape;
    }
    const relCenterX = (origShape.centerX - origBounds.minX) / origW;
    const relCenterY = (origShape.centerY - origBounds.minY) / origH;

    const newCenterX = Math.round(newBounds.minX + relCenterX * newW);
    const newCenterY = Math.round(newBounds.minY + relCenterY * newH);
    const newRadius = Math.round(Math.max(4, Math.min(newW, newH) / 2));

    return {
      ...shape,
      centerX: newCenterX,
      centerY: newCenterY,
      radius: newRadius,
    };
  }

  if (shape.type === "line" || shape.type === "arrow") {
    if (origShape.type !== "line" && origShape.type !== "arrow") {
      return shape;
    }
    if (handle === "start") {
      return {
        ...shape,
        startX: Math.round(worldX),
        startY: Math.round(worldY),
      };
    }
    if (handle === "end") {
      return {
        ...shape,
        endX: Math.round(worldX),
        endY: Math.round(worldY),
      };
    }

    const relStartX = (origShape.startX - origBounds.minX) / origW;
    const relStartY = (origShape.startY - origBounds.minY) / origH;
    const relEndX = (origShape.endX - origBounds.minX) / origW;
    const relEndY = (origShape.endY - origBounds.minY) / origH;

    return {
      ...shape,
      startX: Math.round(newBounds.minX + relStartX * newW),
      startY: Math.round(newBounds.minY + relStartY * newH),
      endX: Math.round(newBounds.minX + relEndX * newW),
      endY: Math.round(newBounds.minY + relEndY * newH),
    };
  }

  if (shape.type === "text") {
    if (origShape.type !== "text") {
      return shape;
    }
    const relX = (origShape.x - origBounds.minX) / origW;
    const relY = (origShape.y - origBounds.minY) / origH;
    const scale = Math.max(0.2, Math.min(newW / origW, newH / origH));
    const origFontSize = origShape.fontSize || 24;
    const newFontSize = Math.max(12, Math.round(origFontSize * scale));

    return {
      ...shape,
      x: Math.round(newBounds.minX + relX * newW),
      y: Math.round(newBounds.minY + relY * newH),
      fontSize: newFontSize,
    };
  }

  return shape;
}

export function isShapeInBox(
  shape: Shape,
  box: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  const b = getShapeBounds(shape);
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
