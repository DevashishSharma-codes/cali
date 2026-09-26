'use client';

import { useRef } from 'react';
import { Tool } from '../lib/types';
import {
  MousePointer,
  Hand,
  Pencil,
  Square,
  Circle,
  Diamond,
  Minus,
  MoveRight,
  Eraser,
  Undo2,
  Image as ImageIcon,
  Type,
  Boxes,
  Download,
} from 'lucide-react';

interface ToolbarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onUploadImage?: (file: File) => void;
  isLibraryOpen?: boolean;
  onToggleLibrary?: () => void;
  onOpenExport?: () => void;
}

export function Toolbar({
  selectedTool,
  setSelectedTool,
  onUndo,
  canUndo = true,
  onUploadImage,
  isLibraryOpen = false,
  onToggleLibrary,
  onOpenExport,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tools: { type: Tool; label: string; icon: React.ReactNode }[] = [
    { type: 'select', label: 'Selection (V)', icon: <MousePointer size={18} /> },
    { type: 'hand', label: 'Hand (H)', icon: <Hand size={18} /> },
    { type: 'pencil', label: 'Pencil (P)', icon: <Pencil size={18} /> },
    { type: 'rect', label: 'Rectangle (R)', icon: <Square size={18} /> },
    { type: 'circle', label: 'Circle (C)', icon: <Circle size={18} /> },
    { type: 'diamond', label: 'Diamond (D)', icon: <Diamond size={18} /> },
    { type: 'line', label: 'Line (L)', icon: <Minus size={18} /> },
    { type: 'arrow', label: 'Arrow (A)', icon: <MoveRight size={18} /> },
    { type: 'text', label: 'Text (T)', icon: <Type size={18} /> },
    { type: 'eraser', label: 'Eraser (E)', icon: <Eraser size={18} /> },
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
        gap: '4px',
        padding: '5px 8px',
        backgroundColor: 'rgba(24, 24, 30, 0.76)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '16px',
        boxShadow:
          '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        zIndex: 100,
        fontFamily:
          '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
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
              borderRadius: '9px',
              border: 'none',
              backgroundColor: isActive ? '#cae39f' : 'transparent',
              color: isActive ? '#16220b' : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              boxShadow: 'none',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
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
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            <ImageIcon size={18} />
          </button>
        </>
      )}

      {onToggleLibrary && (
        <button
          title="Shape & Architecture Library (Shift+L)"
          onClick={onToggleLibrary}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: isLibraryOpen ? '#cae39f' : 'transparent',
            color: isLibraryOpen ? '#16220b' : 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            boxShadow: 'none',
            transform: isLibraryOpen ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            if (!isLibraryOpen) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLibraryOpen) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }
          }}
        >
          <Boxes size={18} />
        </button>
      )}

      {onUndo && (
        <>
          <div
            style={{
              width: '1px',
              height: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              margin: '0 3px',
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
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'transparent',
              color: canUndo ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.25)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }
            }}
          >
            <Undo2 size={18} />
          </button>
        </>
      )}

      {onOpenExport && (
        <>
          <div
            style={{
              width: '1px',
              height: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              margin: '0 3px',
            }}
          />
          <button
            title="Export Diagram as PNG / JPEG / SVG (Ctrl+Shift+E / ⌘⇧E)"
            onClick={onOpenExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#cae39f',
              cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(202, 227, 159, 0.18)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#cae39f';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Download size={18} />
          </button>
        </>
      )}
    </div>
  );
}
