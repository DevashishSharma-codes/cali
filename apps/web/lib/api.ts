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

  chronologicalMessages.forEach((msg: { id: number; message: string }) => {
    try {
      const shapeData = JSON.parse(msg.message);
      if (
        shapeData &&
        (shapeData.type === "pencil" ||
          shapeData.type === "rect" ||
          shapeData.type === "circle" ||
          shapeData.type === "diamond" ||
          shapeData.type === "line" ||
          shapeData.type === "arrow" ||
          shapeData.type === "image")
      ) {
        shapes.push({
          ...shapeData,
          id: shapeData.id ?? msg.id,
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });

  return shapes;
}

export async function deleteShapeApi(shapeId: number): Promise<boolean> {
  try {
    const res = await fetch(`${HTTP_URL}/chats/${shapeId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to delete shape via API:", e);
    return false;
  }
}
