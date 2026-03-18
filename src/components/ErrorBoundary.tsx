/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 bg-creme">
          <h1 className="text-2xl font-display font-bold text-burgundy">Ops! Algo deu errado.</h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Ocorreu um erro inesperado. Por favor, tente recarregar a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recarregar Página
          </button>
          {this.state.error && (
            <pre className="mt-4 p-4 bg-red-50 text-red-800 text-xs rounded-xl overflow-auto max-w-full text-left">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}
