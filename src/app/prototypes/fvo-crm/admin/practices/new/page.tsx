'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PracticeForm from '@/components/fvo-crm/forms/PracticeForm';
import { Practice } from '@/types';

export default function NewPracticePage() {
  const router = useRouter();

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
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={false}
    />
  );
}
