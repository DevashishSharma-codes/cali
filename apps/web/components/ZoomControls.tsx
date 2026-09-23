'use client';

import { Minus, Plus } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  const percentage = Math.round(zoom * 100);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 6px',
        backgroundColor: 'rgba(24, 24, 30, 0.76)',
        backdropFilter: 'blur(28px) saturate(190%)',
        WebkitBackdropFilter: 'blur(28px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '12px',
        boxShadow:
          '0 16px 36px -8px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        title="Zoom Out (Ctrl - / ⌘ -)"
        style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.75)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
        }}
      >
        <Minus size={14} />
      </button>

      {/* Reset Zoom */}
      <button
        onClick={onResetZoom}
        title="Reset Zoom to 100% (Ctrl 0 / ⌘ 0)"
        style={{
          padding: '0 8px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: '50px',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {percentage}%
      </button>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        title="Zoom In (Ctrl + / ⌘ +)"
        style={{
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.75)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
