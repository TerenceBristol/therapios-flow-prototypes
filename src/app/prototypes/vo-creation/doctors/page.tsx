'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EntityTable, Column, Arzt } from '@/components/vo-creation';

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

// Extended Arzt type with praxis_id
interface ArztWithPraxis extends Arzt {
  praxis_id?: string;
}

export default function DoctorsListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<ArztWithPraxis[]>([]);
  const [praxen, setPraxen] = useState<Praxis[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setDoctors(data.arzte || arzteDataJson);
          setPraxen(data.praxen || praxenDataJson);
        } else {
          setDoctors(arzteDataJson as ArztWithPraxis[]);
          setPraxen(praxenDataJson as Praxis[]);
        }
      } catch {
        setDoctors(arzteDataJson as ArztWithPraxis[]);
        setPraxen(praxenDataJson as Praxis[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getPraxisName = (praxisId?: string) => {
    if (!praxisId) return '-';
    const praxis = praxen.find((p) => p.id === praxisId);
    return praxis?.name || '-';
  };

  const columns: Column<ArztWithPraxis>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (doctor) => (
        <span className="font-mono text-gray-500">{doctor.id.replace('a-', '')}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (doctor) => `${doctor.arzt_vorname} ${doctor.arzt_nachname}`,
    },
    {
      key: 'praxis',
      header: 'Praxis',
      render: (doctor) => (
        <span className="text-gray-600">{getPraxisName(doctor.praxis_id)}</span>
      ),
    },
  ];

  const handleEdit = (doctor: ArztWithPraxis) => {
    router.push(`/prototypes/vo-creation/doctors/edit/${doctor.id}`);
  };

  const handleCreate = () => {
    router.push('/prototypes/vo-creation/doctors/create');
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
        title="Ärzte verwalten"
        columns={columns}
        data={doctors}
        searchPlaceholder="Arzt suchen"
        searchFields={['arzt_vorname', 'arzt_nachname', 'arzt_arztnummer']}
        onEdit={handleEdit}
        onCreate={handleCreate}
        createLabel="+ Arzt hinzufügen"
        getRowId={(doctor) => doctor.id}
      />
    </div>
  );
}
