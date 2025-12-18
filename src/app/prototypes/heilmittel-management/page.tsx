'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeilmittelManagementTable from '@/components/heilmittel/HeilmittelManagementTable';
import { Heilmittel, TariffHistoryEntry } from '@/types';
import { ToastProvider, useToast } from '@/contexts/ToastContext';

// Import mock data
import heilmittelDataJson from '@/data/heilmittelData.json';

const STORAGE_KEY = 'heilmittel-management-data';

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
        if (stored) {
          const data = JSON.parse(stored);
          setHeilmittel(data.heilmittel || heilmittelDataJson);
        } else {
          // Initialize session storage with JSON data
          const initialData = { heilmittel: heilmittelDataJson };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
          setHeilmittel(heilmittelDataJson as Heilmittel[]);
        }
      } catch {
        setHeilmittel(heilmittelDataJson as Heilmittel[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/prototypes/heilmittel-management/${id}`);
  };

  const handleAdd = () => {
    router.push('/prototypes/heilmittel-management/new');
  };

  // Mock current user for audit trail
  const currentUser = 'Max M.';

  const handleSaveAll = (updates: { id: string; changes: Partial<Heilmittel>; effectiveDate: string }[]) => {
    const now = new Date().toISOString();

    const updatedHeilmittel = heilmittel.map(h => {
      const update = updates.find(u => u.id === h.id);
      if (!update) return h;

      const updated = {
        ...h,
        ...update.changes,
        updatedAt: now,
        lastEditedAt: now,
        lastEditedBy: currentUser
      };

      // Create history entries for tariff changes
      const tariffKeys = ['tar1', 'tar10', 'tar11', 'tar12'] as const;
      tariffKeys.forEach(key => {
        if (update.changes[key] !== undefined && update.changes[key] !== h[key]) {
          const historyKey = `${key}History` as keyof Heilmittel;
          const newEntry: TariffHistoryEntry = {
            id: `hist-${h.kurzzeichen}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            value: update.changes[key] as number,
            effectiveDate: update.effectiveDate,
            changedAt: now,
            changedBy: currentUser
          };
          (updated as Record<string, unknown>)[historyKey] = [...(h[historyKey] as TariffHistoryEntry[]), newEntry];
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
