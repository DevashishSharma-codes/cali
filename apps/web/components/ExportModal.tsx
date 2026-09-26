'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Shape } from '../lib/types';
import { draw } from '../lib/draw';
import { getCombinedBounds } from '../lib/hitTest';
import {
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Maximize2,
  FileDown,
  X,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shapes: Shape[];
  selectedShapes: Shape[];
  canvasBackground: string;
}

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportBackground = 'transparent' | 'dark' | 'white' | 'canvas';

export function ExportModal({
  isOpen,
  onClose,
  shapes,
  selectedShapes,
  canvasBackground,
}: ExportModalProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scope: 'selection' (if items selected) or 'all'
  const hasSelection = selectedShapes.length > 0;
  const [scope, setScope] = useState<'selection' | 'all'>(hasSelection ? 'selection' : 'all');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<number>(2); // Default 2x Retina
  const [bgOption, setBgOption] = useState<ExportBackground>(
    canvasBackground === '#121212' || canvasBackground.startsWith('#1') ? 'dark' : 'canvas'
  );
  const [padding, setPadding] = useState<number>(40);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hoverTrafficLight, setHoverTrafficLight] = useState(false);

  // Update scope default when modal opens
  useEffect(() => {
    if (isOpen) {
      setScope(selectedShapes.length > 0 ? 'selection' : 'all');
      setCopiedToast(false);
    }
  }, [isOpen, selectedShapes.length]);

  // Target shapes based on scope
  const targetShapes = useMemo(() => {
    if (scope === 'selection' && selectedShapes.length > 0) {
      return selectedShapes;
    }
    return shapes;
  }, [scope, selectedShapes, shapes]);

  // Combined bounds of target shapes
  const bounds = useMemo(() => {
    return getCombinedBounds(targetShapes);
  }, [targetShapes]);

  // Determine effective background color
  const effectiveBg = useMemo(() => {
    if (format === 'jpeg' && bgOption === 'transparent') {
      return '#ffffff'; // JPEGs do not support transparency
    }
    if (bgOption === 'transparent') return 'transparent';
    if (bgOption === 'white') return '#ffffff';
    if (bgOption === 'dark') return '#121212';
    return canvasBackground || '#121212';
  }, [bgOption, canvasBackground, format]);

  // Render live preview on thumbnail canvas
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current || targetShapes.length === 0) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pad = padding;
    const rawW = bounds.width + pad * 2;
    const rawH = bounds.height + pad * 2;

    const maxPreviewW = 440;
    const maxPreviewH = 280;
    const previewScale = Math.min(maxPreviewW / rawW, maxPreviewH / rawH, 1);

    canvas.width = Math.max(1, Math.round(rawW * previewScale));
    canvas.height = Math.max(1, Math.round(rawH * previewScale));

    const panX = (-bounds.minX + pad) * previewScale;
    const panY = (-bounds.minY + pad) * previewScale;

    draw(
      canvas,
      targetShapes,
      undefined,
      null,
      undefined,
      effectiveBg === 'transparent' ? 'transparent' : effectiveBg,
      panX,
      panY,
      previewScale,
      undefined,
      null
    );
  }, [isOpen, targetShapes, bounds, effectiveBg, padding]);

  // Helper to generate full-resolution canvas
  const generateExportCanvas = useCallback(
    (exportScale = scale): HTMLCanvasElement | null => {
      if (targetShapes.length === 0) return null;

      const offscreen = document.createElement('canvas');
      const pad = padding;
      const rawW = bounds.width + pad * 2;
      const rawH = bounds.height + pad * 2;

      offscreen.width = Math.max(1, Math.round(rawW * exportScale));
      offscreen.height = Math.max(1, Math.round(rawH * exportScale));

      const panX = (-bounds.minX + pad) * exportScale;
      const panY = (-bounds.minY + pad) * exportScale;

      draw(
        offscreen,
        targetShapes,
        undefined,
        null,
        undefined,
        effectiveBg === 'transparent' ? 'transparent' : effectiveBg,
        panX,
        panY,
        exportScale,
        undefined,
        null
      );

      return offscreen;
    },
    [targetShapes, bounds, padding, scale, effectiveBg]
  );

  // Download Handler (PNG / JPEG / SVG)
  const handleDownload = useCallback(() => {
    if (targetShapes.length === 0) return;
    setIsExporting(true);

    try {
      if (format === 'svg') {
        // Generate SVG export
        const pad = padding;
        const w = bounds.width + pad * 2;
        const h = bounds.height + pad * 2;
        const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
        const svgBg =
          effectiveBg !== 'transparent'
            ? `<rect width="100%" height="100%" fill="${effectiveBg}" />`
            : '';
        const canvas = generateExportCanvas(1);
        const imgData = canvas ? canvas.toDataURL('image/png') : '';
        const svgBody = `<image href="${imgData}" width="${w}" height="${h}" />`;
        const svgFooter = `</svg>`;
        const svgContent = `${svgHeader}${svgBg}${svgBody}${svgFooter}`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `excali-${scope === 'selection' ? 'selection' : 'diagram'}-${Date.now()}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // PNG or JPEG
        const canvas = generateExportCanvas(scale);
        if (!canvas) return;

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);

        const link = document.createElement('a');
        link.download = `excali-${scope === 'selection' ? 'selection' : 'diagram'}-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Failed to export diagram:', err);
    } finally {
      setIsExporting(false);
    }
  }, [targetShapes.length, format, padding, bounds.width, bounds.height, effectiveBg, generateExportCanvas, scope, scale]);

  // Copy to Clipboard Handler (PNG Blob)
  const handleCopyToClipboard = useCallback(async () => {
    if (targetShapes.length === 0) return;
    setIsExporting(true);

    try {
      const canvas = generateExportCanvas(scale);
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2400);
        } catch (clipErr) {
          console.error('Clipboard copy failed:', clipErr);
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setIsExporting(false);
    }
  }, [targetShapes.length, generateExportCanvas, scale]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const appleFont =
    '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif';
  const appleMonoFont =
    '"SF Mono", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(4, 6, 14, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px',
        animation: 'macModalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: appleFont,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes macModalFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Mac Glass Window Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: 'rgba(20, 24, 36, 0.65)',
          backgroundImage:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 28%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.04) 100%)',
          backdropFilter: 'blur(48px) saturate(220%) brightness(106%)',
          WebkitBackdropFilter: 'blur(48px) saturate(220%) brightness(106%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '20px',
          boxShadow:
            '0 36px 90px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.14), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          position: 'relative',
          fontFamily: appleFont,
          WebkitFontSmoothing: 'antialiased',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Title Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
            userSelect: 'none',
          }}
        >
          {/* Traffic Lights */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '60px' }}
            onMouseEnter={() => setHoverTrafficLight(true)}
            onMouseLeave={() => setHoverTrafficLight(false)}
          >
            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
                border: '0.5px solid rgba(224, 68, 62, 0.9)',
                boxShadow:
                  'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {hoverTrafficLight && (
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                  <path
                    d="M1 1L5 5M5 1L1 5"
                    stroke="#4c0002"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            <div
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
                border: '0.5px solid rgba(222, 161, 35, 0.9)',
                boxShadow:
                  'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                backgroundColor: '#27c93f',
                border: '0.5px solid rgba(26, 171, 41, 0.9)',
                boxShadow:
                  'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
                opacity: 0.5,
              }}
            />
          </div>

          {/* Center Title (Apple SF Pro Display style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '7px',
                background: 'rgba(202, 227, 159, 0.18)',
                border: '1px solid rgba(202, 227, 159, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cae39f',
              }}
            >
              <FileDown size={14} />
            </div>
            <span
              style={{
                fontFamily: appleFont,
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.015em',
              }}
            >
              Export Diagram
            </span>
          </div>

          {/* Apple Interactive Close Button / ESC Badge */}
          <div style={{ minWidth: '60px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              title="Close modal (Esc)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: appleFont,
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.75)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '3px 8px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
                boxShadow:
                  '0 1px 2px rgba(0, 0, 0, 0.2), inset 0 0.5px 0 rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
              }}
            >
              <X size={11} />
              <span>ESC</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Left Preview + Right Options */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 340px',
            gap: '20px',
            padding: '20px 22px',
          }}
        >
          {/* Left: Live Export Thumbnail Preview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: '280px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(8, 12, 20, 0.45)',
                backgroundImage:
                  effectiveBg === 'transparent'
                    ? 'radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px)'
                    : 'none',
                backgroundSize: '16px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              {targetShapes.length === 0 ? (
                <div
                  style={{
                    fontFamily: appleFont,
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    fontWeight: 400,
                  }}
                >
                  No shapes available to export.
                </div>
              ) : (
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '250px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                  }}
                />
              )}

              {/* Dimensions Badge */}
              {targetShapes.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(12, 16, 26, 0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '7px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#ffffff',
                    fontFamily: appleMonoFont,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                  }}
                >
                  {Math.round((bounds.width + padding * 2) * scale)} ×{' '}
                  {Math.round((bounds.height + padding * 2) * scale)} px ({scale}x)
                </div>
              )}
            </div>

            {/* Scope Toggle: macOS Segmented Control */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                type="button"
                onClick={() => setScope('selection')}
                disabled={!hasSelection}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scope === 'selection' ? '#cae39f' : 'transparent',
                  color:
                    scope === 'selection'
                      ? '#121e09'
                      : hasSelection
                        ? '#ffffff'
                        : 'rgba(255, 255, 255, 0.35)',
                  fontFamily: appleFont,
                  fontWeight: 600,
                  fontSize: '12px',
                  letterSpacing: '-0.01em',
                  cursor: hasSelection ? 'pointer' : 'not-allowed',
                  transition: 'all 0.16s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow:
                    scope === 'selection'
                      ? '0 1px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : 'none',
                }}
              >
                <Layers size={14} /> Selected ({selectedShapes.length})
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scope === 'all' ? '#cae39f' : 'transparent',
                  color: scope === 'all' ? '#121e09' : '#ffffff',
                  fontFamily: appleFont,
                  fontWeight: 600,
                  fontSize: '12px',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow:
                    scope === 'all'
                      ? '0 1px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : 'none',
                }}
              >
                <Maximize2 size={14} /> Entire Drawing ({shapes.length})
              </button>
            </div>
          </div>

          {/* Right: Export Options & Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* 1. Format Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: appleFont,
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.48)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                Image Format
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {(['png', 'jpeg', 'svg'] as ExportFormat[]).map((fmt) => {
                  const isActive = format === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isActive
                          ? 'rgba(202, 227, 159, 0.22)'
                          : 'transparent',
                        color: isActive ? '#cae39f' : 'rgba(255, 255, 255, 0.75)',
                        fontFamily: appleFont,
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '12px',
                        letterSpacing: '-0.01em',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive
                          ? '0 1px 4px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(202, 227, 159, 0.45)'
                          : 'none',
                      }}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Scale / Resolution (1x, 2x, 3x) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: appleFont,
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.48)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                Resolution / Quality
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {[
                  { value: 1, label: '1x (Standard)' },
                  { value: 2, label: '2x (Retina)' },
                  { value: 3, label: '3x (Ultra 4K)' },
                ].map((s) => {
                  const isActive = scale === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setScale(s.value)}
                      style={{
                        padding: '7px 4px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isActive
                          ? 'rgba(202, 227, 159, 0.22)'
                          : 'transparent',
                        color: isActive ? '#cae39f' : 'rgba(255, 255, 255, 0.75)',
                        fontFamily: appleFont,
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '11.5px',
                        letterSpacing: '-0.01em',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive
                          ? '0 1px 4px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(202, 227, 159, 0.45)'
                          : 'none',
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Background Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: appleFont,
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.48)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                Background
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.28)',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {[
                  {
                    id: 'transparent',
                    label: 'Transparent',
                    icon: <Sparkles size={12} />,
                    disabled: format === 'jpeg',
                  },
                  { id: 'dark', label: 'Dark Mode', icon: <Moon size={12} />, disabled: false },
                  { id: 'white', label: 'White', icon: <Sun size={12} />, disabled: false },
                ].map((bg) => {
                  const isActive = bgOption === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgOption(bg.id as ExportBackground)}
                      disabled={bg.disabled}
                      style={{
                        padding: '7px 4px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isActive
                          ? 'rgba(202, 227, 159, 0.22)'
                          : 'transparent',
                        color: isActive
                          ? '#cae39f'
                          : bg.disabled
                            ? 'rgba(255, 255, 255, 0.25)'
                            : 'rgba(255, 255, 255, 0.75)',
                        fontFamily: appleFont,
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '11.5px',
                        letterSpacing: '-0.01em',
                        cursor: bg.disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive
                          ? '0 1px 4px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(202, 227, 159, 0.45)'
                          : 'none',
                      }}
                    >
                      {bg.icon}
                      {bg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: macOS Native Apple Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleDownload}
                disabled={targetShapes.length === 0 || isExporting}
                style={{
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#cae39f',
                  color: '#142109',
                  fontFamily: appleFont,
                  fontWeight: 650,
                  fontSize: '13px',
                  letterSpacing: '-0.015em',
                  cursor: targetShapes.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow:
                    '0 3px 14px rgba(202, 227, 159, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (targetShapes.length > 0) {
                    e.currentTarget.style.backgroundColor = '#d8f0ae';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#cae39f';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download size={15} />
                Download {format.toUpperCase()} Image
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  disabled={targetShapes.length === 0 || isExporting}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(16px)',
                    color: '#ffffff',
                    fontFamily: appleFont,
                    fontWeight: 500,
                    fontSize: '12.5px',
                    letterSpacing: '-0.01em',
                    cursor: targetShapes.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow:
                      '0 1px 3px rgba(0, 0, 0, 0.2), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (targetShapes.length > 0) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {copiedToast ? (
                    <>
                      <Check size={15} color="#cae39f" />
                      <span style={{ color: '#cae39f', fontWeight: 600 }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      Copy PNG
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontFamily: appleFont,
                    fontWeight: 500,
                    fontSize: '12.5px',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Apple macOS Sub-footer) */}
        <div
          style={{
            padding: '9px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 14, 24, 0.45)',
            fontSize: '11px',
            fontFamily: appleFont,
            color: 'rgba(255, 255, 255, 0.48)',
            letterSpacing: '-0.005em',
          }}
        >
          <span>Tip: You can select any diagram on canvas and press ⌘⇧E to export instantly.</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {targetShapes.length} element{targetShapes.length !== 1 ? 's' : ''} ready
          </span>
        </div>
      </div>
    </div>
  );
}
