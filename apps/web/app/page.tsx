'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  ArrowRight,
  Search,
} from 'lucide-react';

// --------------------------------------------------------------------------
// Vector SVGs for Soaring Birds with Red Rectangles
// --------------------------------------------------------------------------
function LeftBird({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.08))',
        transition: 'transform 0.4s ease-out',
        ...style,
      }}
      className={className}
    >
      <svg
        viewBox="0 0 180 180"
        width="140"
        height="140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="24" width="34" height="20" rx="1" fill="#E61E1E" />
        <path
          d="M34 34 C44 26 62 16 86 10 C122 3 162 14 176 34 C148 37 118 48 102 70 C94 80 93 94 95 110 C98 132 110 152 116 168 C98 152 88 132 84 114 C80 96 73 88 62 95 C54 100 48 122 44 150 C41 120 48 94 58 74 C63 64 52 50 34 34 Z"
          fill="#F5F4EE"
          opacity="0.96"
        />
      </svg>
    </div>
  );
}

function RightBird({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.08))',
        transition: 'transform 0.4s ease-out',
        ...style,
      }}
      className={className}
    >
      <svg
        viewBox="0 0 200 130"
        width="160"
        height="105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0" y="26" width="36" height="20" rx="1" fill="#E61E1E" />
        <path
          d="M36 36 C48 30 70 24 96 20 C130 16 172 10 198 0 C178 12 158 24 148 38 C138 52 138 68 140 84 C143 104 148 122 150 128 C134 112 124 90 120 74 C116 58 110 50 98 56 C88 60 82 78 78 100 C76 78 82 58 90 42 C94 36 78 30 36 36 Z"
          fill="#EBECEE"
          opacity="0.94"
        />
      </svg>
    </div>
  );
}

// --------------------------------------------------------------------------
// Organic Jigsaw Puzzle Piece Silhouette Shapes
// --------------------------------------------------------------------------
function PuzzlePiece({
  color,
  variant = 1,
  size = 36,
  rotation = 0,
  style,
}: {
  color: string;
  variant?: 1 | 2 | 3 | 4;
  size?: number;
  rotation?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1.22)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`;
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {variant === 1 && (
          <path d="M 22,22 L 40,22 C 41,12 36,2 50,2 C 64,2 59,12 60,22 L 78,22 L 78,40 C 88,41 98,36 98,50 C 98,64 88,59 78,60 L 78,78 L 60,78 C 59,68 64,58 50,58 C 36,58 41,68 40,78 L 22,78 L 22,60 C 12,59 2,64 2,50 C 2,36 12,41 22,40 Z" />
        )}
        {variant === 2 && (
          <path d="M 22,22 L 40,22 C 41,32 36,42 50,42 C 64,42 59,32 60,22 L 78,22 L 78,40 C 88,41 98,36 98,50 C 98,64 88,59 78,60 L 78,78 L 60,78 C 59,88 64,98 50,98 C 36,98 41,88 40,78 L 22,78 L 22,60 C 32,59 42,64 42,50 C 42,36 32,41 22,40 Z" />
        )}
        {variant === 3 && (
          <path d="M 22,22 L 40,22 C 41,12 36,2 50,2 C 64,2 59,12 60,22 L 78,22 L 78,40 C 68,41 58,36 58,50 C 58,64 68,59 78,60 L 78,78 L 60,78 C 59,88 64,98 50,98 C 36,98 41,88 40,78 L 22,78 L 22,60 C 12,59 2,64 2,50 C 2,36 12,41 22,40 Z" />
        )}
        {variant === 4 && (
          <path d="M 22,22 L 40,22 C 41,12 36,2 50,2 C 64,2 59,12 60,22 L 78,22 L 78,40 C 88,41 98,36 98,50 C 98,64 88,59 78,60 L 78,78 L 60,78 C 59,88 64,98 50,98 C 36,98 41,88 40,78 L 22,78 L 22,60 C 32,59 42,64 42,50 C 42,36 32,41 22,40 Z" />
        )}
      </svg>
    </div>
  );
}


// --------------------------------------------------------------------------
// Pixel Mosaic Tile Overlay
// --------------------------------------------------------------------------
interface PixelTile {
  id: number;
  col: number;
  row: number;
  opacity: number;
  widthMultiplier?: number;
}

const MOSAIC_TILES: PixelTile[] = [
  { id: 1, col: 0, row: 1, opacity: 0.55 },
  { id: 2, col: 0, row: 2, opacity: 0.7 },
  { id: 3, col: 0, row: 3, opacity: 0.8 },
  { id: 4, col: 0, row: 4, opacity: 0.6 },
  { id: 5, col: 1, row: 2, opacity: 0.65 },
  { id: 6, col: 1, row: 3, opacity: 0.85 },
  { id: 7, col: 2, row: 1, opacity: 0.4 },
  { id: 8, col: 2, row: 2, opacity: 0.75 },
  { id: 9, col: 2, row: 4, opacity: 0.8 },
  { id: 10, col: 3, row: 2, opacity: 0.6 },
  { id: 11, col: 3, row: 3, opacity: 0.9 },
  { id: 12, col: 4, row: 0, opacity: 0.4, widthMultiplier: 2 },
  { id: 13, col: 5, row: 2, opacity: 0.8 },
  { id: 14, col: 5, row: 4, opacity: 0.85, widthMultiplier: 2 },
  { id: 15, col: 6, row: 1, opacity: 0.5 },
  { id: 16, col: 6, row: 3, opacity: 0.75 },
  { id: 17, col: 7, row: 2, opacity: 0.85 },
  { id: 18, col: 7, row: 4, opacity: 0.9 },
  { id: 19, col: 8, row: 1, opacity: 0.45 },
  { id: 20, col: 8, row: 3, opacity: 0.7 },
  { id: 21, col: 9, row: 2, opacity: 0.8 },
  { id: 22, col: 9, row: 4, opacity: 0.9 },
  { id: 23, col: 10, row: 1, opacity: 0.5 },
  { id: 24, col: 10, row: 3, opacity: 0.85 },
  { id: 25, col: 11, row: 2, opacity: 0.65 },
  { id: 26, col: 11, row: 4, opacity: 0.75 },
  { id: 27, col: 12, row: 1, opacity: 0.8 },
  { id: 28, col: 12, row: 3, opacity: 0.85 },
  { id: 29, col: 13, row: 2, opacity: 0.7 },
  { id: 30, col: 13, row: 4, opacity: 0.6 },
  { id: 31, col: 14, row: 1, opacity: 0.75 },
  { id: 32, col: 14, row: 2, opacity: 0.9 },
  { id: 33, col: 14, row: 3, opacity: 0.5 },
  { id: 34, col: 15, row: 2, opacity: 0.6 },
  { id: 35, col: 15, row: 4, opacity: 0.8 },
  { id: 36, col: 16, row: 0, opacity: 0.4 },
  { id: 37, col: 16, row: 3, opacity: 0.7 },
  { id: 38, col: 16, row: 4, opacity: 0.85 },
];

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [roomIdInput, setRoomIdInput] = useState('');

  const handleInstantRoom = () => {
    const randomSlug = Math.random().toString(36).substring(2, 7);
    router.push(`/canvas/${randomSlug}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = roomIdInput.trim();
    if (id) {
      router.push(`/canvas/${id}`);
    } else {
      handleInstantRoom();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        backgroundColor: '#E5E4DE',
        fontFamily:
          '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* ==================================================================== */}
      {/* SECTION 1: EDITORIAL HERO POSTER (PENCILS IN CUP + AUTH HEADER)     */}
      {/* ==================================================================== */}
      <section
        id="editorial-hero-section"
        className="hero-section"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          backgroundImage: `url('/image-copy.png')`,
          backgroundSize: 'auto clamp(420px, 72vh, 660px)',
          backgroundPosition: 'center 46%',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 24px 32px 24px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Top Navigation Bar with Picasso Branding & Auth */}
        <header
          className="hero-header"
          style={{
            position: 'relative',
            zIndex: 50,
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Brand Official Logo & Title */}
          <div
            className="hero-brand"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            <img
              src="/picasso-logo.png"
              alt="Picasso Official Logo"
              style={{
                height: 'clamp(38px, 3.6vw, 50px)',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                mixBlendMode: 'multiply',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(-3deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}
            />
            <div
              style={{
                fontFamily: "'Cactus Jack Alternate', 'Cactus Jack', var(--font-cactus-jack), cursive, sans-serif",
                fontSize: 'clamp(28px, 3vw, 42px)',
                color: '#111111',
                fontWeight: 400,
                letterSpacing: '0.01em',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.26em', lineHeight: 0.85 }}>P</span>icasso
            </div>
          </div>

          {/* Center Room Quick Jump */}
          <form
            onSubmit={handleJoinRoom}
            className="hero-search-form"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '9999px',
              padding: '4px 6px 4px 14px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Search size={14} style={{ color: 'rgba(0, 0, 0, 0.45)', marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Enter Room Code..."
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#111111',
                width: '140px',
                fontWeight: 500,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#111111',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#111111';
              }}
            >
              Join
            </button>
          </form>

          {/* Right Action / Auth Button */}
          <div className="hero-auth-group">
            {isLoaded && isSignedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleInstantRoom}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  New Board
                </button>
                <UserButton />
              </div>
            ) : isLoaded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SignInButton mode="modal">
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      backgroundColor: 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(10px)',
                      color: '#111111',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
                    }}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <button
                  onClick={handleInstantRoom}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Instant Board
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {/* Center Spatial Stage (Typography Framing) */}
        <div
          className="hero-stage"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1360px',
            minHeight: 'clamp(480px, 68vh, 700px)',
            margin: '0 auto',
            zIndex: 10,
          }}
        >
          {/* ---------------------------------------------------------------- */}
          {/* TOP-LEFT EDITORIAL STATEMENT                                     */}
          {/* ---------------------------------------------------------------- */}
          <div
            className="hero-statement-left"
            style={{
              position: 'absolute',
              top: '4%',
              left: '2%',
              maxWidth: 'clamp(290px, 32vw, 440px)',
              zIndex: 25,
              fontSize: 'clamp(13px, 1.1vw, 15px)',
              lineHeight: 1.6,
              color: '#151515',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              textAlign: 'left',
              letterSpacing: '-0.015em',
              fontWeight: 450,
              textShadow: 'none',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(19px, 2.0vw, 26px)',
                fontWeight: 650,
                letterSpacing: '-0.025em',
                marginBottom: '10px',
                color: '#111111',
              }}
            >
              The Infinite Spatial Matrix
            </div>
            The most intuitive spatial canvas for real-time collaboration. Picasso is built for creators, architects, and product teams who thrive in the open. Every line, shape, and vector stroke updates instantly across every connected screen with zero friction. Free from borders and page limits, your ideas collide, evolve, and come alive in continuous multiplayer flow.
          </div>

          {/* Mobile Illustration (Shown on tablet/phone between statements) */}
          <div className="hero-mobile-image-wrap">
            <img
              src="/image-copy.png"
              alt="Picasso Studio - Hand-drawn colored drawing pencils and pens in studio cup"
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM-RIGHT EDITORIAL STATEMENT                                 */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="hero-statement-right"
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '36px',
            maxWidth: 'clamp(280px, 30vw, 420px)',
            zIndex: 25,
            fontSize: 'clamp(12.5px, 1.0vw, 14.5px)',
            lineHeight: 1.56,
            color: '#151515',
            fontFamily:
              '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            textAlign: 'left',
            letterSpacing: '-0.015em',
            fontWeight: 450,
            textShadow: 'none',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(16px, 1.6vw, 22px)',
              fontWeight: 650,
              letterSpacing: '-0.02em',
              marginBottom: '7px',
              color: '#111111',
            }}
          >
            Ultra-Low Latency Multiplayer
          </div>
          Engineered with a high-throughput WebSocket sync engine and deterministic canvas CRDTs. Every stroke, shape transformation, and cursor movement transmits with sub-millisecond precision. Whether brainstorming with two designers or presenting to a distributed team of hundreds, your shared canvas stays perfectly in sync without lockups or latency.
        </div>

        {/* Bottom Handwritten Editorial Call to Action (No Background, Curly Sketchy Arrow) */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            marginTop: '16px',
            marginBottom: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleInstantRoom}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#111111',
              fontFamily: "'Architects Daughter', 'Patrick Hand', 'Gloria Hallelujah', cursive, sans-serif",
              fontSize: 'clamp(18px, 1.8vw, 24px)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06) rotate(-1deg)';
              e.currentTarget.style.color = '#E51414';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.color = '#111111';
            }}
          >
            <span>Open Picasso Spatial Canvas</span>
            {/* Playful Curly Hand-drawn SVG Arrow */}
            <svg
              width="46"
              height="28"
              viewBox="0 0 46 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                display: 'inline-block',
                transition: 'transform 0.2s ease',
              }}
            >
              <path d="M 4 20 C 14 26, 22 22, 25 16 C 28 8, 20 5, 17 11 C 14 17, 22 24, 35 13 C 38 10, 42 12, 44 14" />
              <path d="M 36 9 L 44 14 L 40 21" />
            </svg>
          </button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 2: PERSPECTIVES ON INFINITE CREATION (PALETTE & PUZZLE PIECES) */}
      {/* ==================================================================== */}
      <section
        id="perspectives-section"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '60px 20px',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Desktop Artistic Spatial Collage Stage (>= 769px) */}
        <div
          className="perspectives-desktop-stage"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            height: 'clamp(520px, 75vh, 720px)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top-Left Concept Tag */}
          <div
            style={{
              position: 'absolute',
              left: '10%',
              top: '14%',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: 'rgba(20, 20, 20, 0.75)',
              letterSpacing: '-0.01em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Real-Time Sync
          </div>

          {/* Main Phrase Part 1: "Perspectives" */}
          <div
            style={{
              position: 'absolute',
              left: '18%',
              top: '20%',
              fontSize: 'clamp(28px, 4.2vw, 54px)',
              fontWeight: 550,
              color: '#151515',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Perspectives
          </div>

          {/* Far-Right Concept Tag */}
          <div
            style={{
              position: 'absolute',
              left: '76%',
              top: '18%',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: 'rgba(20, 20, 20, 0.75)',
              letterSpacing: '-0.01em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Zero Borders
          </div>

          {/* Main Phrase Part 2: "on" */}
          <div
            style={{
              position: 'absolute',
              left: '64%',
              top: '40%',
              fontSize: 'clamp(24px, 3.4vw, 44px)',
              fontWeight: 500,
              color: '#151515',
              letterSpacing: '-0.02em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            on
          </div>

          {/* Center-Right Concept Tag */}
          <div
            style={{
              position: 'absolute',
              left: '72%',
              top: '48%',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: 'rgba(20, 20, 20, 0.75)',
              letterSpacing: '-0.01em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Multiplayer Flow
          </div>

          {/* Lower-Left Concept Tag */}
          <div
            style={{
              position: 'absolute',
              left: '12%',
              top: '68%',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: 'rgba(20, 20, 20, 0.75)',
              letterSpacing: '-0.01em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Wireframe & Sketch
          </div>

          {/* Main Phrase Part 3: "Infinite Creation" */}
          <div
            style={{
              position: 'absolute',
              left: '36%',
              top: '66%',
              fontSize: 'clamp(30px, 4.8vw, 60px)',
              fontWeight: 600,
              color: '#151515',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Infinite Creation
          </div>

          {/* Lower-Right Concept Tag */}
          <div
            style={{
              position: 'absolute',
              left: '75%',
              top: '72%',
              fontSize: 'clamp(14px, 1.4vw, 17px)',
              fontWeight: 600,
              color: 'rgba(20, 20, 20, 0.75)',
              letterSpacing: '-0.01em',
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Hybrid Vectors
          </div>

          {/* ARTIST PALETTE & BRUSH (FLOATING IN CENTER SPACE) */}
          <div
            style={{
              position: 'absolute',
              left: '48%',
              top: '42%',
              transform: 'translate(-50%, -50%) rotate(-4deg)',
              width: 'clamp(150px, 16vw, 220px)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 8,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <img
              src="/artist-palette.png"
              alt="Artist palette and paint brush - Picasso Studio"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 18px rgba(0, 0, 0, 0.08))',
              }}
            />
          </div>

          {/* SCATTERED COLORED JIGSAW PUZZLE PIECES */}
          <PuzzlePiece color="#F05138" variant={1} size={38} rotation={-6} style={{ left: '42%', top: '8%' }} />
          <PuzzlePiece color="#6E432B" variant={2} size={36} rotation={12} style={{ left: '8%', top: '38%' }} />
          <PuzzlePiece color="#F98825" variant={3} size={38} rotation={-8} style={{ left: '54%', top: '16%' }} />
          <PuzzlePiece color="#2E82E6" variant={4} size={38} rotation={8} style={{ left: '62%', top: '30%' }} />
          <PuzzlePiece color="#9955FF" variant={1} size={38} rotation={15} style={{ left: '88%', top: '14%' }} />
          <PuzzlePiece color="#1A1A1A" variant={2} size={36} rotation={-8} style={{ left: '6%', top: '64%' }} />
          <PuzzlePiece color="#F7A3C4" variant={3} size={36} rotation={5} style={{ left: '22%', top: '56%' }} />
          <PuzzlePiece color="#57D5F2" variant={4} size={38} rotation={-14} style={{ left: '18%', top: '84%' }} />
          <PuzzlePiece color="#FBC425" variant={1} size={38} rotation={10} style={{ left: '83%', top: '52%' }} />
          <PuzzlePiece color="#44C554" variant={2} size={38} rotation={-6} style={{ left: '82%', top: '80%' }} />
        </div>

        {/* Mobile-Optimized Perspectives Stage (<= 768px) */}
        <div className="perspectives-mobile-stage">
          <div
            style={{
              fontSize: '12px',
              fontWeight: 650,
              color: 'rgba(20, 20, 20, 0.7)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            <span>Real-Time Spatial Canvas</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 6.5vw, 42px)',
              fontWeight: 650,
              color: '#151515',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              textAlign: 'center',
              margin: '0',
            }}
          >
            Perspectives on <span style={{ color: '#E51414' }}>Infinite Creation</span>
          </h2>

          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '240px',
              padding: '16px 20px',
              margin: '4px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/artist-palette.png"
              alt="Artist palette - Picasso Studio"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.08))',
              }}
            />
            <PuzzlePiece
              color="#F05138"
              variant={1}
              size={28}
              rotation={-10}
              style={{ top: '2px', left: '2px' }}
            />
            <PuzzlePiece
              color="#2E82E6"
              variant={4}
              size={28}
              rotation={12}
              style={{ top: '6px', right: '4px' }}
            />
            <PuzzlePiece
              color="#44C554"
              variant={2}
              size={28}
              rotation={-6}
              style={{ bottom: '2px', right: '28px' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px 18px',
              width: '100%',
              padding: '0 8px',
              boxSizing: 'border-box',
            }}
          >
            {[
              'Real-Time Sync',
              'Zero Borders',
              'Multiplayer Flow',
              'Wireframe & Sketch',
              'Hybrid Vectors',
            ].map((tag, idx) => (
              <React.Fragment key={tag}>
                {idx > 0 && <span style={{ color: 'rgba(0, 0, 0, 0.25)', fontSize: '12px' }}>•</span>}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#151515',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {tag}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom Editorial Action */}
        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={handleInstantRoom}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '9999px',
              backgroundColor: '#111111',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.opacity = '0.92';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <span>Start Collaborative Canvas</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 3: EDITORIAL RELEASE SCHEDULE (3D PENCILS & COLORFUL ROADMAP) */}
      {/* ==================================================================== */}
      <section
        id="schedule-roadmap-section"
        className="schedule-section"
      >
        {/* Left Half: "Picasso Architectural Pencils" 3D Branded Art */}
        <div className="schedule-pencils-art">
          <img
            src="/picasso-pencils.png"
            alt="Picasso Spatial Canvas - Branded architectural drawing pencils"
            style={{
              maxWidth: '100%',
              maxHeight: '94vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'left bottom',
              display: 'block',
              margin: 0,
              padding: 0,
              filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.08))',
            }}
          />
        </div>

        {/* Top-Right Bold Distressed Headline Block */}
        <div className="schedule-headline-block">
          <div
            style={{
              fontSize: 'clamp(11px, 1.1vw, 15px)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#111111',
              marginBottom: '2px',
            }}
          >
            THE FUTURE OF COLLABORATION :
          </div>
          <div
            style={{
              fontSize: 'clamp(52px, 7vw, 96px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 0.84,
              color: '#111111',
              fontFamily: '"Impact", "Arial Black", "SF Pro Display", -apple-system, sans-serif',
              textTransform: 'uppercase',
              filter: 'contrast(1.2)',
              textShadow: '0 0 1px rgba(0,0,0,0.5)',
            }}
          >
            PICASSO
          </div>
        </div>

        {/* Center Staggered Stepped Horizontal Bars */}
        <div className="schedule-list-wrap">
          {[
            { tag: 'v1.0', title: 'INFINITE SPATIAL MATRIX', subtitle: 'ZERO-LATENCY 2D VIEWPORT', offsetLeft: '28%', color: '#D97706', subColor: 'rgba(217, 119, 6, 0.88)' },
            { tag: 'v1.2', title: 'FREEHAND VECTOR ENGINE', subtitle: 'ADAPTIVE BEZIER SMOOTHING', offsetLeft: '33%', color: '#2563EB', subColor: 'rgba(37, 99, 235, 0.88)' },
            { tag: 'v1.4', title: 'REAL-TIME WEBSOCKET MESH', subtitle: 'HIGH-THROUGHPUT MULTI-CLIENT SYNC', offsetLeft: '30%', color: '#059669', subColor: 'rgba(5, 150, 105, 0.88)' },
            { tag: 'v1.6', title: 'MULTI-CURSOR PRESENCE DOCK', subtitle: 'LIVE USER POSITIONING & CURSORS', offsetLeft: '36%', color: '#EA580C', subColor: 'rgba(234, 88, 12, 0.88)' },
            { tag: 'v1.8', title: 'INTELLIGENT SHAPE HEURISTICS', subtitle: 'BOXELS, ARROWS & RECTANGLES', offsetLeft: '39%', color: '#7C3AED', subColor: 'rgba(124, 58, 237, 0.88)' },
            { tag: 'v2.0', title: 'CONFLICT-FREE CRDT ENGINE', subtitle: 'DETERMINISTIC MERGE & MUTATION', offsetLeft: '34%', color: '#DB2777', subColor: 'rgba(219, 39, 119, 0.88)' },
            { tag: 'v2.2', title: 'PERSISTENT ROOM TOPOLOGY', subtitle: 'INSTANT ZERO-CONFIG WHITEBOARDS', offsetLeft: '37%', color: '#0891B2', subColor: 'rgba(8, 145, 178, 0.88)' },
            { tag: 'v2.4', title: 'VECTOR HISTORY & TIMELINE', subtitle: 'INSTANT UNDO / REDO BUFFER MATRIX', offsetLeft: '31%', color: '#F59E0B', subColor: 'rgba(245, 158, 11, 0.88)' },
            { tag: 'v2.6', title: 'TRANSLUCENT COLOR GELS', subtitle: 'MULTIPLY HUE OVERLAY PALETTES', offsetLeft: '33%', color: '#65A30D', subColor: 'rgba(101, 163, 13, 0.88)' },
            { tag: 'v2.8', title: 'OFFLINE-FIRST LOCAL STORAGE', subtitle: 'CLIENT CACHING & FAST RECONNECT', offsetLeft: '32%', color: '#4F46E5', subColor: 'rgba(79, 70, 229, 0.88)' },
            { tag: 'v3.0', title: 'LOSSLESS ASSET EXPORTS', subtitle: 'SVG, HIGH-RES PNG & JSON SCHEMAS', offsetLeft: '26%', color: '#DC2626', subColor: 'rgba(220, 38, 38, 0.88)' },
            { tag: 'v3.2', title: 'END-TO-END ENCRYPTED CANVASES', subtitle: 'SECURE PEER TRANSPORT CHANNELS', offsetLeft: '36%', color: '#0D9488', subColor: 'rgba(13, 148, 136, 0.88)' },
            { tag: 'v3.4', title: 'MULTI-VIEW CAMERA FOLLOWING', subtitle: 'SPATIAL ZOOM & COLLAB FOCUS', offsetLeft: '34%', color: '#2563EB', subColor: 'rgba(37, 99, 235, 0.88)' },
            { tag: 'PRO', title: '[ THE FUTURE OF SPATIAL COLLABORATION : PICASSO ]', subtitle: 'NEXT-GEN MULTIPLAYER ENGINE 2.0', offsetLeft: '38%', color: '#E51414', subColor: 'rgba(229, 20, 20, 0.9)', highlight: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className="schedule-row-item"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                height: 'clamp(24px, 3vh, 32px)',
                marginLeft: item.offsetLeft,
                backgroundColor: 'transparent',
                paddingLeft: '0px',
                paddingRight: '24px',
                boxSizing: 'border-box',
                transition: 'transform 0.18s ease, opacity 0.18s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              onClick={handleInstantRoom}
            >
              <div
                className="schedule-row-content"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'clamp(10px, 1.2vw, 18px)',
                  fontFamily:
                    "'Architects Daughter', 'Patrick Hand', 'Gochi Hand', 'Caveat', cursive, sans-serif",
                }}
              >
                {item.tag && (
                  <span
                    style={{
                      fontSize: 'clamp(13px, 1.15vw, 16px)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: item.color,
                      minWidth: 'clamp(36px, 3.4vw, 50px)',
                      fontFamily: "'Architects Daughter', 'Patrick Hand', cursive, sans-serif",
                    }}
                  >
                    {item.tag}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 'clamp(13.5px, 1.25vw, 17px)',
                    fontWeight: item.highlight ? 800 : 700,
                    letterSpacing: '0.03em',
                    color: item.color,
                    textTransform: 'uppercase',
                    fontFamily: "'Architects Daughter', 'Patrick Hand', cursive, sans-serif",
                    textShadow: item.highlight ? `0 0 1px ${item.color}` : 'none',
                  }}
                >
                  {item.title}
                </span>
                {item.subtitle && (
                  <span
                    style={{
                      fontSize: 'clamp(11.5px, 1vw, 14px)',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: item.subColor,
                      textTransform: 'uppercase',
                      marginLeft: '6px',
                      fontFamily: "'Patrick Hand', 'Architects Daughter', cursive, sans-serif",
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom-Right Metadata & Branding */}
        <div className="schedule-meta-block">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '16px',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(11px, 1vw, 13px)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#111111',
              }}
            >
              PICASSO 2.0 // SPECIFICATION
            </span>
            <div
              style={{
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#111111">
                <path d="M12 0L15.5 8.5L24 12L15.5 15.5L12 24L8.5 15.5L0 12L8.5 8.5Z" />
              </svg>
            </div>
          </div>
          <div
            style={{
              fontSize: 'clamp(8.5px, 0.75vw, 10px)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'rgba(20, 20, 20, 0.72)',
              lineHeight: 1.45,
            }}
          >
            <div>® PICASSO RESEARCH LABS. REAL-TIME MULTIPLAYER SPATIAL CANVASES.</div>
            <div>POWERED BY WEBSOCKETS, DETERMINISTIC CRDTS & VECTOR COMPOSITING.</div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 4: HERO MOSAIC CANVAS (COMMENTED OUT FOR NOW)                */}
      {/* ==================================================================== */}
      {/*
      <section
        id="hero-mosaic-section"
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          backgroundColor: '#E5E4DE',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('/hero-landscape.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 45%',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.04) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        <LeftBird
          style={{
            top: 'clamp(24px, 7vw, 70px)',
            left: 'clamp(16px, 5vw, 65px)',
            zIndex: 10,
          }}
        />

        <RightBird
          style={{
            top: 'clamp(55px, 12vw, 130px)',
            right: 'clamp(20px, 8vw, 110px)',
            zIndex: 10,
          }}
        />

        <main
          style={{
            position: 'relative',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 20px',
            marginTop: 'auto',
            marginBottom: 'auto',
            transform: 'translateY(-10px)',
          }}
        >
          <h1
            style={{
              fontFamily: "'Windraw Aesthetic', var(--font-windraw), serif, sans-serif",
              fontSize: 'clamp(4.2rem, 11vw, 9.6rem)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.0,
              margin: '0 0 14px 0',
              color: '#E51414',
              userSelect: 'none',
              textShadow: 'none',
            }}
          >
            Picasso.
          </h1>

          <p
            style={{
              fontFamily:
                '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontSize: 'clamp(15px, 2vw, 18px)',
              fontWeight: 450,
              lineHeight: 1.5,
              letterSpacing: '-0.015em',
              color: 'rgba(25, 25, 25, 0.76)',
              maxWidth: '520px',
              margin: '0 0 22px 0',
              userSelect: 'none',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            A real-time infinite spatial canvas to sketch, wireframe, and collaborate seamlessly with anyone.
          </p>

          <div
            onClick={handleInstantRoom}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              marginTop: '8px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <div
              style={{
                position: 'relative',
                filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.12)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.04))',
              }}
            >
              <svg
                width="240"
                height="50"
                viewBox="0 0 240 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <path
                  d="M 25 0
                     C 34 0 41 3.8 45 7.5
                     C 49 11.2 49 11.2 53 7.5
                     C 57 3.8 64 0 73 0
                     L 215 0
                     A 25 25 0 0 1 240 25
                     A 25 25 0 0 1 215 50
                     L 73 50
                     C 64 50 57 46.2 53 42.5
                     C 49 38.8 49 38.8 45 42.5
                     C 41 46.2 34 50 25 50
                     A 25 25 0 0 1 0 25
                     A 25 25 0 0 1 25 0
                     Z"
                  fill="#ffffff"
                  stroke="rgba(0, 0, 0, 0.06)"
                  strokeWidth="1"
                />
              </svg>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  fontFamily:
                    '"SF Pro Display", "SF Pro Text", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111111',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.8 14.8 0 0 1 3.8 10 14.8 14.8 0 0 1-3.8 10 14.8 14.8 0 0 1-3.8-10 14.8 14.8 0 0 1 3.8-10z" />
                      <path d="M2.5 9h19" />
                      <path d="M2.5 15h19" />
                    </svg>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#000000',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    paddingRight: '12px',
                    paddingLeft: '4px',
                  }}
                >
                  <span style={{ color: '#000000' }}>Start Drawing</span>
                  <ArrowRight size={15} style={{ color: '#000000' }} />
                </div>
              </div>
            </div>
          </div>
        </main>

        <div
          style={{
            position: 'relative',
            zIndex: 15,
            width: '100%',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 24px 28px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(17, 1fr)',
              gridTemplateRows: 'repeat(5, 42px)',
              gap: '10px',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            {MOSAIC_TILES.map((tile) => (
              <div
                key={tile.id}
                style={{
                  gridColumn: `${tile.col + 1} / span ${tile.widthMultiplier || 1}`,
                  gridRow: `${tile.row + 1} / span 1`,
                  backgroundColor: `rgba(240, 243, 245, ${tile.opacity})`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '2px',
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'rgba(30, 30, 30, 0.65)',
              paddingTop: '4px',
              pointerEvents: 'auto',
            }}
          >
            <span>Infinite Spatial Whiteboard</span>
            <span>Back to Top ↑</span>
          </div>
        </div>
      </section>
      */}
    </div>
  );
}
