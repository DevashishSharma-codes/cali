'use client';

import { useEffect, useRef, useState } from 'react';
import { draw } from '../lib/draw';
import { Shape, Tool } from '../lib/types';
import { getExistingShapes } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { Toolbar } from './Toolbar';

export function Canvas({ roomId }: { roomId: string | number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const pencilPointsRef = useRef<{ x: number; y: number }[]>([]);

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

  // Helper to construct a shape object from coordinates
  const createShape = (tool: Tool, x1: number, y1: number, x2: number, y2: number): Shape => {
    if (tool === 'pencil') {
      return {
        type: 'pencil',
        points: pencilPointsRef.current,
      };
    } else if (tool === 'rect') {
      return {
        type: 'rect',
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      };
    } else if (tool === 'circle') {
      const radius = Math.round(Math.hypot(x2 - x1, y2 - y1) / 2);
      const centerX = Math.round((x1 + x2) / 2);
      const centerY = Math.round((y1 + y2) / 2);
      return {
        type: 'circle',
        centerX,
        centerY,
        radius,
      };
    } else if (tool === 'diamond') {
      return {
        type: 'diamond',
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      };
    } else if (tool === 'line') {
      return {
        type: 'line',
        startX: x1,
        startY: y1,
        endX: x2,
        endY: y2,
      };
    } else {
      return {
        type: 'arrow',
        startX: x1,
        startY: y1,
        endX: x2,
        endY: y2,
      };
    }
  };

  // Mouse down: start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    if (selectedTool === 'pencil') {
      pencilPointsRef.current = [{ x: e.clientX, y: e.clientY }];
      if (canvasRef.current) {
        draw(canvasRef.current, [
          ...shapes,
          { type: 'pencil', points: pencilPointsRef.current },
        ]);
      }
    }
  };

  // Mouse move: live preview of shape currently being drawn
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    if (selectedTool === 'pencil') {
      pencilPointsRef.current.push({ x: e.clientX, y: e.clientY });
      const previewShape: Shape = {
        type: 'pencil',
        points: [...pencilPointsRef.current],
      };
      draw(canvasRef.current, [...shapes, previewShape]);
    } else {
      const previewShape = createShape(selectedTool, startX, startY, e.clientX, e.clientY);
      draw(canvasRef.current, [...shapes, previewShape]);
    }
  };

  // Mouse up: finalize shape, update state, and broadcast over WebSocket
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    let newShape: Shape;
    if (selectedTool === 'pencil') {
      newShape = {
        type: 'pencil',
        points: [...pencilPointsRef.current],
      };
      pencilPointsRef.current = [];
    } else {
      newShape = createShape(selectedTool, startX, startY, e.clientX, e.clientY);
    }

    setShapes((prev) => [...prev, newShape]);

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'chat',
          roomId: Number(roomId),
          message: JSON.stringify(newShape),
        })
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundColor: '#121212',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
    </div>
  );
}
