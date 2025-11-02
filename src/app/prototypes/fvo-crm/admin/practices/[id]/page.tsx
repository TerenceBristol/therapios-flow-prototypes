'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice } from '@/types';
import { useFVOCRM } from '@/hooks/useFVOCRM';

export default function EditPracticePage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const { practices, doctors, updatePractice } = useFVOCRM();
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

    // Update practice using context
    updatePractice(selectedPractice.id, practiceData);

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
      doctors={doctors}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={true}
    />
  );
}
