'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArzteTable from '@/components/fvo-crm/table/ArzteTable';
import { Practice, Arzt } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function AdminArzteListPage() {
  const router = useRouter();
  const [arzte] = useState<Arzt[]>(mockData.doctors as Arzt[]);
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);

  const handleEdit = (arztId: string) => {
    router.push(`/prototypes/fvo-crm/admin/arzte/${arztId}`);
  };

  const handleAdd = () => {
    router.push('/prototypes/fvo-crm/admin/arzte/new');
  };

  return (
    <ArzteTable
      arzte={arzte}
      practices={practices}
      onEdit={handleEdit}
      onAdd={handleAdd}
    />
  );
}
