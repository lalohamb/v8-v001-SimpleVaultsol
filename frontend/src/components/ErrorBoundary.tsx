import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if error is from browser extension
    const isExtensionError =
      error.message?.includes("chainId") ||
      error.message?.includes("getter") ||
      error.stack?.includes("chrome-extension://") ||
      error.stack?.includes("moz-extension://");

    // Don't show error UI for extension errors
    if (isExtensionError) {
      console.warn("Suppressed browser extension error:", error.message);
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if error is from browser extension
    const isExtensionError =
      error.message?.includes("chainId") ||
      error.message?.includes("getter") ||
      error.stack?.includes("chrome-extension://") ||
      error.stack?.includes("moz-extension://");

    if (isExtensionError) {
      console.warn("Caught and suppressed extension error:", error.message);
      return;
    }

    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            {this.state.error.toString()}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

