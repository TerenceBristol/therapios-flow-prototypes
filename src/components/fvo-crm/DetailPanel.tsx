import React from 'react';
import { PracticeWithComputed, PracticeActivity, PracticeVO, PracticeDoctor } from '@/types';
import ContactInfoSection from './ContactInfoSection';
import QuickStatsSection from './QuickStatsSection';
import ActivityLogSection from './ActivityLogSection';

interface DetailPanelProps {
  practice: PracticeWithComputed | null;
  activities: PracticeActivity[];
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  onAddActivity: () => void;
  onEditPractice: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  practice,
  activities,
  vos,
  doctors,
  onAddActivity,
  onEditPractice
}) => {
  if (!practice) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🏥</div>
          <p className="text-lg">Select a practice from the list</p>
          <p className="text-sm mt-2">to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{practice.name}</h2>
        <button
          onClick={onEditPractice}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Edit practice"
        >
          ✏️
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Contact Information */}
        <ContactInfoSection practice={practice} />

        {/* Doctors at Practice */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
            Doctors at this Practice
          </h3>
          {doctors.length === 0 ? (
            <div className="text-sm text-muted-foreground">No doctors listed</div>
          ) : (
            <div className="space-y-1">
              {doctors.map(doctor => (
                <div key={doctor.id} className="text-sm text-foreground">
                  • {doctor.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Quick Stats */}
        <QuickStatsSection practice={practice} />

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Activity Log */}
        <ActivityLogSection
          activities={activities}
          onAddActivity={onAddActivity}
        />

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Notes Section */}
        {practice.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
              Notes
            </h3>
            <div className="text-sm text-foreground p-3 bg-muted/50 rounded-lg border border-border">
              {practice.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
