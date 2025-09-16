import { useState, useEffect, useCallback, useRef } from "react";
import { chatAPI } from "../services/api";
import websocketService from "../services/websocket";
import { MESSAGE_TYPES, CHAT_STATES, ERROR_MESSAGES } from "../utils/constants";

export const useChat = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState(CHAT_STATES.IDLE);
  const [error, setError] = useState(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const streamingMessageRef = useRef("");
  const typingTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Initialize WebSocket connection
  useEffect(() => {
    if (sessionId) {
      websocketService.connect(sessionId);

      // Set up WebSocket event listeners
      const handleConnectionStatus = ({ connected }) => {
        setIsWebSocketConnected(connected);
        if (connected) {
          setError(null);
          retryCountRef.current = 0;
        }
      };

      const handleTyping = (isTypingNow) => {
        setIsTyping(isTypingNow);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator if no response
        if (isTypingNow) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 10000);
        }
      };

      const handleMessageChunk = (data) => {
        streamingMessageRef.current += data.chunk || "";

        // Update the last message (assistant message) with streaming content
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage && lastMessage.type === MESSAGE_TYPES.ASSISTANT) {
            updated[updated.length - 1] = {
              ...lastMessage,
              content: streamingMessageRef.current,
              isStreaming: !data.isComplete,
              timestamp: data.timestamp || new Date().toISOString(),
            };
          } else {
            // Create new assistant message
            updated.push({
              id: `msg_${Date.now()}`,
              type: MESSAGE_TYPES.ASSISTANT,
              content: streamingMessageRef.current,
              isStreaming: !data.isComplete,
              timestamp: data.timestamp || new Date().toISOString(),
              metadata: data.metadata || {},
            });
          }

          return updated;
        });

        if (data.isComplete) {
          streamingMessageRef.current = "";
          setIsTyping(false);
          setChatState(CHAT_STATES.IDLE);
        }
      };

      const handleMessageComplete = (data) => {
        streamingMessageRef.current = "";
        setIsTyping(false);
        setChatState(CHAT_STATES.IDLE);

        // Ensure final message is marked as complete
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];

          if (lastMessage && lastMessage.type === MESSAGE_TYPES.ASSISTANT) {
            updated[updated.length - 1] = {
              ...lastMessage,
              content: data.fullResponse || lastMessage.content,
              isStreaming: false,
              timestamp: data.timestamp || new Date().toISOString(),
            };
          }

          return updated;
        });
      };

      const handleError = (error) => {
        console.error("WebSocket error:", error);
        setError(error.message || ERROR_MESSAGES.WEBSOCKET_ERROR);
        setIsTyping(false);
        setChatState(CHAT_STATES.ERROR);
        streamingMessageRef.current = "";
      };

      const handleConnectionError = ({ attempts }) => {
        setError(`Connection error (attempt ${attempts}/${maxRetries})`);
      };

      const handleConnectionFailed = () => {
        setError(ERROR_MESSAGES.WEBSOCKET_ERROR);
        setChatState(CHAT_STATES.ERROR);
      };

      // Register event listeners
      websocketService.on("connection_status", handleConnectionStatus);
      websocketService.on("typing", handleTyping);
      websocketService.on("message_chunk", handleMessageChunk);
      websocketService.on("message_complete", handleMessageComplete);
      websocketService.on("error", handleError);
      websocketService.on("connection_error", handleConnectionError);
      websocketService.on("connection_failed", handleConnectionFailed);

      // Cleanup
      return () => {
        websocketService.off("connection_status", handleConnectionStatus);
        websocketService.off("typing", handleTyping);
        websocketService.off("message_chunk", handleMessageChunk);
        websocketService.off("message_complete", handleMessageComplete);
        websocketService.off("error", handleError);
        websocketService.off("connection_error", handleConnectionError);
        websocketService.off("connection_failed", handleConnectionFailed);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [sessionId]);

  // Send message via WebSocket (preferred)
  const sendMessageWS = useCallback(
    async (message) => {
      if (!message.trim() || chatState === CHAT_STATES.SENDING) {
        return;
      }

      try {
        setChatState(CHAT_STATES.SENDING);
        setError(null);
        streamingMessageRef.current = "";

        // Add user message immediately
        const userMessage = {
          id: `msg_${Date.now()}_user`,
          type: MESSAGE_TYPES.USER,
          content: message,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send via WebSocket
        websocketService.sendMessage(message, sessionId);

        setChatState(CHAT_STATES.RECEIVING);
        setCurrentMessage("");
      } catch (error) {
        console.error("WebSocket send error:", error);
        setError(error.message);
        setChatState(CHAT_STATES.ERROR);
      }
    },
    [sessionId, chatState]
  );

  // Send message via HTTP API (fallback)
  const sendMessageHTTP = useCallback(
    async (message) => {
      if (!message.trim() || isLoading) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setChatState(CHAT_STATES.SENDING);

        // Add user message
        const userMessage = {
          id: `msg_${Date.now()}_user`,
          type: MESSAGE_TYPES.USER,
          content: message,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send to API
        const response = await chatAPI.sendMessage(message, sessionId);

        // Add assistant response
        const assistantMessage = {
          id: `msg_${Date.now()}_assistant`,
          type: MESSAGE_TYPES.ASSISTANT,
          content: response.data.botResponse,
          timestamp: response.data.timestamp,
          metadata: {
            context: response.data.context || [],
            source: response.data.source || "api",
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentMessage("");
        setChatState(CHAT_STATES.IDLE);
      } catch (error) {
        console.error("HTTP send error:", error);
        setError(error.message);
        setChatState(CHAT_STATES.ERROR);

        // Add error message
        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          type: MESSAGE_TYPES.ERROR,
          content: `Failed to send message: ${error.message}`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  // Main send message function (tries WebSocket first, falls back to HTTP)
  const sendMessage = useCallback(
    async (message) => {
      await sendMessageHTTP(message);
    },
    [sendMessageHTTP]
  );

  // Retry sending message
  const retryMessage = useCallback(
    async (message) => {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        await sendMessage(message);
      } else {
        setError(`Failed to send message after ${maxRetries} attempts`);
      }
    },
    [sendMessage]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setChatState(CHAT_STATES.IDLE);
    retryCountRef.current = 0;
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentMessage("");
    setError(null);
    setChatState(CHAT_STATES.IDLE);
    streamingMessageRef.current = "";
  }, []);

  // Add system message
  const addSystemMessage = useCallback(
    (content, type = MESSAGE_TYPES.SYSTEM) => {
      const systemMessage = {
        id: `msg_${Date.now()}_system`,
        type,
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, systemMessage]);
    },
    []
  );

  // Get chat statistics
  const getChatStats = useCallback(() => {
    return {
      totalMessages: messages.length,
      userMessages: messages.filter((m) => m.type === MESSAGE_TYPES.USER)
        .length,
      assistantMessages: messages.filter(
        (m) => m.type === MESSAGE_TYPES.ASSISTANT
      ).length,
      errorMessages: messages.filter((m) => m.type === MESSAGE_TYPES.ERROR)
        .length,
      isActive: chatState !== CHAT_STATES.IDLE,
      connectionStatus: isWebSocketConnected ? "connected" : "disconnected",
    };
  }, [messages, chatState, isWebSocketConnected]);

  return {
    // State
    messages,
    currentMessage,
    isLoading,
    isTyping,
    chatState,
    error,
    isWebSocketConnected,

    // Actions
    sendMessage,
    retryMessage,
    clearError,
    clearMessages,
    addSystemMessage,
    setCurrentMessage,

    // Utilities
    getChatStats,

    // Status checks
    canSendMessage: chatState === CHAT_STATES.IDLE && !isLoading,
    isActive: chatState !== CHAT_STATES.IDLE || isLoading || isTyping,
  };
};
