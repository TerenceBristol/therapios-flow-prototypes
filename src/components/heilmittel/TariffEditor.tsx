'use client';

import React, { useState } from 'react';
import { TariffHistoryEntry } from '@/types';

interface TariffEditorProps {
  tariffName: string;
  currentValue: number;
  history: TariffHistoryEntry[];
  onUpdate: (newValue: number, effectiveDate: string) => void;
  onViewHistory: () => void;
}

const TariffEditor: React.FC<TariffEditorProps> = ({
  tariffName,
  currentValue,
  history,
  onUpdate,
  onViewHistory
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(() => {
    // Default to today's date
    return new Date().toISOString().split('T')[0];
  });
  const [error, setError] = useState('');

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setNewValue(currentValue.toString().replace('.', ','));
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setNewValue('');
    setError('');
  };

  const handleSave = () => {
    // Parse the value (handle both comma and dot as decimal separator)
    const parsedValue = parseFloat(newValue.replace(',', '.'));

    if (isNaN(parsedValue) || parsedValue < 0) {
      setError('Please enter a valid value');
      return;
    }

    if (!effectiveDate) {
      setError('Please select an effective date');
      return;
    }

    onUpdate(parsedValue, effectiveDate);
    setIsExpanded(false);
    setNewValue('');
    setError('');
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{tariffName}</div>
          <div className="text-lg font-semibold text-foreground">{formatCurrency(currentValue)}</div>
        </div>

        {!isExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpand}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Update
            </button>
            <button
              type="button"
              onClick={onViewHistory}
              className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors text-foreground"
            >
              History ({history.length})
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 border border-border rounded-lg bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            {/* New Value */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                New Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 pr-8 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-500">{error}</div>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffEditor;
