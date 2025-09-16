import React, { useEffect, useState, useCallback } from "react";
import MessageList from "./MessageList";
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
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle initial welcome message
  useEffect(() => {
    if (currentSessionId && messages.length === 0 && showWelcome) {
      setShowWelcome(false);
    }
  }, [currentSessionId, messages.length, showWelcome]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || !canSendMessage) return;

    try {
      clearError();
      setInputValue("");
      await sendMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
      addSystemMessage(`Error: ${error.message}`, "error");
    }
  }, [inputValue, canSendMessage, sendMessage, clearError, addSystemMessage]);

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle new session
  const handleNewSession = useCallback(async () => {
    try {
      await startNewSession();
      clearMessages();
      setShowWelcome(true);
      setInputValue("");
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
      setShowWelcome(true);
      setInputValue("");
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

  // Auto-resize textarea
  const adjustTextareaHeight = (textarea) => {
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const sessionInfo = getSessionInfo();

  // Show loading state while creating initial session
  if (isCreatingSession && !currentSessionId) {
    return (
      <div className="chat-interface">
        <div className="loading-container">
          <LoadingSpinner size="large" message="Initializing chat..." />
        </div>
      </div>
    );
  }

  // Show error state if critical error
  if (sessionError && !currentSessionId) {
    return (
      <div className="chat-interface">
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
    <div className="chat-interface">
      {/* Sidebar */}
      <div className={`chat-interface-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>RAG Chat</h2>
        </div>

        <div className="sidebar-actions">
          <button
            className="new-chat-btn"
            onClick={handleNewSession}
            disabled={isLoading}
          >
            <span className="icon">✏️</span>
            New chat
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item">
            <a href="#" className="menu-link">
              <span className="icon">🔍</span>
              Search chats
            </a>
          </li>
          <li className="menu-item">
            <a href="#" className="menu-link">
              <span className="icon">📚</span>
              Library
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="footer-actions">
            <button
              className="footer-btn"
              onClick={handleClearSession}
              disabled={!sessionInfo?.messageCount}
            >
              Clear
            </button>
            <button
              className="footer-btn"
              onClick={handleExportSession}
              disabled={!sessionInfo?.messageCount}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-interface-main">
        {/* Header */}
        <div className="chat-interface-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <button className="model-selector">RAG News Chatbot</button>
        </div>

        {/* Messages */}
        <div className="chat-interface-messages">
          <div className="chat-content">
            {messages.length === 0 ? (
              <div className="chat-content-welcome">
                <h1 className="welcome-title">Ready when you are.</h1>
                <p className="welcome-message">
                  Ask me anything about recent news and developments.
                </p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                isLoading={false}
                isTyping={isTyping}
                onRetryMessage={retryMessage}
                autoScroll={true}
                showTimestamps={false}
              />
            )}
          </div>
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
        <div className="chat-interface-input">
          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything..."
                className="message-input"
                disabled={!canSendMessage || !currentSessionId}
                rows={1}
              />
              <div className="input-actions">
                <button
                  className="action-btn"
                  type="button"
                  aria-label="Attach file"
                >
                  📎
                </button>
                <button
                  className={`action-btn send-btn ${
                    inputValue.trim() ? "active" : ""
                  }`}
                  onClick={handleSendMessage}
                  disabled={
                    !inputValue.trim() || !canSendMessage || !currentSessionId
                  }
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </div>
            <div className="input-hint">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
