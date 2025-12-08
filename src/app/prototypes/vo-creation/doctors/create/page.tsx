'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DoctorForm } from '@/components/vo-creation/DoctorForm';
import { Arzt } from '@/components/vo-creation/ArztModal';

import arzteDataJson from '@/data/arzteData.json';
import praxenDataJson from '@/data/praxenData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface Praxis {
  id: string;
  name: string;
  strasse?: string;
  plz?: string;
  ort?: string;
}

interface ArztWithPraxis extends Arzt {
  praxis_id?: string;
}

export default function CreateDoctorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [praxen, setPraxen] = useState<Praxis[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setPraxen(data.praxen || praxenDataJson);
        } else {
          setPraxen(praxenDataJson as Praxis[]);
        }
      } catch {
        setPraxen(praxenDataJson as Praxis[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSave = (doctorData: { arzt_vorname: string; arzt_nachname: string; arzt_arztnummer?: string; praxis_id?: string }) => {
    const newDoctor: ArztWithPraxis = {
      id: `a-${Date.now()}`,
      arzt_vorname: doctorData.arzt_vorname,
      arzt_nachname: doctorData.arzt_nachname,
      arzt_arztnummer: doctorData.arzt_arztnummer || '',
      arzt_strasse: '',
      arzt_plz: '',
      arzt_ort: '',
      arzt_telefax: '',
      praxis_id: doctorData.praxis_id,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentDoctors = data.arzte || arzteDataJson;
      const updatedDoctors = [...currentDoctors, newDoctor];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, arzte: updatedDoctors }));
    } catch {
      // Ignore storage errors
    }

    router.push('/prototypes/vo-creation/doctors');
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation/doctors');
  };

  if (isLoading) {
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
          Arzt erstellen
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <DoctorForm
          mode="create"
          praxen={praxen}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
