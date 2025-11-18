'use client';

import React, { useState, useMemo } from 'react';
import {
  Practice,
  PracticeDoctor,
  PracticeVO,
  PracticeActivity,
  PracticeWithComputed
} from '@/types';
import fvoCRMData from '@/data/fvoCRMData.json';
import PriorityQueuePanel from './PriorityQueuePanel';
import DetailPanel from './DetailPanel';
import AddActivityModal from './AddActivityModal';
import PracticeFormModal from './PracticeFormModal';

const FVOCRMDashboard: React.FC = () => {
  // Load data from JSON
  const [practices, setPractices] = useState<Practice[]>(fvoCRMData.practices as Practice[]);
  const [doctors] = useState<PracticeDoctor[]>(fvoCRMData.doctors as PracticeDoctor[]);
  const [vos] = useState<PracticeVO[]>(fvoCRMData.vos as PracticeVO[]);
  const [activities, setActivities] = useState<PracticeActivity[]>(fvoCRMData.activities as PracticeActivity[]);

  // UI State
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [isPracticeFormModalOpen, setIsPracticeFormModalOpen] = useState(false);
  const [practiceToEdit, setPracticeToEdit] = useState<Practice | null>(null);

  // Calculate priority level for a practice (legacy - for Priority Queue Panel only)
  const calculatePriorityLevel = (nextFollowUpDate?: string) => {
    if (!nextFollowUpDate) return 'other';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUpDate = new Date(nextFollowUpDate);
    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) return 'overdue';
    if (followUpDate.getTime() === today.getTime()) return 'dueToday';

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    if (followUpDate <= sevenDaysFromNow) return 'thisWeek';

    return 'other';
  };

  // Calculate next follow-up date from activities
  // Note: This component uses legacy data model without follow-ups array
  const getNextFollowUpDate = (practiceId: string): string | undefined => {
    // Follow-ups are now tracked separately, not in activities
    // Return undefined for this legacy component
    return undefined;
  };

  // Calculate practices with computed fields
  const practicesWithComputed: PracticeWithComputed[] = useMemo(() => {
    return practices.map(practice => {
      const practiceVOs = vos.filter(vo => vo.practiceId === practice.id);
      const pendingVOs = practiceVOs.filter(vo => vo.status !== 'Received');
      const practiceActivities = activities.filter(a => a.practiceId === practice.id);
      const sortedActivities = [...practiceActivities].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const practiceDoctors = doctors.filter(d => d.practiceId === practice.id);
      const nextFollowUpDate = getNextFollowUpDate(practice.id);
      const priorityLevel = calculatePriorityLevel(nextFollowUpDate);

      // Compute issue-related fields from activities
      const activeIssues = practiceActivities.filter(a => a.isIssue && a.issueStatus === 'active');
      const latestIssue = activeIssues.length > 0
        ? activeIssues.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]
        : undefined;

      return {
        ...practice,
        pendingVOCount: pendingVOs.length,
        lastActivity: sortedActivities[0],
        nextFollowUpDate,
        priorityLevel,
        activeIssueCount: activeIssues.length,
        latestIssue,
        doctors: practiceDoctors
      };
    });
  }, [practices, vos, activities, doctors]);

  // Get selected practice with computed fields
  const selectedPractice = useMemo(() => {
    if (!selectedPracticeId) return null;
    return practicesWithComputed.find(p => p.id === selectedPracticeId) || null;
  }, [selectedPracticeId, practicesWithComputed]);

  // Get activities for selected practice
  const selectedPracticeActivities = useMemo(() => {
    if (!selectedPracticeId) return [];
    return activities.filter(a => a.practiceId === selectedPracticeId);
  }, [selectedPracticeId, activities]);

  // Get VOs for selected practice
  const selectedPracticeVOs = useMemo(() => {
    if (!selectedPracticeId) return [];
    return vos.filter(vo => vo.practiceId === selectedPracticeId);
  }, [selectedPracticeId, vos]);

  // Get doctors for selected practice
  const selectedPracticeDoctors = useMemo(() => {
    if (!selectedPracticeId) return [];
    return doctors.filter(d => d.practiceId === selectedPracticeId);
  }, [selectedPracticeId, doctors]);

  // Handler: Select practice
  const handleSelectPractice = (practiceId: string) => {
    setSelectedPracticeId(practiceId);
  };

  // Handler: Add activity
  const handleAddActivity = () => {
    if (!selectedPracticeId) return;
    setIsAddActivityModalOpen(true);
  };

  // Handler: Save activity
  const handleSaveActivity = (activityData: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    const newActivity: PracticeActivity = {
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...activityData
    };

    setActivities([...activities, newActivity]);

    // Show success message (you could add a toast notification here)
    console.log('Activity saved successfully!');
  };

  // Handler: Add new practice
  const handleAddPractice = () => {
    setPracticeToEdit(null);
    setIsPracticeFormModalOpen(true);
  };

  // Handler: Edit practice
  const handleEditPractice = () => {
    if (!selectedPractice) return;
    setPracticeToEdit(selectedPractice);
    setIsPracticeFormModalOpen(true);
  };

  // Handler: Save practice (create or update)
  const handleSavePractice = (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (practiceToEdit) {
      // Update existing practice
      setPractices(practices.map(p =>
        p.id === practiceToEdit.id
          ? {
              ...p,
              ...practiceData,
              updatedAt: new Date().toISOString()
            }
          : p
      ));
      console.log('Practice updated successfully!');
    } else {
      // Create new practice
      const newPractice: Practice = {
        id: `prac-${Date.now()}`,
        ...practiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPractices([...practices, newPractice]);
      setSelectedPracticeId(newPractice.id);
      console.log('Practice created successfully!');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Practice Follow-up CRM</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage follow-up verification orders
          </p>
        </div>
        <button
          onClick={handleAddPractice}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          + Add Practice
        </button>
      </div>

      {/* Split-Screen Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Priority Queue (60%) */}
        <div className="w-[60%] border-r border-border overflow-hidden">
          <PriorityQueuePanel
            practices={practicesWithComputed}
            selectedPracticeId={selectedPracticeId}
            onSelectPractice={handleSelectPractice}
          />
        </div>

        {/* Right Panel - Detail View (40%) */}
        <div className="w-[40%] overflow-hidden">
          <DetailPanel
            practice={selectedPractice}
            activities={selectedPracticeActivities}
            vos={selectedPracticeVOs}
            doctors={selectedPracticeDoctors}
            onAddActivity={handleAddActivity}
            onEditPractice={handleEditPractice}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedPracticeId && (
        <AddActivityModal
          isOpen={isAddActivityModalOpen}
          practiceId={selectedPracticeId}
          onClose={() => setIsAddActivityModalOpen(false)}
          onSave={handleSaveActivity}
        />
      )}

      <PracticeFormModal
        isOpen={isPracticeFormModalOpen}
        practice={practiceToEdit}
        onClose={() => {
          setIsPracticeFormModalOpen(false);
          setPracticeToEdit(null);
        }}
        onSave={handleSavePractice}
      />
    </div>
  );
};

export default FVOCRMDashboard;
