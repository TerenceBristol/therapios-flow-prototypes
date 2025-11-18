import React from 'react';
import { PracticeActivity } from '@/types';

interface ActivityHistoryItemProps {
  activity: PracticeActivity;
  isFromFollowUp?: boolean; // True if this activity was created from completing a follow-up
}

const ActivityHistoryItem: React.FC<ActivityHistoryItemProps> = ({ activity, isFromFollowUp = false }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isResolvedIssue = activity.isIssue && activity.issueStatus === 'resolved';

  return (
    <div className="border-b border-border py-2 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-2">
        {/* Type Label Badge */}
        <div className="flex-shrink-0">
          {isResolvedIssue ? (
            <span className="inline-flex items-center justify-center w-[110px] px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-300">
              Resolved Issue
            </span>
          ) : isFromFollowUp ? (
            <span className="inline-flex items-center justify-center w-[110px] px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
              Follow-Up
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-[110px] px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
              Activity
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Notes */}
          <p className="text-foreground text-sm mb-2 whitespace-pre-wrap">{activity.notes}</p>

          {/* Metadata - Vertical Layout */}
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">
              {formatDate(activity.date)} at {formatTime(activity.date)}
            </div>
            {isResolvedIssue && activity.resolvedAt && (
              <div className="text-[11px] mt-0.5">
                Resolved {formatDate(activity.resolvedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistoryItem;
