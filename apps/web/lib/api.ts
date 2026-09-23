import { Shape } from "./types";

const HTTP_URL = "http://localhost:3001";

// 1. Fetch chat messages from the backend for a given room
// 2. Parse the shape coordinates stored inside each chat's `message` field
export async function getExistingShapes(roomId: string | number): Promise<Shape[]> {
  const res = await fetch(`${HTTP_URL}/chats/${roomId}`);
  const data = await res.json();
  const messages = data.messages || [];

  const shapes: Shape[] = [];

  // In the DB, chats are ordered newest first (desc), so reverse to draw chronologically
  const chronologicalMessages = [...messages].reverse();

  chronologicalMessages.forEach((msg: { message: string }) => {
    try {
      const shapeData = JSON.parse(msg.message);
      if (
        shapeData &&
        (shapeData.type === "pencil" ||
          shapeData.type === "rect" ||
          shapeData.type === "circle" ||
          shapeData.type === "diamond" ||
          shapeData.type === "line" ||
          shapeData.type === "arrow")
      ) {
        shapes.push(shapeData);
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });

  return shapes;
}
