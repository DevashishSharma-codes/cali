'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, LogIn, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [createSlug, setCreateSlug] = useState('');
  const [joinId, setJoinId] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = createSlug.trim();
    if (id) {
      router.push(`/canvas/${id}`);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = joinId.trim();
    if (id) {
      router.push(`/canvas/${id}`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f12',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(202, 227, 159, 0.12)',
            border: '1px solid rgba(202, 227, 159, 0.3)',
            color: '#cae39f',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} /> Real-time Collaborative Canvas
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '12px' }}>
          <img src="/favicon.svg" alt="Pencil Logo" style={{ width: '48px', height: '48px' }} />
          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #cae39f 60%, #8fb654 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pencil
          </h1>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0, maxWidth: '440px' }}>
          An infinite hand-drawn whiteboard to sketch, collaborate, and create together in real time.
        </p>
      </div>

      {/* Action Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '740px',
        }}
      >
        {/* Create Room Card */}
        <div
          style={{
            background: 'rgba(23, 23, 28, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(202, 227, 159, 0.15)',
                color: '#cae39f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <PlusCircle size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px 0', color: '#f8fafc' }}>
              Create Room
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              Enter a Room ID to start a new canvas session.
            </p>
          </div>

          <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. 2"
              value={createSlug}
              onChange={(e) => setCreateSlug(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(15, 15, 18, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#cae39f',
                color: '#16220b',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b8d689';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#cae39f';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Enter Room</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Join Room Card */}
        <div
          style={{
            background: 'rgba(23, 23, 28, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#cae39f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <LogIn size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px 0', color: '#f8fafc' }}>
              Join Room
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              Enter an existing Room ID to join your team.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. 2"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(15, 15, 18, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(202, 227, 159, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(202, 227, 159, 0.4)';
                e.currentTarget.style.color = '#cae39f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = '#ffffff';
              }}
            >
              <span>Join Room</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
