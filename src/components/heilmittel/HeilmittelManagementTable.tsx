'use client';

import React, { useState, useMemo } from 'react';
import { Heilmittel, HeilmittelKind, HeilmittelBereich } from '@/types';
import ConfirmationDialog from './ConfirmationDialog';

interface EditedTariff {
  value: number;
  rule: number;
}

interface EditedRow {
  tar1?: EditedTariff;
  tar10?: EditedTariff;
  tar11?: EditedTariff;
  tar12?: EditedTariff;
  tarBg?: EditedTariff;
  effectiveDate: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface HeilmittelManagementTableProps {
  heilmittel: Heilmittel[];
  onEdit: (id: number) => void;
  onAdd: () => void;
  onSaveAll?: (updates: { id: number; changes: Partial<Heilmittel>; effectiveDate: string }[]) => void;
}

type SortColumn = 'id' | 'kurzzeichen' | 'bezeichnung' | 'tar1' | 'bereich' | 'kind';

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
  const [editedRows, setEditedRows] = useState<Map<number, EditedRow>>(new Map());
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Map<number, ValidationError[]>>(new Map());

  // Pricing rules
  const PRICING_RULES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
        case 'id':
          compareValue = a.id - b.id;
          break;
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

  const handleTariffEdit = (itemId: number, tariffKey: 'tar1' | 'tar10' | 'tar11' | 'tar12' | 'tarBg', value: number, rule: number) => {
    // Clear previous validation errors for this field
    setValidationErrors(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || [];
      const filtered = existing.filter(e => e.field !== tariffKey);
      if (filtered.length > 0) {
        newMap.set(itemId, filtered);
      } else {
        newMap.delete(itemId);
      }
      return newMap;
    });

    // Validate tariff value
    const error = validateTariff(value);
    if (error) {
      setValidationErrors(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(itemId) || [];
        newMap.set(itemId, [...existing, { ...error, field: tariffKey }]);
        return newMap;
      });
    }

    // Update the edited row with tariff value and rule
    setEditedRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || { effectiveDate: getToday() };
      newMap.set(itemId, { ...existing, [tariffKey]: { value, rule } });
      return newMap;
    });
  };

  const hasValidationErrors = validationErrors.size > 0;
  const totalValidationErrors = useMemo(() => {
    let count = 0;
    validationErrors.forEach(errors => count += errors.length);
    return count;
  }, [validationErrors]);

  const handleEffectiveDateChange = (itemId: number, date: string) => {
    setEditedRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId) || { effectiveDate: getToday() };
      newMap.set(itemId, { ...existing, effectiveDate: date });
      return newMap;
    });
  };

  const isRowModified = (itemId: number) => {
    const edited = editedRows.get(itemId);
    if (!edited) return false;
    const original = heilmittel.find(h => h.id === itemId);
    if (!original) return false;

    return (
      (edited.tar1 !== undefined && edited.tar1.value !== original.tar1) ||
      (edited.tar10 !== undefined && edited.tar10.value !== original.tar10) ||
      (edited.tar11 !== undefined && edited.tar11.value !== original.tar11) ||
      (edited.tar12 !== undefined && edited.tar12.value !== original.tar12) ||
      (edited.tarBg !== undefined && edited.tarBg.value !== original.tarBg)
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

    const updates: { id: number; changes: Partial<Heilmittel> & { tariffUpdates?: { key: string; value: number; rule: number }[] }; effectiveDate: string }[] = [];

    editedRows.forEach((edited, itemId) => {
      if (isRowModified(itemId)) {
        const changes: Partial<Heilmittel> & { tariffUpdates?: { key: string; value: number; rule: number }[] } = {};
        const original = heilmittel.find(h => h.id === itemId);
        if (!original) return;

        // Collect tariff updates with their rules
        const tariffUpdates: { key: string; value: number; rule: number }[] = [];
        if (edited.tar1 !== undefined && edited.tar1.value !== original.tar1) {
          tariffUpdates.push({ key: 'tar1', value: edited.tar1.value, rule: edited.tar1.rule });
        }
        if (edited.tar10 !== undefined && edited.tar10.value !== original.tar10) {
          tariffUpdates.push({ key: 'tar10', value: edited.tar10.value, rule: edited.tar10.rule });
        }
        if (edited.tar11 !== undefined && edited.tar11.value !== original.tar11) {
          tariffUpdates.push({ key: 'tar11', value: edited.tar11.value, rule: edited.tar11.rule });
        }
        if (edited.tar12 !== undefined && edited.tar12.value !== original.tar12) {
          tariffUpdates.push({ key: 'tar12', value: edited.tar12.value, rule: edited.tar12.rule });
        }
        if (edited.tarBg !== undefined && edited.tarBg.value !== original.tarBg) {
          tariffUpdates.push({ key: 'tarBg', value: edited.tarBg.value, rule: edited.tarBg.rule });
        }
        if (tariffUpdates.length > 0) {
          changes.tariffUpdates = tariffUpdates;
          updates.push({ id: itemId, changes, effectiveDate: edited.effectiveDate });
        }
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
                onClick={() => handleSort('id')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f] w-16"
              >
                ID{getSortIndicator('id')}
              </th>
              <th
                onClick={() => handleSort('kurzzeichen')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                Kurzzeichen{getSortIndicator('kurzzeichen')}
              </th>
              <th
                onClick={() => handleSort('tar1')}
                className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-[#2a4a6f]"
              >
                GKV{getSortIndicator('tar1')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Beihilfe
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Privat
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Privat Basis
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                BG
              </th>
              {isEditMode && (
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Effective Date
                </th>
              )}
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
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHeilmittel.length === 0 ? (
              <tr>
                <td colSpan={isEditMode ? 13 : 12} className="px-4 py-12 text-center text-muted-foreground">
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
                const hasTar10Error = rowErrors.some(e => e.field === 'tar10');
                const hasTar11Error = rowErrors.some(e => e.field === 'tar11');
                const hasTar12Error = rowErrors.some(e => e.field === 'tar12');
                const hasTarBgError = rowErrors.some(e => e.field === 'tarBg');

                // Get current rule values for each tariff in edit mode
                const tar1Rule = editedData?.tar1?.rule || 1;
                const tar10Rule = editedData?.tar10?.rule || 1;
                const tar11Rule = editedData?.tar11?.rule || 1;
                const tar12Rule = editedData?.tar12?.rule || 1;
                const tarBgRule = editedData?.tarBg?.rule || 1;

                // Determine row styling based on state
                let rowClassName = 'border-b border-border transition-colors ';
                if (rowModified) {
                  rowClassName += 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 ';
                } else {
                  rowClassName += 'hover:bg-muted/50 ';
                }

                // Render a tariff cell with input and rule dropdown
                const renderTariffCell = (
                  tariffKey: 'tar1' | 'tar10' | 'tar11' | 'tar12' | 'tarBg',
                  value: number,
                  hasError: boolean,
                  currentRule: number
                ) => (
                  <td className="px-4 py-2">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          defaultValue={value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          onBlur={(e) => handleTariffEdit(item.id, tariffKey, parseCurrencyInput(e.target.value), currentRule)}
                          className={`w-20 px-2 py-1 text-xs font-mono border rounded bg-background text-foreground focus:outline-none focus:ring-1 ${
                            hasError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'
                          }`}
                        />
                        <select
                          value={currentRule}
                          onChange={(e) => {
                            const newRule = parseInt(e.target.value);
                            const currentValue = editedData?.[tariffKey]?.value ?? value;
                            handleTariffEdit(item.id, tariffKey, currentValue, newRule);
                          }}
                          className="w-20 px-1 py-0.5 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {PRICING_RULES.map((r) => (
                            <option key={r} value={r}>R{r}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-sm text-foreground font-mono">{formatCurrency(value)}</div>
                    )}
                  </td>
                );

                return (
                  <tr
                    key={item.id}
                    className={rowClassName}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 w-16">
                      <span className="text-sm text-muted-foreground font-mono">{item.id}</span>
                    </td>

                    {/* Kurzzeichen */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.kurzzeichen}</span>
                    </td>

                    {/* GKV (tar1) */}
                    {renderTariffCell('tar1', item.tar1, hasTar1Error, tar1Rule)}

                    {/* Beihilfe (tar10) */}
                    {renderTariffCell('tar10', item.tar10, hasTar10Error, tar10Rule)}

                    {/* Privat (tar11) */}
                    {renderTariffCell('tar11', item.tar11, hasTar11Error, tar11Rule)}

                    {/* Privat Basis (tar12) */}
                    {renderTariffCell('tar12', item.tar12, hasTar12Error, tar12Rule)}

                    {/* BG (tarBg) */}
                    {renderTariffCell('tarBg', item.tarBg || 0, hasTarBgError, tarBgRule)}

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

                    {/* Bereich */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{item.bereich}</span>
                    </td>

                    {/* Kind */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{item.kind}</span>
                    </td>

                    {/* BV */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{item.bv ? 'true' : 'false'}</span>
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
