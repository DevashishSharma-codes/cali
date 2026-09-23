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

function getRoughOptions(shape: Shape) {
  const stroke = shape.strokeColor || "#ffffff";
  const strokeWidth = shape.strokeWidth || 2;
  const roughness = shape.roughness !== undefined ? shape.roughness : 1.2;
  const strokeLineDash =
    shape.strokeStyle === "dashed"
      ? [8, 8]
      : shape.strokeStyle === "dotted"
      ? [3, 6]
      : undefined;

  const hasFill = shape.backgroundColor && shape.backgroundColor !== "transparent";
  const fill = hasFill ? shape.backgroundColor : undefined;
  const fillStyle = hasFill
    ? shape.fillStyle === "transparent"
      ? undefined
      : shape.fillStyle || "hachure"
    : undefined;

  return {
    stroke,
    strokeWidth,
    roughness,
    strokeLineDash,
    fill,
    fillStyle,
    fillWeight: Math.max(1, strokeWidth / 2),
    hachureGap: Math.max(4, strokeWidth * 2),
  };
}

export function draw(
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  onImageLoaded?: () => void,
  eraserHalo?: { x: number; y: number } | null,
  particles?: EraserParticle[],
  canvasBackground?: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear & fill canvas with background color
  const bg = canvasBackground || "#121212";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Initialize roughjs
  const rc = rough.canvas(canvas);

  shapes.forEach((shape) => {
    ctx.save();
    if (shape.opacity !== undefined && shape.opacity < 100) {
      ctx.globalAlpha = Math.max(0, Math.min(1, shape.opacity / 100));
    }

    const options = getRoughOptions(shape);

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
            draw(canvas, shapes, onImageLoaded, eraserHalo, particles, canvasBackground);
          }
        };
        imageCache.set(shape.src, img);
      } else if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
      }
    } else if (shape.type === "pencil") {
      if (!shape.points || shape.points.length === 0) {
        ctx.restore();
        return;
      }
      const firstPoint = shape.points[0];
      if (shape.points.length === 1 && firstPoint) {
        rc.circle(firstPoint.x, firstPoint.y, options.strokeWidth * 1.5, {
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          fill: options.stroke,
          fillStyle: "solid",
          roughness: options.roughness,
        });
      } else {
        const pts: [number, number][] = shape.points.map((p) => [p.x, p.y]);
        rc.linearPath(pts, {
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          roughness: options.roughness,
          strokeLineDash: options.strokeLineDash,
        });
      }
    } else if (shape.type === "rect") {
      rc.rectangle(shape.x, shape.y, shape.width, shape.height, options);
    } else if (shape.type === "circle") {
      rc.circle(shape.centerX, shape.centerY, shape.radius * 2, options);
    } else if (shape.type === "diamond") {
      const top: [number, number] = [shape.x + shape.width / 2, shape.y];
      const right: [number, number] = [shape.x + shape.width, shape.y + shape.height / 2];
      const bottom: [number, number] = [shape.x + shape.width / 2, shape.y + shape.height];
      const left: [number, number] = [shape.x, shape.y + shape.height / 2];

      rc.polygon([top, right, bottom, left], options);
    } else if (shape.type === "line") {
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, options);
    } else if (shape.type === "arrow") {
      // Main shaft
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, options);

      // Arrowhead calculations
      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      const headLen = Math.max(14, options.strokeWidth * 4);
      const leftX = shape.endX - headLen * Math.cos(angle - Math.PI / 6);
      const leftY = shape.endY - headLen * Math.sin(angle - Math.PI / 6);
      const rightX = shape.endX - headLen * Math.cos(angle + Math.PI / 6);
      const rightY = shape.endY - headLen * Math.sin(angle + Math.PI / 6);

      rc.line(shape.endX, shape.endY, leftX, leftY, options);
      rc.line(shape.endX, shape.endY, rightX, rightY, options);
    } else if (shape.type === "text") {
      const fontSize = shape.fontSize || 24;
      ctx.font = `600 ${fontSize}px "Architects Daughter", "Caveat", "Kalam", "Patrick Hand", "Comic Sans MS", cursive, sans-serif`;
      ctx.fillStyle = shape.strokeColor || "#ffffff";
      ctx.textBaseline = "top";
      const lines = shape.text.split("\n");
      const lineHeight = fontSize * 1.35;
      lines.forEach((line, index) => {
        ctx.fillText(line, shape.x, shape.y + index * lineHeight);
      });
    }

    ctx.restore();
  });

  // Render eraser shavings/dust particles
  if (particles && particles.length > 0) {
    ctx.save();
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace("OPACITY", Math.max(0, Math.min(1, p.opacity)).toFixed(2));
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
    grad.addColorStop(0, "rgba(255, 255, 255, 0.32)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.12)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(eraserHalo.x, eraserHalo.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Soft dashed friction perimeter
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(eraserHalo.x, eraserHalo.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
