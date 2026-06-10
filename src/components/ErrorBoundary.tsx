import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught app exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-rose-50 flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <AlertTriangle className="w-9 h-9" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-800">Something slipped off the orbit</h1>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              We encountered a minor layout interruption. Don't worry, your carbon footprints database is completely secure.
            </p>

            <div className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-6 text-left">
              <p className="text-[10px] text-slate-400 font-extrabold font-mono tracking-wider uppercase">System Trace Log</p>
              <p className="text-xs text-rose-600 font-mono mt-1 break-all bg-white px-2 py-1.5 rounded border border-rose-100">
                {this.state.error?.message || "Internal Rendering Constraint"}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="mt-8 w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl transition-all shadow-md shadow-brand-600/10 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Restore Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
