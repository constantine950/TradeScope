import { useEffect, useRef, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage: (data: unknown) => void;
  enabled?: boolean;
}

export function useWebSocket(
  url: string,
  { onMessage, enabled = true }: UseWebSocketOptions,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WS connected: ${url}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      console.log(`WS disconnected: ${url}, reconnecting in 3s...`);
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (e) => {
      console.error("WS error:", e);
    };
  }, [url, enabled]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
