import type { AppProps } from "next/app";
import { useEffect } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Prevent wallet extension errors from crashing the app
    const handleError = (event: ErrorEvent) => {
      // Suppress errors from browser extensions
      if (
        event.filename?.includes("chrome-extension://") ||
        event.filename?.includes("moz-extension://") ||
        event.message?.includes("chainId") ||
        event.message?.includes("getter") ||
        event.message?.includes("only a getter")
      ) {
        event.preventDefault();
        event.stopPropagation();
        console.warn("Suppressed extension error:", event.message);
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || "";
      if (
        reason.includes("chainId") ||
        reason.includes("getter") ||
        reason.includes("chrome-extension://") ||
        reason.includes("moz-extension://")
      ) {
        event.preventDefault();
        console.warn("Suppressed extension promise rejection:", reason);
        return true;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

