import React from 'react';
import FVOCRMLayout from '@/components/fvo-crm/FVOCRMLayout';
import { FVOCRMProvider } from '@/contexts/FVOCRMContext';

interface FVOCRMLayoutProps {
  children: React.ReactNode;
}

export default function FVOCRMRouteLayout({ children }: FVOCRMLayoutProps) {
  return (
    <FVOCRMProvider>
      <FVOCRMLayout>{children}</FVOCRMLayout>
    </FVOCRMProvider>
  );
}
