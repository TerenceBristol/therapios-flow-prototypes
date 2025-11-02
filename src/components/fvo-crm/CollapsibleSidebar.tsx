'use client';

import { useState, useEffect } from 'react';

interface CollapsibleSidebarProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  storageKey?: string; // Key for localStorage persistence
  className?: string;
}

export default function CollapsibleSidebar({
  children,
  defaultCollapsed = false,
  storageKey = 'fvo-crm-sidebar-collapsed',
  className = ''
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMounted, setIsMounted] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, [storageKey]);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(storageKey, isCollapsed.toString());
    }
  }, [isCollapsed, storageKey, isMounted]);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div
      className={`relative transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-[300px]'
      } ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 -right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(var(--background))] border border-[oklch(var(--border))] shadow-md hover:bg-[oklch(var(--muted))] transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`h-3 w-3 transition-transform duration-300 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div
        className={`h-full bg-[oklch(var(--card))] border-r border-[oklch(var(--border))] ${
          isCollapsed ? 'px-2' : 'px-4'
        } py-4`}
      >
        <div
          className={`h-full overflow-y-auto transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {!isCollapsed && children}
        </div>

        {/* Collapsed state - show icons only */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-4 pt-8">
            {/* Icon indicators for collapsed state */}
            <div className="w-8 h-8 rounded-full bg-[oklch(var(--muted))] flex items-center justify-center text-xs">
              📋
            </div>
            <div className="w-8 h-8 rounded-full bg-[oklch(var(--muted))] flex items-center justify-center text-xs">
              📞
            </div>
            <div className="w-8 h-8 rounded-full bg-[oklch(var(--muted))] flex items-center justify-center text-xs">
              🕐
            </div>
            <div className="w-8 h-8 rounded-full bg-[oklch(var(--muted))] flex items-center justify-center text-xs">
              👨‍⚕️
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
