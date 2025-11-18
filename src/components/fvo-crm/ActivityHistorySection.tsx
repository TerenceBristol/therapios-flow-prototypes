import React, { useState } from 'react';
import { PracticeActivity, PracticeFollowUp } from '@/types';
import ActivityHistoryItem from './ActivityHistoryItem';

interface ActivityHistorySectionProps {
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
}

const ActivityHistorySection: React.FC<ActivityHistorySectionProps> = ({ activities, followUps }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 50;

  // Get completed follow-up IDs for badge display
  const completedFollowUpIds = new Set(
    followUps.filter(f => f.completed).map(f => f.id)
  );

  // Filter activities for history (all activities that are not active issues)
  const historyActivities = activities.filter(
    activity => !activity.isIssue || activity.issueStatus === 'resolved'
  );

  // Sort by date (newest first)
  const sortedActivities = [...historyActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Determine which activities to display
  const displayedActivities = showAll
    ? sortedActivities
    : sortedActivities.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMore = sortedActivities.length > INITIAL_DISPLAY_COUNT;

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
          <h3 className="text-base font-semibold text-gray-950">Activity History</h3>
          <span className="text-sm font-normal text-gray-950">
            ({sortedActivities.length})
          </span>
        </div>
      </div>

      {/* Activities List */}
      {sortedActivities.length > 0 ? (
        <div className="bg-gray-50/50 border border-gray-200 rounded-lg">
          <div className="divide-y divide-border">
            {displayedActivities.map(activity => (
              <div key={activity.id} className="px-4">
                <ActivityHistoryItem
                  activity={activity}
                  isFromFollowUp={completedFollowUpIds.has(activity.id)}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !showAll && (
            <div className="p-4 border-t border-border text-center">
              <button
                onClick={() => setShowAll(true)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Load More ({sortedActivities.length - INITIAL_DISPLAY_COUNT} more)
              </button>
            </div>
          )}

          {/* Show Less Button */}
          {showAll && hasMore && (
            <div className="p-4 border-t border-border text-center">
              <button
                onClick={() => setShowAll(false)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      ) : (
        // Empty State
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-foreground font-medium">No activity history</p>
            <p className="text-sm text-muted-foreground">Activities will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityHistorySection;
