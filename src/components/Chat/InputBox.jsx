import React, { useState, useRef, useEffect, useCallback } from "react";
import { APP_CONFIG, VALIDATION, ERROR_MESSAGES } from "../../utils/constants";
import "./InputBox.scss";

const InputBox = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = APP_CONFIG.MAX_MESSAGE_LENGTH,
  showCharCount = true,
}) => {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const submitTimeoutRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max 6 lines approximately
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;

    if (value.length <= maxLength) {
      setMessage(value);
      setError("");
    } else {
      setError(ERROR_MESSAGES.MAX_LENGTH);
    }

    adjustTextareaHeight();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }

    const trimmedMessage = message.trim();

    // Validation
    if (!trimmedMessage) {
      setError("Please enter a message");
      return;
    }

    if (trimmedMessage.length < VALIDATION.MESSAGE.MIN_LENGTH) {
      setError(
        `Message must be at least ${VALIDATION.MESSAGE.MIN_LENGTH} character(s)`
      );
      return;
    }

    if (trimmedMessage.length > VALIDATION.MESSAGE.MAX_LENGTH) {
      setError(ERROR_MESSAGES.MAX_LENGTH);
      return;
    }

    if (disabled) {
      setError("Cannot send message at this time");
      return;
    }

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    // Debounced submit to prevent double-sends
    submitTimeoutRef.current = setTimeout(() => {
      try {
        onSendMessage(trimmedMessage);
        setMessage("");
        setError("");
        adjustTextareaHeight();

        // Focus back on textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } catch (err) {
        setError(err.message || "Failed to send message");
      }
    }, 100);
  };

  // Handle composition events (for IME input)
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Handle paste events
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    const currentLength = message.length;
    const availableSpace = maxLength - currentLength;

    if (pastedText.length > availableSpace) {
      e.preventDefault();
      setError(`Pasted text too long. ${availableSpace} characters remaining.`);
    }
  };

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Calculate character count and status
  const charCount = message.length;
  const remaining = maxLength - charCount;
  const isNearLimit = remaining <= 50;
  const isOverLimit = remaining < 0;

  return (
    <div className={`input-box ${disabled ? "input-box--disabled" : ""}`}>
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPaste={handlePaste}
            placeholder={disabled ? "Please wait..." : placeholder}
            disabled={disabled}
            rows={1}
            className={`message-input ${error ? "message-input--error" : ""}`}
            aria-label="Type your message"
            aria-describedby={error ? "input-error" : undefined}
            maxLength={maxLength + 10} // Allow slight overflow for better UX
          />

          <button
            type="submit"
            disabled={disabled || !message.trim() || isOverLimit}
            className="send-button"
            aria-label="Send message"
          >
            <span className="send-icon">📤</span>
          </button>
        </div>

        {(error || (showCharCount && (isNearLimit || charCount > 0))) && (
          <div className="input-footer">
            {error && (
              <div className="input-error" id="input-error" role="alert">
                {error}
              </div>
            )}

            {showCharCount && !error && (
              <div
                className={`char-count ${
                  isNearLimit ? "char-count--warning" : ""
                } ${isOverLimit ? "char-count--error" : ""}`}
              >
                {charCount}/{maxLength}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Keyboard shortcuts hint */}
      <div className="input-hint">
        <small>Press Enter to send, Shift+Enter for new line</small>
      </div>
    </div>
  );
};

export default InputBox;
