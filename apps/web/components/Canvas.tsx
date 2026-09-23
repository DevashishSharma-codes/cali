'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { draw, EraserParticle } from '../lib/draw';
import { FillStyle, Shape, StrokeStyle, Tool } from '../lib/types';
import { deleteShapeApi, getExistingShapes, updateShapeApi } from '../lib/api';
import {
  Bounds,
  calculateNewBounds,
  getCombinedBounds,
  getResizeHandleAt,
  getShapeBounds,
  isPointNearShape,
  isShapeInBox,
  moveShape,
  ResizeHandle,
  resizeShape,
} from '../lib/hitTest';
import { deleteImageFromSupabase, uploadImageToSupabase } from '../lib/supabase';
import { useSocket } from '../hooks/useSocket';
import { Toolbar } from './Toolbar';
import { StyleSidebar } from './StyleSidebar';
import { ZoomControls } from './ZoomControls';
import { Loader2 } from 'lucide-react';

export function Canvas({ roomId }: { roomId: string | number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const shapesRef = useRef<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const pencilPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Selection & Resizing state
  const [selectedShapes, setSelectedShapes] = useState<Shape[]>([]);
  const selectedShapesRef = useRef<Shape[]>([]);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const dragStartWorldPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const resizingStateRef = useRef<{
    handle: ResizeHandle;
    origBounds: Bounds;
    origShapes: Shape[];
    startMouse: { x: number; y: number };
  } | null>(null);
  const [hoverHandleCursor, setHoverHandleCursor] = useState<string | null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Viewport / Camera Pan and Zoom state
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const panRef = useRef<{ panX: number; panY: number; zoom: number }>({ panX: 0, panY: 0, zoom: 1 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number }>({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Keep references synchronized for animation/event callbacks
  useEffect(() => {
    panRef.current = { panX, panY, zoom };
  }, [panX, panY, zoom]);

  useEffect(() => {
    selectedShapesRef.current = selectedShapes;
  }, [selectedShapes]);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  // Style attributes state
  const [strokeColor, setStrokeColor] = useState<string>('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [fillStyle, setFillStyle] = useState<FillStyle>('hachure');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('solid');
  const [roughness, setRoughness] = useState<number>(1.2);
  const [opacity, setOpacity] = useState<number>(100);
  const [canvasBackground, setCanvasBackground] = useState<string>('#121212');

  // Text tool inline editing
  const [editingText, setEditingText] = useState<{ x: number; y: number; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Eraser rubbing effect & particles
  const particlesRef = useRef<EraserParticle[]>([]);
  const eraserPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const { socket, loading } = useSocket();

  // Screen-to-World and World-to-Screen coordinate transformation
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - panX) / zoom,
        y: (screenY - panY) / zoom,
      };
    },
    [panX, panY, zoom]
  );

  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      return {
        x: worldX * zoom + panX,
        y: worldY * zoom + panY,
      };
    },
    [panX, panY, zoom]
  );

  // Batch style updater for selected shapes + default draw style
  const updateStyleProperty = useCallback(
    (prop: string, value: any) => {
      if (prop === 'strokeColor') setStrokeColor(value);
      if (prop === 'backgroundColor') setBackgroundColor(value);
      if (prop === 'fillStyle') setFillStyle(value);
      if (prop === 'strokeWidth') setStrokeWidth(value);
      if (prop === 'strokeStyle') setStrokeStyle(value);
      if (prop === 'roughness') setRoughness(value);
      if (prop === 'opacity') setOpacity(value);

      if (selectedShapesRef.current.length > 0) {
        const selectedIds = new Set(selectedShapesRef.current.map((s) => s.id ?? s));
        setShapes((prev) => {
          const updated = prev.map((s) => {
            const isSelected = selectedIds.has(s.id ?? s) || selectedShapesRef.current.includes(s);
            if (isSelected) {
              const updatedShape = { ...s, [prop]: value };
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: 'chat',
                    roomId: Number(roomId),
                    message: JSON.stringify(updatedShape),
                  })
                );
              }
              return updatedShape;
            }
            return s;
          });
          return updated;
        });

        setSelectedShapes((curr) =>
          curr.map((s) => ({
            ...s,
            [prop]: value,
          }))
        );
      }
    },
    [roomId, socket]
  );

  // Zoom control actions
  const handleZoomIn = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setZoom((prevZoom) => {
      const newZoom = Math.min(5.0, prevZoom * 1.15);
      const mouseWorldX = (centerX - panRef.current.panX) / prevZoom;
      const mouseWorldY = (centerY - panRef.current.panY) / prevZoom;
      setPanX(centerX - mouseWorldX * newZoom);
      setPanY(centerY - mouseWorldY * newZoom);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setZoom((prevZoom) => {
      const newZoom = Math.max(0.1, prevZoom / 1.15);
      const mouseWorldX = (centerX - panRef.current.panX) / prevZoom;
      const mouseWorldY = (centerY - panRef.current.panY) / prevZoom;
      setPanX(centerX - mouseWorldX * newZoom);
      setPanY(centerY - mouseWorldY * newZoom);
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  // Load canvas background preference from localStorage
  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('excali_canvas_bg');
      if (savedBg) setCanvasBackground(savedBg);
    } catch (e) {}
  }, []);

  const handleSetCanvasBackground = useCallback((color: string) => {
    setCanvasBackground(color);
    try {
      localStorage.setItem('excali_canvas_bg', color);
    } catch (e) {}
  }, []);

  // Delete selected shapes (Backspace / Delete key)
  const deleteSelectedShapes = useCallback(() => {
    if (selectedShapesRef.current.length === 0) return;

    const toDelete = [...selectedShapesRef.current];
    setSelectedShapes([]);

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

    setShapes((prev) => prev.filter((s) => !toDelete.includes(s)));
  }, [roomId, socket]);

  // Keyboard events: Tool shortcuts, Spacebar pan, Zoom, and Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteSelectedShapes();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'v' || key === '1') setSelectedTool('select');
        else if (key === 'h' || key === '2') setSelectedTool('hand');
        else if (key === 'p' || key === '3') setSelectedTool('pencil');
        else if (key === 'r' || key === '4') setSelectedTool('rect');
        else if (key === 'c' || key === '5') setSelectedTool('circle');
        else if (key === 'd' || key === '6') setSelectedTool('diamond');
        else if (key === 'l' || key === '7') setSelectedTool('line');
        else if (key === 'a' || key === '8') setSelectedTool('arrow');
        else if (key === 't' || key === '9') setSelectedTool('text');
        else if (key === 'e' || key === '0') setSelectedTool('eraser');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [deleteSelectedShapes, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Non-passive wheel event listener for 2-finger trackpad swipe, mouse scroll pan, and pinch zoom
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom or Ctrl+Wheel centered around cursor
        const zoomDelta = -e.deltaY * 0.005;
        setZoom((prevZoom) => {
          const newZoom = Math.min(5.0, Math.max(0.1, prevZoom * (1 + zoomDelta)));
          const { panX: currentPanX, panY: currentPanY } = panRef.current;
          const mouseWorldX = (e.clientX - currentPanX) / prevZoom;
          const mouseWorldY = (e.clientY - currentPanY) / prevZoom;
          const newPanX = e.clientX - mouseWorldX * newZoom;
          const newPanY = e.clientY - mouseWorldY * newZoom;
          setPanX(newPanX);
          setPanY(newPanY);
          return newZoom;
        });
      } else {
        // Infinite 2-finger trackpad swipe or mouse wheel pan
        setPanX((prev) => prev - e.deltaX);
        setPanY((prev) => prev - e.deltaY);
      }
    };

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Focus textarea when text editing starts
  useEffect(() => {
    if (editingText && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingText]);

  // Commit typed text as a new TextShape in world coordinates
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
        strokeColor,
        opacity,
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
  }, [editingText, roomId, socket, strokeColor, opacity]);

  // Double click anywhere on canvas to create/type text
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'hand' || isSpacePressed) return;
    if (editingText) {
      commitText();
    }
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setEditingText({ x: worldPos.x, y: worldPos.y, text: '' });
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
        particles,
        canvasBackground,
        panRef.current.panX,
        panRef.current.panY,
        panRef.current.zoom,
        selectedShapesRef.current,
        marqueeBox
      );

      if (particles.length > 0 || eraserPosRef.current !== null) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [canvasBackground, marqueeBox]);

  const spawnParticles = useCallback((worldX: number, worldY: number, count = 4, burst = false) => {
    const colors = [
      'rgba(255, 255, 255, OPACITY)',
      'rgba(248, 250, 252, OPACITY)',
      'rgba(241, 245, 249, OPACITY)',
      'rgba(226, 232, 240, OPACITY)',
      'rgba(203, 213, 225, OPACITY)',
    ];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 3.5 + 1.5 : Math.random() * 1.5 + 0.5;
      particlesRef.current.push({
        x: worldX + (Math.random() - 0.5) * 14,
        y: worldY + (Math.random() - 0.5) * 14,
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
            setShapes((prev) => {
              const existingIdx = prev.findIndex((s) => s.id && s.id === newShape.id);
              if (existingIdx !== -1) {
                const next = [...prev];
                next[existingIdx] = newShape;
                return next;
              }
              return [...prev, newShape];
            });
          } else if (data.type === 'update_shape') {
            const updatedShape = JSON.parse(data.message);
            const updatedId = Number(data.shapeId);
            setShapes((prev) =>
              prev.map((s) => (s.id === updatedId ? { ...updatedShape, id: updatedId } : s))
            );
            setSelectedShapes((prev) =>
              prev.map((s) => (s.id === updatedId ? { ...updatedShape, id: updatedId } : s))
            );
          } else if (data.type === 'delete_shape') {
            const deletedId = Number(data.shapeId);
            setShapes((prev) => prev.filter((s) => s.id !== deletedId));
            setSelectedShapes((prev) => prev.filter((s) => s.id !== deletedId));
          }
        } catch (e) {}
      };
    }
  }, [socket, loading, roomId]);

  // 3. Set canvas dimensions and redraw whenever shapes, pan, zoom, selection, or marquee changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      draw(
        canvasRef.current,
        shapes,
        undefined,
        undefined,
        undefined,
        canvasBackground,
        panX,
        panY,
        zoom,
        selectedShapes,
        marqueeBox
      );
    }
  }, [shapes, canvasBackground, panX, panY, zoom, selectedShapes, marqueeBox]);

  // Redraw when custom sketchy web fonts finish loading
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          draw(
            canvasRef.current,
            shapesRef.current,
            undefined,
            undefined,
            undefined,
            canvasBackground,
            panRef.current.panX,
            panRef.current.panY,
            panRef.current.zoom,
            selectedShapesRef.current,
            marqueeBox
          );
        }
      });
    }
  }, [canvasBackground, marqueeBox]);

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
    setSelectedShapes([]);
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

  // Upload image to Supabase and place on canvas at world coordinates
  const uploadAndAddImage = useCallback(
    (file: File | Blob, screenX?: number, screenY?: number) => {
      try {
        const localUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = localUrl;

        img.onload = () => {
          const maxWidth = 500;
          const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
          const width = Math.round((img.naturalWidth || 300) * scale);
          const height = Math.round((img.naturalHeight || 200) * scale);

          const targetScreenX = screenX !== undefined ? screenX : Math.max(20, Math.round((window.innerWidth - width) / 2));
          const targetScreenY = screenY !== undefined ? screenY : Math.max(60, Math.round((window.innerHeight - height) / 2));
          const worldPos = screenToWorld(targetScreenX, targetScreenY);

          const localImageShape: Shape = {
            type: 'image',
            src: localUrl,
            x: worldPos.x,
            y: worldPos.y,
            width,
            height,
            opacity,
          };

          // 1. Instantly display image on canvas
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
    [roomId, socket, opacity, screenToWorld]
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

  // Erase shapes touched by world coordinates
  const eraseAt = useCallback(
    (worldX: number, worldY: number) => {
      eraserPosRef.current = { x: worldX, y: worldY };
      spawnParticles(worldX, worldY, 3, false);
      startParticleLoop();

      setShapes((prev) => {
        const toDelete = prev.filter((shape) => isPointNearShape(worldX, worldY, shape, 18 / zoom));
        if (toDelete.length === 0) return prev;

        // Sparkle / dust burst when shapes are rubbed off
        spawnParticles(worldX, worldY, 16, true);

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

        setSelectedShapes((curr) => curr.filter((s) => !toDelete.includes(s)));
        return prev.filter((shape) => !toDelete.includes(shape));
      });
    },
    [roomId, socket, spawnParticles, startParticleLoop, zoom]
  );

  // Helper to construct a shape object from world coordinates and current styles
  const createShape = (tool: Tool, x1: number, y1: number, x2: number, y2: number): Shape => {
    const commonStyle = {
      strokeColor,
      backgroundColor,
      fillStyle,
      strokeWidth,
      strokeStyle,
      roughness,
      opacity,
    };

    if (tool === 'pencil') {
      return {
        type: 'pencil',
        points: pencilPointsRef.current,
        ...commonStyle,
      };
    } else if (tool === 'rect') {
      return {
        type: 'rect',
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
        ...commonStyle,
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
        ...commonStyle,
      };
    } else if (tool === 'diamond') {
      return {
        type: 'diamond',
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
        ...commonStyle,
      };
    } else if (tool === 'line') {
      return {
        type: 'line',
        startX: x1,
        startY: y1,
        endX: x2,
        endY: y2,
        ...commonStyle,
      };
    } else {
      return {
        type: 'arrow',
        startX: x1,
        startY: y1,
        endX: x2,
        endY: y2,
        ...commonStyle,
      };
    }
  };

  // Mouse down: handle panning, selection handle resize, dragging selection, drawing, erasing, or text tool
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpacePressed || selectedTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPanX: panX,
        startPanY: panY,
      };
      return;
    }

    if (editingText) {
      commitText();
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // SELECTION & RESIZING TOOL HANDLING
    if (selectedTool === 'select') {
      // 1. Check if clicking on a resize handle of currently selected shape(s)
      if (selectedShapes.length > 0) {
        const activeBounds =
          selectedShapes.length === 1
            ? getShapeBounds(selectedShapes[0]!)
            : getCombinedBounds(selectedShapes);
        const isSingleLine =
          selectedShapes.length === 1 &&
          (selectedShapes[0]!.type === 'line' || selectedShapes[0]!.type === 'arrow');

        const handleHit = getResizeHandleAt(
          worldPos.x,
          worldPos.y,
          activeBounds,
          zoom,
          isSingleLine,
          selectedShapes[0]
        );

        if (handleHit) {
          setIsResizing(true);
          resizingStateRef.current = {
            handle: handleHit.handle,
            origBounds: activeBounds,
            origShapes: selectedShapes.map((s) => JSON.parse(JSON.stringify(s))),
            startMouse: worldPos,
          };
          return;
        }
      }

      // 2. Find top-most shape under cursor (iterating from newest to oldest)
      const hitShape = [...shapes].reverse().find((s) => isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));

      if (hitShape) {
        const isAlreadySelected = selectedShapes.includes(hitShape);
        if (e.shiftKey) {
          // Toggle selection
          setSelectedShapes((prev) =>
            isAlreadySelected ? prev.filter((s) => s !== hitShape) : [...prev, hitShape]
          );
        } else if (!isAlreadySelected) {
          // Select clicked shape exclusively and load its style into the sidebar
          setSelectedShapes([hitShape]);
          if (hitShape.strokeColor) setStrokeColor(hitShape.strokeColor);
          if (hitShape.backgroundColor !== undefined) setBackgroundColor(hitShape.backgroundColor);
          if (hitShape.fillStyle) setFillStyle(hitShape.fillStyle);
          if (hitShape.strokeWidth) setStrokeWidth(hitShape.strokeWidth);
          if (hitShape.strokeStyle) setStrokeStyle(hitShape.strokeStyle);
          if (hitShape.roughness !== undefined) setRoughness(hitShape.roughness);
          if (hitShape.opacity !== undefined) setOpacity(hitShape.opacity);
        }

        // Start dragging selection group
        setIsDraggingSelection(true);
        dragStartWorldPos.current = worldPos;
      } else {
        // Clicked on empty space: clear selection unless Shift is held
        if (!e.shiftKey) {
          setSelectedShapes([]);
        }
        // Start marquee selection drag
        setMarqueeBox({
          startX: worldPos.x,
          startY: worldPos.y,
          currentX: worldPos.x,
          currentY: worldPos.y,
        });
      }
      return;
    }

    if (selectedTool === 'text') {
      setEditingText({ x: worldPos.x, y: worldPos.y, text: '' });
      return;
    }

    setIsDrawing(true);
    setStartX(worldPos.x);
    setStartY(worldPos.y);

    if (selectedTool === 'eraser') {
      eraseAt(worldPos.x, worldPos.y);
    } else if (selectedTool === 'pencil') {
      pencilPointsRef.current = [worldPos];
      if (canvasRef.current) {
        draw(
          canvasRef.current,
          [
            ...shapes,
            {
              type: 'pencil',
              points: pencilPointsRef.current,
              strokeColor,
              strokeWidth,
              roughness,
              opacity,
              strokeStyle,
            },
          ],
          undefined,
          undefined,
          undefined,
          canvasBackground,
          panX,
          panY,
          zoom,
          selectedShapes,
          marqueeBox
        );
      }
    }
  };

  // Mouse move: handle viewport panning, resizing shapes, dragging selected shapes, marquee selection, drawing preview, or erasing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.startX;
      const dy = e.clientY - panStartRef.current.startY;
      setPanX(panStartRef.current.startPanX + dx);
      setPanY(panStartRef.current.startPanY + dy);
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // SELECTION & RESIZING INTERACTIONS
    if (selectedTool === 'select') {
      // 1. Resizing active shapes
      if (isResizing && resizingStateRef.current) {
        const { handle, origBounds, origShapes } = resizingStateRef.current;
        const newBounds = calculateNewBounds(
          origBounds,
          handle,
          worldPos.x,
          worldPos.y,
          e.shiftKey
        );

        const updatedSelected = selectedShapes.map((s, idx) => {
          const origS = origShapes[idx] || s;
          return resizeShape(s, origS, origBounds, newBounds, handle, worldPos.x, worldPos.y);
        });

        const nextShapes = shapes.map((s) => {
          const selIdx = selectedShapes.findIndex((sel) => (sel.id && sel.id === s.id) || sel === s);
          if (selIdx !== -1 && updatedSelected[selIdx]) {
            return updatedSelected[selIdx]!;
          }
          return s;
        });

        setShapes(nextShapes);
        setSelectedShapes(updatedSelected);

        if (canvasRef.current) {
          draw(
            canvasRef.current,
            nextShapes,
            undefined,
            undefined,
            undefined,
            canvasBackground,
            panX,
            panY,
            zoom,
            updatedSelected,
            marqueeBox
          );
        }
        return;
      }

      // 2. Dragging selected shapes
      if (isDraggingSelection && selectedShapes.length > 0) {
        const dx = worldPos.x - dragStartWorldPos.current.x;
        const dy = worldPos.y - dragStartWorldPos.current.y;
        dragStartWorldPos.current = worldPos;

        const selectedSet = new Set(selectedShapes);
        const nextShapes = shapes.map((s) => (selectedSet.has(s) ? moveShape(s, dx, dy) : s));
        const nextSelected = selectedShapes.map((s) => moveShape(s, dx, dy));

        setShapes(nextShapes);
        setSelectedShapes(nextSelected);

        if (canvasRef.current) {
          draw(
            canvasRef.current,
            nextShapes,
            undefined,
            undefined,
            undefined,
            canvasBackground,
            panX,
            panY,
            zoom,
            nextSelected,
            marqueeBox
          );
        }
        return;
      }

      // 3. Marquee selection
      if (marqueeBox) {
        const currentMarquee = {
          ...marqueeBox,
          currentX: worldPos.x,
          currentY: worldPos.y,
        };
        setMarqueeBox(currentMarquee);

        const box = {
          minX: Math.min(currentMarquee.startX, currentMarquee.currentX),
          minY: Math.min(currentMarquee.startY, currentMarquee.currentY),
          maxX: Math.max(currentMarquee.startX, currentMarquee.currentX),
          maxY: Math.max(currentMarquee.startY, currentMarquee.currentY),
        };

        const enclosed = shapes.filter((s) => isShapeInBox(s, box));
        setSelectedShapes(enclosed);
        return;
      }

      // 4. Hover handle cursor detection when idle
      if (selectedShapes.length > 0) {
        const activeBounds =
          selectedShapes.length === 1
            ? getShapeBounds(selectedShapes[0]!)
            : getCombinedBounds(selectedShapes);
        const isSingleLine =
          selectedShapes.length === 1 &&
          (selectedShapes[0]!.type === 'line' || selectedShapes[0]!.type === 'arrow');
        const handleHit = getResizeHandleAt(
          worldPos.x,
          worldPos.y,
          activeBounds,
          zoom,
          isSingleLine,
          selectedShapes[0]
        );
        setHoverHandleCursor(handleHit ? handleHit.cursor : null);
      } else {
        setHoverHandleCursor(null);
      }
      return;
    }

    if (!isDrawing || !canvasRef.current || selectedTool === 'text') return;

    if (selectedTool === 'eraser') {
      eraseAt(worldPos.x, worldPos.y);
    } else if (selectedTool === 'pencil') {
      pencilPointsRef.current.push(worldPos);
      const previewShape: Shape = {
        type: 'pencil',
        points: [...pencilPointsRef.current],
        strokeColor,
        strokeWidth,
        roughness,
        opacity,
        strokeStyle,
      };
      draw(
        canvasRef.current,
        [...shapes, previewShape],
        undefined,
        undefined,
        undefined,
        canvasBackground,
        panX,
        panY,
        zoom,
        selectedShapes,
        marqueeBox
      );
    } else {
      const previewShape = createShape(selectedTool, startX, startY, worldPos.x, worldPos.y);
      draw(
        canvasRef.current,
        [...shapes, previewShape],
        undefined,
        undefined,
        undefined,
        canvasBackground,
        panX,
        panY,
        zoom,
        selectedShapes,
        marqueeBox
      );
    }
  };

  // Mouse up: finalize shape, finalize resize/drag, stop panning, or end marquee
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (selectedTool === 'select') {
      if (isResizing) {
        setIsResizing(false);
        resizingStateRef.current = null;
        // Sync resized shapes to backend and peers
        if (selectedShapes.length > 0) {
          selectedShapes.forEach((shape) => {
            if (shape.id) {
              updateShapeApi(shape.id, shape);
            }
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: shape.id ? 'update_shape' : 'chat',
                  roomId: Number(roomId),
                  shapeId: shape.id,
                  message: JSON.stringify(shape),
                })
              );
            }
          });
        }
      }

      if (isDraggingSelection) {
        setIsDraggingSelection(false);
        // Sync moved shapes to backend and peers
        if (selectedShapes.length > 0) {
          selectedShapes.forEach((shape) => {
            if (shape.id) {
              updateShapeApi(shape.id, shape);
            }
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: shape.id ? 'update_shape' : 'chat',
                  roomId: Number(roomId),
                  shapeId: shape.id,
                  message: JSON.stringify(shape),
                })
              );
            }
          });
        }
      }

      if (marqueeBox) {
        setMarqueeBox(null);
      }
      return;
    }

    if (!isDrawing || selectedTool === 'text') return;
    setIsDrawing(false);

    if (selectedTool === 'eraser') {
      eraserPosRef.current = null;
      startParticleLoop();
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    let newShape: Shape;
    if (selectedTool === 'pencil') {
      newShape = {
        type: 'pencil',
        points: [...pencilPointsRef.current],
        strokeColor,
        strokeWidth,
        roughness,
        opacity,
        strokeStyle,
      };
      pencilPointsRef.current = [];
    } else {
      newShape = createShape(selectedTool, startX, startY, worldPos.x, worldPos.y);
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
    if (isPanning) {
      setIsPanning(false);
    }
    if (isResizing) {
      setIsResizing(false);
      resizingStateRef.current = null;
    }
    if (isDraggingSelection) {
      setIsDraggingSelection(false);
    }
    if (marqueeBox) {
      setMarqueeBox(null);
    }
    setHoverHandleCursor(null);
    if (selectedTool === 'eraser') {
      eraserPosRef.current = null;
      startParticleLoop();
    }
  };

  const getCursor = () => {
    if (isPanning) {
      return 'grabbing';
    }
    if (isSpacePressed || selectedTool === 'hand') {
      return 'grab';
    }
    if (selectedTool === 'select') {
      if (isResizing && hoverHandleCursor) {
        return hoverHandleCursor;
      }
      if (hoverHandleCursor) {
        return hoverHandleCursor;
      }
      return isDraggingSelection ? 'grabbing' : 'default';
    }
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

  const textScreenPos = editingText ? worldToScreen(editingText.x, editingText.y) : null;

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: canvasBackground,
      }}
    >
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onUndo={handleUndo}
        canUndo={shapes.length > 0}
        onUploadImage={(file) => uploadAndAddImage(file)}
      />

      <StyleSidebar
        strokeColor={strokeColor}
        setStrokeColor={(c) => updateStyleProperty('strokeColor', c)}
        backgroundColor={backgroundColor}
        setBackgroundColor={(c) => updateStyleProperty('backgroundColor', c)}
        fillStyle={fillStyle}
        setFillStyle={(f) => updateStyleProperty('fillStyle', f)}
        strokeWidth={strokeWidth}
        setStrokeWidth={(w) => updateStyleProperty('strokeWidth', w)}
        strokeStyle={strokeStyle}
        setStrokeStyle={(s) => updateStyleProperty('strokeStyle', s)}
        roughness={roughness}
        setRoughness={(r) => updateStyleProperty('roughness', r)}
        opacity={opacity}
        setOpacity={(o) => updateStyleProperty('opacity', o)}
        canvasBackground={canvasBackground}
        setCanvasBackground={handleSetCanvasBackground}
      />

      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      {/* Pencil Brand & Room Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'rgba(24, 24, 30, 0.76)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '12px',
          boxShadow:
            '0 16px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#cae39f',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '-0.01em',
          }}
        >
          <img src="/favicon.svg" alt="Pencil Logo" style={{ width: '18px', height: '18px' }} />
          <span>Pencil</span>
        </div>
        <div
          style={{
            width: '1px',
            height: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.55)',
          }}
        >
          Room {roomId}
        </span>
      </div>

      {editingText && textScreenPos && (
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
            left: `${textScreenPos.x}px`,
            top: `${textScreenPos.y}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            background: 'rgba(23, 23, 28, 0.85)',
            color: strokeColor || '#ffffff',
            fontFamily: '"Architects Daughter", "Caveat", "Kalam", "Patrick Hand", "Comic Sans MS", cursive, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: 1.35,
            border: '1px dashed #cae39f',
            borderRadius: '6px',
            padding: '4px 8px',
            outline: 'none',
            resize: 'none',
            minWidth: '140px',
            zIndex: 200,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            opacity: opacity / 100,
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
            border: '1px solid rgba(202, 227, 159, 0.4)',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 150,
          }}
        >
          <Loader2 size={16} className="animate-spin" style={{ color: '#cae39f', animation: 'spin 1s linear infinite' }} />
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
          backgroundColor: canvasBackground,
          cursor: getCursor(),
          display: 'block',
        }}
      />
    </div>
  );
}
