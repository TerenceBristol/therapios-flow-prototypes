'use client';

import React, { useState, useEffect } from 'react';
import { PracticeWithComputed, PracticeActivity, PracticeActivityType, PracticeVO, PracticeDoctor, PracticeFollowUp, FVOCRMVOStatus, Therapist, Facility, OrderFormType } from '@/types';
import ActivityAndFollowUpsSection from '../ActivityAndFollowUpsSection';
import AddActivityModal from '../AddActivityModal';
import AddFollowUpModal from '../AddFollowUpModal';
import VOsTable from '../VOsTable';
import PracticeInfoTab from '../PracticeInfoTab';

interface PracticeCRMModalProps {
  isOpen: boolean;
  practice: PracticeWithComputed | null;
  activities: PracticeActivity[];
  followUps: PracticeFollowUp[];
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  therapists: Therapist[];
  facilities: Facility[];
  initialTab?: 'practiceInfo' | 'vos' | 'activityFollowups';
  onClose: () => void;
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
  onDeleteActivity?: (activityId: string) => void;
  onAddFollowUp: (followUp: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'>) => void;
  onDeleteFollowUp?: (followUpId: string) => void;
  onCompleteFollowUpAndLogActivity?: (followUpId: string, activityData: {
    practiceId: string;
    date: string;
    type: PracticeActivityType;
    notes: string;
    userId: string;
  }) => void;
  onStatusChange?: (voId: string, newStatus: FVOCRMVOStatus) => void;
  onNoteChange?: (voId: string, note: string) => void;
  onEditNote?: (voId: string, noteIndex: number, newText: string) => void;
  onDeleteNote?: (voId: string, noteIndex: number) => void;
  onBulkStatusChange?: (voIds: string[], newStatus: FVOCRMVOStatus) => void;
  onBulkNoteChange?: (voIds: string[], note: string) => void;
  onGeneratePDF?: (selectedVOIds: string[], orderType: OrderFormType) => void;
}

const PracticeCRMModal: React.FC<PracticeCRMModalProps> = ({
  isOpen,
  practice,
  activities,
  followUps,
  vos,
  doctors,
  therapists,
  facilities,
  initialTab = 'practiceInfo',
  onClose,
  onAddActivity,
  onDeleteActivity,
  onAddFollowUp,
  onDeleteFollowUp,
  onCompleteFollowUpAndLogActivity,
  onStatusChange,
  onNoteChange,
  onEditNote,
  onDeleteNote,
  onBulkStatusChange,
  onBulkNoteChange,
  onGeneratePDF
}) => {
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isAddFollowUpModalOpen, setIsAddFollowUpModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'practiceInfo' | 'vos' | 'activityFollowups'>(initialTab);

  // Reset active tab when modal opens or practice changes
  useEffect(() => {
    if (isOpen && practice) {
      setActiveTab(initialTab);
    }
  }, [isOpen, practice?.id, initialTab]);

  if (!isOpen || !practice) return null;

  const handleAddActivityFromModal = (activity: {
    practiceId: string;
    type: PracticeActivityType;
    date: string;
    notes: string;
  }) => {
    // Add userId to the activity
    const activityWithUser: Omit<PracticeActivity, 'id' | 'createdAt'> = {
      ...activity,
      userId: 'current-user' // TODO: Get from auth context
    };
    onAddActivity(activityWithUser);
    setIsAddActivityModalOpen(false);
  };

  const handleAddFollowUpFromModal = (followUp: {
    practiceId: string;
    dueDate: string;
    dueTime?: string;
    notes: string;
    activityType?: PracticeActivityType;
  }) => {
    // Add userId to the follow-up
    const followUpWithUser: Omit<PracticeFollowUp, 'id' | 'completed' | 'createdAt'> = {
      ...followUp,
      userId: 'current-user' // TODO: Get from auth context
    };
    onAddFollowUp(followUpWithUser);
    setIsAddFollowUpModalOpen(false);
  };

  // Get pending VOs (all non-received VOs)
  const pendingVOs = vos.filter(vo => vo.status !== 'Received');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="w-full h-full max-w-7xl max-h-[90vh] bg-card rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{practice.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">Practice Information</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Close"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Content - Full Width Tabbed Interface */}
          <div className="flex-1 flex flex-col min-h-0">

              {/* Tab Navigation */}
              <div className="flex-shrink-0 border-b border-border bg-muted/20">
                <div className="flex gap-1 px-6">
                  <button
                    onClick={() => setActiveTab('practiceInfo')}
                    className={`px-6 py-4 font-medium transition-colors relative ${
                      activeTab === 'practiceInfo' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Practice Info
                    {activeTab === 'practiceInfo' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('vos')}
                    className={`px-6 py-4 font-medium transition-colors relative ${
                      activeTab === 'vos' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Follow-Up Verordnungen
                    {activeTab === 'vos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    <span className="ml-2 text-sm">({pendingVOs.length} pending)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('activityFollowups')}
                    className={`px-6 py-4 font-medium transition-colors relative ${
                      activeTab === 'activityFollowups' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Activity & Follow-ups
                    {activeTab === 'activityFollowups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    <span className="ml-2 text-sm">
                      ({followUps.filter(f => !f.completed).length} active)
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab Content - Full Height */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {activeTab === 'practiceInfo' && (
                  <PracticeInfoTab
                    practice={practice}
                    doctors={doctors}
                  />
                )}

                {activeTab === 'vos' && (
                  <VOsTable
                    vos={vos}
                    doctors={doctors}
                    therapists={therapists}
                    facilities={facilities}
                    onStatusChange={onStatusChange}
                    onNoteChange={onNoteChange}
                    onEditNote={onEditNote}
                    onDeleteNote={onDeleteNote}
                    onBulkStatusChange={onBulkStatusChange}
                    onBulkNoteChange={onBulkNoteChange}
                    onGeneratePDF={onGeneratePDF}
                  />
                )}

                {activeTab === 'activityFollowups' && (
                  <div className="h-full overflow-y-auto px-6 py-4">
                    <ActivityAndFollowUpsSection
                      practiceId={practice.id}
                      activities={activities}
                      followUps={followUps}
                      onAddActivity={() => setIsAddActivityModalOpen(true)}
                      onDeleteActivity={onDeleteActivity}
                      onAddFollowUp={() => setIsAddFollowUpModalOpen(true)}
                      onDeleteFollowUp={onDeleteFollowUp}
                      onCompleteFollowUpAndLogActivity={onCompleteFollowUpAndLogActivity || (() => {})}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onSave={handleAddActivityFromModal}
        practiceId={practice.id}
      />

      {/* Add Follow-up Modal */}
      <AddFollowUpModal
        isOpen={isAddFollowUpModalOpen}
        onClose={() => setIsAddFollowUpModalOpen(false)}
        onSave={handleAddFollowUpFromModal}
        practiceId={practice.id}
      />
    </>
  );
};

export default PracticeCRMModal;
