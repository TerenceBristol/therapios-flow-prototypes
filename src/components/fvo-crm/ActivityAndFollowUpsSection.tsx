'use client';

import React, { useState, useMemo } from 'react';
import { PracticeActivity, PracticeFollowUp, PracticeActivityType } from '@/types';
import CollapsibleSection from './CollapsibleSection';
import CompleteFollowUpModal from './modals/CompleteFollowUpModal';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface ActivityAndFollowUpsSectionProps {
  practiceId: string;
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  onAddFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  onCompleteFollowUpAndLogActivity: (followUpId: string, activityData: {
    practiceId: string;
    date: string;
    type: PracticeActivityType;
    notes: string;
    userId: string;
  }) => void;
  onDeleteFollowUp?: (followUpId: string) => void;
  onDeleteActivity?: (activityId: string) => void;
}

const ActivityAndFollowUpsSection: React.FC<ActivityAndFollowUpsSectionProps> = ({
  practiceId,
  activities,
  followUps,
  onAddActivity,
  onAddFollowUp,
  onCompleteFollowUpAndLogActivity,
  onDeleteFollowUp,
  onDeleteActivity
}) => {
  // Follow-up form state
  const [followUpDueDate, setFollowUpDueDate] = useState('');
  const [followUpDueTime, setFollowUpDueTime] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Activity form state
  const [activityType, setActivityType] = useState<PracticeActivityType>('Call');
  const [activityDate, setActivityDate] = useState('');
  const [activityNotes, setActivityNotes] = useState('');

  const [showCompletedFollowUps, setShowCompletedFollowUps] = useState(false);
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

  // Activity type icons
  const getActivityIcon = (type: PracticeActivityType) => {
    switch (type) {
      case 'Call': return '📞';
      case 'Email': return '📧';
      case 'Fax': return '📠';
      case 'Note': return '📝';
    }
  };

  const handleAddFollowUp = () => {
    if (!followUpDueDate.trim() || !followUpNotes.trim()) return;

    onAddFollowUp({
      practiceId,
      dueDate: followUpDueDate,
      dueTime: followUpDueTime || undefined,
      notes: followUpNotes,
      userId: 'current-user' // TODO: Get from auth context
    });

    // Reset form
    setFollowUpDueDate('');
    setFollowUpDueTime('');
    setFollowUpNotes('');
  };

  const handleAddActivity = () => {
    if (!activityDate.trim() || !activityNotes.trim()) return;

    onAddActivity({
      practiceId,
      type: activityType,
      date: activityDate,
      notes: activityNotes,
      userId: 'current-user' // TODO: Get from auth context
    });

    // Reset form
    setActivityDate('');
    setActivityNotes('');
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
            <div key={followUp.id} className="border border-border rounded-md p-3 bg-background hover:border-foreground/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      Due: {new Date(followUp.dueDate).toLocaleDateString()}
                      {followUp.dueTime && ` at ${followUp.dueTime}`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{followUp.notes}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleCompleteWithActivity(followUp)}
                  className="flex-1 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  Complete
                </button>
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
      <CollapsibleSection
        title="Follow-up Activities"
        icon="🎯"
        count={totalActiveFollowUps}
        defaultExpanded={true}
      >
        {/* Add Follow-up Form */}
        <div className="border border-border rounded-lg p-4 bg-muted/30 mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Add Follow-up</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={followUpDueDate}
                onChange={(e) => setFollowUpDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Due Time (optional)
              </label>
              <input
                type="time"
                value={followUpDueTime}
                onChange={(e) => setFollowUpDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes *
            </label>
            <textarea
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="What should be done?"
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
            />
          </div>
          <button
            onClick={handleAddFollowUp}
            disabled={!followUpDueDate.trim() || !followUpNotes.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Follow-up
          </button>
        </div>

        {/* Follow-up List */}
        {totalActiveFollowUps === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
            <p className="text-sm">No upcoming follow-ups</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderFollowUpGroup('Overdue', groupedFollowUps.overdue, 'text-red-600', '⚠️')}
            {renderFollowUpGroup('Due Today', groupedFollowUps.dueToday, 'text-orange-600', '📅')}
            {renderFollowUpGroup('This Week', groupedFollowUps.thisWeek, 'text-yellow-600', '📆')}
            {renderFollowUpGroup('Upcoming', groupedFollowUps.future, 'text-muted-foreground', '📋')}
          </div>
        )}

        {/* Completed Follow-ups (Collapsible) */}
        {groupedFollowUps.completed.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCompletedFollowUps(!showCompletedFollowUps)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <span>{showCompletedFollowUps ? '▼' : '▶'}</span>
              <span>Completed ({groupedFollowUps.completed.length})</span>
            </button>
            {showCompletedFollowUps && (
              <div className="mt-2 space-y-2">
                {groupedFollowUps.completed.map(followUp => (
                  <div key={followUp.id} className="border border-border rounded-md p-3 bg-muted/50 opacity-60">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground line-through">{followUp.notes}</p>
                        <p className="text-xs text-muted-foreground mt-1">
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
      </CollapsibleSection>

      {/* ACTIVITY HISTORY SECTION */}
      <CollapsibleSection
        title="Activity History"
        icon="📋"
        count={activities.length}
        defaultExpanded={true}
      >
        {/* Add Activity Form */}
        <div className="border border-border rounded-lg p-4 bg-muted/30 mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Log Activity</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type *
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as PracticeActivityType)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="Call">📞 Call</option>
                <option value="Email">📧 Email</option>
                <option value="Fax">📠 Fax</option>
                <option value="Note">📝 Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes *
            </label>
            <textarea
              value={activityNotes}
              onChange={(e) => setActivityNotes(e.target.value)}
              placeholder="What was discussed or done?"
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
            />
          </div>
          <button
            onClick={handleAddActivity}
            disabled={!activityDate.trim() || !activityNotes.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log Activity
          </button>
        </div>

        {/* Activity List */}
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
            <p className="text-sm">No activities logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map(activity => (
              <div key={activity.id} className="border-l-4 border-primary bg-background p-3 rounded-r-md shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{activity.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()} at{' '}
                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{activity.notes}</p>
                  </div>
                  <div className="flex gap-1">
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
        )}
      </CollapsibleSection>

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
