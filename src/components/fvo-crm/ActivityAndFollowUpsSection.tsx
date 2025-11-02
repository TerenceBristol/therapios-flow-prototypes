import React, { useState, useMemo } from 'react';
import { PracticeActivity, PracticeFollowUp, PracticeActivityType } from '@/types';
import { formatDateTimeDisplay } from '@/utils/openingHoursUtils';
import CompleteFollowUpModal from './modals/CompleteFollowUpModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface ActivityAndFollowUpsSectionProps {
  practiceId: string;
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
  onAddActivity: () => void;
  onAddFollowUp: () => void;
  onCompleteFollowUpAndLogActivity: (followUpId: string, activityData: {
    practiceId: string;
    date: string;
    type: PracticeActivityType;
    notes: string;
    userId: string;
  }) => void;
  onDeleteFollowUp?: (followUpId: string) => void;
  onDeleteActivity?: (activityId: string) => void;
  onEditFollowUp?: (followUpId: string) => void;
  onEditActivity?: (activityId: string) => void;
}

const ActivityAndFollowUpsSection: React.FC<ActivityAndFollowUpsSectionProps> = ({
  practiceId,
  activities,
  followUps,
  onAddActivity,
  onAddFollowUp,
  onCompleteFollowUpAndLogActivity,
  onDeleteFollowUp,
  onDeleteActivity,
  onEditFollowUp,
  onEditActivity
}) => {
  const [showCompletedFollowUps, setShowCompletedFollowUps] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<PracticeFollowUp | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'followUp' | 'activity' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get urgency for a follow-up
  const getFollowUpUrgency = (followUp: PracticeFollowUp): 'overdue' | 'dueToday' | 'thisWeek' | 'future' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(followUp.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'dueToday';
    if (diffDays <= 7) return 'thisWeek';
    return 'future';
  };

  // Group follow-ups by status and urgency
  const groupedFollowUps = useMemo(() => {
    const active = followUps.filter(f => !f.completed);
    const completed = followUps.filter(f => f.completed);

    const overdue = active.filter(f => getFollowUpUrgency(f) === 'overdue');
    const dueToday = active.filter(f => getFollowUpUrgency(f) === 'dueToday');
    const thisWeek = active.filter(f => getFollowUpUrgency(f) === 'thisWeek');
    const future = active.filter(f => getFollowUpUrgency(f) === 'future');

    return { overdue, dueToday, thisWeek, future, completed };
  }, [followUps]);

  // Sort activities by date (newest first)
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const displayedActivities = showAllActivities ? sortedActivities : sortedActivities.slice(0, 5);

  // Activity type icons
  const getActivityIcon = (type: PracticeActivityType) => {
    switch (type) {
      case 'Call': return '📞';
      case 'Email': return '📧';
      case 'Fax': return '📠';
      case 'Note': return '📝';
    }
  };

  const handleCompleteWithActivity = (followUp: PracticeFollowUp) => {
    setSelectedFollowUp(followUp);
    setIsCompleteModalOpen(true);
  };

  const handleDeleteFollowUp = (followUpId: string) => {
    setDeleteType('followUp');
    setDeleteId(followUpId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    setDeleteType('activity');
    setDeleteId(activityId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    if (deleteType === 'followUp' && onDeleteFollowUp) {
      onDeleteFollowUp(deleteId);
    } else if (deleteType === 'activity' && onDeleteActivity) {
      onDeleteActivity(deleteId);
    }

    setDeleteConfirmOpen(false);
    setDeleteType(null);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeleteType(null);
    setDeleteId(null);
  };

  const renderFollowUpGroup = (
    title: string,
    followUps: PracticeFollowUp[],
    urgencyColor: string,
    urgencyIcon: string
  ) => {
    if (followUps.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${urgencyColor}`}>
          {urgencyIcon} {title} ({followUps.length})
        </h4>
        <div className="space-y-2">
          {followUps.map(followUp => (
            <div key={followUp.id} className="border border-gray-200 rounded-md p-3 bg-white hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      Due: {new Date(followUp.dueDate).toLocaleDateString()}
                      {followUp.dueTime && ` at ${followUp.dueTime}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{followUp.notes}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleCompleteWithActivity(followUp)}
                  className="flex-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Complete
                </button>
                {onEditFollowUp && (
                  <button
                    onClick={() => onEditFollowUp(followUp.id)}
                    className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded hover:bg-muted transition-colors"
                    title="Edit follow-up"
                  >
                    ✏️
                  </button>
                )}
                {onDeleteFollowUp && (
                  <button
                    onClick={() => handleDeleteFollowUp(followUp.id)}
                    className="text-xs px-3 py-1.5 border border-border text-muted-foreground rounded hover:bg-muted transition-colors"
                    title="Delete follow-up"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalActiveFollowUps = groupedFollowUps.overdue.length +
    groupedFollowUps.dueToday.length +
    groupedFollowUps.thisWeek.length +
    groupedFollowUps.future.length;

  return (
    <div className="space-y-6">
      {/* FOLLOW UP ACTIVITIES SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🎯 Follow Up Activities {totalActiveFollowUps > 0 && `(${totalActiveFollowUps})`}
          </h3>
          <button
            onClick={onAddFollowUp}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Add Follow-up
          </button>
        </div>

        {totalActiveFollowUps === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No upcoming follow-ups</p>
            <button
              onClick={onAddFollowUp}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              Schedule one now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {renderFollowUpGroup('Overdue', groupedFollowUps.overdue, 'text-red-600', '⚠️')}
            {renderFollowUpGroup('Due Today', groupedFollowUps.dueToday, 'text-orange-600', '📅')}
            {renderFollowUpGroup('This Week', groupedFollowUps.thisWeek, 'text-yellow-600', '📆')}
            {renderFollowUpGroup('Upcoming', groupedFollowUps.future, 'text-gray-600', '📋')}
          </div>
        )}

        {/* Completed Follow-ups (Collapsible) */}
        {groupedFollowUps.completed.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCompletedFollowUps(!showCompletedFollowUps)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <span>{showCompletedFollowUps ? '▼' : '▶'}</span>
              <span>Completed ({groupedFollowUps.completed.length})</span>
            </button>
            {showCompletedFollowUps && (
              <div className="mt-2 space-y-2">
                {groupedFollowUps.completed.map(followUp => (
                  <div key={followUp.id} className="border border-gray-200 rounded-md p-3 bg-gray-50 opacity-60">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 line-through">{followUp.notes}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Completed: {followUp.completedAt && new Date(followUp.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="border-t-2 border-gray-300"></div>

      {/* ACTIVITY HISTORY SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📋 Activity History {activities.length > 0 && `(${activities.length})`}
          </h3>
          <button
            onClick={onAddActivity}
            className="text-sm px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            + Log Activity
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No activities logged yet</p>
            <button
              onClick={onAddActivity}
              className="text-sm text-green-600 hover:text-green-700 mt-2"
            >
              Log your first activity
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedActivities.map(activity => (
                <div key={activity.id} className="border-l-4 border-blue-500 bg-white p-3 rounded-r-md shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{activity.type}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()} at{' '}
                          {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.notes}</p>
                    </div>
                    <div className="flex gap-1">
                      {onEditActivity && (
                        <button
                          onClick={() => onEditActivity(activity.id)}
                          className="text-xs px-2 py-1 border border-border text-muted-foreground rounded hover:bg-muted transition-colors"
                          title="Edit activity"
                        >
                          ✏️
                        </button>
                      )}
                      {onDeleteActivity && (
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-xs px-2 py-1 border border-border text-muted-foreground rounded hover:bg-muted transition-colors"
                          title="Delete activity"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedActivities.length > 5 && !showAllActivities && (
              <button
                onClick={() => setShowAllActivities(true)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 mt-3 border-t border-gray-200"
              >
                Show {sortedActivities.length - 5} more activities ▼
              </button>
            )}
          </>
        )}
      </div>

      {/* Complete Follow-up Modal */}
      <CompleteFollowUpModal
        isOpen={isCompleteModalOpen}
        followUp={selectedFollowUp}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedFollowUp(null);
        }}
        onComplete={onCompleteFollowUpAndLogActivity}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        title={`Delete ${deleteType === 'followUp' ? 'Follow-up' : 'Activity'}`}
        message={`Are you sure you want to delete this ${deleteType === 'followUp' ? 'follow-up' : 'activity'}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default ActivityAndFollowUpsSection;
