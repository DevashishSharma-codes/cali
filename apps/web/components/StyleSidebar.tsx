'use client';

import { useState } from 'react';
import { FillStyle, Sloppiness, StrokeStyle } from '../lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Maximize2,
  Grid,
  Hash,
  Square,
  Sparkles,
  Palette,
  Sliders,
} from 'lucide-react';

interface StyleSidebarProps {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  fillStyle: FillStyle;
  setFillStyle: (style: FillStyle) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  strokeStyle: StrokeStyle;
  setStrokeStyle: (style: StrokeStyle) => void;
  roughness: number;
  setRoughness: (roughness: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  canvasBackground: string;
  setCanvasBackground: (color: string) => void;
}

const STROKE_COLORS = [
  '#ffffff',
  '#ff8787',
  '#69db7c',
  '#4dabf7',
  '#ffa94d',
  '#da77f2',
  '#868e96',
];

const BG_COLORS = [
  'transparent',
  '#2b2c37',
  '#fa5252',
  '#40c057',
  '#228be6',
  '#fd7e14',
  '#be4bdb',
  '#fab005',
];

const CANVAS_BG_COLORS = [
  '#121212',
  '#1e1e24',
  '#0f172a',
  '#1a1a2e',
  '#262626',
  '#f8fafc',
  '#fdf6e2',
];

export function StyleSidebar({
  strokeColor,
  setStrokeColor,
  backgroundColor,
  setBackgroundColor,
  fillStyle,
  setFillStyle,
  strokeWidth,
  setStrokeWidth,
  strokeStyle,
  setStrokeStyle,
  roughness,
  setRoughness,
  opacity,
  setOpacity,
  canvasBackground,
  setCanvasBackground,
}: StyleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 90,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
      }}
    >
      {/* Main Glassmorphic Sidebar Card */}
      {!isCollapsed && (
        <div
          style={{
            width: '240px',
            maxHeight: 'calc(100vh - 36px)',
            overflowY: 'auto',
            backgroundColor: 'rgba(26, 26, 32, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            userSelect: 'none',
          }}
        >
          {/* Section: Stroke Color */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Stroke
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {STROKE_COLORS.map((color) => {
                const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isSelected ? '0 0 8px rgba(129, 140, 248, 0.6)' : 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      padding: 0,
                    }}
                    title={color}
                  />
                );
              })}
              {/* Custom Stroke Color Picker */}
              <label
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title="Custom color"
              >
                <Palette size={12} color="#94a3b8" />
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
          </div>

          {/* Section: Background / Fill Color */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Background
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {BG_COLORS.map((color) => {
                const isSelected = backgroundColor.toLowerCase() === color.toLowerCase();
                const isTransparent = color === 'transparent';
                return (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: isTransparent ? '#1e1e24' : color,
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isSelected ? '0 0 8px rgba(129, 140, 248, 0.6)' : 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={isTransparent ? 'Transparent' : color}
                  >
                    {isTransparent && (
                      <div
                        style={{
                          width: '18px',
                          height: '2px',
                          backgroundColor: '#ef4444',
                          transform: 'rotate(-45deg)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
              {/* Custom Fill Color Picker */}
              <label
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title="Custom color"
              >
                <Palette size={12} color="#94a3b8" />
                <input
                  type="color"
                  value={backgroundColor === 'transparent' ? '#6366f1' : backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
          </div>

          {/* Section: Fill Style */}
          {backgroundColor !== 'transparent' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Fill Style
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {[
                  { type: 'hachure' as FillStyle, label: 'Hachure', icon: '///' },
                  { type: 'cross-hatch' as FillStyle, label: 'Cross', icon: '###' },
                  { type: 'solid' as FillStyle, label: 'Solid', icon: '■' },
                  { type: 'dots' as FillStyle, label: 'Dots', icon: '•••' },
                ].map((item) => {
                  const isSelected = fillStyle === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => setFillStyle(item.type)}
                      title={item.label}
                      style={{
                        padding: '6px 0',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Stroke Width */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Stroke width
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { width: 2, label: 'Thin', barHeight: 2 },
                { width: 4, label: 'Medium', barHeight: 4 },
                { width: 6, label: 'Bold', barHeight: 7 },
              ].map((item) => {
                const isSelected = strokeWidth === item.width;
                return (
                  <button
                    key={item.width}
                    onClick={() => setStrokeWidth(item.width)}
                    title={item.label}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: `${item.barHeight}px`,
                        backgroundColor: isSelected ? '#ffffff' : '#94a3b8',
                        borderRadius: '2px',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Stroke Style */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Stroke style
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { style: 'solid' as StrokeStyle, label: 'Solid', dash: 'solid' },
                { style: 'dashed' as StrokeStyle, label: 'Dashed', dash: 'dashed' },
                { style: 'dotted' as StrokeStyle, label: 'Dotted', dash: 'dotted' },
              ].map((item) => {
                const isSelected = strokeStyle === item.style;
                return (
                  <button
                    key={item.style}
                    onClick={() => setStrokeStyle(item.style)}
                    title={item.label}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: 0,
                        borderTop: `2px ${item.dash} ${isSelected ? '#ffffff' : '#94a3b8'}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Sloppiness / Roughness */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Sloppiness
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { value: 0, label: 'Architect (Clean)', icon: '—' },
                { value: 1.2, label: 'Artist (Hand-drawn)', icon: '∿' },
                { value: 2.5, label: 'Cartoonist (Sketchy)', icon: '⌇' },
              ].map((item) => {
                const isSelected = roughness === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setRoughness(item.value)}
                    title={item.label}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Opacity */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              <span>Opacity</span>
              <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 500 }}>{opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: '#6366f1',
              }}
            />
          </div>

          {/* Section: Canvas Background */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Canvas background
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              {CANVAS_BG_COLORS.map((color) => {
                const isSelected = canvasBackground.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => setCanvasBackground(color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isSelected ? '0 0 8px rgba(129, 140, 248, 0.6)' : 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      padding: 0,
                    }}
                    title={color}
                  />
                );
              })}
              {/* Custom Canvas Background Picker */}
              <label
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title="Custom Canvas BG"
              >
                <Palette size={12} color="#94a3b8" />
                <input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => setCanvasBackground(e.target.value)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Show Style Panel' : 'Hide Style Panel'}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          backgroundColor: 'rgba(26, 26, 32, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.backgroundColor = 'rgba(40, 40, 50, 0.95)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#94a3b8';
          e.currentTarget.style.backgroundColor = 'rgba(26, 26, 32, 0.9)';
        }}
      >
        {isCollapsed ? <Sliders size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
