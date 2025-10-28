'use client';

import React, { useState } from 'react';
import DoctorsTable from '@/components/fvo-crm/table/DoctorsTable';
import DoctorDetailModal from '@/components/fvo-crm/modals/DoctorDetailModal';
import DoctorFormModal from '@/components/fvo-crm/modals/DoctorFormModal';
import { Practice, PracticeDoctor } from '@/types';

// Import mock data
import mockData from '@/data/fvoCRMData.json';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<PracticeDoctor[]>(mockData.doctors as PracticeDoctor[]);
  const [practices] = useState<Practice[]>(mockData.practices as Practice[]);
  const [selectedDoctor, setSelectedDoctor] = useState<PracticeDoctor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const handleViewDoctor = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditDoctor = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setIsDetailModalOpen(true);
    }
  };

  const handleAddDoctor = () => {
    setIsFormModalOpen(true);
  };

  const handleSaveDoctor = (
    doctorData: Omit<PracticeDoctor, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    // TODO: Implement save logic (will be handled by dashboard refactor)
    if (selectedDoctor) {
      const updatedDoctor: PracticeDoctor = {
        ...doctorData,
        id: selectedDoctor.id,
        createdAt: selectedDoctor.createdAt,
        updatedAt: new Date().toISOString()
      };
      setDoctors(prevDoctors =>
        prevDoctors.map(doc => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
      );
      console.log('Save doctor:', updatedDoctor);
    }
    setIsDetailModalOpen(false);
  };

  const handleCreateDoctor = (
    doctorData: Omit<PracticeDoctor, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    // TODO: Implement create logic (will be handled by dashboard refactor)
    const newDoctor: PracticeDoctor = {
      ...doctorData,
      id: `doctor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDoctors(prevDoctors => [...prevDoctors, newDoctor]);
    console.log('Create doctor:', newDoctor);
    setIsFormModalOpen(false);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  return (
    <>
      <DoctorsTable
        doctors={doctors}
        practices={practices}
        onViewDoctor={handleViewDoctor}
        onEditDoctor={handleEditDoctor}
        onAddDoctor={handleAddDoctor}
      />

      {selectedDoctor && (
        <DoctorDetailModal
          isOpen={isDetailModalOpen}
          doctor={selectedDoctor}
          practices={practices}
          onClose={handleCloseDetailModal}
          onSave={handleSaveDoctor}
        />
      )}

      <DoctorFormModal
        isOpen={isFormModalOpen}
        practices={practices}
        onClose={handleCloseFormModal}
        onSave={handleCreateDoctor}
      />
    </>
  );
}
