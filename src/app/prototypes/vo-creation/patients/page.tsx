'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntityTable, Column, Patient } from '@/components/vo-creation';

import patientsDataJson from '@/data/patientsData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function PatientsListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setPatients(data.patients || patientsDataJson);
        } else {
          setPatients(patientsDataJson as Patient[]);
        }
      } catch {
        setPatients(patientsDataJson as Patient[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const formatAddress = (patient: Patient) => {
    const parts = [];
    if (patient.pat_strasse) parts.push(patient.pat_strasse);
    if (patient.pat_plz && patient.pat_ort) {
      parts.push(`${patient.pat_plz} ${patient.pat_ort}`);
    } else if (patient.pat_ort) {
      parts.push(patient.pat_ort);
    }
    return parts.join(', ') || '-';
  };

  const columns: Column<Patient>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (patient) => (
        <span className="font-mono text-gray-500">{patient.id.replace('p-', '')}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (patient) => `${patient.pat_vorname} ${patient.pat_nachname}`,
    },
    {
      key: 'pat_geburtsdatum',
      header: 'Geburtsdatum',
      render: (patient) => {
        if (!patient.pat_geburtsdatum) return '-';
        const date = new Date(patient.pat_geburtsdatum);
        return date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
    },
    {
      key: 'address',
      header: 'Adresse',
      render: (patient) => (
        <span className="text-gray-600">{formatAddress(patient)}</span>
      ),
    },
    {
      key: 'insurance',
      header: 'Versicherung',
      render: (patient) => (
        <span className="text-gray-600">{patient.pat_kostentraeger || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (patient) => (
        <span className={`inline-flex items-center gap-1 ${patient.pat_zuzahlung_befreit === 'Ja' ? 'text-green-700' : 'text-gray-600'}`}>
          {patient.pat_zuzahlung_befreit === 'Ja' ? 'Befreit' : 'Standard'}
        </span>
      ),
    },
  ];

  const handleEdit = (patient: Patient) => {
    router.push(`/prototypes/vo-creation/patients/edit/${patient.id}`);
  };

  const handleCreate = () => {
    router.push('/prototypes/vo-creation/patients/create');
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
        title="Patienten verwalten"
        columns={columns}
        data={patients}
        searchPlaceholder="Patient suchen"
        searchFields={['pat_vorname', 'pat_nachname', 'pat_versichertennummer']}
        onEdit={handleEdit}
        onCreate={handleCreate}
        createLabel="+ Patient hinzufügen"
        getRowId={(patient) => patient.id}
      />
    </div>
  );
}
