'use client';

import React, { useState, useMemo } from 'react';
import { CRMVORecord, FVOStatus, CRMColumn, VOStatus, TherapistBreakdown } from '@/types';
import crmVOData from '@/data/crmVOData.json';
import therapistData from '@/data/therapistBreakdownData.json';
import VOTable from './VOTable';
import TherapistBreakdownTable from './TherapistBreakdownTable';
import FVOActionsModal from './FVOActionsModal';
import PDFPreviewModal from './PDFPreviewModal';

import FilterBar from './FilterBar';
import './CRM.css';

interface CRMDashboardProps {
  initialTab?: string;
}

const CRMDashboard: React.FC<CRMDashboardProps> = ({ initialTab = 'F.VO' }) => {
  // Map fvoStatus to currentColumn for CRM board functionality
  const transformedData = useMemo(() => {
    return crmVOData.map(record => ({
      ...record,
      currentColumn: record.fvoStatus as CRMColumn,
      secondaryTreatmentStatus: record.secondaryTreatmentStatus || undefined,
      voStatus: record.voStatus as VOStatus,
      fvoStatus: record.fvoStatus as FVOStatus,
      timeline: record.timeline.map(event => ({
        ...event,
        fvoStatus: event.fvoStatus as FVOStatus | undefined
      }))
    }));
  }, []);

  // Transform therapist data
  const therapistBreakdownData = useMemo(() => {
    return therapistData as TherapistBreakdown[];
  }, []);

  const [voRecords, setVORecords] = useState<CRMVORecord[]>(transformedData);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Filter state - F.VO Status and Doctor filters
  const [selectedFVOStatus, setSelectedFVOStatus] = useState('All F.VO Status');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  
  // New state for F.VO Actions flow
  const [selectedVOIds, setSelectedVOIds] = useState<Set<string>>(new Set());
  const [checkboxesVisible, setCheckboxesVisible] = useState(false);
  const [fvoActionsModalOpen, setFvoActionsModalOpen] = useState(false);
  
  // PDF Preview Modal state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfFormType, setPdfFormType] = useState<'initial' | 'followup'>('followup');

  // Extract unique doctor names for dropdown
  const doctorOptions = useMemo(() => {
    const uniqueDoctors = Array.from(new Set(voRecords.map(vo => vo.doctorInfo.name))).sort();
    return ['All Doctors', ...uniqueDoctors];
  }, [voRecords]);

  // Filter VO records based on F.VO status and doctor
  const filteredVORecords = useMemo(() => {
    return voRecords.filter(vo => {
      const matchesFVOStatus = selectedFVOStatus === 'All F.VO Status' || vo.fvoStatus === selectedFVOStatus;
      const matchesDoctor = selectedDoctor === 'All Doctors' || vo.doctorInfo.name === selectedDoctor;
      return matchesFVOStatus && matchesDoctor;
    });
  }, [voRecords, selectedFVOStatus, selectedDoctor]);

  // Determine if both filters are selected (not default values)
  const bothFiltersSelected = selectedFVOStatus !== 'All F.VO Status' && selectedDoctor !== 'All Doctors';

  // Determine helper text and button visibility
  const showHelperText = !bothFiltersSelected;
  const showFVOActionsButton = bothFiltersSelected;
  const fvoActionsEnabled = selectedVOIds.size > 0;

  // Update checkbox visibility when filters change
  React.useEffect(() => {
    setCheckboxesVisible(bothFiltersSelected);
    // Reset selected checkboxes when filters change
    if (!bothFiltersSelected) {
      setSelectedVOIds(new Set());
    }
  }, [bothFiltersSelected]);

  // Get selected VO records for the modal
  const selectedVORecords = useMemo(() => {
    return voRecords.filter(vo => selectedVOIds.has(vo.id));
  }, [voRecords, selectedVOIds]);



  const handleFVOStatusChange = (status: string) => {
    setSelectedFVOStatus(status);
  };

  const handleDoctorChange = (doctor: string) => {
    setSelectedDoctor(doctor);
  };

  const handleCheckboxSelection = (voIds: Set<string>) => {
    setSelectedVOIds(voIds);
  };

  const handleFVOActionsClick = () => {
    setFvoActionsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFvoActionsModalOpen(false);
  };

  const handleGenerateOrderForm = (type: 'initial' | 'followup') => {
    setPdfFormType(type);
    setPdfPreviewOpen(true);
    setFvoActionsModalOpen(false);
  };

  // Helper function to set appropriate date based on new status
  const getUpdatedRecordWithDate = (record: CRMVORecord, newStatus: FVOStatus) => {
    const currentDate = new Date().toLocaleDateString('de-DE'); // DD.MM.YYYY format
    const updatedRecord = { ...record, fvoStatus: newStatus };

    switch (newStatus) {
      case 'Bestellen':
        return { ...updatedRecord, bestellenDate: currentDate };
      case 'Bestelt':
        return { 
          ...updatedRecord, 
          bestellenDate: record.bestellenDate || currentDate,
          besteltDate: currentDate 
        };
      case '1st Follow up':
        return { 
          ...updatedRecord, 
          bestellenDate: record.bestellenDate || currentDate,
          besteltDate: record.besteltDate || currentDate,
          firstFollowUpDate: currentDate 
        };
      case '2nd Follow up':
        return { 
          ...updatedRecord, 
          bestellenDate: record.bestellenDate || currentDate,
          besteltDate: record.besteltDate || currentDate,
          firstFollowUpDate: record.firstFollowUpDate || currentDate,
          secondFollowUpDate: currentDate 
        };
      default:
        return updatedRecord;
    }
  };

  const handleChangeStatus = (newStatus: string) => {
    // Update status for all selected VOs
    setVORecords(prevRecords => 
      prevRecords.map(record => {
        if (selectedVOIds.has(record.id)) {
          const updatedRecord = getUpdatedRecordWithDate(record, newStatus as FVOStatus);
          return {
            ...updatedRecord,
            lastActionDate: new Date().toISOString(),
            timeline: [
              ...record.timeline,
              {
                action: `Status bulk changed to ${newStatus}`,
                timestamp: new Date().toISOString(),
                fvoStatus: newStatus as FVOStatus
              }
            ]
          };
        }
        return record;
      })
    );
    setFvoActionsModalOpen(false);
  };

  const handleCopyInformation = () => {
    // Mock copy functionality
    console.log('Copying information for selected VOs:', selectedVORecords);
    // In a real implementation, this would copy relevant data to clipboard
    setFvoActionsModalOpen(false);
  };

  const handleClosePDFModal = () => {
    setPdfPreviewOpen(false);
  };

  const handleVOStatusChange = (voId: string, newStatus: FVOStatus) => {
    setVORecords(prevRecords => 
      prevRecords.map(record => {
        if (record.id === voId) {
          const updatedRecord = getUpdatedRecordWithDate(record, newStatus);
          return {
            ...updatedRecord,
            lastActionDate: new Date().toISOString(),
            timeline: [
              ...record.timeline,
              {
                action: `Status changed to ${newStatus}`,
                timestamp: new Date().toISOString(),
                fvoStatus: newStatus
              }
            ]
          };
        }
        return record;
      })
    );
  };

  // Tab structure with F.VO active + new Fertig VO Breakdown tab + 3 display-only tabs
  const tabs = [
    { id: 'F.VO', label: 'F.VO', active: activeTab === 'F.VO', disabled: false },
    { id: 'Fertig-VO-Breakdown', label: 'Fertig VO Breakdown', active: activeTab === 'Fertig-VO-Breakdown', disabled: false },
    { id: 'Arztbericht-zu-versenden', label: 'Arztbericht zu versenden', active: false, disabled: true },
    { id: 'Patient-Transfers', label: 'Patient Transfers', active: false, disabled: true },
    { id: 'Alle-VOs', label: 'Alle VOs', active: false, disabled: true }
  ];

  return (
    <div className="crm-dashboard">
      {/* Tab Navigation */}
      <div className="crm-tabs">
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${tab.active ? 'tab-active' : ''} ${tab.disabled ? 'tab-disabled' : ''}`}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="crm-header">
        <div className="crm-header-left">
          <h1 className="crm-title">F.VO Ordering Dashboard</h1>
          <p className="crm-subtitle">Manage Follow-up VO ordering workflow</p>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'F.VO' ? (
        <div>
          <div className="filter-section">
            <FilterBar
              selectedFVOStatus={selectedFVOStatus}
              selectedDoctor={selectedDoctor}
              doctorOptions={doctorOptions}
              onFVOStatusChange={handleFVOStatusChange}
              onDoctorChange={handleDoctorChange}
              showHelperText={showHelperText}
              showFVOActionsButton={showFVOActionsButton}
              fvoActionsEnabled={fvoActionsEnabled}
              onFVOActionsClick={handleFVOActionsClick}
            />
          </div>
          <VOTable 
            voRecords={filteredVORecords}
            onStatusChange={handleVOStatusChange}
            checkboxesVisible={checkboxesVisible}
            selectedVOIds={selectedVOIds}
            onCheckboxSelection={handleCheckboxSelection}
          />
        </div>
      ) : activeTab === 'Fertig-VO-Breakdown' ? (
        <div>
          <TherapistBreakdownTable therapists={therapistBreakdownData} />
        </div>
      ) : (
        <div className="tab-content-placeholder">
          <div className="text-center p-8 text-gray-500">
            <h3 className="text-lg font-semibold mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p>This tab is for display purposes only.</p>
          </div>
        </div>
      )}

      {/* F.VO Actions Modal */}
      <FVOActionsModal
        isOpen={fvoActionsModalOpen}
        onClose={handleCloseModal}
        selectedVOs={selectedVORecords}
        doctorName={selectedDoctor}
        onGenerateOrderForm={handleGenerateOrderForm}
        onChangeStatus={handleChangeStatus}
        onCopyInformation={handleCopyInformation}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={pdfPreviewOpen}
        onClose={handleClosePDFModal}
        formType={pdfFormType}
        doctorName={selectedDoctor}
        selectedVOs={selectedVORecords}
      />
    </div>
  );
};

export default CRMDashboard;