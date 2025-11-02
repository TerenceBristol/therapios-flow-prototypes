'use client';

import React, { useEffect } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // milliseconds
}

const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  duration = 5000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleUndo = () => {
    onUndo();
    onDismiss();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-card border border-border rounded-lg shadow-xl px-6 py-4 flex items-center gap-4 min-w-[400px]">
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors"
        >
          Undo
        </button>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UndoToast;
