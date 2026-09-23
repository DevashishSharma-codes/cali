export type Tool =
  | 'select'
  | 'hand'
  | 'pencil'
  | 'rect'
  | 'circle'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'eraser';

export type FillStyle = 'transparent' | 'solid' | 'hachure' | 'cross-hatch' | 'dots';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type Sloppiness = 'architect' | 'artist' | 'cartoonist';

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface ShapeStyle {
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: FillStyle;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
  roughness?: number;
  opacity?: number; // 0 - 100
  clientId?: string;
}

export type PencilShape = ShapeStyle & {
  id?: number;
  type: 'pencil';
  points: { x: number; y: number }[];
};

export type RectShape = ShapeStyle & {
  id?: number;
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = ShapeStyle & {
  id?: number;
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
};

export type DiamondShape = ShapeStyle & {
  id?: number;
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LineShape = ShapeStyle & {
  id?: number;
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type ArrowShape = ShapeStyle & {
  id?: number;
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type TextShape = ShapeStyle & {
  id?: number;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize?: number;
};

export type ImageShape = ShapeStyle & {
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
  | TextShape
  | ImageShape;
