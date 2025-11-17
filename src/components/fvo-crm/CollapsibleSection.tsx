'use client';

import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  count,
  defaultExpanded = true,
  children
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">
            {isExpanded ? '▼' : '▶'}
          </span>
          {icon && <span>{icon}</span>}
          <span className="font-semibold text-foreground">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">({count})</span>
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}
