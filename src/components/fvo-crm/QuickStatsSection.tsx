import React from 'react';
import { PracticeWithComputed } from '@/types';

interface QuickStatsSectionProps {
  practice: PracticeWithComputed;
}

const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({ practice }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
        📊 Quick Stats
      </h3>

      <div className="space-y-2 text-sm">
        {/* Pending FVOs */}
        <div className="flex items-center gap-2">
          <span className="text-lg">⏳</span>
          <span className="text-foreground">
            {practice.pendingVOCount === 0 ? (
              <span className="font-medium">✅ No Pending FVOs</span>
            ) : (
              <span><span className="font-medium">{practice.pendingVOCount}</span> Pending FVOs</span>
            )}
          </span>
        </div>

        {/* Last Contact */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-foreground">
            Last Contact: {practice.lastActivity ? formatDate(practice.lastActivity.date) : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsSection;
