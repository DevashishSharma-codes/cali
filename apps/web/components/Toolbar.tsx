'use client';

import { useRef } from 'react';
import { Tool } from '../lib/types';
import { Pencil, Square, Circle, Diamond, Minus, MoveRight, Eraser, Undo2, Image as ImageIcon } from 'lucide-react';

interface ToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onUploadImage?: (file: File) => void;
}

export function Toolbar({
  selectedTool,
  setSelectedTool,
  onUndo,
  canUndo = true,
  onUploadImage,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tools: { type: Tool; label: string; icon: React.ReactNode }[] = [
    { type: 'pencil', label: 'Pencil', icon: <Pencil size={18} /> },
    { type: 'rect', label: 'Rectangle', icon: <Square size={18} /> },
    { type: 'circle', label: 'Circle', icon: <Circle size={18} /> },
    { type: 'diamond', label: 'Diamond', icon: <Diamond size={18} /> },
    { type: 'line', label: 'Line', icon: <Minus size={18} /> },
    { type: 'arrow', label: 'Arrow', icon: <MoveRight size={18} /> },
    { type: 'eraser', label: 'Eraser', icon: <Eraser size={18} /> },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 8px',
        backgroundColor: 'rgba(29, 29, 34, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 100,
      }}
    >
      {tools.map((tool) => {
        const isActive = selectedTool === tool.type;
        return (
          <button
            key={tool.type}
            title={tool.label}
            onClick={() => setSelectedTool(tool.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isActive ? '#6366f1' : 'transparent',
              color: isActive ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            {tool.icon}
          </button>
        );
      })}

      {onUploadImage && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadImage(file);
                e.target.value = '';
              }
            }}
          />
          <button
            title="Upload Image"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'background-color 0.15s, color 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <ImageIcon size={18} />
          </button>
        </>
      )}

      {onUndo && (
        <>
          <div
            style={{
              width: '1px',
              height: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              margin: '0 2px',
            }}
          />
          <button
            title="Undo (Ctrl+Z / ⌘Z)"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: canUndo ? '#94a3b8' : 'rgba(148, 163, 184, 0.35)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s, color 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <Undo2 size={18} />
          </button>
        </>
      )}
    </div>
  );
}
