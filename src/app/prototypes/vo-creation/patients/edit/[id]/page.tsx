'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientForm } from '@/components/vo-creation/PatientForm';
import { Patient } from '@/components/vo-creation/PatientModal';

import patientsDataJson from '@/data/patientsData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        let loadedPatients: Patient[];

        if (stored) {
          const data = JSON.parse(stored);
          loadedPatients = data.patients || patientsDataJson;
        } else {
          loadedPatients = patientsDataJson as Patient[];
        }

        const patient = loadedPatients.find((p) => p.id === patientId);
        if (patient) {
          setCurrentPatient(patient);
        }
      } catch {
        const fallbackPatients = patientsDataJson as Patient[];
        const patient = fallbackPatients.find((p) => p.id === patientId);
        if (patient) {
          setCurrentPatient(patient);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [patientId]);

  const handleSave = (patientData: Omit<Patient, 'id'>) => {
    if (!currentPatient) return;

    const updatedPatient: Patient = {
      ...patientData,
      id: currentPatient.id,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentPatients = data.patients || patientsDataJson;
      const updatedPatients = currentPatients.map((p: Patient) =>
        p.id === currentPatient.id ? updatedPatient : p
      );
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

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Patient nicht gefunden</h2>
          <p className="text-gray-500 mb-4">Der angeforderte Patient existiert nicht.</p>
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
          Patient bearbeiten
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <PatientForm
          mode="edit"
          initialPatient={currentPatient}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
