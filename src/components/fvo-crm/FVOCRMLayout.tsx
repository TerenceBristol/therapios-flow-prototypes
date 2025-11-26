'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FVOCRMLayoutProps {
  children: React.ReactNode;
}

const FVOCRMLayout: React.FC<FVOCRMLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on CRM page
  const isCRMActive = pathname === '/prototypes/fvo-crm';

  // Check if we're on any admin page
  const isAdminActive = pathname?.startsWith('/prototypes/fvo-crm/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };

    if (adminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminDropdownOpen]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Practice Follow-up CRM
          </h1>

          {/* Menu Navigation */}
          <div className="flex gap-1">
            {/* CRM Menu Item */}
            <Link
              href="/prototypes/fvo-crm"
              className={`px-6 py-2.5 rounded-t-lg font-medium transition-colors ${
                isCRMActive
                  ? 'bg-background text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              CRM
            </Link>

            {/* Admin Menu Item with Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={`px-6 py-2.5 rounded-t-lg font-medium transition-colors ${
                  isAdminActive
                    ? 'bg-background text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Admin {adminDropdownOpen ? '▲' : '▼'}
              </button>

              {/* Dropdown Menu */}
              {adminDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {/* Team - Display Only */}
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Team
                    </div>

                    {/* ER - Display Only */}
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      ER
                    </div>

                    {/* Practices - Clickable */}
                    <Link
                      href="/prototypes/fvo-crm/admin/practices"
                      onClick={() => setAdminDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Practices
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
