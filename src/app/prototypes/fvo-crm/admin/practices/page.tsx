'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PracticesManagementTable from '@/components/fvo-crm/table/PracticesManagementTable';
import { useFVOCRM } from '@/hooks/useFVOCRM';

export default function AdminPracticesPage() {
  const router = useRouter();
  const { practices, doctors } = useFVOCRM();

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
