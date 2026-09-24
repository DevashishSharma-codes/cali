import { useEffect, useState, useRef } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isUnmounted = false;
    let retryDelay = 2000;

    function connect() {
      if (isUnmounted) return;

      let userId = "";
      if (typeof window !== "undefined") {
        userId = localStorage.getItem("picasso_uid") || "";
        if (!userId) {
          userId = "user_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
          localStorage.setItem("picasso_uid", userId);
        }
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isUnmounted) {
            ws?.close();
            return;
          }
          console.log("[WebSocket] Connected to real-time server:", WS_URL);
          setLoading(false);
          setSocket(ws);
          retryDelay = 2000;
        };

        ws.onclose = () => {
          setSocket(null);
          setLoading(true);
          if (!isUnmounted) {
            console.warn(`[WebSocket] Disconnected from ${WS_URL}. Reconnecting in ${retryDelay / 1000}s...`);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 1.5, 10000);
          }
        };

        ws.onerror = () => {
          // Browser WebSocket error events do not contain error details for security reasons.
          // The onclose event will fire immediately after, triggering reconnection.
          console.warn(`[WebSocket] Could not connect to ${WS_URL}. Ensure the WebSocket server is running.`);
        };
      } catch (e) {
        console.warn("[WebSocket] Exception creating connection:", e);
        if (!isUnmounted) {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 1.5, 10000);
        }
      }
    }

    connect();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    socket,
    loading,
  };
}

