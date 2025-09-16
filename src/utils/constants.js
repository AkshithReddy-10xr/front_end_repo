// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  WS_URL: process.env.REACT_APP_WS_URL || "http://localhost:5000",
  TIMEOUT: 30000,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_APP_NAME || "RAG News Chatbot",
  VERSION: "1.0.0",
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_ITEMS: 100,
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
};

// Message Types
export const MESSAGE_TYPES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  ERROR: "error",
};

// Connection States
export const CONNECTION_STATES = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
};

// Chat States
export const CHAT_STATES = {
  IDLE: "idle",
  TYPING: "typing",
  SENDING: "sending",
  RECEIVING: "receiving",
  ERROR: "error",
};

// Session Storage Keys
export const STORAGE_KEYS = {
  CURRENT_SESSION: "currentSessionId",
  CHAT_HISTORY: "chatHistory",
  USER_PREFERENCES: "userPreferences",
  CONNECTION_STATUS: "connectionStatus",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error - please check your connection",
  SERVER: "Server error - please try again later",
  TIMEOUT: "Request timeout - please try again",
  INVALID_INPUT: "Invalid input - please check your message",
  SESSION_EXPIRED: "Session expired - please start a new conversation",
  MAX_LENGTH: `Message too long - maximum ${APP_CONFIG.MAX_MESSAGE_LENGTH} characters`,
  WEBSOCKET_ERROR: "Real-time connection error",
  GENERIC: "An unexpected error occurred",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: "Message sent successfully",
  SESSION_CREATED: "New conversation started",
  SESSION_CLEARED: "Conversation cleared",
  CONNECTION_RESTORED: "Connection restored",
};

// UI Constants
export const UI_CONFIG = {
  TYPING_INDICATOR_DELAY: 500,
  MESSAGE_ANIMATION_DURATION: 300,
  SCROLL_BEHAVIOR: "smooth",
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,
};

// Theme Constants
export const THEME = {
  COLORS: {
    PRIMARY: "#007bff",
    SECONDARY: "#6c757d",
    SUCCESS: "#28a745",
    WARNING: "#ffc107",
    ERROR: "#dc3545",
    INFO: "#17a2b8",
    LIGHT: "#f8f9fa",
    DARK: "#343a40",
  },
  BREAKPOINTS: {
    MOBILE: "576px",
    TABLET: "768px",
    DESKTOP: "992px",
    LARGE: "1200px",
  },
};

// Chat Configuration
export const CHAT_CONFIG = {
  MESSAGE_CHUNK_DELAY: 50,
  TYPING_INDICATOR_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  STREAM_TIMEOUT: 60000,
  PING_INTERVAL: 30000,
};

// Validation Rules
export const VALIDATION = {
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: APP_CONFIG.MAX_MESSAGE_LENGTH,
    REQUIRED: true,
  },
  SESSION_ID: {
    PATTERN: /^session:[a-f0-9-]{36}$/,
    REQUIRED: false,
  },
};

// Feature Flags
export const FEATURES = {
  WEBSOCKET_ENABLED: false,
  STREAMING_ENABLED: false,
  VOICE_INPUT: false,
  FILE_UPLOAD: false,
  DARK_MODE: false,
  ADMIN_PANEL: false,
};

// Routes/Paths
export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  HISTORY: "/history",
  SETTINGS: "/settings",
  HELP: "/help",
};

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: process.env.NODE_ENV === "development",
  MOCK_DELAY: 1000,
  SIMULATE_ERRORS: false,
  DEBUG_MODE: process.env.NODE_ENV === "development",
};

// Default Messages
export const DEFAULT_MESSAGES = {
  WELCOME:
    "Hello! I'm your AI assistant. Ask me anything about recent news and developments.",
  NO_MESSAGES: "No messages yet. Start a conversation!",
  LOADING: "Loading...",
  CONNECTING: "Connecting...",
  TYPING: "AI is typing...",
  ERROR_FALLBACK: "Something went wrong. Please try again.",
};

// Export all constants as default
export default {
  API_CONFIG,
  APP_CONFIG,
  MESSAGE_TYPES,
  CONNECTION_STATES,
  CHAT_STATES,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONFIG,
  THEME,
  CHAT_CONFIG,
  VALIDATION,
  FEATURES,
  ROUTES,
  DEV_CONFIG,
  DEFAULT_MESSAGES,
};
