'use client';

import React, { useState, useMemo } from 'react';
import { Heilmittel, HeilmittelKind, HeilmittelBereich } from '@/types';
import ConfirmationDialog from './ConfirmationDialog';

interface EditedRow {
  tar1?: number;
  tar10?: number;
  tar11?: number;
  tar12?: number;
  duration?: number | null;
  kind?: HeilmittelKind;
  bereich?: HeilmittelBereich;
  bv?: boolean;
  effectiveDate: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface HeilmittelManagementTableProps {
  heilmittel: Heilmittel[];
  onEdit: (id: string) => void;
  onAdd: () => void;
  onSaveAll?: (updates: { id: string; changes: Partial<Heilmittel>; effectiveDate: string }[]) => void;
}

type SortColumn = 'kurzzeichen' | 'bezeichnung' | 'tar1' | 'bereich' | 'kind';

const HeilmittelManagementTable: React.FC<HeilmittelManagementTableProps> = ({
  heilmittel,
  onEdit,
  onAdd,
  onSaveAll
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bereichFilter, setBereichFilter] = useState<HeilmittelBereich | ''>('');
  const [kindFilter, setKindFilter] = useState<HeilmittelKind | ''>('');
  const [bvFilter, setBvFilter] = useState<'all' | 'true' | 'false'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortColumn, setSortColumn] = useState<SortColumn>('kurzzeichen');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Inline edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState<Map<string, EditedRow>>(new Map());
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Map<string, ValidationError[]>>(new Map());

  // Get today's date as default
  const getToday = () => new Date().toISOString().split('T')[0];

  // Filter heilmittel
  const filteredHeilmittel = useMemo(() => {
    let result = [...heilmittel];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(h =>
        h.kurzzeichen.toLowerCase().includes(query) ||
        h.bezeichnung.toLowerCase().includes(query)
      );
    }

    // Bereich filter
    if (bereichFilter) {
      result = result.filter(h => h.bereich === bereichFilter);
    }

    // Kind filter
    if (kindFilter) {
      result = result.filter(h => h.kind === kindFilter);
    }

    // BV filter
    if (bvFilter !== 'all') {
      result = result.filter(h => h.bv === (bvFilter === 'true'));
    }

    // Status filter (archived/active)
    if (statusFilter === 'active') {
      result = result.filter(h => !h.isArchived);
    } else if (statusFilter === 'archived') {
      result = result.filter(h => h.isArchived);
    }

    return result;
  }, [heilmittel, searchQuery, bereichFilter, kindFilter, bvFilter, statusFilter]);

  // Sort heilmittel
  const sortedHeilmittel = useMemo(() => {
    const result = [...filteredHeilmittel];

    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortColumn) {
        case 'kurzzeichen':
          compareValue = a.kurzzeichen.localeCompare(b.kurzzeichen);
          break;
        case 'bezeichnung':
          compareValue = a.bezeichnung.localeCompare(b.bezeichnung);
          break;
        case 'tar1':
          compareValue = a.tar1 - b.tar1;
          break;
        case 'bereich':
          compareValue = a.bereich.localeCompare(b.bereich);
          break;
        case 'kind':
          compareValue = a.kind.localeCompare(b.kind);
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [filteredHeilmittel, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveFilters = searchQuery || bereichFilter || kindFilter || bvFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setBereichFilter('');
    setKindFilter('');
    setBvFilter('all');
    setStatusFilter('all');
  };

  // Format last edited display
  const formatLastEdited = (item: Heilmittel) => {
    if (item.lastEditedBy && item.lastEditedAt) {
      const date = new Date(item.lastEditedAt);
      const formattedDate = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return `${item.lastEditedBy}, ${formattedDate}`;
    }
    return '—';
  };

  // Validation for bulk edit
  const validateTariff = (value: number): ValidationError | null => {
    if (value < 0) {
      return { field: 'tariff', message: 'Value must be ≥ 0' };
    }
    return null;
  };

  const handleCellEditWithValidation = (itemId: string, field: keyof Omit<EditedRow, 'effectiveDate'>, value: number | string | boolean | null) => {
    // Clear previous validation errors for this field
    setValidationErrors(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || [];
      const filtered = existing.filter(e => e.field !== field);
      if (filtered.length > 0) {
        newMap.set(itemId, filtered);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });

    // Validate tariff fields
    if (['tar1', 'tar10', 'tar11', 'tar12'].includes(field) && typeof value === 'number') {
      const error = validateTariff(value);
      if (error) {
        setValidationErrors(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(itemId) || [];
          newMap.set(itemId, [...existing, { ...error, field }]);
          return newMap;
        });
      }
    }

    handleCellEdit(itemId, field, value);
  };

  const hasValidationErrors = validationErrors.size > 0;
  const totalValidationErrors = useMemo(() => {
    let count = 0;
    validationErrors.forEach(errors => count += errors.length);
    return count;
  }, [validationErrors]);

  // Edit mode helpers
  const getEditedValue = <K extends keyof EditedRow>(itemId: string, field: K, originalValue: EditedRow[K]) => {
    const edited = editedRows.get(itemId);
    if (edited && field in edited && edited[field] !== undefined) {
      return edited[field] as EditedRow[K];
    }
    return originalValue;
  };

  const handleCellEdit = (itemId: string, field: keyof Omit<EditedRow, 'effectiveDate'>, value: number | string | boolean | null) => {
    setEditedRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || { effectiveDate: getToday() };
      newMap.set(itemId, { ...existing, [field]: value });
      return newMap;
    });
  };

  const handleEffectiveDateChange = (itemId: string, date: string) => {
    setEditedRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || { effectiveDate: getToday() };
      newMap.set(itemId, { ...existing, effectiveDate: date });
      return newMap;
    });
  };

  const isRowModified = (itemId: string) => {
    const edited = editedRows.get(itemId);
    if (!edited) return false;
    const original = heilmittel.find(h => h.id === itemId);
    if (!original) return false;

    return (
      (edited.tar1 !== undefined && edited.tar1 !== original.tar1) ||
      (edited.tar10 !== undefined && edited.tar10 !== original.tar10) ||
      (edited.tar11 !== undefined && edited.tar11 !== original.tar11) ||
      (edited.tar12 !== undefined && edited.tar12 !== original.tar12) ||
      (edited.duration !== undefined && edited.duration !== original.duration) ||
      (edited.kind !== undefined && edited.kind !== original.kind) ||
      (edited.bereich !== undefined && edited.bereich !== original.bereich) ||
      (edited.bv !== undefined && edited.bv !== original.bv)
    );
  };

  const modifiedCount = useMemo(() => {
    let count = 0;
    editedRows.forEach((_, itemId) => {
      if (isRowModified(itemId)) count++;
    });
    return count;
  }, [editedRows, heilmittel]);

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    setEditedRows(new Map());
  };

  const handleDiscardChanges = () => {
    if (modifiedCount > 0) {
      setShowDiscardConfirm(true);
    } else {
      setIsEditMode(false);
      setEditedRows(new Map());
    }
  };

  const confirmDiscard = () => {
    setIsEditMode(false);
    setEditedRows(new Map());
    setShowDiscardConfirm(false);
  };

  const handleSaveAll = () => {
    if (!onSaveAll) return;

    const updates: { id: string; changes: Partial<Heilmittel>; effectiveDate: string }[] = [];

    editedRows.forEach((edited, itemId) => {
      if (isRowModified(itemId)) {
        const changes: Partial<Heilmittel> = {};
        const original = heilmittel.find(h => h.id === itemId);
        if (!original) return;

        if (edited.tar1 !== undefined && edited.tar1 !== original.tar1) changes.tar1 = edited.tar1;
        if (edited.tar10 !== undefined && edited.tar10 !== original.tar10) changes.tar10 = edited.tar10;
        if (edited.tar11 !== undefined && edited.tar11 !== original.tar11) changes.tar11 = edited.tar11;
        if (edited.tar12 !== undefined && edited.tar12 !== original.tar12) changes.tar12 = edited.tar12;
        if (edited.duration !== undefined && edited.duration !== original.duration) changes.duration = edited.duration;
        if (edited.kind !== undefined && edited.kind !== original.kind) changes.kind = edited.kind;
        if (edited.bereich !== undefined && edited.bereich !== original.bereich) changes.bereich = edited.bereich;
        if (edited.bv !== undefined && edited.bv !== original.bv) changes.bv = edited.bv;

        updates.push({ id: itemId, changes, effectiveDate: edited.effectiveDate });
      }
    });

    if (updates.length > 0) {
      onSaveAll(updates);
    }

    setIsEditMode(false);
    setEditedRows(new Map());
  };

  const parseCurrencyInput = (value: string): number => {
    // Handle German number format (comma as decimal separator)
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search by Kurzzeichen or Bezeichnung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bereich Filter */}
          <select
            value={bereichFilter}
            onChange={(e) => setBereichFilter(e.target.value as HeilmittelBereich | '')}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Bereich</option>
            <option value="PT">PT</option>
            <option value="ERGO">ERGO</option>
            <option value="SSSST">SSSST</option>
          </select>

          {/* Kind Filter */}
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as HeilmittelKind | '')}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Kind</option>
            <option value="treatment">Treatment</option>
            <option value="fee">Fee</option>
            <option value="passiv">Passiv</option>
          </select>

          {/* BV Filter */}
          <select
            value={bvFilter}
            onChange={(e) => setBvFilter(e.target.value as 'all' | 'true' | 'false')}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All BV</option>
            <option value="true">BV: Yes</option>
            <option value="false">BV: No</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {/* Edit Mode / Add Buttons */}
          {isEditMode ? (
            <div className="flex items-center gap-2">
              {modifiedCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                  {modifiedCount} modified
                </span>
              )}
              {hasValidationErrors && (
                <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">
                  {totalValidationErrors} error{totalValidationErrors !== 1 ? 's' : ''}
                </span>
              )}
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium whitespace-nowrap text-foreground"
              >
                Discard
              </button>
              <button
                onClick={handleSaveAll}
                disabled={modifiedCount === 0 || hasValidationErrors}
                className={`px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap ${
                  modifiedCount > 0 && !hasValidationErrors
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                title={hasValidationErrors ? 'Fix validation errors before saving' : undefined}
              >
                Save All Changes
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnterEditMode}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium whitespace-nowrap text-foreground"
              >
                Edit Mode
              </button>
              <button
                onClick={onAdd}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
              >
                + Add Heilmittel
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Info */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {sortedHeilmittel.length} of {heilmittel.length} Heilmittel</span>
            <button
              onClick={clearFilters}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-[#1e3a5f] sticky top-0">
            <tr className="text-[#d4b896]">
              <th
                onClick={() => handleSort('kurzzeichen')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Kurzzeichen{getSortIndicator('kurzzeichen')}
              </th>
              <th
                onClick={() => handleSort('bezeichnung')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Bezeichnung{getSortIndicator('bezeichnung')}
              </th>
              <th
                onClick={() => handleSort('tar1')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Tar. 1{getSortIndicator('tar1')}
              </th>
              <th
                onClick={() => handleSort('bereich')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Bereich{getSortIndicator('bereich')}
              </th>
              <th
                onClick={() => handleSort('kind')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Kind{getSortIndicator('kind')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                BV
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Last Edited
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              {isEditMode && (
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Effective Date
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHeilmittel.length === 0 ? (
              <tr>
                <td colSpan={isEditMode ? 10 : 9} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🔍</div>
                  <div>No Heilmittel found</div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              sortedHeilmittel.map((item) => {
                const rowModified = isRowModified(item.id);
                const editedData = editedRows.get(item.id);
                const effectiveDate = editedData?.effectiveDate || getToday();
                const rowErrors = validationErrors.get(item.id) || [];
                const hasTar1Error = rowErrors.some(e => e.field === 'tar1');

                // Determine row styling based on state
                let rowClassName = 'border-b border-border transition-colors ';
                if (rowModified) {
                  rowClassName += 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 ';
                } else {
                  rowClassName += 'hover:bg-muted/50 ';
                }

                return (
                  <tr
                    key={item.id}
                    className={rowClassName}
                  >
                    {/* Kurzzeichen */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.kurzzeichen}</span>
                    </td>

                    {/* Bezeichnung */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground">{item.bezeichnung}</div>
                    </td>

                    {/* Tar. 1 */}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <div className="relative">
                          <input
                            type="text"
                            defaultValue={item.tar1.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            onBlur={(e) => handleCellEditWithValidation(item.id, 'tar1', parseCurrencyInput(e.target.value))}
                            className={`w-24 px-2 py-1 text-sm font-mono border rounded bg-background text-foreground focus:outline-none focus:ring-2 ${
                              hasTar1Error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-border focus:ring-primary'
                            }`}
                          />
                          {hasTar1Error && (
                            <div className="absolute left-0 top-full mt-1 text-xs text-red-500 whitespace-nowrap">
                              Value must be ≥ 0
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-foreground font-mono">{formatCurrency(item.tar1)}</div>
                      )}
                    </td>

                    {/* Bereich */}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <select
                          defaultValue={item.bereich}
                          onChange={(e) => handleCellEdit(item.id, 'bereich', e.target.value as HeilmittelBereich)}
                          className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="PT">PT</option>
                          <option value="ERGO">ERGO</option>
                          <option value="SSSST">SSSST</option>
                        </select>
                      ) : (
                        <span className="text-sm text-foreground">{item.bereich}</span>
                      )}
                    </td>

                    {/* Kind */}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <select
                          defaultValue={item.kind}
                          onChange={(e) => handleCellEdit(item.id, 'kind', e.target.value as HeilmittelKind)}
                          className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="treatment">treatment</option>
                          <option value="fee">fee</option>
                          <option value="passiv">passiv</option>
                        </select>
                      ) : (
                        <span className="text-sm text-foreground">{item.kind}</span>
                      )}
                    </td>

                    {/* BV */}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        <select
                          defaultValue={item.bv ? 'true' : 'false'}
                          onChange={(e) => handleCellEdit(item.id, 'bv', e.target.value === 'true')}
                          className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <span className="text-sm text-foreground">{item.bv ? 'true' : 'false'}</span>
                      )}
                    </td>

                    {/* Last Edited */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatLastEdited(item)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {item.isArchived ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Effective Date (edit mode only) */}
                    {isEditMode && (
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={effectiveDate}
                          onChange={(e) => handleEffectiveDateChange(item.id, e.target.value)}
                          className="px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {isEditMode ? (
                        rowModified && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Modified</span>
                        )
                      ) : (
                        <button
                          onClick={() => onEdit(item.id)}
                          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={confirmDiscard}
        title="Discard Changes?"
        message={`You have unsaved changes to ${modifiedCount} item${modifiedCount !== 1 ? 's' : ''}.`}
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="danger"
      />
    </div>
  );
};

export default HeilmittelManagementTable;
