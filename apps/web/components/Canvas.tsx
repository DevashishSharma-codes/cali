import { useCallback, useEffect, useRef, useState } from 'react';
import { draw, EraserParticle } from '../lib/draw';
import { Shape, Tool } from '../lib/types';
import { deleteShapeApi, getExistingShapes } from '../lib/api';
import { isPointNearShape } from '../lib/hitTest';
import { deleteImageFromSupabase, uploadImageToSupabase } from '../lib/supabase';
import { useSocket } from '../hooks/useSocket';
import { Toolbar } from './Toolbar';
import { Loader2 } from 'lucide-react';

export function Canvas({ roomId }: { roomId: string | number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const shapesRef = useRef<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const pencilPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Text tool inline editing
  const [editingText, setEditingText] = useState<{ x: number; y: number; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Eraser rubbing effect & particles
  const particlesRef = useRef<EraserParticle[]>([]);
  const eraserPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const { socket, loading } = useSocket();

  // Focus textarea when text editing starts
  useEffect(() => {
    if (editingText && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingText]);

  // Keep shapesRef synchronized for 60fps animation loop
  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  // Commit typed text as a new TextShape
  const commitText = useCallback(() => {
    if (!editingText) return;
    const trimmed = editingText.text.trim();
    if (trimmed.length > 0) {
      const newTextShape: Shape = {
        type: 'text',
        text: trimmed,
        x: editingText.x,
        y: editingText.y,
        fontSize: 24,
      };
      setShapes((prev) => [...prev, newTextShape]);

      if (socket) {
        socket.send(
          JSON.stringify({
            type: 'chat',
            roomId: Number(roomId),
            message: JSON.stringify(newTextShape),
          })
        );
      }
    }
    setEditingText(null);
  }, [editingText, roomId, socket]);

  // Double click anywhere on canvas to create/type text
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editingText) {
      commitText();
    }
    setEditingText({ x: e.clientX, y: e.clientY, text: '' });
  };

  const startParticleLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const loop = () => {
      if (!canvasRef.current) return;

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // slight gravity
        p.opacity -= 0.03; // smooth fade
        p.size = Math.max(0.5, p.size * 0.98);
        if (p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }

      draw(
        canvasRef.current,
        shapesRef.current,
        undefined,
        eraserPosRef.current,
        particles
      );

      if (particles.length > 0 || eraserPosRef.current !== null) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count = 4, burst = false) => {
    const colors = [
      'rgba(255, 255, 255, OPACITY)', // pure white
      'rgba(248, 250, 252, OPACITY)', // soft white
      'rgba(241, 245, 249, OPACITY)', // chalk white
      'rgba(226, 232, 240, OPACITY)', // light eraser dust
      'rgba(203, 213, 225, OPACITY)', // slate dust
    ];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 3.5 + 1.5 : Math.random() * 1.5 + 0.5;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        opacity: 0.9,
        color: colors[Math.floor(Math.random() * colors.length)] || 'rgba(255, 255, 255, OPACITY)',
      });
    }
  }, []);

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

  // Redraw when custom sketchy web fonts finish loading
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          draw(canvasRef.current, shapesRef.current);
        }
      });
    }
  }, []);

  // Handle Undo: remove last shape locally, from DB, from S3 if image, and over WebSocket
  const handleUndo = useCallback(() => {
    setShapes((prev) => {
      if (prev.length === 0) return prev;
      const lastShape = prev[prev.length - 1];
      if (lastShape) {
        if (lastShape.type === 'image') {
          deleteImageFromSupabase(lastShape.src);
        }
        if (lastShape.id) {
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

  // Upload image to Supabase and place on canvas instantly
  const uploadAndAddImage = useCallback(
    (file: File | Blob, x?: number, y?: number) => {
      try {
        const localUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = localUrl;

        img.onload = () => {
          const maxWidth = 500;
          const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
          const width = Math.round((img.naturalWidth || 300) * scale);
          const height = Math.round((img.naturalHeight || 200) * scale);

          const posX = x !== undefined ? x : Math.max(20, Math.round((window.innerWidth - width) / 2));
          const posY = y !== undefined ? y : Math.max(60, Math.round((window.innerHeight - height) / 2));

          const localImageShape: Shape = {
            type: 'image',
            src: localUrl,
            x: posX,
            y: posY,
            width,
            height,
          };

          // 1. Instantly display image on canvas without waiting for network upload
          setShapes((prev) => [...prev, localImageShape]);

          // 2. Upload to Supabase bucket in the background
          setIsUploading(true);
          uploadImageToSupabase(file)
            .then((publicUrl) => {
              const finalSrc = publicUrl || localUrl;

              // Update shape with the permanent Supabase public URL
              setShapes((prev) =>
                prev.map((s) => (s === localImageShape ? { ...s, src: finalSrc } : s))
              );

              // Broadcast to WebSocket room
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: 'chat',
                    roomId: Number(roomId),
                    message: JSON.stringify({
                      ...localImageShape,
                      src: finalSrc,
                    }),
                  })
                );
              }
            })
            .catch((err) => {
              console.error('Background upload error:', err);
            })
            .finally(() => {
              setIsUploading(false);
            });
        };
      } catch (err) {
        console.error('Error creating image preview:', err);
      }
    },
    [roomId, socket]
  );

  // Clipboard paste event listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            await uploadAndAddImage(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadAndAddImage]);

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
          await uploadAndAddImage(file, e.clientX, e.clientY);
        }
      }
    }
  };

  // Erase shapes touched by cursor coordinates
  const eraseAt = useCallback(
    (x: number, y: number) => {
      eraserPosRef.current = { x, y };
      spawnParticles(x, y, 3, false);
      startParticleLoop();

      setShapes((prev) => {
        const toDelete = prev.filter((shape) => isPointNearShape(x, y, shape, 18));
        if (toDelete.length === 0) return prev;

        // Sparkle / dust burst when shapes are rubbed off
        spawnParticles(x, y, 16, true);

        toDelete.forEach((shape) => {
          if (shape.type === 'image') {
            deleteImageFromSupabase(shape.src);
          }
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
    [roomId, socket, spawnParticles, startParticleLoop]
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

  // Mouse down: start drawing, erase, or open text tool
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editingText) {
      commitText();
    }

    if (selectedTool === 'text') {
      setEditingText({ x: e.clientX, y: e.clientY, text: '' });
      return;
    }

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
    if (!isDrawing || !canvasRef.current || selectedTool === 'text') return;

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
    if (!isDrawing || selectedTool === 'text') return;
    setIsDrawing(false);

    if (selectedTool === 'eraser') {
      eraserPosRef.current = null;
      startParticleLoop();
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

  const handleMouseLeave = () => {
    if (selectedTool === 'eraser') {
      eraserPosRef.current = null;
      startParticleLoop();
    }
  };

  const getCursor = () => {
    if (selectedTool === 'text') {
      return 'text';
    }
    if (selectedTool === 'eraser') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='filter:drop-shadow(0 0 1.5px %23000000);'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/%3E%3Cpath d='M22 21H7'/%3E%3Cpath d='m5 11 9 9'/%3E%3C/svg%3E\") 4 20, pointer";
    }
    if (selectedTool === 'pencil') {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='filter:drop-shadow(0 0 1.5px %23000000);'%3E%3Cpath d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/svg%3E\") 2 22, crosshair";
    }
    return 'crosshair';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onUndo={handleUndo}
        canUndo={shapes.length > 0}
        onUploadImage={(file) => uploadAndAddImage(file)}
      />

      {editingText && (
        <textarea
          ref={textareaRef}
          value={editingText.text}
          onChange={(e) => {
            setEditingText({ ...editingText, text: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              commitText();
            }
          }}
          onBlur={commitText}
          placeholder="Type text..."
          rows={Math.max(1, editingText.text.split('\n').length)}
          style={{
            position: 'absolute',
            left: `${editingText.x}px`,
            top: `${editingText.y}px`,
            background: 'rgba(23, 23, 28, 0.85)',
            color: '#ffffff',
            fontFamily: '"Architects Daughter", "Caveat", "Kalam", "Patrick Hand", "Comic Sans MS", cursive, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: 1.35,
            border: '1px dashed #818cf8',
            borderRadius: '6px',
            padding: '4px 8px',
            outline: 'none',
            resize: 'none',
            minWidth: '140px',
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {isUploading && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            backgroundColor: 'rgba(29, 29, 34, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 150,
          }}
        >
          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Uploading image to Supabase...</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        style={{
          backgroundColor: '#121212',
          cursor: getCursor(),
          display: 'block',
        }}
      />
    </div>
  );
}


