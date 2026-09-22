'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  LogIn,
  UserPlus,
  Layers,
  Zap,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { signinUser, signupUser, createRoom, getRoomBySlug } from '../lib/api';

export default function HomePage() {
  const router = useRouter();

  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Room State
  const [roomSlug, setRoomSlug] = useState('');
  const [joinSlug, setJoinSlug] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Handle Authentication (Sign In or Sign Up)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isLoginMode) {
        res = await signinUser(email, password);
      } else {
        res = await signupUser(email, password, name);
      }

      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId);
        setToken(res.token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Creating a New Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in or register first to create a room.');
      return;
    }

    const slugToUse = roomSlug.trim() || `room-${Math.floor(1000 + Math.random() * 9000)}`;
    setError(null);
    setLoading(true);

    try {
      const res = await createRoom(slugToUse, token);
      router.push(`/canvas/${res.roomId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create room');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Joining an Existing Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = joinSlug.trim();
    if (!query) return;

    setError(null);
    setLoading(true);

    try {
      // If user provided a numeric room ID
      if (!isNaN(Number(query))) {
        router.push(`/canvas/${query}`);
        return;
      }

      // Otherwise look up room by slug
      const room = await getRoomBySlug(query);
      if (room && room.id) {
        router.push(`/canvas/${room.id}`);
      } else {
        setError('Room not found');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not find room');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
  };

  return (
    <div className="landing-container">
      {/* Background Decorative Gradient Blobs */}
      <div className="blob-1" />
      <div className="blob-2" />

      {/* Main Content Card */}
      <div className="landing-card">
        {/* Header Hero */}
        <div className="landing-hero">
          <div className="hero-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>Hand-Drawn Collaborative Canvas</span>
          </div>
          <h1 className="hero-title">
            Excali<span className="gradient-text">Draw</span>
          </h1>
          <p className="hero-desc">
            A real-time whiteboard built with <strong>Rough.js</strong>, React, and WebSockets.
            Sketch ideas, collaborate with others, and synchronize coordinates seamlessly.
          </p>
        </div>

        {/* Error Alert */}
        {error && <div className="alert-error">{error}</div>}

        {/* Authenticated View: Create or Join Room */}
        {token ? (
          <div className="dashboard-grid">
            <div className="auth-status-bar">
              <span>✅ Authenticated Session</span>
              <button onClick={handleLogout} className="text-btn">
                Log Out
              </button>
            </div>

            {/* Create Room Form */}
            <div className="card-section">
              <h2 className="section-title">
                <PlusCircle size={20} className="icon-teal" />
                Create New Whiteboard
              </h2>
              <form onSubmit={handleCreateRoom} className="form-group">
                <input
                  type="text"
                  value={roomSlug}
                  onChange={(e) => setRoomSlug(e.target.value)}
                  placeholder="e.g. system-design, brainstorm-room"
                  className="input-field"
                  minLength={3}
                  maxLength={20}
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Creating...' : 'Create Room'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>

            <div className="section-divider">
              <span>OR</span>
            </div>

            {/* Join Room Form */}
            <div className="card-section">
              <h2 className="section-title">
                <Layers size={20} className="icon-blue" />
                Join Existing Whiteboard
              </h2>
              <form onSubmit={handleJoinRoom} className="form-group">
                <input
                  type="text"
                  value={joinSlug}
                  onChange={(e) => setJoinSlug(e.target.value)}
                  placeholder="Enter room slug or room ID"
                  className="input-field"
                  required
                />
                <button type="submit" disabled={loading} className="btn-secondary">
                  {loading ? 'Joining...' : 'Join Room'}
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Unauthenticated View: Sign In / Sign Up */
          <div className="auth-container">
            <div className="auth-tabs">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setError(null);
                }}
                className={`tab-btn ${isLoginMode ? 'active' : ''}`}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setError(null);
                }}
                className={`tab-btn ${!isLoginMode ? 'active' : ''}`}
              >
                <UserPlus size={16} />
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="auth-form">
              {!isLoginMode && (
                <div className="input-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="input-field with-icon"
                    required
                  />
                </div>
              )}

              <div className="input-wrap">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="input-field with-icon"
                  required
                />
              </div>

              <div className="input-wrap">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="input-field with-icon"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary full-width">
                {loading
                  ? 'Please wait...'
                  : isLoginMode
                    ? 'Sign In to Whiteboard'
                    : 'Create Account & Continue'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div className="features-footer">
          <div className="feature-item">
            <Zap size={16} className="feature-icon" />
            <span>Real-time Rough.js Drawing</span>
          </div>
          <div className="feature-item">
            <Layers size={16} className="feature-icon" />
            <span>Coordinate Sync via WS & DB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
