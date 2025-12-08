'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentDoctor, setCurrentDoctor] = useState<ArztWithPraxis | null>(null);
  const [praxen, setPraxen] = useState<Praxis[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        let loadedDoctors: ArztWithPraxis[];
        let loadedPraxen: Praxis[];

        if (stored) {
          const data = JSON.parse(stored);
          loadedDoctors = data.arzte || arzteDataJson;
          loadedPraxen = data.praxen || praxenDataJson;
        } else {
          loadedDoctors = arzteDataJson as ArztWithPraxis[];
          loadedPraxen = praxenDataJson as Praxis[];
        }

        setPraxen(loadedPraxen);
        const doctor = loadedDoctors.find((d) => d.id === doctorId);
        if (doctor) {
          setCurrentDoctor(doctor);
        }
      } catch {
        const fallbackDoctors = arzteDataJson as ArztWithPraxis[];
        setPraxen(praxenDataJson as Praxis[]);
        const doctor = fallbackDoctors.find((d) => d.id === doctorId);
        if (doctor) {
          setCurrentDoctor(doctor);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [doctorId]);

  const handleSave = (doctorData: { arzt_vorname: string; arzt_nachname: string; arzt_arztnummer?: string; praxis_id?: string }) => {
    if (!currentDoctor) return;

    const updatedDoctor: ArztWithPraxis = {
      ...currentDoctor,
      arzt_vorname: doctorData.arzt_vorname,
      arzt_nachname: doctorData.arzt_nachname,
      arzt_arztnummer: doctorData.arzt_arztnummer || '',
      praxis_id: doctorData.praxis_id,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentDoctors = data.arzte || arzteDataJson;
      const updatedDoctors = currentDoctors.map((d: ArztWithPraxis) =>
        d.id === currentDoctor.id ? updatedDoctor : d
      );
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

  if (!currentDoctor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Arzt nicht gefunden</h2>
          <p className="text-gray-500 mb-4">Der angeforderte Arzt existiert nicht.</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Zurück zur Liste
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
          Arzt bearbeiten
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <DoctorForm
          mode="edit"
          initialDoctor={currentDoctor}
          praxen={praxen}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
