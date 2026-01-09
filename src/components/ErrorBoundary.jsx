import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">System Application Error</h1>
            <p className="text-gray-500 mb-6">The application encountered a critical rendering issue. This is usually caused by a file path mismatch or a missing component.</p>
            
            <div className="bg-gray-900 text-left p-4 rounded-lg overflow-auto mb-6 text-xs text-red-300 font-mono max-h-32">
              {this.state.error && this.state.error.toString()}
            </div>

            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Return to Safe Mode (Dashboard)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;