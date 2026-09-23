'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { draw } from '../lib/draw';
import { Shape, Tool } from '../lib/types';
import { deleteShapeApi, getExistingShapes } from '../lib/api';
import { isPointNearShape } from '../lib/hitTest';
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

  // 2. Join WebSocket room & receive live shapes and deletions
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
            if (data.id && !newShape.id) {
              newShape.id = data.id;
            }
            setShapes((prev) => [...prev, newShape]);
          } else if (data.type === 'delete_shape') {
            const deletedId = Number(data.shapeId);
            setShapes((prev) => prev.filter((s) => s.id !== deletedId));
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

  // Handle Undo: remove last shape locally, from DB, and over WebSocket
  const handleUndo = useCallback(() => {
    setShapes((prev) => {
      if (prev.length === 0) return prev;
      const lastShape = prev[prev.length - 1];
      if (lastShape && lastShape.id) {
        deleteShapeApi(lastShape.id);
        if (socket) {
          socket.send(
            JSON.stringify({
              type: 'delete_shape',
              roomId: Number(roomId),
              shapeId: lastShape.id,
            })
          );
        }
      }
      return prev.slice(0, -1);
    });
  }, [roomId, socket]);

  // Keyboard shortcut for Undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Erase shapes touched by cursor coordinates
  const eraseAt = useCallback(
    (x: number, y: number) => {
      setShapes((prev) => {
        const toDelete = prev.filter((shape) => isPointNearShape(x, y, shape, 16));
        if (toDelete.length === 0) return prev;

        toDelete.forEach((shape) => {
          if (shape.id) {
            deleteShapeApi(shape.id);
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: 'delete_shape',
                  roomId: Number(roomId),
                  shapeId: shape.id,
                })
              );
            }
          }
        });

        return prev.filter((shape) => !toDelete.includes(shape));
      });
    },
    [roomId, socket]
  );

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

  // Mouse down: start drawing or erase
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setStartX(e.clientX);
    setStartY(e.clientY);

    if (selectedTool === 'eraser') {
      eraseAt(e.clientX, e.clientY);
    } else if (selectedTool === 'pencil') {
      pencilPointsRef.current = [{ x: e.clientX, y: e.clientY }];
      if (canvasRef.current) {
        draw(canvasRef.current, [
          ...shapes,
          { type: 'pencil', points: pencilPointsRef.current },
        ]);
      }
    }
  };

  // Mouse move: live preview of shape currently being drawn or continuous erase
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    if (selectedTool === 'eraser') {
      eraseAt(e.clientX, e.clientY);
    } else if (selectedTool === 'pencil') {
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

    if (selectedTool === 'eraser') {
      return;
    }

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

  const getCursor = () => {
    if (selectedTool === 'eraser') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='filter:drop-shadow(0 0 1.5px %23000000);'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E\") 4 20, pointer";
    }
    if (selectedTool === 'pencil') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='filter:drop-shadow(0 0 1.5px %23000000);'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E\") 2 22, crosshair";
    }
    return 'crosshair';
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onUndo={handleUndo}
        canUndo={shapes.length > 0}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundColor: '#121212',
          cursor: getCursor(),
          display: 'block',
        }}
      />
    </div>
  );
}

