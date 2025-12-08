'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntityTable, Column } from '@/components/vo-creation';
import { Einrichtung } from '@/components/vo-creation/EinrichtungForm';

import einrichtungenDataJson from '@/data/einrichtungenData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function EinrichtungenListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [einrichtungen, setEinrichtungen] = useState<Einrichtung[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Map legacy data format to new format
          const loadedEinrichtungen = (data.einrichtungen || einrichtungenDataJson).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            name: e.name as string,
            status: (e.status as 'Aktiv' | 'Inaktiv') || 'Aktiv',
          }));
          setEinrichtungen(loadedEinrichtungen);
        } else {
          // Map initial data to new format
          const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
            id: e.id,
            name: e.name,
            status: 'Aktiv' as const,
          }));
          setEinrichtungen(initialEinrichtungen);
        }
      } catch {
        const initialEinrichtungen = einrichtungenDataJson.map((e) => ({
          id: e.id,
          name: e.name,
          status: 'Aktiv' as const,
        }));
        setEinrichtungen(initialEinrichtungen);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const columns: Column<Einrichtung>[] = [
    {
      key: 'id',
      header: 'Einrichtungs-ID',
      width: '120px',
      render: (einrichtung) => (
        <span className="font-mono text-gray-500">{einrichtung.id.replace('e-', '')}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name der Einrichtung',
      render: (einrichtung) => einrichtung.name,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (einrichtung) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            einrichtung.status === 'Aktiv'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {einrichtung.status}
        </span>
      ),
    },
  ];

  const handleEdit = (einrichtung: Einrichtung) => {
    router.push(`/prototypes/vo-creation/einrichtungen/edit/${einrichtung.id}`);
  };

  const handleCreate = () => {
    router.push('/prototypes/vo-creation/einrichtungen/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <EntityTable
        title="Einrichtungen (ER)"
        columns={columns}
        data={einrichtungen}
        searchPlaceholder="Einrichtung suchen"
        searchFields={['name']}
        onEdit={handleEdit}
        onCreate={handleCreate}
        createLabel="+ ER"
        getRowId={(einrichtung) => einrichtung.id}
      />
    </div>
  );
}
