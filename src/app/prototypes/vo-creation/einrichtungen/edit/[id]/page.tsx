'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EinrichtungForm, Einrichtung } from '@/components/vo-creation/EinrichtungForm';

import einrichtungenDataJson from '@/data/einrichtungenData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface PrototypeData {
  einrichtungen: Einrichtung[];
  [key: string]: unknown;
}

export default function EditEinrichtungPage() {
  const router = useRouter();
  const params = useParams();
  const einrichtungId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);
  const [currentEinrichtung, setCurrentEinrichtung] = useState<Einrichtung | null>(null);

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

          const einrichtung = einrichtungen.find((e: Einrichtung) => e.id === einrichtungId);
          setCurrentEinrichtung(einrichtung || null);
        } else {
          const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
            id: e.id,
            name: e.name,
            status: 'Aktiv' as const,
          }));
          setData({ einrichtungen: initialEinrichtungen });

          const einrichtung = initialEinrichtungen.find((e) => e.id === einrichtungId);
          setCurrentEinrichtung(einrichtung || null);
        }
      } catch {
        const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
          id: e.id,
          name: e.name,
          status: 'Aktiv' as const,
        }));
        setData({ einrichtungen: initialEinrichtungen });

        const einrichtung = initialEinrichtungen.find((e) => e.id === einrichtungId);
        setCurrentEinrichtung(einrichtung || null);
      }
      setIsLoading(false);
    };

    loadData();
  }, [einrichtungId]);

  const handleSave = (formData: { name: string; status: 'Aktiv' | 'Inaktiv' }) => {
    if (!data || !currentEinrichtung) return;

    const updatedEinrichtungen = data.einrichtungen.map((e) =>
      e.id === einrichtungId
        ? { ...e, name: formData.name, status: formData.status }
        : e
    );

    const updatedData = {
      ...data,
      einrichtungen: updatedEinrichtungen,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!currentEinrichtung) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Einrichtung nicht gefunden</h2>
          <p className="text-gray-500 mb-4">Die angeforderte Einrichtung existiert nicht.</p>
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-800"
          >
            Zurück zur Übersicht
          </button>
        </div>
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
        <h1 className="text-2xl font-bold text-gray-900">ER bearbeiten</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <EinrichtungForm
          mode="edit"
          initialData={currentEinrichtung}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
