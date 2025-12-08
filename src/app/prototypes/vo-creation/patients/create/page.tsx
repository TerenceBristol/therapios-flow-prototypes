'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PatientForm } from '@/components/vo-creation/PatientForm';
import { Patient } from '@/components/vo-creation/PatientModal';

import patientsDataJson from '@/data/patientsData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function CreatePatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSave = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `p-${Date.now()}`,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentPatients = data.patients || patientsDataJson;
      const updatedPatients = [...currentPatients, newPatient];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, patients: updatedPatients }));
    } catch {
      // Ignore storage errors
    }

    router.push('/prototypes/vo-creation/patients');
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation/patients');
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
          Patient erstellen
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <PatientForm
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
