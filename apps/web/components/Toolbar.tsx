'use client';

import React from 'react';
import {
  MousePointer,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Eraser,
  Undo2,
  Trash2,
} from 'lucide-react';
import { Tool } from '../lib/types';

interface ToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  strokeColor: string;
  onChangeStrokeColor: (color: string) => void;
  strokeWidth: number;
  onChangeStrokeWidth: (width: number) => void;
  fillColor: string;
  onChangeFillColor: (color: string) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
}

const STROKE_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
];

const FILL_COLORS = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'Red Tint', value: '#fee2e2' },
  { name: 'Green Tint', value: '#dcfce7' },
  { name: 'Blue Tint', value: '#dbeafe' },
  { name: 'Yellow Tint', value: '#fef9c3' },
  { name: 'Purple Tint', value: '#f3e8ff' },
];

export function Toolbar({
  currentTool,
  onSelectTool,
  strokeColor,
  onChangeStrokeColor,
  strokeWidth,
  onChangeStrokeWidth,
  fillColor,
  onChangeFillColor,
  onUndo,
  onClear,
  canUndo,
}: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, label: 'Select', icon: MousePointer, key: '1' },
    { id: 'rect' as Tool, label: 'Rectangle', icon: Square, key: '2' },
    { id: 'diamond' as Tool, label: 'Diamond', icon: Diamond, key: '3' },
    { id: 'circle' as Tool, label: 'Circle', icon: Circle, key: '4' },
    { id: 'arrow' as Tool, label: 'Arrow', icon: ArrowRight, key: '5' },
    { id: 'line' as Tool, label: 'Line', icon: Minus, key: '6' },
    { id: 'pencil' as Tool, label: 'Pencil', icon: Pencil, key: '7' },
    { id: 'eraser' as Tool, label: 'Eraser', icon: Eraser, key: '8' },
  ];

  return (
    <div className="toolbar-container">
      {/* Tool Selection Section */}
      <div className="toolbar-panel">
        <div className="tool-group">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = currentTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTool(t.id)}
                className={`tool-button ${isActive ? 'active' : ''}`}
                title={`${t.label} (${t.key})`}
              >
                <Icon size={18} />
                <span className="tool-shortcut">{t.key}</span>
              </button>
            );
          })}
        </div>

        <div className="toolbar-divider" />

        {/* Undo & Clear */}
        <div className="action-group">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="tool-button"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onClear}
            className="tool-button danger"
            title="Clear Canvas"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Style Options (Colors & Stroke Width) */}
      {currentTool !== 'eraser' && currentTool !== 'select' && (
        <div className="style-panel">
          {/* Stroke Colors */}
          <div className="style-section">
            <span className="style-label">Stroke</span>
            <div className="color-palette">
              {STROKE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onChangeStrokeColor(c.value)}
                  className={`color-swatch ${strokeColor === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="toolbar-divider" />

          {/* Stroke Width */}
          <div className="style-section">
            <span className="style-label">Width</span>
            <div className="width-options">
              {[2, 4, 6].map((w) => (
                <button
                  key={w}
                  onClick={() => onChangeStrokeWidth(w)}
                  className={`width-btn ${strokeWidth === w ? 'selected' : ''}`}
                >
                  <div
                    style={{
                      height: `${w}px`,
                      width: '16px',
                      backgroundColor: strokeColor,
                      borderRadius: '2px',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Fill Color for closed shapes */}
          {(currentTool === 'rect' || currentTool === 'circle' || currentTool === 'diamond') && (
            <>
              <div className="toolbar-divider" />
              <div className="style-section">
                <span className="style-label">Fill</span>
                <div className="color-palette">
                  {FILL_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onChangeFillColor(c.value)}
                      className={`color-swatch ${fillColor === c.value ? 'selected' : ''} ${
                        c.value === 'transparent' ? 'transparent-swatch' : ''
                      }`}
                      style={{
                        backgroundColor: c.value === 'transparent' ? '#2e2e2e' : c.value,
                      }}
                      title={c.name}
                    >
                      {c.value === 'transparent' && <span className="slash">∅</span>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
