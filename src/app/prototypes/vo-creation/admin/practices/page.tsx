'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PracticesManagementTable from '@/components/fvo-crm/table/PracticesManagementTable';
import { Practice, Arzt } from '@/types';

// Import mock data
import practicesDataJson from '@/data/practicesData.json';
import arzteDataJson from '@/data/arzteData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function AdminPracticesPage() {
  const router = useRouter();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [doctors, setDoctors] = useState<Arzt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from sessionStorage or initialize
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setPractices(data.practices || practicesDataJson);
          // Load doctors from arzte data (convert to FVO-CRM Arzt format)
          setDoctors(arzteDataJson.map((a: { id: string; arzt_vorname: string; arzt_nachname: string }) => ({
            id: a.id,
            name: `${a.arzt_vorname} ${a.arzt_nachname}`,
            practiceId: undefined,
            facilities: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) as Arzt[]);
        } else {
          setPractices(practicesDataJson as Practice[]);
          setDoctors([]);
        }
      } catch {
        setPractices(practicesDataJson as Practice[]);
        setDoctors([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleEdit = (practiceId: string) => {
    router.push(`/prototypes/vo-creation/admin/practices/${practiceId}`);
  };

  const handleAdd = () => {
    router.push('/prototypes/vo-creation/admin/practices/new');
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
              onClick={() => router.push('/prototypes/vo-creation')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück zum Dashboard
            </button>
            <h1 className="text-2xl font-bold text-foreground">Praxisverwaltung</h1>
            <p className="text-sm text-muted-foreground mt-1">Verwalten Sie alle Praxen</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <PracticesManagementTable
        practices={practices}
        doctors={doctors}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />
    </div>
  );
}
