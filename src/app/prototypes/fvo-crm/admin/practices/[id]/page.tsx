'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function EditPracticePage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  useEffect(() => {
    const practice = practices.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
    } else {
      // If practice not found, redirect to list
      router.push('/prototypes/fvo-crm/admin/practices');
    }
  }, [practiceId, practices, router]);

  const handleSave = (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedPractice) return;

    // TODO: Implement save logic (will be handled by dashboard refactor)
    const updatedPractice: Practice = {
      ...practiceData,
      id: selectedPractice.id,
      createdAt: selectedPractice.createdAt,
      updatedAt: new Date().toISOString()
    };
    console.log('Save practice:', updatedPractice);

    // Navigate back to practices list
    router.push('/prototypes/fvo-crm/admin/practices');
  };

  const handleCancel = () => {
    router.push('/prototypes/fvo-crm/admin/practices');
  };

  if (!selectedPractice) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading practice...</p>
        </div>
      </div>
    );
  }

  return (
    <PracticeForm
      initialData={selectedPractice}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={true}
    />
  );
}
