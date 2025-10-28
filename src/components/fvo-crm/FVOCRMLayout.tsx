'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FVOCRMLayoutProps {
  children: React.ReactNode;
}

const FVOCRMLayout: React.FC<FVOCRMLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const tabs = [
    { name: 'CRM', href: '/prototypes/fvo-crm' },
    { name: 'Practices', href: '/prototypes/fvo-crm/practices' },
    { name: 'Doctors', href: '/prototypes/fvo-crm/doctors' }
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            ← Back to Wireframes
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-4">
            Practice Follow-up CRM
          </h1>

          {/* Tab Navigation */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              // Exact match for CRM tab (root route), startsWith for others
              const isActive = tab.href === '/prototypes/fvo-crm'
                ? pathname === '/prototypes/fvo-crm'
                : pathname?.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-6 py-2.5 rounded-t-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-background text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FVOCRMLayout;
