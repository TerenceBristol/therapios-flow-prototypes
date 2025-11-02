'use client';

import React, { useState, useMemo } from 'react';
import PracticesTable from '@/components/fvo-crm/table/PracticesTable';
import PracticeCRMModal from '@/components/fvo-crm/modals/PracticeCRMModal';
import GeneratePDFModal from '@/components/fvo-crm/GeneratePDFModal';
import VOsPDFPreviewModal from '@/components/fvo-crm/VOsPDFPreviewModal';
import UndoToast from '@/components/fvo-crm/UndoToast';
import QuickActivityModal from '@/components/fvo-crm/QuickActivityModal';
import { PracticeWithComputed, PracticeVO, FVOCRMVOStatus, PracticeActivity } from '@/types';
import { calculateTherapistStats } from '@/utils/therapistStats';
import { useFVOCRM } from '@/hooks/useFVOCRM';

export default function FVOCRMPage() {
  // Get data from context
  const { practices, doctors, vos, activities, followUps, therapists, facilities, updateVO, bulkUpdateVOs, addActivity, deleteActivity, addFollowUp, deleteFollowUp, completeFollowUp, completeFollowUpAndLogActivity } = useFVOCRM();

  const [selectedPractice, setSelectedPractice] = useState<PracticeWithComputed | null>(null);
  const [isCRMModalOpen, setIsCRMModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'practiceInfo' | 'vos' | 'activityFollowups'>('practiceInfo');

  // PDF Modal States
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [selectedVOIds, setSelectedVOIds] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<'initial' | 'followup'>('followup');
  const [deliveryType, setDeliveryType] = useState<'er' | 'teltow'>('er');

  // Undo Toast States
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [undoToastMessage, setUndoToastMessage] = useState('');
  const [undoSnapshot, setUndoSnapshot] = useState<PracticeVO[]>([]);

  // Quick Activity Modal States
  const [isQuickActivityModalOpen, setIsQuickActivityModalOpen] = useState(false);
  const [quickActivityPractice, setQuickActivityPractice] = useState<PracticeWithComputed | null>(null);

  // Calculate therapist stats
  const therapistStats = useMemo(() => {
    return calculateTherapistStats(therapists, facilities, vos);
  }, [therapists, facilities, vos]);

  // Compute practice fields
  const practicesWithComputed = useMemo((): PracticeWithComputed[] => {
    return practices.map(practice => {
      // Get all activities for this practice
      const practiceActivities = activities.filter(
        a => a.practiceId === practice.id
      );

      // Get all VOs for this practice (excluding "Received" and "In Transit" status)
      const practiceVOs = vos.filter(vo => vo.practiceId === practice.id && vo.status !== 'Received' && vo.status !== 'In Transit');

      // Find pending VOs (all non-received, non-in-transit VOs are considered pending)
      const pendingVOs = practiceVOs;

      // Get last activity
      const sortedActivities = [...practiceActivities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastActivity = sortedActivities[0];

      // Find next follow-up from followUps array
      const practiceFollowUps = followUps.filter(
        f => f.practiceId === practice.id && !f.completed
      );
      const sortedFollowUps = [...practiceFollowUps].sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });
      const nextFollowUp = sortedFollowUps[0];

      // Get doctors for this practice
      const practiceDoctors = doctors.filter(doc =>
        doc.practiceId === practice.id
      );

      return {
        ...practice,
        pendingVOCount: pendingVOs.length,
        lastActivity: lastActivity,
        nextFollowUpDate: nextFollowUp?.dueDate,
        nextFollowUpTime: nextFollowUp?.dueTime,
        doctors: practiceDoctors
      };
    });
  }, [practices, doctors, activities, vos, followUps]);

  const handleViewPractice = (practiceId: string) => {
    const practice = practicesWithComputed.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setInitialTab('practiceInfo');
      setIsCRMModalOpen(true);
    }
  };

  const handleOpenActivities = (practiceId: string) => {
    const practice = practicesWithComputed.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setInitialTab('activityFollowups');
      setIsCRMModalOpen(true);
    }
  };

  const handleAddActivity = (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    addActivity(activity);
    console.log('Activity added');
  };

  const handleCloseModal = () => {
    setIsCRMModalOpen(false);
    setSelectedPractice(null);
    setInitialTab('practiceInfo');
  };

  // Handle quick activity modal
  const handleQuickActivity = (practiceId: string) => {
    const practice = practicesWithComputed.find(p => p.id === practiceId);
    if (practice) {
      setQuickActivityPractice(practice);
      setIsQuickActivityModalOpen(true);
    }
  };

  // Handle VO status change
  const handleStatusChange = (voId: string, newStatus: FVOCRMVOStatus) => {
    updateVO(voId, { status: newStatus });
    console.log(`VO ${voId} status changed to ${newStatus}`);
  };

  // Handle VO note change
  const handleNoteChange = (voId: string, note: string) => {
    const vo = vos.find(v => v.id === voId);
    updateVO(voId, {
      note: note,
      noteHistory: [
        ...(vo?.noteHistory || []),
        {
          text: note,
          userId: 'current-user', // TODO: Get from auth context
          timestamp: new Date().toISOString()
        }
      ]
    });
    console.log(`VO ${voId} note updated:`, note);
  };

  // Handle VO note edit
  const handleEditNote = (voId: string, noteIndex: number, newText: string) => {
    const vo = vos.find(v => v.id === voId);
    if (!vo || !vo.noteHistory) return;

    const updatedNoteHistory = [...vo.noteHistory];
    updatedNoteHistory[noteIndex] = {
      ...updatedNoteHistory[noteIndex],
      text: newText
    };

    updateVO(voId, {
      noteHistory: updatedNoteHistory
    });
    console.log(`VO ${voId} note edited at index ${noteIndex}`);
  };

  // Handle VO note delete
  const handleDeleteNote = (voId: string, noteIndex: number) => {
    const vo = vos.find(v => v.id === voId);
    if (!vo || !vo.noteHistory) return;

    const updatedNoteHistory = vo.noteHistory.filter((_, index) => index !== noteIndex);

    updateVO(voId, {
      noteHistory: updatedNoteHistory
    });
    console.log(`VO ${voId} note deleted at index ${noteIndex}`);
  };

  // Handle bulk status change
  const handleBulkStatusChange = (voIds: string[], newStatus: FVOCRMVOStatus) => {
    // Create snapshot for undo
    setUndoSnapshot([...vos]);

    bulkUpdateVOs(voIds, { status: newStatus });

    // Show undo toast
    const count = voIds.length;
    setUndoToastMessage(`${count} ${count === 1 ? 'VO' : 'VOs'} status changed to "${newStatus}"`);
    setShowUndoToast(true);

    console.log(`Bulk status change: ${voIds.length} VOs changed to ${newStatus}`);
  };

  // Handle bulk note change
  const handleBulkNoteChange = (voIds: string[], note: string) => {
    // Create snapshot for undo
    setUndoSnapshot([...vos]);

    // Apply updates to each VO (always add to noteHistory)
    voIds.forEach(voId => {
      const vo = vos.find(v => v.id === voId);
      if (!vo) return;

      updateVO(voId, {
        noteHistory: [
          ...(vo.noteHistory || []),
          {
            text: note,
            userId: 'current-user', // TODO: Get from auth context
            timestamp: new Date().toISOString()
          }
        ]
      });
    });

    // Show undo toast
    const count = voIds.length;
    setUndoToastMessage(`Note added to ${count} ${count === 1 ? 'VO' : 'VOs'}`);
    setShowUndoToast(true);

    console.log(`Bulk note added: ${voIds.length} VOs updated`);
  };

  // Handle undo bulk operation
  const handleUndo = () => {
    // Restore each VO from snapshot
    undoSnapshot.forEach(vo => {
      updateVO(vo.id, vo);
    });
    console.log('Bulk operation undone');
  };

  // Handle Generate PDF - opens the delivery selection modal
  const handleGeneratePDF = (selectedVOIds: string[], orderType: 'initial' | 'followup') => {
    setSelectedVOIds(selectedVOIds);
    setOrderType(orderType);
    setIsPDFModalOpen(true);
  };

  // Handle PDF generation with order type and delivery type selected
  const handlePDFGenerate = (orderType: 'initial' | 'followup', deliveryType: 'er' | 'teltow') => {
    setOrderType(orderType);
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
        onOpenActivities={handleOpenActivities}
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
          therapists={therapists}
          facilities={facilities}
          followUps={followUps.filter(f => f.practiceId === selectedPractice.id)}
          initialTab={initialTab}
          onClose={handleCloseModal}
          onAddActivity={handleAddActivity}
          onDeleteActivity={deleteActivity}
          onAddFollowUp={addFollowUp}
          onDeleteFollowUp={deleteFollowUp}
          onCompleteFollowUpAndLogActivity={completeFollowUpAndLogActivity}
          onStatusChange={handleStatusChange}
          onNoteChange={handleNoteChange}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkNoteChange={handleBulkNoteChange}
          onGeneratePDF={handleGeneratePDF}
        />
      )}

      {/* Generate PDF Modal - Delivery Selection */}
      <GeneratePDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        selectedVOs={vos.filter(vo => selectedVOIds.includes(vo.id))}
        doctors={doctors}
        orderType={orderType}
        onGenerate={handlePDFGenerate}
      />

      {/* PDF Preview Modal */}
      <VOsPDFPreviewModal
        isOpen={isPDFPreviewOpen}
        onClose={() => setIsPDFPreviewOpen(false)}
        selectedVOs={vos.filter(vo => selectedVOIds.includes(vo.id))}
        doctors={doctors}
        orderType={orderType}
        deliveryType={deliveryType}
      />

      {/* Quick Activity Modal */}
      <QuickActivityModal
        isOpen={isQuickActivityModalOpen}
        practice={quickActivityPractice}
        onClose={() => setIsQuickActivityModalOpen(false)}
        onSave={handleAddActivity}
      />

      {/* Undo Toast Notification */}
      {showUndoToast && (
        <UndoToast
          message={undoToastMessage}
          onUndo={handleUndo}
          onDismiss={() => setShowUndoToast(false)}
          duration={5000}
        />
      )}
    </>
  );
}
