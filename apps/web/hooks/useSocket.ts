import { useEffect, useState } from "react";

const WS_URL = "ws://localhost:8080";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Get token from localStorage (if authenticated)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setLoading(false);
      setSocket(ws);
    };

    return () => {
      ws.close();
    };
  }, []);

  return {
    socket,
    loading,
  };
}
