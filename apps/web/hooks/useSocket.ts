'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Shape, WSIncomingMessage } from '../lib/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

interface UseSocketProps {
  roomId: string | number;
  token?: string | null;
  onIncomingShape?: (shape: Shape) => void;
}

export function useSocket({ roomId, token, onIncomingShape }: UseSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Store callback in ref to prevent unnecessary reconnects
  const onIncomingShapeRef = useRef(onIncomingShape);
  useEffect(() => {
    onIncomingShapeRef.current = onIncomingShape;
  }, [onIncomingShape]);

  useEffect(() => {
    if (!token || !roomId) {
      setIsConnected(false);
      return;
    }

    const wsUrl = `${WS_BASE_URL}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);

      // Join the specified room
      ws.send(
        JSON.stringify({
          type: 'join_room',
          roomId: String(roomId),
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSIncomingMessage;
        if (data.type === 'chat' && data.message) {
          // Parse the shape coordinates JSON from the chat message
          const parsedShape = JSON.parse(data.message) as Shape;
          if (parsedShape && parsedShape.type && onIncomingShapeRef.current) {
            onIncomingShapeRef.current(parsedShape);
          }
        }
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'leave_room',
            roomId: String(roomId),
          })
        );
      }
      ws.close();
      socketRef.current = null;
    };
  }, [roomId, token]);

  // Send a drawn shape to the room over WebSocket
  const sendShape = useCallback(
    (shape: Shape) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat',
            roomId: Number(roomId),
            message: JSON.stringify(shape), // Coordinate data saved in chat message
          })
        );
      }
    },
    [roomId]
  );

  return {
    isConnected,
    sendShape,
  };
}
