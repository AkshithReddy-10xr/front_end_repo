import { io } from "socket.io-client";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = new Map();
    this.currentSessionId = null;
  }

  // Connect to WebSocket server
  connect(sessionId = null) {
    const wsUrl = process.env.REACT_APP_WS_URL || "http://localhost:5000";

    this.socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();

    if (sessionId) {
      this.joinSession(sessionId);
    }

    return this.socket;
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connection_status", { connected: true });

      // Rejoin session if we have one
      if (this.currentSessionId) {
        this.joinSession(this.currentSessionId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.isConnected = false;
      this.emit("connection_status", { connected: false, reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnected = false;
      this.reconnectAttempts++;

      this.emit("connection_error", {
        error: error.message,
        attempts: this.reconnectAttempts,
      });

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit("connection_failed", {
          error: "Max reconnection attempts reached",
        });
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("WebSocket reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.emit("reconnected", { attempts: attemptNumber });
    });

    // Chat-specific events
    this.socket.on("typing", (isTyping) => {
      this.emit("typing", isTyping);
    });

    this.socket.on("message_chunk", (data) => {
      this.emit("message_chunk", data);
    });

    this.socket.on("message_complete", (data) => {
      this.emit("message_complete", data);
    });

    this.socket.on("error", (error) => {
      this.emit("error", error);
    });
  }

  // Join a chat session
  joinSession(sessionId) {
    if (!this.socket || !this.isConnected) {
      console.warn("Cannot join session: WebSocket not connected");
      return;
    }

    this.currentSessionId = sessionId;
    this.socket.emit("join_session", sessionId);
    console.log("Joined session:", sessionId);
  }

  // Send a chat message
  sendMessage(message, sessionId) {
    if (!this.socket || !this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    const messageData = {
      sessionId: sessionId || this.currentSessionId,
      message,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("send_message", messageData);
  }

  // Generic event listener registration
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;

    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Emit event to registered listeners
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in event listener:", error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      sessionId: this.currentSessionId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentSessionId = null;
    this.eventListeners.clear();
  }

  // Check if WebSocket is connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Reconnect manually
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

// Create and export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
