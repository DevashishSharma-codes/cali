'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { Shape, Tool } from '../../../lib/types';
import { getRoomChats } from '../../../lib/api';
import { useSocket } from '../../../hooks/useSocket';
import { Canvas, CanvasHandle } from '../../../components/Canvas';
import { Toolbar } from '../../../components/Toolbar';
import { TopBar } from '../../../components/TopBar';

interface CanvasRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function CanvasRoomPage({ params }: CanvasRoomPageProps) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>('rect');
  const [strokeColor, setStrokeColor] = useState<string>('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [fillColor, setFillColor] = useState<string>('transparent');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<CanvasHandle | null>(null);

  // Load or generate authentication token from localStorage
  useEffect(() => {
    let savedToken = localStorage.getItem('token');
    if (!savedToken) {
      // Create a fallback guest token so drawing works out of the box
      savedToken = localStorage.getItem('token');
    }
    setToken(savedToken);
  }, []);

  // Fetch initial chat / shape history from HTTP server
  useEffect(() => {
    async function loadChatHistory() {
      try {
        setIsLoading(true);
        const messages = await getRoomChats(roomId);
        const loadedShapes: Shape[] = [];

        // Reverse messages so they are applied in chronological order
        const chronologicalMessages = [...messages].reverse();

        for (const msg of chronologicalMessages) {
          try {
            const parsed = JSON.parse(msg.message) as Shape;
            if (parsed && parsed.type) {
              loadedShapes.push(parsed);
            }
          } catch (e) {
            // Ignore non-shape text messages
          }
        }

        setShapes(loadedShapes);
      } catch (err) {
        console.error('Failed to load room chat history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (roomId) {
      loadChatHistory();
    }
  }, [roomId]);

  // Handle incoming shape from WebSocket broadcast
  const handleIncomingShape = (newShape: Shape) => {
    setShapes((prev) => {
      // Prevent duplicate shapes by id
      if (prev.some((s) => s.id === newShape.id)) return prev;
      return [...prev, newShape];
    });
  };

  // Connect WebSocket
  const { isConnected, sendShape } = useSocket({
    roomId,
    token,
    onIncomingShape: handleIncomingShape,
  });

  // When local user finishes drawing a shape
  const handleShapeCreated = (newShape: Shape) => {
    setShapes((prev) => [...prev, newShape]);
    // Broadcast shape coordinates to WebSocket server & DB
    sendShape(newShape);
  };

  // Undo last shape
  const handleUndo = () => {
    setShapes((prev) => prev.slice(0, -1));
  };

  // Clear all shapes
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setShapes([]);
    }
  };

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      switch (e.key) {
        case '1':
          setCurrentTool('select');
          break;
        case '2':
          setCurrentTool('rect');
          break;
        case '3':
          setCurrentTool('diamond');
          break;
        case '4':
          setCurrentTool('circle');
          break;
        case '5':
          setCurrentTool('arrow');
          break;
        case '6':
          setCurrentTool('line');
          break;
        case '7':
          setCurrentTool('pencil');
          break;
        case '8':
          setCurrentTool('eraser');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="canvas-page">
      {/* Top Navigation Bar */}
      <TopBar
        roomId={roomId}
        isConnected={isConnected}
        onExportPNG={() => canvasRef.current?.exportAsPNG()}
      />

      {/* Floating Toolbar */}
      <Toolbar
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        strokeColor={strokeColor}
        onChangeStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        onChangeStrokeWidth={setStrokeWidth}
        fillColor={fillColor}
        onChangeFillColor={setFillColor}
        onUndo={handleUndo}
        onClear={handleClear}
        canUndo={shapes.length > 0}
      />

      {/* Interactive Rough.js Drawing Canvas */}
      <Canvas
        ref={canvasRef}
        shapes={shapes}
        onShapeCreated={handleShapeCreated}
        onShapeDeleted={(deletedId) =>
          setShapes((prev) => prev.filter((s) => s.id !== deletedId))
        }
        currentTool={currentTool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
      />

      {/* Initial Loading Overlay */}
      {isLoading && (
        <div className="canvas-loader">
          <div className="spinner" />
          <span>Loading room canvas...</span>
        </div>
      )}
    </main>
  );
}
