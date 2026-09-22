import rough from "roughjs";
import { Shape } from "./types";

export function draw(canvas: HTMLCanvasElement, shapes: Shape[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Initialize roughjs
  const rc = rough.canvas(canvas);

  // Draw all rectangles
  shapes.forEach((shape) => {
    if (shape.type === "rect") {
      rc.rectangle(shape.x, shape.y, shape.width, shape.height, {
        stroke: "#ffffff",
        strokeWidth: 2,
      });
    }
  });
}
