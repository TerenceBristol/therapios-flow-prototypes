'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PracticesManagementTable from '@/components/fvo-crm/table/PracticesManagementTable';
import { Practice, PracticeDoctor } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function AdminPracticesPage() {
  const router = useRouter();
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [doctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);

  const handleEdit = (practiceId: string) => {
    router.push(`/prototypes/fvo-crm/admin/practices/${practiceId}`);
  };

  const handleAdd = () => {
    router.push('/prototypes/fvo-crm/admin/practices/new');
  };

  return (
    <PracticesManagementTable
      practices={practices}
      doctors={doctors}
      onEdit={handleEdit}
      onAdd={handleAdd}
    />
  );
}
