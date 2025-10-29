'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ArztForm from '@/components/fvo-crm/forms/ArztForm';
import { Practice, Arzt } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function EditArztPage() {
  const router = useRouter();
  const params = useParams();
  const arztId = params.id as string;

  const [arzte] = useState<Arzt[]>(mockData.doctors as Arzt[]);
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [selectedArzt, setSelectedArzt] = useState<Arzt | null>(null);

  useEffect(() => {
    const arzt = arzte.find(a => a.id === arztId);
    if (arzt) {
      setSelectedArzt(arzt);
    } else {
      // If arzt not found, redirect to list
      router.push('/prototypes/fvo-crm/admin/arzte');
    }
  }, [arztId, arzte, router]);

  const handleSave = (arztData: Omit<Arzt, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedArzt) return;

    // TODO: Implement save logic (will be handled by dashboard refactor)
    const updatedArzt: Arzt = {
      ...arztData,
      id: selectedArzt.id,
      createdAt: selectedArzt.createdAt,
      updatedAt: new Date().toISOString()
    };
    console.log('Save arzt:', updatedArzt);

    // Navigate back to arzte list
    router.push('/prototypes/fvo-crm/admin/arzte');
  };

  const handleCancel = () => {
    router.push('/prototypes/fvo-crm/admin/arzte');
  };

  if (!selectedArzt) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading arzt...</p>
        </div>
      </div>
    );
  }

  return (
    <ArztForm
      initialData={selectedArzt}
      practices={practices}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={true}
    />
  );
}
