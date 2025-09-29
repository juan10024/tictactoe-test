// frontend/src/services/websocketService.ts
import { useEffect, useRef } from 'react';

type WebSocketMessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string | null = null;
  private messageHandlers: WebSocketMessageHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  connect(url: string) {
    if (this.ws) {
      this.disconnect();
    }

    this.url = url;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    this.ws.onclose = (event) => {
      console.log('Disconnected from WebSocket:', event.code, event.reason);
      if (event.code !== 1000) { // 1000 = normal closure
        this.reconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      this.reconnectTimeout = setTimeout(() => {
        if (this.url) {
          this.connect(this.url);
        }
      }, 2000); 
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  addMessageHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

export const wsService = new WebSocketService();

// Hook para usar el servicio de WebSocket
export const useWebSocket = (url: string) => {
  const handlerRef = useRef<WebSocketMessageHandler | null>(null);

  const setHandler = (handler: WebSocketMessageHandler) => {
    if (handlerRef.current) {
      wsService.removeMessageHandler(handlerRef.current);
    }
    handlerRef.current = handler;
    wsService.addMessageHandler(handler);
  };

  useEffect(() => {
    wsService.connect(url);

    return () => {
      if (handlerRef.current) {
        wsService.removeMessageHandler(handlerRef.current);
      }
      // No desconectar aquí si no es intencional
    };
  }, [url]);

  return { sendMessage: wsService.sendMessage, setHandler };
};