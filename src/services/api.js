import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add session ID to requests
apiClient.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("currentSessionId");
  if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Network error
      throw new Error("Network error - please check your connection");
    } else {
      // Other error
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
);

// Chat API endpoints
export const chatAPI = {
  // Send a message and get response
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await apiClient.post("/api/chat", {
        message,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  },

  // Stream a message (for Server-Sent Events)
  streamMessage: async (message, sessionId = null, onChunk = null) => {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId || "",
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (onChunk) {
                onChunk(data);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream message error:", error);
      throw error;
    }
  },
};

// Session API endpoints
export const sessionAPI = {
  // Create new session
  createSession: async () => {
    try {
      const response = await apiClient.post("/api/sessions");
      return response.data.data.sessionId;
    } catch (error) {
      console.error("Create session error:", error);
      throw error;
    }
  },

  // Get session history
  getSessionHistory: async (sessionId) => {
    try {
      const response = await apiClient.get(
        `/api/sessions/${sessionId}/history`
      );
      return response.data.data.messages;
    } catch (error) {
      console.error("Get session history error:", error);
      throw error;
    }
  },

  // Clear session
  clearSession: async (sessionId) => {
    try {
      const response = await apiClient.post(`/api/sessions/${sessionId}/clear`);
      return response.data;
    } catch (error) {
      console.error("Clear session error:", error);
      throw error;
    }
  },

  // Get session stats
  getStats: async () => {
    try {
      const response = await apiClient.get("/api/sessions/stats");
      return response.data.data;
    } catch (error) {
      console.error("Get stats error:", error);
      throw error;
    }
  },
};

// Health check endpoint
export const healthAPI = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get("/api/health");
      return response.data;
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  },

  checkDetailed: async () => {
    try {
      const response = await apiClient.get("/api/health/detailed");
      return response.data;
    } catch (error) {
      console.error("Detailed health check error:", error);
      throw error;
    }
  },
};

// News ingestion endpoints (for admin features)
export const ingestionAPI = {
  ingestNews: async (limit = 10) => {
    try {
      const response = await apiClient.post("/api/ingest/news", { limit });
      return response.data;
    } catch (error) {
      console.error("News ingestion error:", error);
      throw error;
    }
  },

  addArticles: async (articles) => {
    try {
      const response = await apiClient.post("/api/ingest/articles", {
        articles,
      });
      return response.data;
    } catch (error) {
      console.error("Add articles error:", error);
      throw error;
    }
  },

  getIngestionStats: async () => {
    try {
      const response = await apiClient.get("/api/ingest/stats");
      return response.data;
    } catch (error) {
      console.error("Get ingestion stats error:", error);
      throw error;
    }
  },
};

// Utility functions
export const apiUtils = {
  // Generate unique request ID
  generateRequestId: () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format error message for display
  formatError: (error) => {
    if (typeof error === "string") {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return (
      error?.message?.includes("Network error") ||
      error?.message?.includes("ERR_NETWORK") ||
      error?.code === "NETWORK_ERROR"
    );
  },

  // Check if error is server error
  isServerError: (error) => {
    return (
      error?.message?.includes("500") ||
      error?.message?.includes("502") ||
      error?.message?.includes("503")
    );
  },
};

export default apiClient;
