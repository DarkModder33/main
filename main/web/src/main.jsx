import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import RootBoundaryProvider from "./shared/providers/RootBoundaryProvider.jsx";
import { logAIFeedback, logSiteEvent } from "./lib/supabaseClient";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootBoundaryProvider>
      <App />
    </RootBoundaryProvider>
  </React.StrictMode>
);

// Global feedback event handler
if (typeof window !== "undefined") {
  window.addEventListener("openFeedback", async (event) => {
    const symbol = event.detail?.symbol || "unknown";
    // Use a prompt for feedback; fallback for mobile/desktop compatibility
    // Consider replacing with a custom modal for better UX in the future
    const feedback = window.prompt(`Feedback for ${symbol}:`, "");
    if (feedback && feedback.trim()) {
      try {
        await logAIFeedback({
          user_id: null, // Optionally fill with user ID if available
          session_id: null,
          feedback_text: feedback,
          symbol,
          created_at: new Date().toISOString(),
        });
        await logSiteEvent({
          user_id: null, // Optionally fill with user ID if available
          event_type: "scanner_feedback",
          event_data: { symbol, feedback },
          timestamp: new Date().toISOString(),
        });
        // Use a non-blocking alert for mobile/desktop compatibility
        setTimeout(() => window.alert("Thank you for your feedback!"), 0);
      } catch (err) {
        setTimeout(() => window.alert("Failed to submit feedback. Please try again later."), 0);
      }
    }
  });

  // Service worker registration for PWA/offline support
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Feature detection for cross-browser compatibility
      if (navigator.serviceWorker && navigator.serviceWorker.register) {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            // Registration successful
            // Optionally show a toast or log for user awareness
          })
          .catch((error) => {
            // Registration failed
            // Optionally log error for analytics
          });
      }
    });
  }
}
