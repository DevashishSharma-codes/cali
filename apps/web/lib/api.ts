import { Shape } from "./types";

const HTTP_URL = (process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001").replace(/\/+$/, "");

// 1. Fetch chat messages from the backend for a given room
// 2. Parse the shape coordinates stored inside each chat's `message` field
export async function getExistingShapes(roomId: string | number): Promise<Shape[]> {
  try {
    const res = await fetch(`${HTTP_URL}/chats/${roomId}`);
    if (!res.ok) return [];
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
            shapeData.type === "text" ||
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
  } catch (e) {
    console.warn(`[HTTP] Could not fetch existing shapes from ${HTTP_URL}. Using local canvas state.`);
    return [];
  }
}

export async function deleteShapeApi(shapeId: number): Promise<boolean> {
  try {
    const res = await fetch(`${HTTP_URL}/chats/${shapeId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    // Graceful fallback - WebSocket persists deletions directly to DB
    return false;
  }
}

export async function updateShapeApi(shapeId: number, shape: Shape): Promise<boolean> {
  try {
    const res = await fetch(`${HTTP_URL}/chats/${shapeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: JSON.stringify(shape) }),
    });
    return res.ok;
  } catch (e) {
    // Graceful fallback - WebSocket persists shape updates directly to DB
    return false;
  }
}

