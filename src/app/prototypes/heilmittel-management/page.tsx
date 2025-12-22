'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeilmittelManagementTable from '@/components/heilmittel/HeilmittelManagementTable';
import { Heilmittel, TariffHistoryEntry } from '@/types';
import { ToastProvider, useToast } from '@/contexts/ToastContext';

// Import mock data
import heilmittelDataJson from '@/data/heilmittelData.json';

const STORAGE_KEY = 'heilmittel-management-data';

// Normalize IDs to numbers (fixes stale sessionStorage with old string IDs)
const normalizeHeilmittelIds = (data: Heilmittel[]): Heilmittel[] =>
  data.map((h, index) => ({
    ...h,
    id: typeof h.id === 'number' ? h.id : index + 1
  }));

function HeilmittelManagementContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [heilmittel, setHeilmittel] = useState<Heilmittel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from sessionStorage or initialize
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const rawData = stored ? JSON.parse(stored) : { heilmittel: heilmittelDataJson };

        // Normalize IDs to numbers (fixes stale sessionStorage with old string IDs)
        const normalizedData = normalizeHeilmittelIds(rawData.heilmittel || heilmittelDataJson);
        setHeilmittel(normalizedData);

        // Update sessionStorage with normalized data
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ heilmittel: normalizedData }));
      } catch {
        const normalizedData = normalizeHeilmittelIds(heilmittelDataJson as Heilmittel[]);
        setHeilmittel(normalizedData);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/prototypes/heilmittel-management/${id}`);
  };

  const handleAdd = () => {
    router.push('/prototypes/heilmittel-management/new');
  };

  // Mock current user for audit trail
  const currentUser = 'Max M.';

  const handleSaveAll = (updates: { id: number; changes: Partial<Heilmittel> & { tariffUpdates?: { key: string; value: number; rule: number }[] }; effectiveDate: string }[]) => {
    const now = new Date().toISOString();

    const updatedHeilmittel = heilmittel.map(h => {
      const update = updates.find(u => u.id === h.id);
      if (!update) return h;

      const updated: Heilmittel = {
        ...h,
        updatedAt: now,
        lastEditedAt: now,
        lastEditedBy: currentUser
      };

      // Handle tariff updates with rules
      if (update.changes.tariffUpdates) {
        update.changes.tariffUpdates.forEach(tariffUpdate => {
          const key = tariffUpdate.key as 'tar1' | 'tar10' | 'tar11' | 'tar12' | 'tarBg';
          const historyKey = `${key}History` as keyof Heilmittel;
          const oldValue = h[key] as number;
          const newValue = tariffUpdate.value;

          if (newValue !== oldValue) {
            // Update current value
            (updated as unknown as Record<string, unknown>)[key] = newValue;

            // Create history entry with rule
            const newEntry: TariffHistoryEntry = {
              id: `hist-${h.kurzzeichen}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              value: newValue,
              effectiveDate: update.effectiveDate,
              changedAt: now,
              changedBy: currentUser,
              rule: tariffUpdate.rule
            };
            (updated as unknown as Record<string, unknown>)[historyKey] = [...(h[historyKey] as TariffHistoryEntry[]), newEntry];
          }
        });
      }

      // Handle non-tariff changes
      const nonTariffChanges = { ...update.changes };
      delete nonTariffChanges.tariffUpdates;

      (['duration', 'kind', 'bereich', 'bv'] as const).forEach(field => {
        if (nonTariffChanges[field] !== undefined && nonTariffChanges[field] !== h[field]) {
          (updated as unknown as Record<string, unknown>)[field] = nonTariffChanges[field];
        }
      });

      return updated;
    });

    // Update state
    setHeilmittel(updatedHeilmittel);

    // Save to sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ heilmittel: updatedHeilmittel }));
      showToast('Changes saved', 'success');
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      showToast('Error saving changes', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/prototypes')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück zur Übersicht
            </button>
            <h1 className="text-2xl font-bold text-foreground">Heilmittelverwaltung</h1>
            <p className="text-sm text-muted-foreground mt-1">Verwalten Sie alle Heilmittelcodes und deren Tarife</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <HeilmittelManagementTable
        heilmittel={heilmittel}
        onEdit={handleEdit}
        onAdd={handleAdd}
        onSaveAll={handleSaveAll}
      />
    </div>
  );
}

export default function HeilmittelManagementPage() {
  return (
    <ToastProvider>
      <HeilmittelManagementContent />
    </ToastProvider>
  );
}
