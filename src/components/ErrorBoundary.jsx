import { Component } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong 😕</h2>
            <p className="text-sm text-gray-500 mb-6">
              {import.meta.env.DEV && this.state.error
                ? this.state.error.toString()
                : "An unexpected error occurred. Please try again."}
            </p>
            {import.meta.env.DEV && this.state.errorInfo && (
              <pre className="text-left text-[10px] text-gray-600 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6 max-h-40 overflow-auto">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-[#0f1117] font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
