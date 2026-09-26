'use client';

import { useState } from 'react';
import { FillStyle, Sloppiness, StrokeStyle } from '../lib/types';
import {
  ChevronLeft,
  ChevronRight,
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
  '#ff6b6b',
  '#51cf66',
  '#339af0',
  '#fcc419',
  '#cc5de8',
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
        gap: '8px',
      }}
    >
      {/* Main MacBook Glassmorphic Sidebar Card */}
      {!isCollapsed && (
        <div
          style={{
            width: '256px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: 'rgba(24, 24, 30, 0.76)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '18px',
            padding: '16px',
            boxShadow:
              '0 20px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#f8fafc',
            fontFamily:
              '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            userSelect: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* Section: Stroke Color */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Stroke
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {STROKE_COLORS.map((color) => {
                const isSelected = strokeColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    style={{
                      width: '23px',
                      height: '23px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: isSelected
                        ? '2px solid #cae39f'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                      padding: 0,
                    }}
                    title={color}
                  />
                );
              })}
              {/* Custom Stroke Color Picker */}
              <label
                style={{
                  width: '23px',
                  height: '23px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.28)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
                title="Custom color"
              >
                <Palette size={12} color="rgba(255, 255, 255, 0.7)" />
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
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Background
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {BG_COLORS.map((color) => {
                const isSelected = backgroundColor.toLowerCase() === color.toLowerCase();
                const isTransparent = color === 'transparent';
                return (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    style={{
                      width: '23px',
                      height: '23px',
                      borderRadius: '6px',
                      backgroundColor: isTransparent ? 'rgba(30, 30, 38, 0.8)' : color,
                      border: isSelected
                        ? '2px solid #cae39f'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
                          width: '16px',
                          height: '2px',
                          backgroundColor: '#ef4444',
                          transform: 'rotate(-45deg)',
                          borderRadius: '1px',
                        }}
                      />
                    )}
                  </button>
                );
              })}
              {/* Custom Fill Color Picker */}
              <label
                style={{
                  width: '23px',
                  height: '23px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.28)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
                title="Custom color"
              >
                <Palette size={12} color="rgba(255, 255, 255, 0.7)" />
                <input
                  type="color"
                  value={backgroundColor === 'transparent' ? '#cae39f' : backgroundColor}
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
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                Fill Style
              </div>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  gap: '2px',
                }}
              >
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
                        flex: 1,
                        height: '28px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isSelected ? '#cae39f' : 'transparent',
                        color: isSelected ? '#16220b' : 'rgba(255, 255, 255, 0.65)',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
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
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Stroke width
            </div>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '2px',
              }}
            >
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
                      flex: 1,
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: isSelected ? '#cae39f' : 'transparent',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: `${item.barHeight}px`,
                        backgroundColor: isSelected ? '#16220b' : 'rgba(255, 255, 255, 0.65)',
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
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Stroke style
            </div>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '2px',
              }}
            >
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
                      flex: 1,
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: isSelected ? '#cae39f' : 'transparent',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: 0,
                        borderTop: `2px ${item.dash} ${isSelected ? '#16220b' : 'rgba(255, 255, 255, 0.65)'}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Sloppiness / Roughness */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Sloppiness
            </div>
            <div
              style={{
                display: 'flex',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                gap: '2px',
              }}
            >
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
                      flex: 1,
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 700,
                      borderRadius: '7px',
                      border: 'none',
                      backgroundColor: isSelected ? '#cae39f' : 'transparent',
                      color: isSelected ? '#16220b' : 'rgba(255, 255, 255, 0.65)',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
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
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              <span>Opacity</span>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {opacity}%
              </span>
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
                height: '5px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: '#cae39f',
              }}
            />
          </div>

          {/* Section: Canvas Background */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
              }}
            >
              Canvas background
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '6px',
                alignItems: 'center',
              }}
            >
              {CANVAS_BG_COLORS.map((color) => {
                const isSelected = canvasBackground.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => setCanvasBackground(color)}
                    style={{
                      width: '23px',
                      height: '23px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: isSelected
                        ? '2px solid #cae39f'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                      padding: 0,
                    }}
                    title={color}
                  />
                );
              })}
              {/* Custom Canvas Background Picker */}
              <label
                style={{
                  width: '23px',
                  height: '23px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px dashed rgba(255, 255, 255, 0.28)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
                title="Custom Canvas BG"
              >
                <Palette size={12} color="rgba(255, 255, 255, 0.7)" />
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

      {/* macOS Frosted Floating Capsule Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Show Style Panel' : 'Hide Style Panel'}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          backgroundColor: 'rgba(26, 28, 38, 0.85)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow:
            '0 8px 24px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(40, 44, 60, 0.95)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.38)';
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.boxShadow =
            '0 12px 28px -4px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 38, 0.85)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)';
        }}
      >
        {isCollapsed ? (
          <Sliders size={20} strokeWidth={2.2} color="#ffffff" />
        ) : (
          <ChevronLeft size={20} strokeWidth={2.4} color="#ffffff" />
        )}
      </button>
    </div>
  );
}
