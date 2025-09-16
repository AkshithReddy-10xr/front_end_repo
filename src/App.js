import React from "react";
import ChatInterface from "./components/Chat/ChatInterface";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import { APP_CONFIG } from "./utils/constants";
import "./App.scss";

function App() {
  const handleError = (error, errorInfo) => {
    // Log error to external service if needed
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  };

  const handleOffline = () => {
    console.warn("App went offline");
  };

  const handleOnline = () => {
    console.log("App back online");
  };

  // Add online/offline listeners
  React.useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div className="app">
      <ErrorBoundary
        onError={handleError}
        fallbackMessage="The chat application encountered an error. Please refresh the page to continue."
      >
        <ChatInterface />
      </ErrorBoundary>

      {/* App version info for development */}
      {process.env.NODE_ENV === "development" && (
        <div className="app-debug">
          <small>
            {APP_CONFIG.NAME} v{APP_CONFIG.VERSION}
          </small>
        </div>
      )}
    </div>
  );
}

export default App;
