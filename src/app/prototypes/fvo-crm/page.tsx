'use client';

import React, { useState, useMemo } from 'react';
import PracticesTable from '@/components/fvo-crm/table/PracticesTable';
import PracticeCRMModal from '@/components/fvo-crm/modals/PracticeCRMModal';
import { Practice, PracticeDoctor, PracticeWithComputed, PracticeActivity } from '@/types';
import { isTimePast } from '@/utils/timeUtils';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function FVOCRMPage() {
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [doctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);
  const [activities, setActivities] = useState(mockData.activities);
  const [selectedPractice, setSelectedPractice] = useState<PracticeWithComputed | null>(null);
  const [isCRMModalOpen, setIsCRMModalOpen] = useState(false);

  // Compute practice fields
  const practicesWithComputed = useMemo((): PracticeWithComputed[] => {
    return practices.map(practice => {
      // Get all activities for this practice
      const practiceActivities = activities.filter(
        a => a.practiceId === practice.id
      );

      // Get all VOs for this practice
      const vos = mockData.vos.filter(vo => vo.practiceId === practice.id);

      // Find pending VOs
      const pendingVOs = vos.filter(vo => vo.status === 'Pending');

      // Find active batches (batches with VOs from this practice)
      const batchIds = new Set(vos.map(vo => vo.batchId));
      const activeBatches = Array.from(batchIds);

      // Get last activity
      const sortedActivities = [...practiceActivities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastActivity = sortedActivities[0];

      // Find next follow-up
      const activitiesWithFollowUp = practiceActivities.filter(a => a.nextFollowUpDate);
      const sortedFollowUps = [...activitiesWithFollowUp].sort((a, b) => {
        const dateA = new Date(a.nextFollowUpDate!);
        const dateB = new Date(b.nextFollowUpDate!);
        return dateA.getTime() - dateB.getTime();
      });
      const nextFollowUpActivity = sortedFollowUps[0];

      // Calculate priority level
      let priorityLevel: 'overdue' | 'dueToday' | 'thisWeek' | 'other' = 'other';

      if (nextFollowUpActivity?.nextFollowUpDate) {
        const followUpDate = nextFollowUpActivity.nextFollowUpDate;
        const followUpTime = nextFollowUpActivity.nextFollowUpTime;

        if (isTimePast(followUpDate, followUpTime)) {
          priorityLevel = 'overdue';
        } else {
          const now = new Date();
          const followUpDateTime = new Date(followUpDate);
          const diffTime = followUpDateTime.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            priorityLevel = 'dueToday';
          } else if (diffDays <= 7) {
            priorityLevel = 'thisWeek';
          }
        }
      }

      // Get doctors for this practice
      const practiceDoctors = doctors.filter(doc =>
        doc.practiceIds.includes(practice.id)
      );

      return {
        ...practice,
        pendingVOCount: pendingVOs.length,
        activeBatchCount: activeBatches.length,
        lastActivityDate: lastActivity?.date,
        nextFollowUpDate: nextFollowUpActivity?.nextFollowUpDate,
        nextFollowUpTime: nextFollowUpActivity?.nextFollowUpTime,
        priorityLevel,
        doctors: practiceDoctors
      };
    });
  }, [practices, doctors, activities]);

  const handleViewPractice = (practiceId: string) => {
    const practice = practicesWithComputed.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setIsCRMModalOpen(true);
    }
  };

  const handleAddActivity = (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    // Add new activity with generated ID and timestamp
    const newActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setActivities(prev => [...prev, newActivity as any]);
    console.log('Activity added:', newActivity);
  };

  const handleCloseModal = () => {
    setIsCRMModalOpen(false);
    setSelectedPractice(null);
  };

  // Note: No "Add Practice" button in CRM view - that's for management page
  const handleAddPractice = () => {
    // This shouldn't be called in CRM context, but provide a no-op
    console.log('Add practice action not available in CRM view');
  };

  return (
    <>
      <PracticesTable
        practices={practicesWithComputed}
        allDoctors={doctors}
        onViewPractice={handleViewPractice}
        onEditPractice={handleViewPractice} // Same as view in CRM context
        onAddPractice={handleAddPractice}
      />

      {selectedPractice && (
        <PracticeCRMModal
          isOpen={isCRMModalOpen}
          practice={selectedPractice}
          activities={activities.filter(
            a => a.practiceId === selectedPractice.id
          ) as any}
          batches={(() => {
            const vos = mockData.vos.filter(vo => vo.practiceId === selectedPractice.id);
            const batchIds = new Set(vos.map(vo => vo.batchId));
            return mockData.batches.filter(batch => batchIds.has(batch.id));
          })() as any}
          vos={mockData.vos.filter(vo => vo.practiceId === selectedPractice.id) as any}
          doctors={doctors.filter(doc => doc.practiceIds.includes(selectedPractice.id))}
          onClose={handleCloseModal}
          onAddActivity={handleAddActivity}
        />
      )}
    </>
  );
}
