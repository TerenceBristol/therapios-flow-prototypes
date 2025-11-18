import React from 'react';
import { PracticeActivity } from '@/types';
import ActiveIssueCard from './ActiveIssueCard';

interface ActiveIssuesSectionProps {
  activities: PracticeActivity[];
  onResolve: (activityId: string, notes?: string) => void;
}

const ActiveIssuesSection: React.FC<ActiveIssuesSectionProps> = ({ activities, onResolve }) => {
  // Filter for active issues only
  const activeIssues = activities.filter(
    activity => activity.isIssue && activity.issueStatus === 'active'
  );

  // Sort by date (newest first)
  const sortedIssues = [...activeIssues].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between px-4 py-2 bg-orange-100">
          <h3 className="text-base font-semibold text-orange-950">Issues</h3>
          {sortedIssues.length > 0 && (
            <span className="text-sm font-normal text-orange-950">
              ({sortedIssues.length})
            </span>
          )}
        </div>
      </div>

      {/* Issues List */}
      {sortedIssues.length > 0 ? (
        <div>
          {sortedIssues.map(issue => (
            <ActiveIssueCard
              key={issue.id}
              activity={issue}
              onResolve={onResolve}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-foreground font-medium">No active issues</p>
            <p className="text-sm text-muted-foreground">All issues have been resolved</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveIssuesSection;
