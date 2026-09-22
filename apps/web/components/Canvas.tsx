'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Shape, Tool } from '../lib/types';
import { redrawCanvas } from '../lib/draw';

export interface CanvasHandle {
  exportAsPNG: () => void;
}

interface CanvasProps {
  shapes: Shape[];
  onShapeCreated: (shape: Shape) => void;
  onShapeDeleted?: (shapeId: string) => void;
  currentTool: Tool;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  {
    shapes,
    onShapeCreated,
    onShapeDeleted,
    currentTool,
    strokeColor,
    strokeWidth,
    fillColor,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);

  // Expose exportAsPNG method to parent component (TopBar)
  useImperativeHandle(ref, () => ({
    exportAsPNG: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create a temporary canvas with dark background for clean export
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;

      // Fill background
      exportCtx.fillStyle = '#121212';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportCtx.drawImage(canvas, 0, 0);

      // Trigger download
      const link = document.createElement('a');
      link.download = `excalidraw-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    },
  }));

  // Handle window resizing
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas(canvas, shapes, currentShape);
  }, [shapes, currentShape]);

  // Set initial canvas size & attach window resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Redraw canvas whenever shapes or the currently drawing shape changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      redrawCanvas(canvas, shapes, currentShape);
    }
  }, [shapes, currentShape]);

  // Helper to generate unique shape IDs
  const createShapeId = () => `shape_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Handle Mouse Down (Start Drawing)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle Eraser Tool: delete shape clicked on
    if (currentTool === 'eraser') {
      if (onShapeDeleted && shapes.length > 0) {
        // Simple eraser: removes the most recent shape near the pointer
        const lastShape = shapes[shapes.length - 1];
        if (lastShape) {
          onShapeDeleted(lastShape.id);
        }
      }
      return;
    }

    isDrawingRef.current = true;
    startPosRef.current = { x, y };

    // Initialize the shape object based on selected tool
    let newShape: Shape | null = null;
    const base = {
      id: createShapeId(),
      strokeColor,
      strokeWidth,
      fillColor,
    };

    switch (currentTool) {
      case 'rect':
        newShape = { ...base, type: 'rect', x, y, width: 0, height: 0 };
        break;
      case 'circle':
        newShape = { ...base, type: 'circle', centerX: x, centerY: y, radius: 0 };
        break;
      case 'line':
        newShape = { ...base, type: 'line', startX: x, startY: y, endX: x, endY: y };
        break;
      case 'arrow':
        newShape = { ...base, type: 'arrow', startX: x, startY: y, endX: x, endY: y };
        break;
      case 'diamond':
        newShape = { ...base, type: 'diamond', x, y, width: 0, height: 0 };
        break;
      case 'pencil':
        newShape = { ...base, type: 'pencil', points: [{ x, y }] };
        break;
    }

    setCurrentShape(newShape);
  };

  // Handle Mouse Move (Update Preview of Shape)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentShape) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;

    let updatedShape: Shape = { ...currentShape };

    switch (currentTool) {
      case 'rect':
      case 'diamond': {
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        updatedShape = { ...updatedShape, x, y, width, height } as Shape;
        break;
      }

      case 'circle': {
        const radius = Math.round(Math.hypot(currentX - startX, currentY - startY) / 2);
        const centerX = Math.round((startX + currentX) / 2);
        const centerY = Math.round((startY + currentY) / 2);
        updatedShape = { ...updatedShape, centerX, centerY, radius } as Shape;
        break;
      }

      case 'line':
      case 'arrow': {
        updatedShape = { ...updatedShape, startX, startY, endX: currentX, endY: currentY } as Shape;
        break;
      }

      case 'pencil': {
        if (updatedShape.type === 'pencil') {
          updatedShape = {
            ...updatedShape,
            points: [...updatedShape.points, { x: currentX, y: currentY }],
          };
        }
        break;
      }
    }

    setCurrentShape(updatedShape);
  };

  // Handle Mouse Up (Finalize Shape & Broadcast)
  const handleMouseUp = () => {
    if (!isDrawingRef.current || !currentShape) return;

    isDrawingRef.current = false;

    // Filter out accidental tiny clicks for shapes (unless pencil)
    let isValidShape = true;
    if (currentShape.type === 'rect' || currentShape.type === 'diamond') {
      if (currentShape.width < 3 && currentShape.height < 3) isValidShape = false;
    } else if (currentShape.type === 'circle') {
      if (currentShape.radius < 3) isValidShape = false;
    } else if (currentShape.type === 'pencil') {
      if (currentShape.points.length < 2) isValidShape = false;
    }

    if (isValidShape) {
      // Send shape to parent handler (updates state & sends to WebSocket / DB)
      onShapeCreated(currentShape);
    }

    setCurrentShape(null);
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`drawing-canvas tool-${currentTool}`}
      />
    </div>
  );
});
