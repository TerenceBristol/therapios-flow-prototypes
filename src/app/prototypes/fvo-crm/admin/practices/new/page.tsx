'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice, Arzt } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function NewPracticePage() {
  const router = useRouter();
  const [doctors] = useState<Arzt[]>(mockData.doctors as Arzt[]);

  const handleSave = (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement save logic (will be handled by dashboard refactor)
    const newPractice: Practice = {
      ...practiceData,
      id: `practice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('Create practice:', newPractice);

    // Navigate back to practices list
    router.push('/prototypes/fvo-crm/admin/practices');
  };

  const handleCancel = () => {
    router.push('/prototypes/fvo-crm/admin/practices');
  };

  return (
    <PracticeForm
      doctors={doctors}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={false}
    />
  );
}
