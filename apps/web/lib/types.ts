export type Tool = 'pencil' | 'rect' | 'circle' | 'diamond' | 'line' | 'arrow' | 'eraser';

export type PencilShape = {
  id?: number;
  type: 'pencil';
  points: { x: number; y: number }[];
};

export type RectShape = {
  id?: number;
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = {
  id?: number;
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
};

export type DiamondShape = {
  id?: number;
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LineShape = {
  id?: number;
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type ArrowShape = {
  id?: number;
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type ImageShape = {
  id?: number;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Shape =
  | PencilShape
  | RectShape
  | CircleShape
  | DiamondShape
  | LineShape
  | ArrowShape
  | ImageShape;



