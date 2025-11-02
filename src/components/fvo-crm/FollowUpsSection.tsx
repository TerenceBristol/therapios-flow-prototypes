import React, { useState } from 'react';
import { PracticeFollowUp } from '@/types';
import { formatDateTimeDisplay } from '@/utils/timeUtils';

interface FollowUpsSectionProps {
  followUps: PracticeFollowUp[];
  onAddFollowUp: () => void;
  onCompleteFollowUp?: (followUpId: string) => void;
  showHeader?: boolean;
  showAddButton?: boolean;
  collapsible?: boolean;
}

const FollowUpsSection: React.FC<FollowUpsSectionProps> = ({
  followUps,
  onAddFollowUp,
  onCompleteFollowUp,
  showHeader = true,
  showAddButton = true,
  collapsible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // Separate active and completed follow-ups
  const activeFollowUps = followUps.filter(f => !f.completed);
  const completedFollowUps = followUps.filter(f => f.completed);

  // Sort active follow-ups by due date (earlier first)
  const sortedActiveFollowUps = [...activeFollowUps].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Get urgency class based on due date
  const getUrgencyClass = (dueDate: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 font-semibold'; // Overdue
    if (diffDays === 0) return 'text-orange-600 font-semibold'; // Due today
    if (diffDays <= 7) return 'text-yellow-600'; // Due this week
    return 'text-foreground';
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[priority];
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority];
  };

  const handleComplete = (followUpId: string) => {
    if (onCompleteFollowUp && window.confirm('Mark this follow-up as completed?')) {
      onCompleteFollowUp(followUpId);
    }
  };

  return (
    <div className="mb-6">
      {showHeader && (
        <div
          className={`flex items-center justify-between mb-2 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            📅 Follow-ups
            {activeFollowUps.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-bold">
                {activeFollowUps.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddFollowUp();
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
          {/* Active Follow-ups */}
          {sortedActiveFollowUps.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No upcoming follow-ups
            </div>
          ) : (
            <div className="space-y-3">
              {sortedActiveFollowUps.map(followUp => (
                <div
                  key={followUp.id}
                  className="p-3 border border-border rounded-lg bg-background hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${getUrgencyClass(followUp.dueDate)}`}>
                          {formatDateTimeDisplay(followUp.dueDate, followUp.dueTime)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground">
                        {followUp.notes}
                      </div>
                    </div>
                    <button
                      onClick={() => handleComplete(followUp.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      ✓ Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show Completed Toggle */}
          {completedFollowUps.length > 0 && (
            <>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                {showCompleted ? '▲' : '▼'} {completedFollowUps.length} Completed Follow-up{completedFollowUps.length !== 1 ? 's' : ''}
              </button>

              {showCompleted && (
                <div className="mt-3 space-y-2">
                  {completedFollowUps.map(followUp => (
                    <div
                      key={followUp.id}
                      className="p-3 border border-border rounded-lg bg-muted/50 opacity-60"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✓</span>
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground line-through">
                            {formatDateTimeDisplay(followUp.dueDate, followUp.dueTime)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {followUp.notes}
                          </div>
                          {followUp.completedAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Completed: {new Date(followUp.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowUpsSection;
