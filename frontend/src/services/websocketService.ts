/*
 * file: websocketService.ts
 * module: services
 * description:
 *    WebSocket connection manager and React hook for real-time communication.
 *    - Manages WebSocket connection lifecycle (connect, disconnect, reconnect)
 *    - Handles sending and receiving messages
 *    - Supports multiple message handlers
 *    - Provides a React hook `useWebSocket` for easier integration with components
 *
 * usage:
 *    import { useWebSocket } from '../services/websocketService'
 *
 *    const { sendMessage, setHandler } = useWebSocket("ws://localhost:8080/ws")
 *
 *    useEffect(() => {
 *       setHandler((data) => {
 *          console.log("Received:", data)
 *       })
 *    }, [])
 */

import { useEffect, useRef } from 'react'

// Types
type WebSocketMessageHandler = (data: any) => void

// WebSocket Service Class

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string | null = null
  private messageHandlers: WebSocketMessageHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: number | null = null

  /**
   * Establish connection to WebSocket server
   * @param url - WebSocket endpoint
   */
  connect(url: string) {
    if (this.ws) {
      this.disconnect()
    }

    this.url = url
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log('Connected to WebSocket')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.messageHandlers.forEach((handler) => handler(data))
      } catch (e) {
        console.error('Error parsing WebSocket message:', e)
      }
    }

    this.ws.onclose = (event) => {
      console.log('Disconnected from WebSocket:', event.code, event.reason)
      if (event.code !== 1000) {
        this.reconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  /** Attempt reconnection with exponential backoff */
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)

      this.reconnectTimeout = setTimeout(() => {
        if (this.url) {
          this.connect(this.url)
        }
      }, 2000)
    }
  }

  /** Gracefully close WebSocket connection */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Send a JSON-encoded message over WebSocket
   * @param message - Any serializable data
   */
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  /** Register a new message handler */
  addMessageHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers.push(handler)
  }

  /** Remove an existing message handler */
  removeMessageHandler(handler: WebSocketMessageHandler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
  }
}

// Export service instance
export const wsService = new WebSocketService()

// React Hook for WebSocket usage

/**
 * Hook to integrate WebSocket service with React components
 * @param url - WebSocket server URL
 * @returns { sendMessage, setHandler }
 *
 * Example:
 *    const { sendMessage, setHandler } = useWebSocket("ws://localhost:8080/ws")
 *
 *    useEffect(() => {
 *       setHandler((data) => console.log(data))
 *    }, [])
 */
export const useWebSocket = (url: string) => {
  const handlerRef = useRef<WebSocketMessageHandler | null>(null)

  const setHandler = (handler: WebSocketMessageHandler) => {
    if (handlerRef.current) {
      wsService.removeMessageHandler(handlerRef.current)
    }
    handlerRef.current = handler
    wsService.addMessageHandler(handler)
  }

  useEffect(() => {
    wsService.connect(url)

    return () => {
      if (handlerRef.current) {
        wsService.removeMessageHandler(handlerRef.current)
      }
   
    }
  }, [url])

  return { sendMessage: wsService.sendMessage.bind(wsService), setHandler }
}
