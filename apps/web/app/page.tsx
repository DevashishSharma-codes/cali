'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  Search,
  Calendar,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Plus,
  Compass,
  Zap,
} from 'lucide-react';

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
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#ffffff',
        color: '#111111',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 48px 36px 48px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Top Navbar Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Two-dot mark */}
        <div
          onClick={() => router.push('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3.5px',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
              }}
            />
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#111111',
            }}
          >
            Picasso
          </span>
        </div>

        {/* Center Search / Room Quick Jump */}
        <form
          onSubmit={handleJoinRoom}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f7f7f8',
            border: '1px solid #eeeeef',
            borderRadius: '9999px',
            padding: '7px 16px',
            width: '260px',
          }}
        >
          <Search size={14} style={{ color: '#8e8e93' }} />
          <input
            type="text"
            placeholder="Search or enter room..."
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#111111',
              width: '100%',
            }}
          />
        </form>

        {/* Auth / Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isLoaded && isSignedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleInstantRoom}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <Plus size={14} />
                <span>New Canvas</span>
              </button>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: '32px',
                      height: '32px',
                    },
                  },
                }}
              />
            </div>
          ) : isLoaded ? (
            <>
              <SignInButton mode="modal">
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#111111',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '6px 12px',
                  }}
                >
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: '#111111',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Get started
                </button>
              </SignUpButton>
            </>
          ) : null}
        </div>
      </header>

      {/* Main Hero Section: Left Text + Right Abstract Artwork */}
      <main
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.25fr',
          alignItems: 'center',
          gap: '40px',
          padding: '24px 0',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        {/* Left Column: Editorial Headline & Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '8px',
            maxWidth: '560px',
          }}
        >
          {/* Category Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#111111',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                border: '1.5px solid #111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  backgroundColor: '#111111',
                }}
              />
            </div>
            <span style={{ letterSpacing: '0.02em' }}>Infinite Spatial Whiteboard</span>
          </div>

          {/* Main Large Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 4.8vw, 4.2rem)',
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              margin: '0 0 10px 0',
              color: '#111111',
            }}
          >
            Real-time collaborative canvas
          </h1>

          {/* Sub-headline with Muted Year */}
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.06,
              margin: '0 0 16px 0',
              color: '#111111',
            }}
          >
            Picasso Studio{' '}
            <span
              style={{
                color: '#b0b0b8',
                fontWeight: 300,
              }}
            >
              2026
            </span>
          </h2>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#6e6e73',
              margin: '0 0 28px 0',
              maxWidth: '480px',
            }}
          >
            Sketch ideas, diagram complex system architectures, and create freely with your team on an infinite hand-drawn vector canvas.
          </p>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
              fontSize: '13px',
              color: '#666666',
            }}
          >
            <button
              onClick={handleInstantRoom}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#111111',
                cursor: 'pointer',
              }}
            >
              <span>→</span>
              <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                Open canvas
              </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} style={{ color: '#8e8e93' }} />
              <span>Multiplayer sync</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} style={{ color: '#8e8e93' }} />
              <span>Vector rough.js</span>
            </div>
          </div>
        </div>

        {/* Right Column: Abstract Artwork with Transparent Background */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={handleInstantRoom}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '460px',
              maxHeight: '560px',
              backgroundImage: 'url(/picasso-cutout.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: 'saturate(1.08) contrast(1.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Click to start drawing on Picasso"
          />
        </div>
      </main>

      {/* Bottom Feature Shelf ("Features & Tools") */}
      <footer
        style={{
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: '1px solid #f2f2f4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#111111',
            }}
          >
            <Calendar size={13} />
            <span>Features & Tools</span>
          </div>

          {/* 3 Horizontal Micro Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              width: '100%',
              maxWidth: '960px',
            }}
          >
            {/* Micro Card 1 */}
            <div
              onClick={handleInstantRoom}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>
                  Rough Vector Engine
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                  Hand-drawn strokes and organic physics
                </div>
              </div>
            </div>

            {/* Micro Card 2 */}
            <div
              onClick={handleInstantRoom}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>
                  Multiplayer Sync
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                  Low-latency WebSockets room sharing
                </div>
              </div>
            </div>

            {/* Micro Card 3 */}
            <div
              onClick={handleInstantRoom}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '8px 10px',
                borderRadius: '10px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>
                  Architecture Library
                </div>
                <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                  1,000+ developer icons & assets
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Up/Down Chevrons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingLeft: '20px',
          }}
        >
          <button
            onClick={handleInstantRoom}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid #e5e5ea',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666666',
            }}
            title="Next"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={handleInstantRoom}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid #e5e5ea',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666666',
            }}
            title="Previous"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}
