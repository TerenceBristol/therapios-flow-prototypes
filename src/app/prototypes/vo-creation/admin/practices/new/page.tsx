'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice, Arzt } from '@/types';

// Import mock data
import practicesDataJson from '@/data/practicesData.json';
import arzteDataJson from '@/data/arzteData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function NewPracticePage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Arzt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    // Convert arzte to Arzt format for the form
    setDoctors(arzteDataJson.map((a: { id: string; arzt_vorname: string; arzt_nachname: string }) => ({
      id: a.id,
      name: `${a.arzt_vorname} ${a.arzt_nachname}`,
      practiceId: undefined,
      facilities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as Arzt[]);
    setIsLoading(false);
  }, []);

  const handleSave = (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Create new practice
    const newPractice: Practice = {
      ...practiceData,
      id: `prac-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.practices = [...(data.practices || []), newPractice];
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        const newData = {
          practices: [...(practicesDataJson as Practice[]), newPractice],
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
    } catch {
      console.error('Failed to save practice');
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
        doctors={doctors}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={false}
      />
    </div>
  );
}
