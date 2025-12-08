'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EinrichtungForm, Einrichtung } from '@/components/vo-creation/EinrichtungForm';

import einrichtungenDataJson from '@/data/einrichtungenData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface PrototypeData {
  einrichtungen: Einrichtung[];
  [key: string]: unknown;
}

export default function CreateEinrichtungPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          // Map legacy data format to new format
          const einrichtungen = (parsedData.einrichtungen || einrichtungenDataJson).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            name: e.name as string,
            status: (e.status as 'Aktiv' | 'Inaktiv') || 'Aktiv',
          }));
          setData({ ...parsedData, einrichtungen });
        } else {
          const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
            id: e.id,
            name: e.name,
            status: 'Aktiv' as const,
          }));
          setData({ einrichtungen: initialEinrichtungen });
        }
      } catch {
        const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
          id: e.id,
          name: e.name,
          status: 'Aktiv' as const,
        }));
        setData({ einrichtungen: initialEinrichtungen });
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSave = (formData: { name: string; status: 'Aktiv' | 'Inaktiv' }) => {
    if (!data) return;

    const newEinrichtung: Einrichtung = {
      id: `e-${Date.now()}`,
      name: formData.name,
      status: formData.status,
    };

    const updatedData = {
      ...data,
      einrichtungen: [...data.einrichtungen, newEinrichtung],
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch {
      // Ignore storage errors
    }

    router.push('/prototypes/vo-creation/einrichtungen');
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation/einrichtungen');
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-bold text-gray-900">ER erstellen</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <EinrichtungForm
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
