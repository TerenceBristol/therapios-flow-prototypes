'use client';

import { useState, useMemo } from 'react';
import { useFVOCRM } from '@/contexts/FVOCRMContext';
import { PracticeActivity, PracticeFollowUp, PracticeIssue } from '@/types';

interface ActivitiesSectionProps {
  practiceId: string;
}

type ActivityType = 'Log' | 'Follow-up' | 'Issue';

export default function ActivitiesSection({ practiceId }: ActivitiesSectionProps) {
  const {
    activities,
    followUps,
    issues,
    addActivity,
    addFollowUp,
    addIssue,
    completeFollowUp,
    resolveIssue
  } = useFVOCRM();

  // Form state
  const [activityType, setActivityType] = useState<ActivityType>('Log');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // Completion/resolution state
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Filter data for this practice
  const practiceActivities = useMemo(() =>
    activities.filter(a => a.practiceId === practiceId),
    [activities, practiceId]
  );

  const practiceFollowUps = useMemo(() =>
    followUps.filter(f => f.practiceId === practiceId),
    [followUps, practiceId]
  );

  const practiceIssues = useMemo(() =>
    issues.filter(i => i.practiceId === practiceId),
    [issues, practiceId]
  );

  // Group into sections
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSection = useMemo(() => {
    return practiceFollowUps
      .filter(f => !f.completed)
      .map(f => {
        const due = new Date(f.dueDate);
        let status: 'overdue' | 'today' | 'future' = 'future';

        if (due < today) {
          status = 'overdue';
        } else if (due.getTime() === today.getTime()) {
          status = 'today';
        }

        return { ...f, status };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [practiceFollowUps, today]);

  const openItemsSection = useMemo(() => {
    return practiceIssues
      .filter(i => i.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [practiceIssues]);

  const historySection = useMemo(() => {
    const logs = practiceActivities.map(a => ({
      ...a,
      type: 'log' as const,
      displayDate: new Date(a.date)
    }));

    const completedFollowUps = practiceFollowUps
      .filter(f => f.completed)
      .map(f => ({
        ...f,
        type: 'followup' as const,
        displayDate: new Date(f.completedAt || f.createdAt)
      }));

    const resolvedIssues = practiceIssues
      .filter(i => i.status === 'resolved')
      .map(i => ({
        ...i,
        type: 'issue' as const,
        displayDate: new Date(i.resolvedAt || i.createdAt)
      }));

    return [...logs, ...completedFollowUps, ...resolvedIssues]
      .sort((a, b) => b.displayDate.getTime() - a.displayDate.getTime())
      .slice(0, 15); // Show recent 15
  }, [practiceActivities, practiceFollowUps, practiceIssues]);

  // Handle form submission
  const handleAdd = () => {
    if (!notes.trim()) return;

    if (activityType === 'Log') {
      addActivity({
        practiceId,
        date: new Date().toISOString(),
        type: 'Note', // Default type, user describes in notes
        notes,
        userId: 'current-user' // TODO: Get from auth context
      });
    } else if (activityType === 'Follow-up') {
      if (!dueDate) {
        alert('Please select a due date for follow-ups');
        return;
      }
      addFollowUp({
        practiceId,
        dueDate,
        dueTime: dueTime || undefined,
        notes,
        userId: 'current-user'
      });
    } else if (activityType === 'Issue') {
      addIssue({
        practiceId,
        title: notes.split('\n')[0].substring(0, 100), // First line as title
        description: notes,
        createdBy: 'current-user'
      });
    }

    // Clear form
    setNotes('');
    setDueDate('');
    setDueTime('');
  };

  // Handle complete follow-up
  const handleComplete = (id: string) => {
    completeFollowUp(id, completionNotes || undefined);
    setCompletingId(null);
    setCompletionNotes('');
  };

  // Handle resolve issue
  const handleResolve = (id: string) => {
    resolveIssue(id, resolutionNotes || undefined, 'current-user');
    setResolvingId(null);
    setResolutionNotes('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Inline Creation Form */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Add Activity</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="Log">Log</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Issue">Issue</option>
            </select>
          </div>

          {activityType === 'Follow-up' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                activityType === 'Log'
                  ? 'e.g., Called practice, spoke with receptionist...'
                  : activityType === 'Follow-up'
                  ? 'e.g., Call back about VO status'
                  : 'e.g., Practice phone line not working'
              }
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Upcoming Section */}
      {upcomingSection.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">▼ UPCOMING ({upcomingSection.length})</h3>
          <div className="space-y-2">
            {upcomingSection.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-3 ${
                  item.status === 'overdue'
                    ? 'border-red-500 bg-red-50/50'
                    : item.status === 'today'
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-green-500 bg-green-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${
                        item.status === 'overdue' ? 'text-red-500' :
                        item.status === 'today' ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
                        {item.status === 'overdue' ? '🔴' : item.status === 'today' ? '🟠' : '🟢'}
                      </span>
                      <span className="font-medium">{item.notes}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-7">
                      Created: {formatDate(item.createdAt)} | Due: {formatDate(item.dueDate)}
                      {item.dueTime && `, ${item.dueTime}`}
                      {item.status === 'overdue' && ' (overdue)'}
                    </div>
                  </div>
                  <div>
                    {completingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Completion notes (optional)"
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          className="px-2 py-1 border border-border rounded text-sm w-48"
                          autoFocus
                        />
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setCompletingId(null);
                            setCompletionNotes('');
                          }}
                          className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCompletingId(item.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Items Section */}
      {openItemsSection.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">▼ OPEN ITEMS ({openItemsSection.length})</h3>
          <div className="space-y-2">
            {openItemsSection.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-yellow-500 bg-yellow-50/50 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.description !== item.title && (
                      <div className="text-sm mt-1 ml-7">{item.description}</div>
                    )}
                    <div className="text-sm text-muted-foreground mt-1 ml-7">
                      Created: {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div>
                    {resolvingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="How was this resolved? (optional)"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="px-2 py-1 border border-border rounded text-sm w-48"
                          autoFocus
                        />
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setResolvingId(null);
                            setResolutionNotes('');
                          }}
                          className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(item.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Section */}
      {historySection.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">▼ HISTORY ({historySection.length})</h3>
          <div className="space-y-2">
            {historySection.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                {item.type === 'log' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📞</span>
                      <span>{(item as any).notes}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-7">
                      {formatDateTime((item as any).date)}
                    </div>
                  </div>
                )}
                {item.type === 'followup' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      <span>Follow-up: {(item as any).notes}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-7">
                      Created: {formatDate((item as any).createdAt)} | Due: {formatDate((item as any).dueDate)}
                      {(item as any).dueTime && `, ${(item as any).dueTime}`}
                      <br />
                      Completed: {formatDateTime((item as any).completedAt)}
                      {(item as any).completionNotes && (
                        <> | Notes: {(item as any).completionNotes}</>
                      )}
                    </div>
                  </div>
                )}
                {item.type === 'issue' && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      <span>Issue resolved: {(item as any).title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 ml-7">
                      Created: {formatDate((item as any).createdAt)} | Resolved: {formatDateTime((item as any).resolvedAt)}
                      {(item as any).resolutionNotes && (
                        <> | Notes: {(item as any).resolutionNotes}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {upcomingSection.length === 0 && openItemsSection.length === 0 && historySection.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No activities yet. Add your first activity above.</p>
        </div>
      )}
    </div>
  );
}
