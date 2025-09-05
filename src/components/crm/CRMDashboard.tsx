'use client';

import React, { useState, useMemo } from 'react';
import { CRMVORecord, FVOStatus, CRMColumn, VOStatus, TherapistBreakdown } from '@/types';
import crmVOData from '@/data/crmVOData.json';
import therapistData from '@/data/therapistBreakdownData.json';
import VOTable from './VOTable';
import TherapistBreakdownTable from './TherapistBreakdownTable';
import FVOActionsModal from './FVOActionsModal';
import PDFPreviewModal from './PDFPreviewModal';
import HeaderFilters from './HeaderFilters';

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
  
  // Workflow tab state - NEW: 4 workflow tabs
  const [workflowTab, setWorkflowTab] = useState<'Bestellen' | 'Bestelt' | 'Follow Up' | 'Call'>('Bestellen');
  
  // Filter state - ER filter (primary) + F.VO Status, Doctor, and Therapist filters (optional)
  const [selectedER, setSelectedER] = useState('All ERs');
  const [selectedFVOStatus, setSelectedFVOStatus] = useState('All F.VO Status');
  const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
  const [selectedTherapist, setSelectedTherapist] = useState('All Therapists');
  
  // New state for F.VO Actions flow
  const [selectedVOIds, setSelectedVOIds] = useState<Set<string>>(new Set());
  const [checkboxesVisible, setCheckboxesVisible] = useState(false);
  const [fvoActionsModalOpen, setFvoActionsModalOpen] = useState(false);
  
  // PDF Preview Modal state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfFormType, setPdfFormType] = useState<'initial' | 'followup'>('followup');

  // Calculate tab counts for all workflow categories
  const tabCounts = useMemo(() => {
    const counts = {
      'Bestellen': voRecords.filter(vo => vo.fvoStatus === 'Bestellen').length,
      'Bestelt': voRecords.filter(vo => vo.fvoStatus === 'Bestelt' || vo.fvoStatus === '>7 days Bestelt').length,
      'Follow Up': voRecords.filter(vo => vo.fvoStatus === '1st Follow up' || vo.fvoStatus === '> 7 days after 1st follow up').length,
      'Call': voRecords.filter(vo => vo.fvoStatus === 'Anrufen').length
    };
    return counts;
  }, [voRecords]);

  // Workflow tab filtering - primary filter
  const workflowFilteredRecords = useMemo(() => {
    return voRecords.filter(vo => {
      switch (workflowTab) {
        case 'Bestellen':
          return vo.fvoStatus === 'Bestellen';
        case 'Bestelt':
          return vo.fvoStatus === 'Bestelt' || vo.fvoStatus === '>7 days Bestelt';
        case 'Follow Up':
          return vo.fvoStatus === '1st Follow up' || vo.fvoStatus === '> 7 days after 1st follow up';
        case 'Call':
          return vo.fvoStatus === 'Anrufen';
        default:
          return true;
      }
    });
  }, [voRecords, workflowTab]);

  // Extract unique ERs from current workflow tab records
  const erOptions = useMemo(() => {
    const uniqueERs = Array.from(new Set(workflowFilteredRecords.map(vo => vo.facility))).sort();
    return ['All ERs', ...uniqueERs];
  }, [workflowFilteredRecords]);

  // Extract unique doctor names from current workflow tab records
  const doctorOptions = useMemo(() => {
    const uniqueDoctors = Array.from(new Set(workflowFilteredRecords.map(vo => vo.doctorInfo.name))).sort();
    return ['All Doctors', ...uniqueDoctors];
  }, [workflowFilteredRecords]);

  // Extract unique therapist names from current workflow tab records
  const therapistOptions = useMemo(() => {
    const uniqueTherapists = Array.from(new Set(workflowFilteredRecords.map(vo => vo.therapist))).sort();
    return ['All Therapists', ...uniqueTherapists];
  }, [workflowFilteredRecords]);

  // F.VO Status options - context-sensitive based on current workflow tab
  const fvoStatusOptions = useMemo(() => {
    const baseOptions = ['All F.VO Status'];
    
    switch (workflowTab) {
      case 'Bestellen':
        return [...baseOptions, 'Bestellen'];
      case 'Bestelt':
        return [...baseOptions, 'Bestelt', '>7 days Bestelt'];
      case 'Follow Up':
        return [...baseOptions, '1st Follow up', '> 7 days after 1st follow up'];
      case 'Call':
        return [...baseOptions, 'Anrufen'];
      default:
        return [...baseOptions, 'Bestellen', 'Bestelt', '>7 days Bestelt', '1st Follow up', '> 7 days after 1st follow up', 'Anrufen'];
    }
  }, [workflowTab]);

  // Cascading filter: workflow tab → ER → F.VO Status → Doctor → Therapist
  const filteredVORecords = useMemo(() => {
    let filtered = workflowFilteredRecords;
    
    // Filter by ER (primary filter)
    if (selectedER !== 'All ERs') {
      filtered = filtered.filter(vo => vo.facility === selectedER);
    }
    
    // Filter by F.VO Status (optional overlay filter)
    if (selectedFVOStatus !== 'All F.VO Status') {
      filtered = filtered.filter(vo => vo.fvoStatus === selectedFVOStatus);
    }
    
    // Filter by Doctor (optional overlay filter)
    if (selectedDoctor !== 'All Doctors') {
      filtered = filtered.filter(vo => vo.doctorInfo.name === selectedDoctor);
    }
    
    // Filter by Therapist (optional overlay filter)
    if (selectedTherapist !== 'All Therapists') {
      filtered = filtered.filter(vo => vo.therapist === selectedTherapist);
    }
    
    return filtered;
  }, [workflowFilteredRecords, selectedER, selectedFVOStatus, selectedDoctor, selectedTherapist]);

  // NEW LOGIC: ER-based button visibility
  const erSelected = selectedER !== 'All ERs';
  const hasSelectedVOs = selectedVOIds.size > 0;

  // Determine helper text and button visibility
  const showHelperText = !erSelected || !hasSelectedVOs;
  const showFVOActionsButton = erSelected; // Show button when ER selected
  const fvoActionsEnabled = erSelected && hasSelectedVOs; // Enable when both conditions met

  // Update checkbox visibility when ER filter changes
  React.useEffect(() => {
    setCheckboxesVisible(erSelected);
    // Reset selected checkboxes when ER filter changes
    if (!erSelected) {
      setSelectedVOIds(new Set());
    }
  }, [erSelected]);

  // Reset filters and checkboxes when workflow tab changes
  React.useEffect(() => {
    setSelectedER('All ERs');
    setSelectedFVOStatus('All F.VO Status');
    setSelectedDoctor('All Doctors');
    setSelectedTherapist('All Therapists');
    setSelectedVOIds(new Set());
    setCheckboxesVisible(false);
  }, [workflowTab]);

  // Get selected VO records for the modal
  const selectedVORecords = useMemo(() => {
    return voRecords.filter(vo => selectedVOIds.has(vo.id));
  }, [voRecords, selectedVOIds]);



  // Workflow tab handlers
  const handleWorkflowTabChange = (tab: 'Bestellen' | 'Bestelt' | 'Follow Up' | 'Call') => {
    setWorkflowTab(tab);
  };

  // Filter handlers
  const handleERChange = (er: string) => {
    setSelectedER(er);
  };

  const handleFVOStatusChange = (status: string) => {
    setSelectedFVOStatus(status);
  };

  const handleDoctorChange = (doctor: string) => {
    setSelectedDoctor(doctor);
  };

  const handleTherapistChange = (therapist: string) => {
    setSelectedTherapist(therapist);
  };

  const handleClearFilters = () => {
    setSelectedER('All ERs');
    setSelectedFVOStatus('All F.VO Status');
    setSelectedDoctor('All Doctors');
    setSelectedTherapist('All Therapists');
    // Also reset checkboxes and selected VOs
    setSelectedVOIds(new Set());
    setCheckboxesVisible(false);
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
      case 'Anrufen':
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

  return (
    <div className="crm-dashboard">

      <div className="crm-header">
        <div className="crm-header-left">
          <h1 className="crm-title">F.VO Ordering Dashboard</h1>
          <p className="crm-subtitle">Manage Follow-up VO ordering workflow</p>
        </div>
        <div className="crm-header-right">
          <HeaderFilters 
            selectedFVOStatus={selectedFVOStatus}
            selectedDoctor={selectedDoctor}
            selectedTherapist={selectedTherapist}
            fvoStatusOptions={fvoStatusOptions}
            doctorOptions={doctorOptions}
            therapistOptions={therapistOptions}
            onFVOStatusChange={handleFVOStatusChange}
            onDoctorChange={handleDoctorChange}
            onTherapistChange={handleTherapistChange}
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="clear-btn"
              onClick={handleClearFilters}
              type="button"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* F.VO Content */}
      <div>
        {/* Workflow Tab System */}
        <div className="workflow-tabs">
          <div className="workflow-tab-list">
            {['Bestellen', 'Bestelt', 'Follow Up', 'Call'].map((tab) => (
              <button
                key={tab}
                className={`workflow-tab ${workflowTab === tab ? 'workflow-tab-active' : ''}`}
                onClick={() => handleWorkflowTabChange(tab as 'Bestellen' | 'Bestelt' | 'Follow Up' | 'Call')}
              >
                {tab} ({tabCounts[tab as keyof typeof tabCounts]})
              </button>
            ))}
          </div>
        </div>
        <div className="filter-section">
          <FilterBar
            selectedER={selectedER}
            erOptions={erOptions}
            onERChange={handleERChange}
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

      {/* F.VO Actions Modal */}
      <FVOActionsModal
        isOpen={fvoActionsModalOpen}
        onClose={handleCloseModal}
        selectedVOs={selectedVORecords}
        doctorName={selectedDoctor}
        currentWorkflowTab={workflowTab}
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