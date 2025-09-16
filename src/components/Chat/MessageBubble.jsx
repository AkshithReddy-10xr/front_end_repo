import React, { memo } from "react";
import { MESSAGE_TYPES } from "../../utils/constants";
import "./MessageBubble.scss";

const MessageBubble = memo(
  ({ message, isLast = false, showTimestamp = false, onRetry = null }) => {
    const { id, type, content, timestamp, isStreaming, metadata } = message;

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleRetry = () => {
      if (onRetry && type === MESSAGE_TYPES.ERROR) {
        onRetry(message);
      }
    };

    const renderContent = () => {
      if (type === MESSAGE_TYPES.ERROR) {
        return (
          <div className="message-error">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <p>{content}</p>
              {onRetry && (
                <button
                  className="retry-button"
                  onClick={handleRetry}
                  type="button"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        );
      }

      if (type === MESSAGE_TYPES.SYSTEM) {
        return (
          <div className="system-message">
            <div className="system-icon">ℹ️</div>
            <p>{content}</p>
          </div>
        );
      }

      return (
        <div className="message-content">
          <p>{content}</p>
          {isStreaming && (
            <div className="streaming-indicator">
              <span className="cursor">|</span>
            </div>
          )}
          {metadata?.context && metadata.context.length > 0 && (
            <div className="context-sources">
              <details>
                <summary>Sources ({metadata.context.length})</summary>
                <div className="sources-list">
                  {metadata.context.map((ctx, idx) => (
                    <div key={idx} className="source-item">
                      <div className="source-similarity">
                        {Math.round(ctx.similarity * 100)}% match
                      </div>
                      <div className="source-metadata">
                        {ctx.metadata?.source && (
                          <span className="source-name">
                            {ctx.metadata.source}
                          </span>
                        )}
                        {ctx.metadata?.title && (
                          <span className="source-title">
                            {ctx.metadata.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      );
    };

    const getMessageClasses = () => {
      const baseClass = "message-bubble";
      const classes = [baseClass];

      classes.push(`${baseClass}--${type}`);

      if (isLast) {
        classes.push(`${baseClass}--last`);
      }

      if (isStreaming) {
        classes.push(`${baseClass}--streaming`);
      }

      if (type === MESSAGE_TYPES.ERROR) {
        classes.push(`${baseClass}--error`);
      }

      if (type === MESSAGE_TYPES.SYSTEM) {
        classes.push(`${baseClass}--system`);
      }

      return classes.join(" ");
    };

    const getAvatarIcon = () => {
      switch (type) {
        case MESSAGE_TYPES.USER:
          return "👤";
        case MESSAGE_TYPES.ASSISTANT:
          return "🤖";
        case MESSAGE_TYPES.SYSTEM:
          return "ℹ️";
        case MESSAGE_TYPES.ERROR:
          return "⚠️";
        default:
          return "💬";
      }
    };

    const getMessageLabel = () => {
      switch (type) {
        case MESSAGE_TYPES.USER:
          return "You";
        case MESSAGE_TYPES.ASSISTANT:
          return "AI Assistant";
        case MESSAGE_TYPES.SYSTEM:
          return "System";
        case MESSAGE_TYPES.ERROR:
          return "Error";
        default:
          return "Unknown";
      }
    };

    return (
      <div className={getMessageClasses()}>
        <div className="message-avatar">
          <span
            className="avatar-icon"
            role="img"
            aria-label={getMessageLabel()}
          >
            {getAvatarIcon()}
          </span>
        </div>

        <div className="message-body">
          <div className="message-header">
            <span className="message-sender">{getMessageLabel()}</span>
            {showTimestamp && timestamp && (
              <span className="message-timestamp">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>

          {renderContent()}

          {metadata?.source && (
            <div className="message-source">Source: {metadata.source}</div>
          )}
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
