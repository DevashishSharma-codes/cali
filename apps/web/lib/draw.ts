import rough from 'roughjs';
import { Shape } from './types';

/**
 * Draws a single shape onto the HTML5 Canvas using Rough.js for a sketchy, hand-drawn look.
 */
export function drawShape(rc: ReturnType<typeof rough.canvas>, shape: Shape) {
  const options = {
    stroke: shape.strokeColor,
    strokeWidth: shape.strokeWidth,
    fill: shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : undefined,
    fillStyle: 'hachure',
    roughness: 1.3, // Gives the hand-drawn Excalidraw style
    bowing: 1.5,
  };

  switch (shape.type) {
    case 'rect': {
      rc.rectangle(shape.x, shape.y, shape.width, shape.height, options);
      break;
    }

    case 'circle': {
      // Rough.js circle takes diameter (radius * 2)
      rc.circle(shape.centerX, shape.centerY, shape.radius * 2, options);
      break;
    }

    case 'line': {
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, options);
      break;
    }

    case 'arrow': {
      // Draw the main line
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, options);

      // Calculate arrow head points
      const headLength = 16;
      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      const x1 = shape.endX - headLength * Math.cos(angle - Math.PI / 6);
      const y1 = shape.endY - headLength * Math.sin(angle - Math.PI / 6);
      const x2 = shape.endX - headLength * Math.cos(angle + Math.PI / 6);
      const y2 = shape.endY - headLength * Math.sin(angle + Math.PI / 6);

      rc.line(shape.endX, shape.endY, x1, y1, options);
      rc.line(shape.endX, shape.endY, x2, y2, options);
      break;
    }

    case 'diamond': {
      const top = [shape.x + shape.width / 2, shape.y] as [number, number];
      const right = [shape.x + shape.width, shape.y + shape.height / 2] as [number, number];
      const bottom = [shape.x + shape.width / 2, shape.y + shape.height] as [number, number];
      const left = [shape.x, shape.y + shape.height / 2] as [number, number];

      rc.polygon([top, right, bottom, left], options);
      break;
    }

    case 'pencil': {
      if (shape.points.length < 2) return;
      const pointsArray = shape.points.map((p) => [p.x, p.y] as [number, number]);
      rc.linearPath(pointsArray, {
        ...options,
        roughness: 0.8,
      });
      break;
    }
  }
}

/**
 * Clears the canvas and redraws all finalized shapes plus any shape currently being drawn.
 */
export function redrawCanvas(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  currentShape?: Shape | null
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Initialize Rough.js canvas instance
  const rc = rough.canvas(canvas);

  // Draw all existing shapes
  for (const shape of shapes) {
    drawShape(rc, shape);
  }

  // Draw shape currently being created by the user in real-time
  if (currentShape) {
    drawShape(rc, currentShape);
  }
}
