'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice, Arzt } from '@/types';

// Import mock data
import practicesDataJson from '@/data/practicesData.json';
import arzteDataJson from '@/data/arzteData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function EditPracticePage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practices, setPractices] = useState<Practice[]>([]);
  const [doctors, setDoctors] = useState<Arzt[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        let loadedPractices: Practice[];

        if (stored) {
          const data = JSON.parse(stored);
          loadedPractices = data.practices || practicesDataJson;
        } else {
          loadedPractices = practicesDataJson as Practice[];
        }

        setPractices(loadedPractices);

        // Find the practice to edit
        const practice = loadedPractices.find(p => p.id === practiceId);
        if (practice) {
          setSelectedPractice(practice);
        }

        // Convert arzte to Arzt format
        setDoctors(arzteDataJson.map((a: { id: string; arzt_vorname: string; arzt_nachname: string }) => ({
          id: a.id,
          name: `${a.arzt_vorname} ${a.arzt_nachname}`,
          practiceId: undefined,
          facilities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })) as Arzt[]);
      } catch {
        setPractices(practicesDataJson as Practice[]);
        const practice = (practicesDataJson as Practice[]).find(p => p.id === practiceId);
        if (practice) {
          setSelectedPractice(practice);
        }
        setDoctors([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [practiceId]);

  const handleSave = (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedPractice) return;

    const updatedPractice: Practice = {
      ...practiceData,
      id: selectedPractice.id,
      createdAt: selectedPractice.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Update in sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.practices = (data.practices || practices).map((p: Practice) =>
          p.id === selectedPractice.id ? updatedPractice : p
        );
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        const newData = {
          practices: practices.map(p => p.id === selectedPractice.id ? updatedPractice : p),
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
    } catch {
      console.error('Failed to update practice');
    }

    // Navigate back to practices list
    router.push('/prototypes/vo-creation/admin/practices');
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation/admin/practices');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!selectedPractice) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Praxis nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Die angeforderte Praxis existiert nicht.</p>
          <button
            onClick={() => router.push('/prototypes/vo-creation/admin/practices')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Zurück zur Praxisliste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <button
          onClick={() => router.push('/prototypes/vo-creation/admin/practices')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Praxisliste
        </button>
      </div>

      {/* Form */}
      <PracticeForm
        initialData={selectedPractice}
        doctors={doctors}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
}
