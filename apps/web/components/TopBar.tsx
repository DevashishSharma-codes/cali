'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Share2, Check, ArrowLeft, Wifi, WifiOff } from 'lucide-react';

interface TopBarProps {
  roomId: string | number;
  slug?: string;
  isConnected: boolean;
  onExportPNG: () => void;
}

export function TopBar({ roomId, slug, isConnected, onExportPNG }: TopBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="back-link" title="Back to home">
          <ArrowLeft size={18} />
        </Link>
        <div className="brand">
          <span className="brand-logo">✏️</span>
          <h1 className="brand-title">ExcaliDraw</h1>
        </div>
        <div className="room-badge">
          <span className="room-label">Room:</span>
          <span className="room-name">{slug || `Room #${roomId}`}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Real-time Connection Status Indicator */}
        <div className={`status-pill ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? (
            <>
              <Wifi size={14} className="status-icon" />
              <span>Live Sync</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="status-icon" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Share Room Button */}
        <button onClick={handleCopyLink} className="topbar-btn" title="Copy room link">
          {copied ? <Check size={16} className="text-green" /> : <Share2 size={16} />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Export Canvas as Image */}
        <button onClick={onExportPNG} className="topbar-btn primary" title="Download Canvas as Image">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
