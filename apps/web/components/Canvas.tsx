'use client';

import { useEffect, useRef, useState } from 'react';
import { draw } from '../lib/draw';
import { Shape } from '../lib/types';
import { getExistingShapes } from '../lib/api';
import { useSocket } from '../hooks/useSocket';

export function Canvas({ roomId }: { roomId: string | number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const { socket, loading } = useSocket();

  // 1. Fetch initial shapes from DB for this room
  useEffect(() => {
    getExistingShapes(roomId).then((data) => {
      setShapes(data);
    });
  }, [roomId]);

  // 2. Join WebSocket room & receive live shapes
  useEffect(() => {
    if (!loading && socket) {
      socket.send(
        JSON.stringify({
          type: 'join_room',
          roomId: Number(roomId),
        })
      );

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat') {
            const newShape = JSON.parse(data.message);
            setShapes((prev) => [...prev, newShape]);
          }
        } catch (e) {}
      };
    }
  }, [socket, loading, roomId]);

  // 3. Set canvas dimensions and redraw whenever shapes array updates
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      draw(canvasRef.current, shapes);
    }
  }, [shapes]);

  // Mouse down: record start coordinates
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  // Mouse up: calculate width/height, save rectangle, and send via WebSocket
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    const newRect: Shape = {
      type: 'rect',
      x: startX,
      y: startY,
      width,
      height,
    };

    setShapes((prev) => [...prev, newRect]);

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'chat',
          roomId: Number(roomId),
          message: JSON.stringify(newRect),
        })
      );
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        backgroundColor: '#121212',
        cursor: 'crosshair',
        display: 'block',
      }}
    />
  );
}
