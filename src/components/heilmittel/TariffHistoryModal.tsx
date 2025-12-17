'use client';

import React from 'react';
import { TariffHistoryEntry } from '@/types';

interface TariffHistoryModalProps {
  tariffName: string;
  kurzzeichen: string;
  history: TariffHistoryEntry[];
  currentValue: number;
  onClose: () => void;
}

const TariffHistoryModal: React.FC<TariffHistoryModalProps> = ({
  tariffName,
  kurzzeichen,
  history,
  currentValue,
  onClose
}) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort history by effective date (newest first)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );

  // Determine which entry is the current/active one
  const today = new Date().toISOString().split('T')[0];
  const activeEntryId = sortedHistory.find(entry => entry.effectiveDate <= today)?.id;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {tariffName} Price History
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Heilmittel: {kurzzeichen}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <div>No history data available</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Effective From
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Changed On
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((entry) => {
                  const isActive = entry.id === activeEntryId;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-border ${
                        isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">
                            {formatDate(entry.effectiveDate)}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-medium text-foreground">
                          {formatCurrency(entry.value)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(entry.changedAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {sortedHistory.length} entries in history
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffHistoryModal;
