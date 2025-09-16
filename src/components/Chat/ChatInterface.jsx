import React, { useEffect, useState, useCallback } from "react";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import SessionControls from "./SessionControls";
import LoadingSpinner from "../UI/LoadingSpinner";
import { useChat } from "../../hooks/useChat";
import { useSession } from "../../hooks/useSession";
import {
  DEFAULT_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "../../utils/constants";
import "./ChatInterface.scss";

const ChatInterface = () => {
  const {
    currentSessionId,
    isCreatingSession,
    createNewSession,
    startNewSession,
    clearCurrentSession,
    getSessionInfo,
    exportSessionData,
    error: sessionError,
  } = useSession();

  const {
    messages,
    currentMessage,
    isLoading,
    isTyping,
    chatState,
    error: chatError,
    isWebSocketConnected,
    sendMessage,
    retryMessage,
    clearError,
    clearMessages,
    addSystemMessage,
    setCurrentMessage,
    canSendMessage,
    isActive,
  } = useChat(currentSessionId);

  const [showWelcome, setShowWelcome] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Handle initial welcome message
  useEffect(() => {
    if (currentSessionId && messages.length === 0 && showWelcome) {
      const timer = setTimeout(() => {
        addSystemMessage(DEFAULT_MESSAGES.WELCOME);
        setShowWelcome(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSessionId, messages.length, showWelcome, addSystemMessage]);

  // Handle connection status
  useEffect(() => {
    if (currentSessionId) {
      setConnectionStatus(isWebSocketConnected ? "connected" : "disconnected");
    } else {
      setConnectionStatus("no_session");
    }
  }, [currentSessionId, isWebSocketConnected]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (message) => {
      try {
        clearError();
        await sendMessage(message);
      } catch (error) {
        console.error("Error sending message:", error);
        addSystemMessage(`Error: ${error.message}`, "error");
      }
    },
    [sendMessage, clearError, addSystemMessage]
  );

  // Handle retry message
  const handleRetryMessage = useCallback(
    async (failedMessage) => {
      try {
        await retryMessage(failedMessage.content);
      } catch (error) {
        console.error("Error retrying message:", error);
        addSystemMessage(`Retry failed: ${error.message}`, "error");
      }
    },
    [retryMessage, addSystemMessage]
  );

  // Handle new session
  const handleNewSession = useCallback(async () => {
    try {
      await startNewSession();
      clearMessages();
      addSystemMessage(SUCCESS_MESSAGES.SESSION_CREATED);
      setShowWelcome(true);
    } catch (error) {
      console.error("Error creating new session:", error);
      addSystemMessage(
        `Failed to create new session: ${error.message}`,
        "error"
      );
    }
  }, [startNewSession, clearMessages, addSystemMessage]);

  // Handle clear session
  const handleClearSession = useCallback(async () => {
    try {
      await clearCurrentSession();
      clearMessages();
      addSystemMessage(SUCCESS_MESSAGES.SESSION_CLEARED);
    } catch (error) {
      console.error("Error clearing session:", error);
      addSystemMessage(`Failed to clear session: ${error.message}`, "error");
    }
  }, [clearCurrentSession, clearMessages, addSystemMessage]);

  // Handle export session
  const handleExportSession = useCallback(() => {
    try {
      const sessionData = exportSessionData();
      const dataStr = JSON.stringify(sessionData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-session-${
        currentSessionId?.replace("session:", "") || "unknown"
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addSystemMessage("Chat session exported successfully");
    } catch (error) {
      console.error("Error exporting session:", error);
      addSystemMessage(`Failed to export session: ${error.message}`, "error");
    }
  }, [exportSessionData, currentSessionId, addSystemMessage]);

  // Get session info for controls
  const sessionInfo = getSessionInfo();

  // Show loading state while creating initial session
  if (isCreatingSession && !currentSessionId) {
    return (
      <div className="chat-interface chat-interface--loading">
        <div className="loading-container">
          <LoadingSpinner size="large" message="Initializing chat..." />
        </div>
      </div>
    );
  }

  // Show error state if critical error
  if (sessionError && !currentSessionId) {
    return (
      <div className="chat-interface chat-interface--error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Session Error</h3>
          <p>{sessionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn--primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`chat-interface ${isActive ? "chat-interface--active" : ""}`}
    >
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h1>RAG News Chatbot</h1>
          <div
            className={`connection-status connection-status--${connectionStatus}`}
          >
            <div className="status-indicator"></div>
            <span className="status-text">
              {connectionStatus === "connected" && "Real-time connected"}
              {connectionStatus === "disconnected" && "Offline mode"}
              {connectionStatus === "checking" && "Connecting..."}
              {connectionStatus === "no_session" && "No session"}
            </span>
          </div>
        </div>

        <SessionControls
          currentSessionId={currentSessionId}
          isLoading={isCreatingSession}
          onNewSession={handleNewSession}
          onClearSession={handleClearSession}
          onExportSession={handleExportSession}
          sessionInfo={sessionInfo}
        />
      </div>

      {/* Messages */}
      <div className="chat-messages">
        <MessageList
          messages={messages}
          isLoading={false}
          isTyping={isTyping}
          onRetryMessage={handleRetryMessage}
          autoScroll={true}
          showTimestamps={false}
        />
      </div>

      {/* Error Display */}
      {(chatError || sessionError) && (
        <div className="chat-error">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{chatError || sessionError}</span>
            <button
              onClick={clearError}
              className="error-close"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input">
        <InputBox
          onSendMessage={handleSendMessage}
          disabled={!canSendMessage || !currentSessionId}
          placeholder={
            !currentSessionId
              ? "Starting session..."
              : !canSendMessage
              ? "Please wait..."
              : "Ask me about recent news and developments..."
          }
          maxLength={500}
          showCharCount={true}
        />
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <small>
          Powered by AI • Session:{" "}
          {currentSessionId
            ? currentSessionId.replace("session:", "").substring(0, 8) + "..."
            : "None"}
        </small>
      </div>
    </div>
  );
};

export default ChatInterface;
