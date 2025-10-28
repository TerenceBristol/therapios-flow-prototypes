import React from 'react';
import FVOCRMLayout from '@/components/fvo-crm/FVOCRMLayout';

interface FVOCRMLayoutProps {
  children: React.ReactNode;
}

export default function FVOCRMRouteLayout({ children }: FVOCRMLayoutProps) {
  return <FVOCRMLayout>{children}</FVOCRMLayout>;
}
