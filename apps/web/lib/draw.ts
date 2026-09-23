import rough from "roughjs";
import { Shape } from "./types";

export interface EraserParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const imageCache = new Map<string, HTMLImageElement>();

export function draw(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  onImageLoaded?: () => void,
  eraserHalo?: { x: number; y: number } | null,
  particles?: EraserParticle[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Initialize roughjs
  const rc = rough.canvas(canvas);

  shapes.forEach((shape) => {
    if (shape.type === "image") {
      let img = imageCache.get(shape.src);
      if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.src = shape.src;
        img.onload = () => {
          if (img) imageCache.set(shape.src, img);
          if (onImageLoaded) {
            onImageLoaded();
          } else {
            draw(canvas, shapes);
          }
        };
        imageCache.set(shape.src, img);
      } else if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
      }
    } else if (shape.type === "pencil") {
      if (!shape.points || shape.points.length === 0) return;
      const firstPoint = shape.points[0];
      if (shape.points.length === 1 && firstPoint) {
        rc.circle(firstPoint.x, firstPoint.y, 2, {
          stroke: "#ffffff",
          strokeWidth: 2,
          fill: "#ffffff",
          fillStyle: "solid",
        });
      } else {
        const pts: [number, number][] = shape.points.map((p) => [p.x, p.y]);
        rc.linearPath(pts, {
          stroke: "#ffffff",
          strokeWidth: 2,
          roughness: 0.5,
        });
      }
    } else if (shape.type === "rect") {
      rc.rectangle(shape.x, shape.y, shape.width, shape.height, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    } else if (shape.type === "circle") {
      rc.circle(shape.centerX, shape.centerY, shape.radius * 2, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    } else if (shape.type === "diamond") {
      const top: [number, number] = [shape.x + shape.width / 2, shape.y];
      const right: [number, number] = [shape.x + shape.width, shape.y + shape.height / 2];
      const bottom: [number, number] = [shape.x + shape.width / 2, shape.y + shape.height];
      const left: [number, number] = [shape.x, shape.y + shape.height / 2];

      rc.polygon([top, right, bottom, left], {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    } else if (shape.type === "line") {
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    } else if (shape.type === "arrow") {
      // Main shaft
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });

      // Arrowhead calculations
      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      const headLen = 15;
      const leftX = shape.endX - headLen * Math.cos(angle - Math.PI / 6);
      const leftY = shape.endY - headLen * Math.sin(angle - Math.PI / 6);
      const rightX = shape.endX - headLen * Math.cos(angle + Math.PI / 6);
      const rightY = shape.endY - headLen * Math.sin(angle + Math.PI / 6);

      rc.line(shape.endX, shape.endY, leftX, leftY, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
      rc.line(shape.endX, shape.endY, rightX, rightY, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    }
  });

  // Render eraser shavings/dust particles
  if (particles && particles.length > 0) {
    ctx.save();
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('OPACITY', Math.max(0, Math.min(1, p.opacity)).toFixed(2));
      ctx.fill();
    });
    ctx.restore();
  }

  // Render active eraser rubbing halo
  if (eraserHalo) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      eraserHalo.x,
      eraserHalo.y,
      0,
      eraserHalo.x,
      eraserHalo.y,
      22
    );
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.4)');
    grad.addColorStop(0.6, 'rgba(244, 114, 182, 0.15)');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(eraserHalo.x, eraserHalo.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Soft dashed friction perimeter
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(eraserHalo.x, eraserHalo.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
