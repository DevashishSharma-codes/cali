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
  isPointInsideBounds,
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
import { EntityLibraryModal } from './EntityLibraryModal';
import { ExportModal } from './ExportModal';
import { LibraryEntity } from '../lib/entityLibrary';
import { Loader2, Home, Paintbrush } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const generateClientId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function Canvas({ roomId }: { roomId: string | number }) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const shapesRef = useRef<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const pencilPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Selection & Resizing state
  const [selectedShapes, setSelectedShapes] = useState<Shape[]>([]);
  const selectedShapesRef = useRef<Shape[]>([]);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [isHoveringSelection, setIsHoveringSelection] = useState(false);
  const draggingStateRef = useRef<{
    origSelected: Shape[];
    origShapes: Shape[];
    selectedIndices: number[];
    startMouse: { x: number; y: number };
    hasMoved?: boolean;
  } | null>(null);

  // In-memory session client ID & throttle timer for live multiplayer streaming
  const sessionClientIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? 'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
      : 'client_init'
  );
  const lastWsDragTimeRef = useRef<number>(0);

  const [isResizing, setIsResizing] = useState(false);
  const resizingStateRef = useRef<{
    handle: ResizeHandle;
    origBounds: Bounds;
    origShapes: Shape[];
    origAllShapes: Shape[];
    selectedIndices: number[];
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
  const [editingText, setEditingText] = useState<{
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    id?: number;
    clientId?: string;
    isEditingExisting?: boolean;
  } | null>(null);
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
        const selectedIds = new Set(selectedShapesRef.current.map((s) => s.id).filter(Boolean));
        const selectedClientIds = new Set(selectedShapesRef.current.map((s) => s.clientId).filter(Boolean));
        const now = Date.now();

        setShapes((prev) => {
          const updated = prev.map((s) => {
            const isSelected =
              (s.id && selectedIds.has(s.id)) ||
              (s.clientId && selectedClientIds.has(s.clientId)) ||
              selectedShapesRef.current.includes(s);

            if (isSelected) {
              const updatedShape: Shape = {
                ...s,
                [prop]: value,
                updatedAt: now,
                version: (s.version || 0) + 1,
              };
              if (updatedShape.id) {
                updateShapeApi(updatedShape.id, updatedShape);
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      type: 'update_shape',
                      roomId: Number(roomId),
                      shapeId: updatedShape.id,
                      senderId: sessionClientIdRef.current,
                      message: JSON.stringify(updatedShape),
                    })
                  );
                }
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
            updatedAt: now,
            version: (s.version || 0) + 1,
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
    } catch (e) { }
  }, []);

  const handleSetCanvasBackground = useCallback((color: string) => {
    setCanvasBackground(color);
    try {
      localStorage.setItem('excali_canvas_bg', color);
    } catch (e) { }
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
      const shapeId = shape.id;
      if (shapeId) {
        deleteShapeApi(shapeId);
        if (socket) {
          socket.send(
            JSON.stringify({
              type: 'delete_shape',
              roomId: Number(roomId),
              shapeId,
              senderId: sessionClientIdRef.current,
            })
          );
        }
      }
    });

    const toDeleteIds = new Set(toDelete.map((s) => s.id).filter(Boolean));
    const toDeleteClientIds = new Set(toDelete.map((s) => s.clientId).filter(Boolean));

    setShapes((prev) =>
      prev.filter((s) => {
        if (s.id && toDeleteIds.has(s.id)) return false;
        if (s.clientId && toDeleteClientIds.has(s.clientId)) return false;
        return !toDelete.includes(s);
      })
    );
  }, [roomId, socket]);

  // Nudge selected shapes using Arrow Keys (2px normal, 10px with Shift)
  const nudgeSelectedShapes = useCallback(
    (dx: number, dy: number) => {
      if (selectedShapesRef.current.length === 0) return;

      const selectedIds = new Set(selectedShapesRef.current.map((s) => s.id).filter(Boolean));
      const selectedClientIds = new Set(selectedShapesRef.current.map((s) => s.clientId).filter(Boolean));
      const now = Date.now();
      const movedSelected = selectedShapesRef.current.map((s) => ({
        ...moveShape(s, dx, dy),
        updatedAt: now,
        version: (s.version || 0) + 1,
      }));

      setShapes((prev) => {
        const next = prev.map((s) => {
          const isSel =
            (s.id && selectedIds.has(s.id)) ||
            (s.clientId && selectedClientIds.has(s.clientId)) ||
            selectedShapesRef.current.includes(s);

          if (isSel) {
            const idx = selectedShapesRef.current.findIndex(
              (sel) => (sel.id && sel.id === s.id) || (sel.clientId && sel.clientId === s.clientId) || sel === s
            );
            return idx !== -1 && movedSelected[idx]
              ? movedSelected[idx]!
              : { ...moveShape(s, dx, dy), updatedAt: now, version: (s.version || 0) + 1 };
          }
          return s;
        });
        return next;
      });

      setSelectedShapes(movedSelected);

      // Sync moved shapes to DB and WebSocket peers
      movedSelected.forEach((shape) => {
        const currentShape = shapesRef.current.find(
          (s) => (shape.id && s.id === shape.id) || (shape.clientId && s.clientId === shape.clientId)
        );
        const shapeId = shape.id || currentShape?.id;
        if (shapeId) {
          updateShapeApi(shapeId, shape);
          if (socket) {
            socket.send(
              JSON.stringify({
                type: 'update_shape',
                roomId: Number(roomId),
                shapeId,
                senderId: sessionClientIdRef.current,
                message: JSON.stringify({ ...shape, id: shapeId }),
              })
            );
          }
        }
      });
    },
    [roomId, socket]
  );

  // Keyboard events: Tool shortcuts, Spacebar pan, Zoom, Delete, Arrow Nudge, and Escape Deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      if (e.key === 'Escape') {
        setIsExportOpen(false);
        setIsLibraryOpen(false);
        if (selectedShapesRef.current.length > 0) {
          setSelectedShapes([]);
        }
        return;
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (selectedShapesRef.current.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          nudgeSelectedShapes(dx, dy);
          return;
        }
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteSelectedShapes();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLibraryOpen((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
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
  }, [deleteSelectedShapes, handleZoomIn, handleZoomOut, handleResetZoom, nudgeSelectedShapes]);

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

  // Commit typed text (creates a new text shape or updates existing text shape)
  const commitText = useCallback(() => {
    if (!editingText) return;
    const trimmed = editingText.text.trim();

    if (editingText.isEditingExisting) {
      const existingId = editingText.id;
      const existingClientId = editingText.clientId;
      const now = Date.now();

      if (trimmed.length > 0) {
        // Update existing text shape in place
        setShapes((prev) =>
          prev.map((s) => {
            const isMatch =
              (existingId && s.id === existingId) ||
              (existingClientId && s.clientId === existingClientId);
            if (isMatch && s.type === 'text') {
              const updated: Shape = {
                ...s,
                text: trimmed,
                fontSize: editingText.fontSize || s.fontSize || 24,
                updatedAt: now,
                version: (s.version || 0) + 1,
              };
              if (updated.id) {
                updateShapeApi(updated.id, updated);
                if (socket) {
                  socket.send(
                    JSON.stringify({
                      type: 'update_shape',
                      roomId: Number(roomId),
                      shapeId: updated.id,
                      senderId: sessionClientIdRef.current,
                      message: JSON.stringify(updated),
                    })
                  );
                }
              }
              return updated;
            }
            return s;
          })
        );
      } else {
        // If text was cleared to empty, delete the shape
        if (existingId) {
          deleteShapeApi(existingId);
          if (socket) {
            socket.send(
              JSON.stringify({
                type: 'delete_shape',
                roomId: Number(roomId),
                shapeId: existingId,
                senderId: sessionClientIdRef.current,
              })
            );
          }
        }
        setShapes((prev) =>
          prev.filter((s) => {
            if (existingId && s.id === existingId) return false;
            if (existingClientId && s.clientId === existingClientId) return false;
            return true;
          })
        );
      }
    } else if (trimmed.length > 0) {
      // Create new text shape
      const clientId = generateClientId();
      const now = Date.now();
      const newTextShape: Shape = {
        type: 'text',
        text: trimmed,
        x: editingText.x,
        y: editingText.y,
        fontSize: editingText.fontSize || 24,
        strokeColor,
        opacity,
        clientId,
        updatedAt: now,
        version: 1,
      };
      setShapes((prev) => [...prev, newTextShape]);

      if (socket) {
        socket.send(
          JSON.stringify({
            type: 'chat',
            roomId: Number(roomId),
            senderId: sessionClientIdRef.current,
            message: JSON.stringify(newTextShape),
          })
        );
      }
    }

    setEditingText(null);
    setSelectedTool('select');
  }, [editingText, roomId, socket, strokeColor, opacity]);

  // Double click anywhere on canvas to edit existing text or create new text
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'hand' || isSpacePressed) return;
    if (editingText) {
      commitText();
    }
    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Check if double-clicked on an existing text shape
    const hitTextShape = [...shapes]
      .reverse()
      .find((s) => s.type === 'text' && isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));

    if (hitTextShape && hitTextShape.type === 'text') {
      setEditingText({
        x: hitTextShape.x,
        y: hitTextShape.y,
        text: hitTextShape.text,
        fontSize: hitTextShape.fontSize || 24,
        id: hitTextShape.id,
        clientId: hitTextShape.clientId,
        isEditingExisting: true,
      });
      setSelectedShapes([]);
    } else {
      setEditingText({
        x: worldPos.x,
        y: worldPos.y,
        text: '',
        fontSize: 24,
        isEditingExisting: false,
      });
    }
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
    if (!roomId) return;
    getExistingShapes(roomId).then((data) => {
      setShapes(data);
    });
  }, [roomId]);

  // 2. Join WebSocket room & receive live shapes and deletions
  useEffect(() => {
    if (!roomId || loading || !socket) return;
    socket.send(
      JSON.stringify({
        type: 'join_room',
        roomId: Number(roomId),
      })
    );

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 1. Drop self-echoes from this session (except chat where we only map DB id)
          if (data.senderId && data.senderId === sessionClientIdRef.current && data.type !== 'chat') {
            return;
          }

          if (data.type === 'peer_drag') {
            if (data.senderId === sessionClientIdRef.current) return;
            const draggedUpdates = data.shapes as Partial<Shape>[];
            if (!Array.isArray(draggedUpdates) || draggedUpdates.length === 0) return;

            const updatedMap = new Map<number | string, Partial<Shape>>();
            draggedUpdates.forEach((u) => {
              if (u.id) updatedMap.set(u.id, u);
              if (u.clientId) updatedMap.set(u.clientId, u);
            });

            setShapes((prev) =>
              prev.map((s) => {
                // If the local user is currently dragging this shape, keep local drag position
                if (
                  isDraggingSelection &&
                  selectedShapesRef.current.some(
                    (sel) => (sel.id && sel.id === s.id) || (sel.clientId && sel.clientId === s.clientId)
                  )
                ) {
                  return s;
                }
                const match = (s.id && updatedMap.get(s.id)) || (s.clientId && updatedMap.get(s.clientId));
                if (match) {
                  return { ...s, ...match } as Shape;
                }
                return s;
              })
            );
          } else if (data.type === 'chat') {
            const newShape: Shape = JSON.parse(data.message);
            const dbId = data.id ? Number(data.id) : newShape.id;

            if (data.senderId === sessionClientIdRef.current) {
              // Self echo for newly created shape: only assign the database ID without resetting coordinates
              if (dbId) {
                setShapes((prev) =>
                  prev.map((s) => {
                    if (newShape.clientId && s.clientId === newShape.clientId) {
                      return { ...s, id: dbId };
                    }
                    return s;
                  })
                );
                setSelectedShapes((prev) =>
                  prev.map((s) => {
                    if (newShape.clientId && s.clientId === newShape.clientId) {
                      return { ...s, id: dbId };
                    }
                    return s;
                  })
                );
              }
              return;
            }

            // Remote shape from a peer
            if (dbId) {
              newShape.id = dbId;
            }

            setShapes((prev) => {
              // 1. Check if shape already exists by DB id
              if (dbId) {
                const idxById = prev.findIndex((s) => s.id === dbId);
                if (idxById !== -1) {
                  const next = [...prev];
                  next[idxById] = { ...next[idxById], ...newShape, id: dbId };
                  return next;
                }
              }

              // 2. Check if shape already exists by clientId
              if (newShape.clientId) {
                const idxByClient = prev.findIndex((s) => s.clientId === newShape.clientId);
                if (idxByClient !== -1) {
                  const next = [...prev];
                  next[idxByClient] = { ...next[idxByClient], ...newShape, id: dbId ?? next[idxByClient]?.id };
                  return next;
                }
              }

              return [...prev, newShape];
            });
          } else if (data.type === 'update_shape') {
            if (data.senderId === sessionClientIdRef.current) return;
            const updatedShape = JSON.parse(data.message) as Shape;
            const updatedId = Number(data.shapeId);
            const incomingUpdatedAt = updatedShape.updatedAt || 0;
            const incomingVersion = updatedShape.version || 0;

            setShapes((prev) =>
              prev.map((s) => {
                const isMatch = s.id === updatedId || (updatedShape.clientId && s.clientId === updatedShape.clientId);
                if (!isMatch) return s;

                // If local user is actively dragging or resizing this shape, shield local state
                if (
                  (isDraggingSelection || isResizing) &&
                  selectedShapesRef.current.some(
                    (sel) => (sel.id && sel.id === s.id) || (sel.clientId && sel.clientId === s.clientId)
                  )
                ) {
                  return s;
                }

                // Last-Write-Wins (LWW) timestamp check: drop stale packet if local is newer
                const localUpdatedAt = s.updatedAt || 0;
                const localVersion = s.version || 0;
                if (incomingUpdatedAt < localUpdatedAt || incomingVersion < localVersion) {
                  return s;
                }

                return { ...s, ...updatedShape, id: updatedId };
              })
            );

            setSelectedShapes((prev) =>
              prev.map((s) => {
                const isMatch = s.id === updatedId || (updatedShape.clientId && s.clientId === updatedShape.clientId);
                if (!isMatch) return s;
                return { ...s, ...updatedShape, id: updatedId };
              })
            );
          } else if (data.type === 'delete_shape') {
            const deletedId = Number(data.shapeId);
            setShapes((prev) => prev.filter((s) => s.id !== deletedId));
            setSelectedShapes((prev) => prev.filter((s) => s.id !== deletedId));
          }
        } catch (e) { }
      };
  }, [socket, loading, roomId]);

  // 3. Set canvas dimensions and redraw whenever shapes, pan, zoom, selection, or marquee changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      const shapesToDraw = editingText?.isEditingExisting
        ? shapes.filter((s) => {
          if (editingText.id && s.id === editingText.id) return false;
          if (editingText.clientId && s.clientId === editingText.clientId) return false;
          return true;
        })
        : shapes;

      draw(
        canvasRef.current,
        shapesToDraw,
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
  }, [shapes, canvasBackground, panX, panY, zoom, selectedShapes, marqueeBox, editingText]);

  // Redraw when custom sketchy web fonts finish loading
  useEffect(() => {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        if (canvasRef.current) {
          const shapesToDraw = editingText?.isEditingExisting
            ? shapesRef.current.filter((s) => {
              if (editingText.id && s.id === editingText.id) return false;
              if (editingText.clientId && s.clientId === editingText.clientId) return false;
              return true;
            })
            : shapesRef.current;

          draw(
            canvasRef.current,
            shapesToDraw,
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
  }, [canvasBackground, marqueeBox, editingText]);

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

          const clientId = generateClientId();
          const now = Date.now();
          const localImageShape: Shape = {
            type: 'image',
            src: localUrl,
            x: worldPos.x,
            y: worldPos.y,
            width,
            height,
            opacity,
            clientId,
            updatedAt: now,
            version: 1,
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
                    senderId: sessionClientIdRef.current,
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

  // Insert entity from Shape & Architecture Library at viewport center
  const handleInsertEntity = useCallback(
    (entity: LibraryEntity) => {
      // 1. Calculate camera center in world coordinates
      const centerScreenX = window.innerWidth / 2;
      const centerScreenY = window.innerHeight / 2;
      const centerWorld = screenToWorld(centerScreenX, centerScreenY);

      // 2. Instantiate shapes for this entity
      const now = Date.now();
      const newShapes = entity.createShapes(
        centerWorld,
        {
          strokeColor,
          backgroundColor,
          fillStyle,
          strokeWidth,
          strokeStyle,
          roughness,
          opacity,
        },
        generateClientId
      ).map((s) => ({
        ...s,
        updatedAt: now,
        version: 1,
      }));

      if (newShapes.length === 0) return;

      // 3. Add to local canvas state
      setShapes((prev) => [...prev, ...newShapes]);

      // 4. Select newly created shapes and switch to select tool for immediate dragging/styling
      setSelectedShapes(newShapes);
      setSelectedTool('select');

      // 5. Broadcast to room over WebSocket
      newShapes.forEach((shape) => {
        if (socket) {
          socket.send(
            JSON.stringify({
              type: 'chat',
              senderId: sessionClientIdRef.current,
              message: JSON.stringify(shape),
              roomId: Number(roomId),
            })
          );
        }
      });
    },
    [
      screenToWorld,
      strokeColor,
      backgroundColor,
      fillStyle,
      strokeWidth,
      strokeStyle,
      roughness,
      opacity,
      socket,
      roomId,
    ]
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
                  senderId: sessionClientIdRef.current,
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
  const createShape = (tool: Tool, x1: number, y1: number, x2: number, y2: number, clientId?: string): Shape => {
    const commonStyle = {
      strokeColor,
      backgroundColor,
      fillStyle,
      strokeWidth,
      strokeStyle,
      roughness,
      opacity,
      seed: Math.floor(Math.random() * 2147483647),
      clientId: clientId || generateClientId(),
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
          const selectedIndices: number[] = [];
          shapes.forEach((s, idx) => {
            if (
              selectedShapes.some(
                (sel) =>
                  (sel.id && sel.id === s.id) ||
                  (sel.clientId && sel.clientId === s.clientId) ||
                  sel === s
              )
            ) {
              selectedIndices.push(idx);
            }
          });
          resizingStateRef.current = {
            handle: handleHit.handle,
            origBounds: activeBounds,
            origShapes: selectedShapes.map((s) => JSON.parse(JSON.stringify(s))),
            origAllShapes: shapes.map((s) => JSON.parse(JSON.stringify(s))),
            selectedIndices,
            startMouse: worldPos,
          };
          return;
        }

        // 2. Check if clicking inside active selection bounding box or on any selected shape
        const isInsideSelection = isPointInsideBounds(worldPos.x, worldPos.y, activeBounds, 6 / zoom);
        const isNearSelectedShape = selectedShapes.some((s) => isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));

        if (!e.shiftKey && (isInsideSelection || isNearSelectedShape)) {
          setIsDraggingSelection(true);
          const selectedIndices: number[] = [];
          shapes.forEach((s, idx) => {
            if (
              selectedShapes.some(
                (sel) =>
                  (sel.id && sel.id === s.id) ||
                  (sel.clientId && sel.clientId === s.clientId) ||
                  sel === s
              )
            ) {
              selectedIndices.push(idx);
            }
          });
          draggingStateRef.current = {
            origSelected: selectedShapes.map((s) => JSON.parse(JSON.stringify(s))),
            origShapes: shapes.map((s) => JSON.parse(JSON.stringify(s))),
            selectedIndices,
            startMouse: worldPos,
            hasMoved: false,
          };
          return;
        }
      }

      // 3. Find top-most shape under cursor (iterating from newest to oldest)
      let hitShapeIdx = -1;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s && isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom)) {
          hitShapeIdx = i;
          break;
        }
      }

      if (hitShapeIdx !== -1) {
        const hitShape = shapes[hitShapeIdx]!;
        const isAlreadySelected = selectedShapes.some(
          (s) => (s.id && s.id === hitShape.id) || (s.clientId && s.clientId === hitShape.clientId) || s === hitShape
        );
        if (e.shiftKey) {
          // Toggle selection
          const nextSelected = isAlreadySelected
            ? selectedShapes.filter(
              (s) => (s.id ? s.id !== hitShape.id : s.clientId ? s.clientId !== hitShape.clientId : s !== hitShape)
            )
            : [...selectedShapes, hitShape];
          setSelectedShapes(nextSelected);
        } else {
          // Select clicked shape exclusively and load its style into the sidebar
          const newSelected = [hitShape];
          setSelectedShapes(newSelected);
          if (hitShape.strokeColor) setStrokeColor(hitShape.strokeColor);
          if (hitShape.backgroundColor !== undefined) setBackgroundColor(hitShape.backgroundColor);
          if (hitShape.fillStyle) setFillStyle(hitShape.fillStyle);
          if (hitShape.strokeWidth) setStrokeWidth(hitShape.strokeWidth);
          if (hitShape.strokeStyle) setStrokeStyle(hitShape.strokeStyle);
          if (hitShape.roughness !== undefined) setRoughness(hitShape.roughness);
          if (hitShape.opacity !== undefined) setOpacity(hitShape.opacity);

          // Start dragging immediately so user can single-click-drag any shape seamlessly
          setIsDraggingSelection(true);
          draggingStateRef.current = {
            origSelected: [JSON.parse(JSON.stringify(hitShape))],
            origShapes: shapes.map((s) => JSON.parse(JSON.stringify(s))),
            selectedIndices: [hitShapeIdx],
            startMouse: worldPos,
            hasMoved: false,
          };
        }
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
      const hitTextShape = [...shapes]
        .reverse()
        .find((s) => s.type === 'text' && isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));

      if (hitTextShape && hitTextShape.type === 'text') {
        setEditingText({
          x: hitTextShape.x,
          y: hitTextShape.y,
          text: hitTextShape.text,
          fontSize: hitTextShape.fontSize || 24,
          id: hitTextShape.id,
          clientId: hitTextShape.clientId,
          isEditingExisting: true,
        });
        setSelectedShapes([]);
      } else {
        setEditingText({
          x: worldPos.x,
          y: worldPos.y,
          text: '',
          fontSize: 24,
          isEditingExisting: false,
        });
      }
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
        const { handle, origBounds, origShapes, origAllShapes, selectedIndices } = resizingStateRef.current;
        const newBounds = calculateNewBounds(
          origBounds,
          handle,
          worldPos.x,
          worldPos.y,
          e.shiftKey
        );

        const nextShapes = [...origAllShapes];
        const nextSelected: Shape[] = [];

        selectedIndices.forEach((shapeIdx, idx) => {
          const origS = origShapes[idx];
          if (origS && nextShapes[shapeIdx]) {
            const resized = resizeShape(
              nextShapes[shapeIdx]!,
              origS,
              origBounds,
              newBounds,
              handle,
              worldPos.x,
              worldPos.y
            );
            nextShapes[shapeIdx] = resized;
            nextSelected.push(resized);
          }
        });

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

      // 2. Dragging selected shapes across canvas
      if (isDraggingSelection && draggingStateRef.current) {
        const totalDx = worldPos.x - draggingStateRef.current.startMouse.x;
        const totalDy = worldPos.y - draggingStateRef.current.startMouse.y;
        if (Math.abs(totalDx) > 1 || Math.abs(totalDy) > 1) {
          draggingStateRef.current.hasMoved = true;
        }

        const nextShapes = [...draggingStateRef.current.origShapes];
        const nextSelected: Shape[] = [];

        draggingStateRef.current.selectedIndices.forEach((shapeIdx) => {
          const origS = draggingStateRef.current!.origShapes[shapeIdx];
          if (origS) {
            const moved = moveShape(origS, totalDx, totalDy);
            nextShapes[shapeIdx] = moved;
            nextSelected.push(moved);
          }
        });

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

        // Ephemeral in-memory live drag stream to peers (throttled to ~25ms / 40 FPS, 0 DB writes)
        if (socket && nextSelected.length > 0) {
          const now = Date.now();
          if (now - lastWsDragTimeRef.current > 25) {
            lastWsDragTimeRef.current = now;
            socket.send(
              JSON.stringify({
                type: 'peer_drag',
                roomId: Number(roomId),
                senderId: sessionClientIdRef.current,
                shapes: nextSelected.map((s) => ({
                  id: s.id,
                  clientId: s.clientId,
                  type: s.type,
                  ...(s.type === 'rect' || s.type === 'diamond' || s.type === 'image' || s.type === 'text'
                    ? { x: s.x, y: s.y, width: (s as any).width, height: (s as any).height }
                    : {}),
                  ...(s.type === 'circle'
                    ? { centerX: (s as any).centerX, centerY: (s as any).centerY, radius: (s as any).radius }
                    : {}),
                  ...(s.type === 'line' || s.type === 'arrow'
                    ? {
                      startX: (s as any).startX,
                      startY: (s as any).startY,
                      endX: (s as any).endX,
                      endY: (s as any).endY,
                    }
                    : {}),
                  ...(s.type === 'pencil' ? { points: (s as any).points } : {}),
                })),
              })
            );
          }
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

      // 4. Hover state & handle cursor detection when idle
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
          setHoverHandleCursor(handleHit.cursor);
          setIsHoveringSelection(false);
        } else {
          setHoverHandleCursor(null);
          const isInsideSelection = isPointInsideBounds(worldPos.x, worldPos.y, activeBounds, 6 / zoom);
          const isNearSelectedShape = selectedShapes.some((s) => isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));
          setIsHoveringSelection(isInsideSelection || isNearSelectedShape);
        }
      } else {
        setHoverHandleCursor(null);
        // Check if hovering over any shape
        const isOverAnyShape = shapes.some((s) => isPointNearShape(worldPos.x, worldPos.y, s, 10 / zoom));
        setIsHoveringSelection(isOverAnyShape);
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
        const finalSelected = selectedShapesRef.current;
        resizingStateRef.current = null;
        // Sync resized shapes to backend and peers with LWW timestamps
        if (finalSelected.length > 0) {
          const now = Date.now();
          finalSelected.forEach((shape) => {
            const currentShape = shapesRef.current.find(
              (s) => (shape.id && s.id === shape.id) || (shape.clientId && s.clientId === shape.clientId)
            );
            const shapeId = shape.id || currentShape?.id;
            const updatedShape: Shape = {
              ...shape,
              id: shapeId,
              updatedAt: now,
              version: (shape.version || 0) + 1,
            };
            if (shapeId) {
              updateShapeApi(shapeId, updatedShape);
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: 'update_shape',
                    roomId: Number(roomId),
                    shapeId,
                    senderId: sessionClientIdRef.current,
                    message: JSON.stringify(updatedShape),
                  })
                );
              }
            }
          });
        }
      }

      if (isDraggingSelection) {
        setIsDraggingSelection(false);
        const hadMoved = draggingStateRef.current?.hasMoved;
        const finalSelected = selectedShapesRef.current;
        draggingStateRef.current = null;

        // Sync moved shapes to backend and peers if position changed
        if (hadMoved && finalSelected.length > 0) {
          const now = Date.now();
          finalSelected.forEach((shape) => {
            const currentShape = shapesRef.current.find(
              (s) => (shape.id && s.id === shape.id) || (shape.clientId && s.clientId === shape.clientId)
            );
            const shapeId = shape.id || currentShape?.id;
            const updatedShape: Shape = {
              ...shape,
              id: shapeId,
              updatedAt: now,
              version: (shape.version || 0) + 1,
            };
            if (shapeId) {
              updateShapeApi(shapeId, updatedShape);
              if (socket) {
                socket.send(
                  JSON.stringify({
                    type: 'update_shape',
                    roomId: Number(roomId),
                    shapeId,
                    senderId: sessionClientIdRef.current,
                    message: JSON.stringify(updatedShape),
                  })
                );
              }
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
    const clientId = generateClientId();
    const now = Date.now();
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
        clientId,
        updatedAt: now,
        version: 1,
      };
      pencilPointsRef.current = [];
    } else {
      newShape = {
        ...createShape(selectedTool, startX, startY, worldPos.x, worldPos.y, clientId),
        updatedAt: now,
        version: 1,
      };
    }

    setShapes((prev) => [...prev, newShape]);

    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'chat',
          roomId: Number(roomId),
          senderId: sessionClientIdRef.current,
          message: JSON.stringify(newShape),
        })
      );
    }

    // Auto-switch back to the select tool for geometric shapes, but keep pencil active for continuous freehand sketching
    if (selectedTool !== 'pencil') {
      setSelectedTool('select');
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
      draggingStateRef.current = null;
    }
    if (marqueeBox) {
      setMarqueeBox(null);
    }
    setHoverHandleCursor(null);
    setIsHoveringSelection(false);
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
      if (isDraggingSelection) {
        return 'grabbing';
      }
      if (isHoveringSelection) {
        return 'grab';
      }
      return 'default';
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
        isLibraryOpen={isLibraryOpen}
        onToggleLibrary={() => setIsLibraryOpen((prev) => !prev)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <EntityLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onInsertEntity={handleInsertEntity}
        selectedShapes={selectedShapes}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        shapes={shapes}
        selectedShapes={selectedShapes}
        canvasBackground={canvasBackground}
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

      {/* Picasso Brand & Room Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
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
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f8fafc',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '-0.01em',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#cae39f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#121908',
            }}
          >
            <Paintbrush size={10} />
          </div>
          <span>Picasso</span>
        </Link>
        <div
          style={{
            width: '1px',
            height: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.01em',
          }}
        >
          Room {roomId}
        </span>
      </div>

      {/* Top Right Header Controls & Clerk Auth */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 8px',
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
        <Link
          href="/"
          title="Back to Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
            e.currentTarget.style.color = '#cae39f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <Home size={15} />
        </Link>

        <div
          style={{
            width: '1px',
            height: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }}
        />

        {isAuthLoaded && isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: '26px',
                  height: '26px',
                  border: '1.5px solid #cae39f',
                },
              },
            }}
          />
        ) : isAuthLoaded ? (
          <SignInButton mode="modal">
            <button
              type="button"
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(202, 227, 159, 0.3)',
                backgroundColor: 'rgba(202, 227, 159, 0.12)',
                color: '#cae39f',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(202, 227, 159, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(202, 227, 159, 0.12)';
              }}
            >
              Sign In
            </button>
          </SignInButton>
        ) : null}
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
            fontSize: `${editingText.fontSize || 24}px`,
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
