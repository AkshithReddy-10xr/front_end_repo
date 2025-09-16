import { useState, useEffect, useCallback } from "react";
import { sessionAPI } from "../services/api";
import { STORAGE_KEYS, ERROR_MESSAGES } from "../utils/constants";

export const useSession = () => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (savedSessionId && savedSessionId !== "null") {
      setCurrentSessionId(savedSessionId);
      loadSessionHistory(savedSessionId);
    } else {
      // Create new session if none exists
      createNewSession();
    }
  }, []);

  // Save current session to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }, [currentSessionId]);

  // Create a new session
  const createNewSession = useCallback(async () => {
    try {
      setIsCreatingSession(true);
      setError(null);

      const newSessionId = await sessionAPI.createSession();
      setCurrentSessionId(newSessionId);
      setSessionHistory([]);

      console.log("New session created:", newSessionId);
      return newSessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      setError(error.message || ERROR_MESSAGES.SERVER);
      throw error;
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  // Load session history
  const loadSessionHistory = useCallback(async (sessionId) => {
    if (!sessionId) return;

    try {
      setIsLoadingHistory(true);
      setError(null);

      const history = await sessionAPI.getSessionHistory(sessionId);
      setSessionHistory(history || []);

      console.log(
        `Loaded ${history?.length || 0} messages for session:`,
        sessionId
      );
    } catch (error) {
      console.error("Error loading session history:", error);
      // Don't set error for history loading failure - session can still work
      setSessionHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Clear current session
  const clearCurrentSession = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      setIsClearingSession(true);
      setError(null);

      await sessionAPI.clearSession(currentSessionId);
      setSessionHistory([]);

      console.log("Session cleared:", currentSessionId);
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      setError(error.message || ERROR_MESSAGES.SERVER);
      return false;
    } finally {
      setIsClearingSession(false);
    }
  }, [currentSessionId]);

  // Start a new session (clear current and create new)
  const startNewSession = useCallback(async () => {
    try {
      // Clear current session if exists
      if (currentSessionId) {
        await clearCurrentSession();
      }

      // Create new session
      const newSessionId = await createNewSession();
      return newSessionId;
    } catch (error) {
      console.error("Error starting new session:", error);
      setError(error.message || ERROR_MESSAGES.SERVER);
      throw error;
    }
  }, [currentSessionId, clearCurrentSession, createNewSession]);

  // Load session statistics
  const loadSessionStats = useCallback(async () => {
    try {
      const stats = await sessionAPI.getStats();
      setSessionStats(stats);
      return stats;
    } catch (error) {
      console.error("Error loading session stats:", error);
      return null;
    }
  }, []);

  // Refresh current session data
  const refreshSession = useCallback(async () => {
    if (currentSessionId) {
      await Promise.all([
        loadSessionHistory(currentSessionId),
        loadSessionStats(),
      ]);
    }
  }, [currentSessionId, loadSessionHistory, loadSessionStats]);

  // Check if session exists and is valid
  const validateSession = useCallback(async (sessionId) => {
    try {
      await sessionAPI.getSessionHistory(sessionId);
      return true;
    } catch (error) {
      console.warn("Session validation failed:", error.message);
      return false;
    }
  }, []);

  // Get session info
  const getSessionInfo = useCallback(() => {
    return {
      sessionId: currentSessionId,
      messageCount: sessionHistory.length,
      isValid: Boolean(currentSessionId),
      lastActivity:
        sessionHistory.length > 0
          ? sessionHistory[sessionHistory.length - 1].timestamp
          : null,
      createdAt: sessionHistory.length > 0 ? sessionHistory[0].timestamp : null,
    };
  }, [currentSessionId, sessionHistory]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup session data
  const cleanupSession = useCallback(() => {
    setCurrentSessionId(null);
    setSessionHistory([]);
    setSessionStats(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }, []);

  // Export session data (for backup/sharing)
  const exportSessionData = useCallback(() => {
    return {
      sessionId: currentSessionId,
      history: sessionHistory,
      stats: sessionStats,
      exportedAt: new Date().toISOString(),
    };
  }, [currentSessionId, sessionHistory, sessionStats]);

  // Import session data (from backup/sharing)
  const importSessionData = useCallback((sessionData) => {
    if (sessionData.sessionId) {
      setCurrentSessionId(sessionData.sessionId);
      setSessionHistory(sessionData.history || []);
      setSessionStats(sessionData.stats || null);
    }
  }, []);

  return {
    // State
    currentSessionId,
    sessionHistory,
    isCreatingSession,
    isClearingSession,
    isLoadingHistory,
    error,
    sessionStats,

    // Actions
    createNewSession,
    startNewSession,
    clearCurrentSession,
    loadSessionHistory,
    loadSessionStats,
    refreshSession,
    validateSession,
    clearError,
    cleanupSession,

    // Utilities
    getSessionInfo,
    exportSessionData,
    importSessionData,

    // Status checks
    hasValidSession: Boolean(currentSessionId),
    hasHistory: sessionHistory.length > 0,
    isLoading: isCreatingSession || isClearingSession || isLoadingHistory,
  };
};
