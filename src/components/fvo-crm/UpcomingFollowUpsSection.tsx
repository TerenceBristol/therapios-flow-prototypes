import React from 'react';
import { PracticeFollowUp } from '@/types';
import UpcomingFollowUpCard from './UpcomingFollowUpCard';

interface UpcomingFollowUpsSectionProps {
  followUps: PracticeFollowUp[];
  onComplete: (followUpId: string, notes?: string) => void;
}

const UpcomingFollowUpsSection: React.FC<UpcomingFollowUpsSectionProps> = ({ followUps, onComplete }) => {
  // Filter incomplete follow-ups and sort by date
  const upcomingFollowUps = followUps
    .filter(f => !f.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between px-4 py-2 bg-blue-100">
          <h3 className="text-base font-semibold text-blue-950">Follow-Ups</h3>
          {upcomingFollowUps.length > 0 && (
            <span className="text-sm font-normal text-blue-950">
              ({upcomingFollowUps.length})
            </span>
          )}
        </div>
      </div>

      {/* Follow-Ups List */}
      {upcomingFollowUps.length > 0 ? (
        <div className="space-y-1.5">
          {upcomingFollowUps.map(followUp => (
            <UpcomingFollowUpCard
              key={followUp.id}
              followUp={followUp}
              onComplete={onComplete}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-foreground font-medium">No upcoming follow-ups</p>
            <p className="text-sm text-muted-foreground">All follow-ups have been completed</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingFollowUpsSection;
