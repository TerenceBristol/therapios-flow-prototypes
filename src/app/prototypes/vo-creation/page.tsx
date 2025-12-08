'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VODashboard } from '@/components/vo-creation/VODashboard';
import { VO } from '@/components/vo-creation/VOForm';
import { Therapist } from '@/components/vo-creation/TherapistModal';
import { Patient } from '@/components/vo-creation/PatientModal';
import { Arzt } from '@/components/vo-creation/ArztModal';
import { SuccessToast } from '@/components/vo-creation/SuccessToast';

// Import mock data
import voDataJson from '@/data/voCreationData.json';
import therapistsDataJson from '@/data/therapistsData.json';
import patientsDataJson from '@/data/patientsData.json';
import arzteDataJson from '@/data/arzteData.json';
import einrichtungenDataJson from '@/data/einrichtungenData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

interface PrototypeData {
  vos: VO[];
  therapists: Therapist[];
  patients: Patient[];
  arzte: Arzt[];
  einrichtungen: { id: string; name: string; short_name?: string; type?: string }[];
}

function VOCreationDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PrototypeData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load data from sessionStorage or initialize from mock data
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          // Initialize with mock data
          const initialData: PrototypeData = {
            vos: voDataJson as VO[],
            therapists: therapistsDataJson as Therapist[],
            patients: patientsDataJson as Patient[],
            arzte: arzteDataJson as Arzt[],
            einrichtungen: einrichtungenDataJson,
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
          setData(initialData);
        }
      } catch {
        // Fallback to mock data if sessionStorage fails
        setData({
          vos: voDataJson as VO[],
          therapists: therapistsDataJson as Therapist[],
          patients: patientsDataJson as Patient[],
          arzte: arzteDataJson as Arzt[],
          einrichtungen: einrichtungenDataJson,
        });
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Check for success message in URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const voNumber = searchParams.get('voNumber');

    if (success === 'created' && voNumber) {
      setToastMessage(`VO ${voNumber} erfolgreich erstellt`);
      // Clear the URL params
      router.replace('/prototypes/vo-creation', { scroll: false });
    }
  }, [searchParams, router]);

  const handleDismissToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const handleEdit = (vo: VO) => {
    router.push(`/prototypes/vo-creation/edit/${vo.id}`);
  };

  const handleCreate = () => {
    router.push('/prototypes/vo-creation/create');
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <VODashboard
          vos={data.vos}
          therapists={data.therapists}
          patients={data.patients}
          arzte={data.arzte}
          einrichtungen={data.einrichtungen}
          onEdit={handleEdit}
          onCreate={handleCreate}
        />
      </div>

      {toastMessage && (
        <SuccessToast message={toastMessage} onDismiss={handleDismissToast} />
      )}
    </>
  );
}

export default function VOCreationDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-muted-foreground">Laden...</div></div>}>
      <VOCreationDashboardContent />
    </Suspense>
  );
}
