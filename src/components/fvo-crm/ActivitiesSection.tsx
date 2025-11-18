'use client';

import { PracticeActivity, PracticeFollowUp } from '@/types';
import ActiveIssuesSection from './ActiveIssuesSection';
import UpcomingFollowUpsSection from './UpcomingFollowUpsSection';
import ActivityHistorySection from './ActivityHistorySection';
import InlineAddEntryForm from './InlineAddEntryForm';

interface ActivitiesSectionProps {
  practiceId: string;
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  onAddFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  onResolveActivity: (activityId: string, resolvedBy: string, resolutionNotes?: string) => void;
  onCompleteFollowUp: (followUpId: string, completionNotes?: string) => void;
}

export default function ActivitiesSection({
  practiceId,
  activities,
  followUps,
  onAddActivity,
  onAddFollowUp,
  onResolveActivity,
  onCompleteFollowUp
}: ActivitiesSectionProps) {
  // Filter activities for this practice
  const practiceActivities = activities.filter(a => a.practiceId === practiceId);
  const practiceFollowUps = followUps.filter(f => f.practiceId === practiceId);

  // Handle resolve with notes - pass through with hardcoded user for now
  const handleResolve = (activityId: string, notes?: string) => {
    onResolveActivity(activityId, 'current-user', notes);
  };

  return (
    <div className="p-4">
      {/* Inline Add Entry Form */}
      <InlineAddEntryForm
        practiceId={practiceId}
        onAddActivity={onAddActivity}
        onAddFollowUp={onAddFollowUp}
      />

      {/* Active Issues Section */}
      <ActiveIssuesSection
        activities={practiceActivities}
        onResolve={handleResolve}
      />

      {/* Upcoming Follow-Ups Section */}
      <UpcomingFollowUpsSection
        followUps={practiceFollowUps}
        onComplete={onCompleteFollowUp}
      />

      {/* Activity History Section */}
      <ActivityHistorySection
        activities={practiceActivities}
        followUps={practiceFollowUps}
      />
    </div>
  );
}
