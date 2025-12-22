'use client';

import React, { useState } from 'react';
import { TariffHistoryEntry } from '@/types';
import ConfirmationDialog from './ConfirmationDialog';

interface TariffHistoryModalProps {
  tariffName: string;
  kurzzeichen: string;
  history: TariffHistoryEntry[];
  currentValue: number;
  onClose: () => void;
  onUpdateEntry?: (entryId: string, newValue: number, newEffectiveDate: string) => void;
  onDeleteEntry?: (entryId: string) => void;
}

interface EditState {
  entryId: string | null;
  value: string;
  effectiveDate: string;
  error: string | null;
}

const TariffHistoryModal: React.FC<TariffHistoryModalProps> = ({
  tariffName,
  kurzzeichen,
  history,
  currentValue,
  onClose,
  onUpdateEntry,
  onDeleteEntry
}) => {
  // Edit state
  const [editState, setEditState] = useState<EditState>({
    entryId: null,
    value: '',
    effectiveDate: '',
    error: null
  });

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    entryId: string | null;
    effectiveDate: string;
  }>({
    isOpen: false,
    entryId: null,
    effectiveDate: ''
  });

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

  const startEdit = (entry: TariffHistoryEntry) => {
    setEditState({
      entryId: entry.id,
      value: entry.value.toString(),
      effectiveDate: entry.effectiveDate,
      error: null
    });
  };

  const cancelEdit = () => {
    setEditState({
      entryId: null,
      value: '',
      effectiveDate: '',
      error: null
    });
  };

  const saveEdit = () => {
    const numValue = parseFloat(editState.value);
    if (isNaN(numValue) || numValue < 0) {
      setEditState(prev => ({ ...prev, error: 'Value must be a non-negative number' }));
      return;
    }
    if (!editState.effectiveDate) {
      setEditState(prev => ({ ...prev, error: 'Effective date is required' }));
      return;
    }

    if (editState.entryId && onUpdateEntry) {
      onUpdateEntry(editState.entryId, numValue, editState.effectiveDate);
    }
    cancelEdit();
  };

  const handleDeleteClick = (entry: TariffHistoryEntry) => {
    setDeleteConfirm({
      isOpen: true,
      entryId: entry.id,
      effectiveDate: entry.effectiveDate
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.entryId && onDeleteEntry) {
      onDeleteEntry(deleteConfirm.entryId);
    }
    setDeleteConfirm({ isOpen: false, entryId: null, effectiveDate: '' });
  };

  const isEditing = editState.entryId !== null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
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
                      Rule
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Changed By
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Changed On
                    </th>
                    {(onUpdateEntry || onDeleteEntry) && (
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((entry) => {
                    const isActive = entry.id === activeEntryId;
                    const isEditingThis = editState.entryId === entry.id;

                    if (isEditingThis) {
                      return (
                        <tr
                          key={entry.id}
                          className="border-b border-border bg-amber-50"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={editState.effectiveDate}
                              onChange={(e) => setEditState(prev => ({ ...prev, effectiveDate: e.target.value, error: null }))}
                              className="w-full px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={editState.value}
                              onChange={(e) => setEditState(prev => ({ ...prev, value: e.target.value, error: null }))}
                              step="0.01"
                              min="0"
                              className={`w-full px-2 py-1 border rounded-md bg-background text-foreground text-sm font-mono ${
                                editState.error ? 'border-red-500' : 'border-border'
                              }`}
                            />
                            {editState.error && (
                              <p className="text-xs text-red-500 mt-1">{editState.error}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              Rule {entry.rule || 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {entry.changedBy || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(entry.changedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-1 text-sm border border-border rounded hover:bg-muted transition-colors text-foreground"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEdit}
                                className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

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
                            Rule {entry.rule || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">
                            {entry.changedBy || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(entry.changedAt)}
                          </span>
                        </td>
                        {(onUpdateEntry || onDeleteEntry) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onUpdateEntry && !isEditing && (
                                <button
                                  onClick={() => startEdit(entry)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              )}
                              {onDeleteEntry && !isEditing && (
                                <button
                                  onClick={() => handleDeleteClick(entry)}
                                  className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, entryId: null, effectiveDate: '' })}
        onConfirm={confirmDelete}
        title="Delete History Entry"
        message={`Are you sure you want to delete the entry effective from ${deleteConfirm.effectiveDate ? formatDate(deleteConfirm.effectiveDate) : ''}?`}
        details={[
          'This will permanently remove the price history entry'
        ]}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default TariffHistoryModal;
