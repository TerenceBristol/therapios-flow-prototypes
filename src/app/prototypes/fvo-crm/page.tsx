'use client';

import React, { useState, useMemo } from 'react';
import PracticesTable from '@/components/fvo-crm/table/PracticesTable';
import PracticeCRMModal from '@/components/fvo-crm/modals/PracticeCRMModal';
import GeneratePDFModal from '@/components/fvo-crm/GeneratePDFModal';
import VOsPDFPreviewModal from '@/components/fvo-crm/VOsPDFPreviewModal';
import { Practice, PracticeDoctor, PracticeWithComputed, PracticeActivity, PracticeVO, FVOCRMVOStatus } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function FVOCRMPage() {
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [doctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);
  const [vos, setVos] = useState<PracticeVO[]>(mockData.vos as PracticeVO[]);
  const [activities, setActivities] = useState<PracticeActivity[]>(mockData.activities as PracticeActivity[]);
  const [selectedPractice, setSelectedPractice] = useState<PracticeWithComputed | null>(null);
  const [isCRMModalOpen, setIsCRMModalOpen] = useState(false);

  // PDF Modal States
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [selectedVOIds, setSelectedVOIds] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'er' | 'teltow'>('er');

  // Compute practice fields
  const practicesWithComputed = useMemo((): PracticeWithComputed[] => {
    return practices.map(practice => {
      // Get all activities for this practice
      const practiceActivities = activities.filter(
        a => a.practiceId === practice.id
      );

      // Get all VOs for this practice (excluding "Received" status)
      const practiceVOs = vos.filter(vo => vo.practiceId === practice.id && vo.status !== 'Received');

      // Find pending VOs (all non-received VOs are considered pending)
      const pendingVOs = practiceVOs;

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

      // Get doctors for this practice
      const practiceDoctors = doctors.filter(doc =>
        doc.practiceId === practice.id
      );

      return {
        ...practice,
        pendingVOCount: pendingVOs.length,
        lastActivity: lastActivity,
        nextFollowUpDate: nextFollowUpActivity?.nextFollowUpDate,
        nextFollowUpTime: nextFollowUpActivity?.nextFollowUpTime,
        doctors: practiceDoctors
      };
    });
  }, [practices, doctors, activities, vos]);

  const handleViewPractice = (practiceId: string) => {
    const practice = practicesWithComputed.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setIsCRMModalOpen(true);
    }
  };

  const handleAddActivity = (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    // Add new activity with generated ID and timestamp
    const newActivity: PracticeActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setActivities(prev => [...prev, newActivity]);
    console.log('Activity added:', newActivity);
  };

  const handleCloseModal = () => {
    setIsCRMModalOpen(false);
    setSelectedPractice(null);
  };

  // Handle VO status change
  const handleStatusChange = (voId: string, newStatus: FVOCRMVOStatus) => {
    setVos(prevVos =>
      prevVos.map(vo =>
        vo.id === voId
          ? {
              ...vo,
              status: newStatus,
              statusTimestamp: new Date().toISOString(),
              statusDate: new Date().toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            }
          : vo
      )
    );
    console.log(`VO ${voId} status changed to ${newStatus}`);
  };

  // Handle Generate PDF - opens the delivery selection modal
  const handleGeneratePDF = (selectedVOIds: string[], selectedDoctorId: string) => {
    setSelectedVOIds(selectedVOIds);
    setSelectedDoctorId(selectedDoctorId);
    setIsPDFModalOpen(true);
  };

  // Handle PDF generation with delivery type selected
  const handlePDFGenerate = (deliveryType: 'er' | 'teltow') => {
    setDeliveryType(deliveryType);
    setIsPDFModalOpen(false);
    setIsPDFPreviewOpen(true);
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
          ) as PracticeActivity[]}
          vos={vos.filter(vo => vo.practiceId === selectedPractice.id) as PracticeVO[]}
          doctors={doctors.filter(doc => doc.practiceId === selectedPractice.id)}
          onClose={handleCloseModal}
          onAddActivity={handleAddActivity}
          onStatusChange={handleStatusChange}
          onGeneratePDF={handleGeneratePDF}
        />
      )}

      {/* Generate PDF Modal - Delivery Selection */}
      <GeneratePDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        selectedDoctor={doctors.find(d => d.id === selectedDoctorId) || null}
        selectedVOs={vos.filter(vo => selectedVOIds.includes(vo.id))}
        onGenerate={handlePDFGenerate}
      />

      {/* PDF Preview Modal */}
      <VOsPDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        selectedVOs={vos.filter(vo => selectedVOIds.includes(vo.id))}
        selectedDoctor={doctors.find(d => d.id === selectedDoctorId) || null}
        deliveryType={deliveryType}
      />
    </>
  );
}
