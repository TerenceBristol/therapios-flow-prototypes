import React, { useState } from 'react';
import { PracticeActivity, PracticeActivityType } from '@/types';
import { formatDateTimeDisplay } from '@/utils/timeUtils';

interface ActivityLogSectionProps {
  activities: PracticeActivity[];
  onAddActivity: () => void;
  showHeader?: boolean; // Control header visibility
  showAddButton?: boolean; // Control add button visibility
  collapsible?: boolean; // Control collapsible behavior
}

const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({
  activities,
  onAddActivity,
  showHeader = true,
  showAddButton = true,
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActivityIcon = (type: PracticeActivityType) => {
    switch (type) {
      case 'Call':
        return '📞';
      case 'Email':
        return '📧';
      case 'Fax':
        return '📠';
      case 'Note':
        return '📝';
    }
  };

  // Sort activities by date descending (newest first)
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Show first 5 or all
  const displayActivities = showAll ? sortedActivities : sortedActivities.slice(0, 5);

  return (
    <div className="mb-6">
      {showHeader && (
        <div
          className={`flex items-center justify-between mb-2 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            📝 Activity Log
          </h3>
          <div className="flex items-center gap-3">
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddActivity();
                }}
                className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                + Add
              </button>
            )}
            {collapsible && (
              <span className="text-muted-foreground text-sm">
                {isExpanded ? '▲' : '▼'}
              </span>
            )}
          </div>
        </div>
      )}

      {(collapsible ? isExpanded : true) && (
        <div className="mt-3">
          {activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No activity logged yet
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {displayActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="p-3 border border-border rounded-lg bg-background"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                    <div className="text-sm text-foreground ml-7">
                      {activity.notes}
                    </div>
                  </div>
                ))}
              </div>

              {sortedActivities.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {showAll ? 'Show Less' : `View All Activity History (${sortedActivities.length} total)`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogSection;
