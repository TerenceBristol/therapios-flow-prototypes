'use client';

import React from 'react';

interface SuccessStateProps {
  voNumber: string;
  mode: 'create' | 'edit';
  onCreateAnother: () => void;
  onReturnToDashboard: () => void;
}

export function SuccessState({
  voNumber,
  mode,
  onCreateAnother,
  onReturnToDashboard,
}: SuccessStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-background border border-border rounded-lg p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-xl font-bold text-foreground mb-2">
          {mode === 'create' ? 'VO erfolgreich erstellt' : 'VO erfolgreich gespeichert'}
        </h2>
        <p className="text-muted-foreground mb-8">
          Die Verordnung <span className="font-medium text-foreground">{voNumber}</span> wurde erfolgreich {mode === 'create' ? 'erstellt' : 'aktualisiert'}.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {mode === 'create' && (
            <button
              onClick={onCreateAnother}
              className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Weitere VO erstellen
            </button>
          )}
          <button
            onClick={onReturnToDashboard}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessState;
