// Available drawing tools
export type Tool = 'select' | 'rect' | 'circle' | 'line' | 'arrow' | 'diamond' | 'pencil' | 'eraser';

// Base shape attributes
interface BaseShape {
  id: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

// Rectangle shape definition
export interface RectShape extends BaseShape {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

// Circle shape definition
export interface CircleShape extends BaseShape {
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
}

// Line shape definition
export interface LineShape extends BaseShape {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Arrow shape definition
export interface ArrowShape extends BaseShape {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Diamond shape definition
export interface DiamondShape extends BaseShape {
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
}

// Freehand pencil shape definition
export interface PencilShape extends BaseShape {
  type: 'pencil';
  points: { x: number; y: number }[];
}

// Discriminated union of all shape types
export type Shape =
  | RectShape
  | CircleShape
  | LineShape
  | ArrowShape
  | DiamondShape
  | PencilShape;

// WebSocket message formats
export type WSIncomingMessage =
  | {
      type: 'chat';
      message: string;
      userId: string;
      roomId: string | number;
    }
  | {
      type?: string;
      message: string;
      userId?: string;
      roomId?: string | number;
    };

export interface ChatMessage {
  id: number;
  message: string;
  userId: string;
  roomId: number;
}
