'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Admin Dashboard',
    href: '/prototypes/vo-creation',
  },
  {
    label: 'Admin',
    children: [
      { label: 'Team', href: '/prototypes/vo-creation/team' },
      { label: 'Patients', href: '/prototypes/vo-creation/patients' },
      { label: 'Doctors', href: '/prototypes/vo-creation/doctors' },
      { label: 'Practices', href: '/prototypes/vo-creation/admin/practices' },
      { label: 'Einrichtungen', href: '/prototypes/vo-creation/einrichtungen' },
    ],
  },
  {
    label: 'Upload Dashboard',
    children: [
      { label: 'Prescription', href: '/prototypes/vo-creation/vo-upload' },
      { label: 'Other Documents', href: '/prototypes/other-documents-upload' },
    ],
  },
];

export function NavigationHeader() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/prototypes/vo-creation') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isDropdownActive = (children: { label: string; href: string }[]) => {
    return children.some((child) => pathname.startsWith(child.href));
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6">
        <nav className="flex items-center h-14 gap-8">
          {/* Logo */}
          <Link
            href="/prototypes/vo-creation"
            className="flex items-center gap-2 text-lg font-semibold text-gray-900"
          >
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Therapios</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              if (item.href) {
                // Direct link
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              // Dropdown
              const isOpen = openDropdown === item.label;
              const hasActiveChild = item.children && isDropdownActive(item.children);

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                      hasActiveChild
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && item.children && (
                    <div className="absolute top-full left-0 pt-1 w-48 z-50">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
