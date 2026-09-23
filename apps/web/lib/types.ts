export type Tool = 'pencil' | 'rect' | 'circle' | 'diamond' | 'line' | 'arrow';

export type PencilShape = {
  type: 'pencil';
  points: { x: number; y: number }[];
};

export type RectShape = {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = {
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
};

export type DiamondShape = {
  type: 'diamond';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LineShape = {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type ArrowShape = {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type Shape = PencilShape | RectShape | CircleShape | DiamondShape | LineShape | ArrowShape;

