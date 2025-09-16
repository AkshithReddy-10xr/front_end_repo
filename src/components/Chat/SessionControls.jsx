import React, { useState } from "react";
import "./SessionControls.scss";

const SessionControls = ({
  currentSessionId,
  isLoading = false,
  onNewSession,
  onClearSession,
  onExportSession,
  sessionInfo = null,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleNewSession = () => {
    if (sessionInfo?.messageCount > 0) {
      setConfirmAction("new");
      setIsConfirming(true);
    } else {
      onNewSession();
    }
  };

  const handleClearSession = () => {
    if (sessionInfo?.messageCount > 0) {
      setConfirmAction("clear");
      setIsConfirming(true);
    } else {
      onClearSession();
    }
  };

  const handleConfirm = () => {
    if (confirmAction === "new") {
      onNewSession();
    } else if (confirmAction === "clear") {
      onClearSession();
    }
    setIsConfirming(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setConfirmAction(null);
  };

  const formatSessionId = (sessionId) => {
    if (!sessionId) return "No session";
    return sessionId.replace("session:", "").substring(0, 8) + "...";
  };

  const formatMessageCount = (count) => {
    if (count === 0) return "No messages";
    if (count === 1) return "1 message";
    return `${count} messages`;
  };

  if (isConfirming) {
    return (
      <div className="session-controls session-controls--confirming">
        <div className="confirm-dialog">
          <div className="confirm-message">
            {confirmAction === "new" && (
              <>
                <h4>Start New Conversation?</h4>
                <p>
                  This will start a fresh conversation. Your current chat
                  history will be preserved in the previous session.
                </p>
              </>
            )}
            {confirmAction === "clear" && (
              <>
                <h4>Clear Conversation?</h4>
                <p>
                  This will permanently delete all messages in the current
                  conversation. This action cannot be undone.
                </p>
              </>
            )}
          </div>
          <div className="confirm-actions">
            <button
              onClick={handleCancel}
              className="btn btn--secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`btn ${
                confirmAction === "clear" ? "btn--danger" : "btn--primary"
              }`}
              disabled={isLoading}
            >
              {confirmAction === "new" ? "Start New" : "Clear All"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-controls">
      <div className="session-info">
        <div className="session-details">
          <div className="session-id">
            <span className="label">Session:</span>
            <span className="value">{formatSessionId(currentSessionId)}</span>
          </div>
          {sessionInfo && (
            <div className="session-stats">
              <span className="message-count">
                {formatMessageCount(sessionInfo.messageCount)}
              </span>
              {sessionInfo.lastActivity && (
                <span className="last-activity">
                  Last:{" "}
                  {new Date(sessionInfo.lastActivity).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="session-actions">
        <button
          onClick={handleNewSession}
          disabled={isLoading}
          className="btn btn--primary btn--sm"
          title="Start a new conversation"
          aria-label="Start new conversation"
        >
          <span className="btn-icon">🆕</span>
          <span className="btn-text">New Chat</span>
        </button>

        <button
          onClick={handleClearSession}
          disabled={isLoading || !sessionInfo?.messageCount}
          className="btn btn--secondary btn--sm"
          title="Clear current conversation"
          aria-label="Clear conversation"
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Clear</span>
        </button>

        {onExportSession && (
          <button
            onClick={onExportSession}
            disabled={isLoading || !sessionInfo?.messageCount}
            className="btn btn--secondary btn--sm"
            title="Export conversation"
            aria-label="Export conversation"
          >
            <span className="btn-icon">💾</span>
            <span className="btn-text">Export</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="session-loading">
          <div className="loading-spinner"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default SessionControls;
