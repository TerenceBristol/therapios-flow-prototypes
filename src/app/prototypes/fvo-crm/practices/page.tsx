'use client';

import React, { useState } from 'react';
import PracticesManagementTable from '@/components/fvo-crm/table/PracticesManagementTable';
import PracticeDetailModal from '@/components/fvo-crm/modals/PracticeDetailModal';
import PracticeFormModal from '@/components/fvo-crm/PracticeFormModal';
import { Practice, PracticeDoctor } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function PracticesManagementPage() {
  const [practices, setPractices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [doctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const handleViewPractice = (practiceId: string) => {
    const practice = practices.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditPractice = (practiceId: string) => {
    const practice = practices.find(p => p.id === practiceId);
    if (practice) {
      setSelectedPractice(practice);
      setIsDetailModalOpen(true);
    }
  };

  const handleDeletePractice = (practiceId: string) => {
    // TODO: Implement delete logic
    setPractices(prev => prev.filter(p => p.id !== practiceId));
    console.log('Practice deleted:', practiceId);
  };

  const handleAddPractice = () => {
    setIsFormModalOpen(true);
  };

  const handleSavePractice = (
    practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (selectedPractice) {
      // Update existing practice
      const updatedPractice: Practice = {
        ...practiceData,
        id: selectedPractice.id,
        createdAt: selectedPractice.createdAt,
        updatedAt: new Date().toISOString()
      };
      setPractices(prev => prev.map(p => p.id === selectedPractice.id ? updatedPractice : p));
      console.log('Practice updated:', updatedPractice);
    }
    setIsDetailModalOpen(false);
  };

  const handleCreatePractice = (
    practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    // Create new practice
    const newPractice: Practice = {
      ...practiceData,
      id: `practice-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPractices(prev => [...prev, newPractice]);
    console.log('Practice created:', newPractice);
    setIsFormModalOpen(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPractice(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  return (
    <>
      <PracticesManagementTable
        practices={practices}
        doctors={doctors}
        onView={handleViewPractice}
        onEdit={handleEditPractice}
        onDelete={handleDeletePractice}
        onAdd={handleAddPractice}
      />

      {selectedPractice && (
        <PracticeDetailModal
          isOpen={isDetailModalOpen}
          practice={{
            ...selectedPractice,
            pendingVOCount: 0,
            activeBatchCount: 0,
            priorityLevel: 'other',
            doctors: doctors.filter(doc => doc.practiceIds.includes(selectedPractice.id))
          }}
          activities={mockData.activities.filter(
            a => a.practiceId === selectedPractice.id
          ) as any}
          batches={(() => {
            const vos = mockData.vos.filter(vo => vo.practiceId === selectedPractice.id);
            const batchIds = new Set(vos.map(vo => vo.batchId));
            return mockData.batches.filter(batch => batchIds.has(batch.id));
          })() as any}
          vos={mockData.vos.filter(vo => vo.practiceId === selectedPractice.id) as any}
          doctors={doctors.filter(doc => doc.practiceIds.includes(selectedPractice.id))}
          allDoctors={doctors}
          onClose={handleCloseDetailModal}
          onSave={handleSavePractice}
        />
      )}

      <PracticeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleCreatePractice}
      />
    </>
  );
}
