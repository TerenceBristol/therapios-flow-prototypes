'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArztForm from '@/components/fvo-crm/forms/ArztForm';
import { Practice, Arzt } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function NewArztPage() {
  const router = useRouter();
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);

  const handleSave = (arztData: Omit<Arzt, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement save logic (will be handled by dashboard refactor)
    const newArzt: Arzt = {
      ...arztData,
      id: `arzt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('Create arzt:', newArzt);

    // Navigate back to arzte list
    router.push('/prototypes/fvo-crm/admin/arzte');
  };

  const handleCancel = () => {
    router.push('/prototypes/fvo-crm/admin/arzte');
  };

  return (
    <ArztForm
      practices={practices}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={false}
    />
  );
}
