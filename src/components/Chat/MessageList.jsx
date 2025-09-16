import React, { useEffect, useRef, useCallback, memo } from "react";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "../UI/LoadingSpinner";
import { DEFAULT_MESSAGES, UI_CONFIG } from "../../utils/constants";
import "./MessageList.scss";

const MessageList = memo(
  ({
    messages = [],
    isLoading = false,
    isTyping = false,
    onRetryMessage = null,
    autoScroll = true,
    showTimestamps = false,
    emptyMessage = DEFAULT_MESSAGES.NO_MESSAGES,
  }) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const lastMessageRef = useRef(null);

    // Scroll to bottom function
    const scrollToBottom = useCallback(
      (behavior = "smooth") => {
        if (messagesEndRef.current && autoScroll) {
          messagesEndRef.current.scrollIntoView({
            behavior: behavior,
            block: "end",
          });
        }
      },
      [autoScroll]
    );

    // Scroll to bottom when new messages arrive
    useEffect(() => {
      if (messages.length > 0) {
        // Use immediate scroll for first message, smooth for subsequent
        const behavior = messages.length === 1 ? "auto" : "smooth";

        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(() => {
          scrollToBottom(behavior);
        }, 50);

        return () => clearTimeout(timeoutId);
      }
    }, [messages.length, scrollToBottom]);

    // Scroll when typing indicator appears
    useEffect(() => {
      if (isTyping) {
        setTimeout(() => scrollToBottom(), 100);
      }
    }, [isTyping, scrollToBottom]);

    // Handle manual scroll and auto-scroll control
    const handleScroll = useCallback(() => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Update auto-scroll based on user position
      // This could be used to disable auto-scroll when user manually scrolls up
      if (!isNearBottom && autoScroll) {
        // User scrolled up, could disable auto-scroll here if desired
      }
    }, [autoScroll]);

    // Retry message handler
    const handleRetryMessage = useCallback(
      (message) => {
        if (onRetryMessage) {
          onRetryMessage(message);
        }
      },
      [onRetryMessage]
    );

    // Render typing indicator
    const renderTypingIndicator = () => {
      if (!isTyping) return null;

      return (
        <div className="typing-indicator">
          <div className="typing-bubble">
            <div className="typing-avatar">
              <span
                className="avatar-icon"
                role="img"
                aria-label="AI Assistant"
              >
                🤖
              </span>
            </div>
            <div className="typing-content">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span className="typing-text">AI is thinking...</span>
            </div>
          </div>
        </div>
      );
    };

    // Render empty state
    const renderEmptyState = () => (
      <div className="messages-empty">
        <div className="empty-icon">💬</div>
        <p className="empty-message">{emptyMessage}</p>
        <p className="empty-hint">
          Ask me anything about recent news and developments!
        </p>
      </div>
    );

    // Render loading state
    const renderLoadingState = () => (
      <div className="messages-loading">
        <LoadingSpinner size="large" message="Loading conversation..." />
      </div>
    );

    // Group messages by date for better organization
    const groupMessagesByDate = (messages) => {
      const groups = {};

      messages.forEach((message) => {
        const date = new Date(message.timestamp).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      });

      return groups;
    };

    // Render date separator
    const renderDateSeparator = (date) => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let displayDate;
      if (date === today) {
        displayDate = "Today";
      } else if (date === yesterday) {
        displayDate = "Yesterday";
      } else {
        displayDate = new Date(date).toLocaleDateString();
      }

      return (
        <div key={date} className="date-separator">
          <span className="date-text">{displayDate}</span>
        </div>
      );
    };

    // Main render
    if (isLoading && messages.length === 0) {
      return (
        <div className="message-list message-list--loading">
          {renderLoadingState()}
        </div>
      );
    }

    if (messages.length === 0 && !isTyping) {
      return (
        <div className="message-list message-list--empty">
          {renderEmptyState()}
        </div>
      );
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
      <div className="message-list" ref={containerRef} onScroll={handleScroll}>
        <div className="messages-content">
          {Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              {showTimestamps && renderDateSeparator(date)}

              {dayMessages.map((message, index) => (
                <MessageBubble
                  key={message.id || `msg-${index}`}
                  message={message}
                  isLast={index === dayMessages.length - 1}
                  showTimestamp={showTimestamps}
                  onRetry={handleRetryMessage}
                  ref={index === dayMessages.length - 1 ? lastMessageRef : null}
                />
              ))}
            </div>
          ))}

          {renderTypingIndicator()}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="messages-end" />
        </div>

        {/* Scroll to bottom button (if needed) */}
        {!autoScroll && (
          <button
            className="scroll-to-bottom"
            onClick={() => scrollToBottom()}
            aria-label="Scroll to bottom"
            type="button"
          >
            ⬇️
          </button>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
