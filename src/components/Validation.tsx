'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import validationData from '@/data/validationData.json';
import { useVOStatus } from '@/contexts/VOStatusContext';
import { ValidationRecord, VOStatus, BillingStatusInsurance, BillingStatusCopayment } from '@/types';
import InsuranceInfoModal from './InsuranceInfoModal';
import CopaymentDocumentModal from './CopaymentDocumentModal';
import './crm/CRM.css';

interface ValidationProps {
  slug?: string;
}

const Validation: React.FC<ValidationProps> = ({ slug = 'validation' }) => {
  const router = useRouter();
  const { 
    getVOStatus, 
    setUploadedSlip, 
    getUploadedSlip, 
    updateVOStatus, 
    updateBothStatuses,
    getBillingStatusInsurance,
    getBillingStatusCopayment,
    updateBillingStatusInsurance,
    updateBillingStatusCopayment
  } = useVOStatus();
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [voStatusFilter, setVoStatusFilter] = useState<string>('');
  const [einrichtungFilter, setEinrichtungFilter] = useState<string>('');
  const [therapeutFilter, setTherapeutFilter] = useState<string>('');
  const [previewSlip, setPreviewSlip] = useState<{record: ValidationRecord, file?: File} | null>(null);
  const [dragStates, setDragStates] = useState<{[key: string]: boolean}>({});
  const [uploadingStates, setUploadingStates] = useState<{[key: string]: boolean}>({});
  const [insuranceInfoRecord, setInsuranceInfoRecord] = useState<ValidationRecord | null>(null);
  const [copaymentRecord, setCopaymentRecord] = useState<ValidationRecord | null>(null);
  const [modalView, setModalView] = useState<'copayment' | 'refund'>('copayment');
  const [isGeneratingRefund, setIsGeneratingRefund] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Apply status changes from context to records
  const records = useMemo(() => {
    return (validationData as ValidationRecord[]).map(record => ({
      ...record,
      voStatus: getVOStatus(record.voNr, record.voStatus) as VOStatus,
      billingStatusInsurance: getBillingStatusInsurance(record.voNr, record.billingStatusInsurance) as BillingStatusInsurance,
      billingStatusCopayment: getBillingStatusCopayment(record.voNr, record.billingStatusCopayment) as BillingStatusCopayment
    }));
  }, [getVOStatus, getBillingStatusInsurance, getBillingStatusCopayment]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Get unique values for filter dropdowns
  const uniqueVoStatuses = useMemo(() => {
    const statuses = Array.from(new Set(records.map(r => r.voStatus)));
    return statuses.sort();
  }, [records]);

  const uniqueEinrichtungen = useMemo(() => {
    const einrichtungen = Array.from(new Set(records.map(r => r.einrichtung)));
    return einrichtungen.sort();
  }, [records]);

  const uniqueTherapeuten = useMemo(() => {
    const therapeuten = Array.from(new Set(records.map(r => r.therapeut)));
    return therapeuten.sort();
  }, [records]);

  // Filter records based on selected filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesVoStatus = !voStatusFilter || record.voStatus === voStatusFilter;
      const matchesEinrichtung = !einrichtungFilter || record.einrichtung === einrichtungFilter;
      const matchesTherapeut = !therapeutFilter || record.therapeut === therapeutFilter;
      return matchesVoStatus && matchesEinrichtung && matchesTherapeut;
    });
  }, [records, voStatusFilter, einrichtungFilter, therapeutFilter]);

  // Handle checkbox selection
  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setVoStatusFilter('');
    setEinrichtungFilter('');
    setTherapeutFilter('');
  };

  // Status change handlers with auto-update logic
  const handleVOStatusChange = (voNr: string, newStatus: VOStatus, record: ValidationRecord) => {
    updateVOStatus(voNr, newStatus);
    
    // Auto-update logic: Abgerechnet → Paid
    if (newStatus === 'Abgerechnet') {
      updateBillingStatusInsurance(voNr, 'Paid');
    }
    
    // Auto-update logic: Abgebrochen + zzBefreiung="ja" → For Refund
    if (newStatus === 'Abgebrochen' && record.zzBefreiung === 'ja') {
      updateBillingStatusCopayment(voNr, 'For Refund');
    }
  };

  const handleBillingInsuranceStatusChange = (voNr: string, newStatus: BillingStatusInsurance) => {
    updateBillingStatusInsurance(voNr, newStatus);
  };

  const handleBillingCopaymentStatusChange = (voNr: string, newStatus: BillingStatusCopayment) => {
    updateBillingStatusCopayment(voNr, newStatus);
  };

  // Get status badge classes for color-coding
  const getVOStatusBadgeClass = (voStatus: VOStatus | string) => {
    switch (voStatus) {
      case 'Aktiv':
        return 'status-badge status-aktiv';
      case 'Abgebrochen':
        return 'status-badge status-abgebrochen';
      case 'Fertig Behandelt':
        return 'status-badge status-fertig-behandelt';
      case 'Abgerechnet':
        return 'status-badge status-abgerechnet';
      case 'Abgelaufen':
        return 'status-badge status-abgelaufen';
      default:
        return 'status-badge status-default';
    }
  };

  const getBillingInsuranceBadgeClass = (status: BillingStatusInsurance | string) => {
    switch (status) {
      case 'Ready to Send':
        return 'status-badge billing-ready-to-send';
      case 'For Fixing':
        return 'status-badge billing-for-fixing';
      case 'Sent':
        return 'status-badge billing-sent';
      case 'Paid':
        return 'status-badge billing-paid';
      default:
        return 'status-badge status-default';
    }
  };

  const getBillingCopaymentBadgeClass = (status: BillingStatusCopayment | string) => {
    switch (status) {
      case 'Paid':
        return 'status-badge copayment-paid';
      case 'For Refund':
        return 'status-badge copayment-for-refund';
      default:
        return 'status-badge status-default';
    }
  };

  // Navigate to validation form
  const handleValidateClick = (voNr: string) => {
    router.push(`/prototypes/${slug}/${voNr}`);
  };

  // Check if validate button should be shown (hide for "Ready to Send" billing status VOs)
  const shouldShowValidateButton = (record: ValidationRecord) => {
    return record.billingStatusInsurance !== 'Ready to Send';
  };

  // Handle file upload for VO slip
  const handleVOSlipUpload = async (voNr: string, file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // Show loading state
    setUploadingStates(prev => ({ ...prev, [voNr]: true }));

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 800));

    // Store in context by voNr instead of recordId
    setUploadedSlip(voNr, file);

    // Clear loading state
    setUploadingStates(prev => ({ ...prev, [voNr]: false }));
  };

  // Handle drag events for table upload
  const handleTableDragOver = (e: React.DragEvent, voNr: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [voNr]: true }));
  };

  const handleTableDragLeave = (e: React.DragEvent, voNr: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [voNr]: false }));
  };

  const handleTableDrop = (e: React.DragEvent, voNr: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [voNr]: false }));
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVOSlipUpload(voNr, files[0]);
    }
  };

  // Handle eye icon click for slip preview
  const handleSlipPreview = (record: ValidationRecord) => {
    const uploadedFile = getUploadedSlip(record.voNr);
    setPreviewSlip({ record, file: uploadedFile });
  };

  // Check if record has VO slip (existing or newly uploaded)
  const hasVOSlip = (record: ValidationRecord) => {
    return record.voSlip || getUploadedSlip(record.voNr);
  };

  // Handle insurance info eye icon click
  const handleInsuranceInfoClick = (record: ValidationRecord) => {
    setInsuranceInfoRecord(record);
  };

  // Handle copayment document eye icon click
  const handleCopaymentClick = (record: ValidationRecord) => {
    setModalView('copayment');
    setCopaymentRecord(record);
  };

  // Check if record has copayment document available
  const hasCopaymentDocument = (record: ValidationRecord) => {
    if (!record.copaymentInfo) return false;
    const [completed] = record.behStatus.split('/').map(n => parseInt(n));
    return completed > 0 && record.copaymentInfo.documentGenerated;
  };

  // Check if record can generate refund
  // Logic: At least 1 treatment completed AND not all treatments completed
  const canGenerateRefund = (record: ValidationRecord) => {
    if (!record.copaymentInfo) return false;
    if (!record.copaymentInfo.documentGenerated || record.copaymentInfo.refundGenerated) return false;
    
    const [completed, total] = record.behStatus.split('/').map(n => parseInt(n));
    return completed >= 1 && completed < total;
  };

  // Check if record has refund to view
  const hasRefundToView = (record: ValidationRecord) => {
    if (!record.copaymentInfo) return false;
    return record.copaymentInfo.refundGenerated === true;
  };

  // Handle generate refund - Opens modal with loading state, then shows generated refund
  const handleGenerateRefund = async (record: ValidationRecord) => {
    setModalView('refund');
    setCopaymentRecord(record);
    setIsGeneratingRefund(true);
    
    // Simulate generation (in real app, this would be API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsGeneratingRefund(false);
  };

  // Handle view existing refund
  const handleViewRefund = (record: ValidationRecord) => {
    setModalView('refund');
    setCopaymentRecord(record);
  };

  // Handle switching between copayment and refund views in modal
  const handleSwitchView = (view: 'copayment' | 'refund') => {
    setModalView(view);
  };

  // Handle refund generation callback from modal
  const handleRefundGenerated = (voNr: string, refundData: {
    refundAmount: string;
    refundDate: string;
    refundInvoiceNumber: string;
  }) => {
    // In a real app, this would update the backend
    // For prototype, we'll just show success message
    console.log(`Refund generated for VO ${voNr}:`, refundData);
  };

  // Handle mark as Abgebrochen from copayment modal
  const handleMarkAsAbgebrochen = (voNr: string, updateFvoStatus: boolean) => {
    if (updateFvoStatus) {
      // Update both VO Status and F.VO Status
      updateBothStatuses(voNr, 'Abgebrochen', 'Keine Folge-VO');
      setSuccessMessage(`VO ${voNr} marked as Abgebrochen with F.VO status set to Keine Folge-VO`);
    } else {
      // Update only VO Status
      updateVOStatus(voNr, 'Abgebrochen');
      setSuccessMessage(`VO ${voNr} marked as Abgebrochen`);
    }

    // Close modal and clear success message after 3 seconds
    setCopaymentRecord(null);
    setModalView('copayment');
    setIsGeneratingRefund(false);
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="crm-dashboard">
      {/* Success Message Notification */}
      {successMessage && (
        <div className="success-notification">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="crm-header">
        <div className="crm-header-left">
          <h1 className="crm-title">Dashboard - Verwaltung</h1>
        </div>
      </div>

      {/* Filter Section - Top Right */}
      <div className="filter-section">
        <div className="filter-bar-with-actions">
          <div className="filter-bar-right">
            <div className="filter-bar">
              {/* VO Status Filter */}
              <div className="filter-group">
                <label className="filter-label">VO Status</label>
                <select
                  className="filter-input"
                  value={voStatusFilter}
                  onChange={(e) => setVoStatusFilter(e.target.value)}
                >
                  <option value="">Alle Status</option>
                  {uniqueVoStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Einrichtung Filter */}
              <div className="filter-group">
                <label className="filter-label">Einrichtung</label>
                <select
                  className="filter-input"
                  value={einrichtungFilter}
                  onChange={(e) => setEinrichtungFilter(e.target.value)}
                >
                  <option value="">Alle Einrichtungen</option>
                  {uniqueEinrichtungen.map(einrichtung => (
                    <option key={einrichtung} value={einrichtung}>{einrichtung}</option>
                  ))}
                </select>
              </div>

              {/* Therapeut Filter */}
              <div className="filter-group">
                <label className="filter-label">Therapeut</label>
                <select
                  className="filter-input"
                  value={therapeutFilter}
                  onChange={(e) => setTherapeutFilter(e.target.value)}
                >
                  <option value="">Alle Therapeuten</option>
                  {uniqueTherapeuten.map(therapeut => (
                    <option key={therapeut} value={therapeut}>{therapeut}</option>
                  ))}
                </select>
              </div>

              {/* Filter Actions */}
              <div className="filter-actions">
                <button
                  className="clear-btn"
                  onClick={clearFilters}
                  disabled={!voStatusFilter && !einrichtungFilter && !therapeutFilter}
                >
                  Filter zurücksetzen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vo-table-container">
        <div className="vo-table-scroll">
          <table className="vo-table">
            <thead>
              <tr>
                <th className="vo-table-header">
                  <input
                    type="checkbox"
                    className="vo-checkbox"
                    checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="vo-table-header">Name</th>
                <th className="vo-table-header">VO Nr.</th>
                <th className="vo-table-header">Heilmittel</th>
                <th className="vo-table-header">Einrichtung</th>
                <th className="vo-table-header">Therapeut</th>
                <th className="vo-table-header">Ausst. Datum</th>
                <th className="vo-table-header">Transfer Status</th>
                <th className="vo-table-header">Beh. Status (8/8)</th>
                <th className="vo-table-header">Arzt</th>
                <th className="vo-table-header">TB</th>
                <th className="vo-table-header">F-VO Status</th>
                <th className="vo-table-header">Bestellt Datum</th>
                <th className="vo-table-header">F-VO</th>
                <th className="vo-table-header">VO Status</th>
                <th className="vo-table-header">Billing Status (Insurance/Private)</th>
                <th className="vo-table-header">Billing Status (Copayment)</th>
                <th className="vo-table-header">Copayment Info</th>
                <th className="vo-table-header">Refund Info</th>
                <th className="vo-table-header">VO Validation</th>
                <th className="vo-table-header">VO Slip</th>
                <th className="vo-table-header">Insurance Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={index % 2 === 0 ? 'vo-table-row-even' : 'vo-table-row-odd'}
                >
                  <td className="vo-table-cell">
                    <input
                      type="checkbox"
                      className="vo-checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={() => handleSelectRecord(record.id)}
                    />
                  </td>
                  <td className="vo-table-cell">
                    <span className="vo-table-clickable">{record.name}</span>
                  </td>
                  <td className="vo-table-cell">{record.voNr}</td>
                  <td className="vo-table-cell">{record.heilmittel}</td>
                  <td className="vo-table-cell">{record.einrichtung}</td>
                  <td className="vo-table-cell">{record.therapeut}</td>
                  <td className="vo-table-cell">{record.ausstDatum}</td>
                  <td className="vo-table-cell">{record.transferStatus}</td>
                  <td className="vo-table-cell">{record.behStatus}</td>
                  <td className="vo-table-cell">{record.arzt}</td>
                  <td className="vo-table-cell">{record.tb}</td>
                  <td className="vo-table-cell">{record.fvoStatus}</td>
                  <td className="vo-table-cell">{record.bestelltDatum}</td>
                  <td className="vo-table-cell">{record.fvo}</td>
                  <td className="vo-table-cell">
                    <div className="status-dropdown-container">
                      <button
                        className={getVOStatusBadgeClass(record.voStatus)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === `vo-${record.id}` ? null : `vo-${record.id}`);
                        }}
                        type="button"
                      >
                        {record.voStatus} ▾
                      </button>
                      {openDropdown === `vo-${record.id}` && (
                        <div className="status-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={getVOStatusBadgeClass('Aktiv')}
                            onClick={() => {
                              handleVOStatusChange(record.voNr, 'Aktiv', record);
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Aktiv
                          </button>
                          <button
                            className={getVOStatusBadgeClass('Abgebrochen')}
                            onClick={() => {
                              handleVOStatusChange(record.voNr, 'Abgebrochen', record);
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Abgebrochen
                          </button>
                          <button
                            className={getVOStatusBadgeClass('Fertig Behandelt')}
                            onClick={() => {
                              handleVOStatusChange(record.voNr, 'Fertig Behandelt', record);
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Fertig Behandelt
                          </button>
                          <button
                            className={getVOStatusBadgeClass('Abgerechnet')}
                            onClick={() => {
                              handleVOStatusChange(record.voNr, 'Abgerechnet', record);
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Abgerechnet
                          </button>
                          <button
                            className={getVOStatusBadgeClass('Abgelaufen')}
                            onClick={() => {
                              handleVOStatusChange(record.voNr, 'Abgelaufen', record);
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Abgelaufen
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="vo-table-cell">
                    <div className="status-dropdown-container">
                      <button
                        className={getBillingInsuranceBadgeClass(record.billingStatusInsurance || '')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === `insurance-${record.id}` ? null : `insurance-${record.id}`);
                        }}
                        type="button"
                      >
                        {record.billingStatusInsurance || '(no status)'} ▾
                      </button>
                      {openDropdown === `insurance-${record.id}` && (
                        <div className="status-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="status-badge status-default"
                            onClick={() => {
                              handleBillingInsuranceStatusChange(record.voNr, '');
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            (no status)
                          </button>
                          <button
                            className={getBillingInsuranceBadgeClass('Ready to Send')}
                            onClick={() => {
                              handleBillingInsuranceStatusChange(record.voNr, 'Ready to Send');
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Ready to Send
                          </button>
                          <button
                            className={getBillingInsuranceBadgeClass('For Fixing')}
                            onClick={() => {
                              handleBillingInsuranceStatusChange(record.voNr, 'For Fixing');
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            For Fixing
                          </button>
                          <button
                            className={getBillingInsuranceBadgeClass('Sent')}
                            onClick={() => {
                              handleBillingInsuranceStatusChange(record.voNr, 'Sent');
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Sent
                          </button>
                          <button
                            className={getBillingInsuranceBadgeClass('Paid')}
                            onClick={() => {
                              handleBillingInsuranceStatusChange(record.voNr, 'Paid');
                              setOpenDropdown(null);
                            }}
                            type="button"
                          >
                            Paid
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="vo-table-cell">
                    {record.zzBefreiung === 'ja' ? (
                      <div className="status-dropdown-container">
                        <button
                          className={getBillingCopaymentBadgeClass(record.billingStatusCopayment || '')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === `copayment-${record.id}` ? null : `copayment-${record.id}`);
                          }}
                          type="button"
                        >
                          {record.billingStatusCopayment || '(no status)'} ▾
                        </button>
                        {openDropdown === `copayment-${record.id}` && (
                          <div className="status-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="status-badge status-default"
                              onClick={() => {
                                handleBillingCopaymentStatusChange(record.voNr, '');
                                setOpenDropdown(null);
                              }}
                              type="button"
                            >
                              (no status)
                            </button>
                            <button
                              className={getBillingCopaymentBadgeClass('Paid')}
                              onClick={() => {
                                handleBillingCopaymentStatusChange(record.voNr, 'Paid');
                                setOpenDropdown(null);
                              }}
                              type="button"
                            >
                              Paid
                            </button>
                            <button
                              className={getBillingCopaymentBadgeClass('For Refund')}
                              onClick={() => {
                                handleBillingCopaymentStatusChange(record.voNr, 'For Refund');
                                setOpenDropdown(null);
                              }}
                              type="button"
                            >
                              For Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="status-not-applicable">-</span>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    {hasCopaymentDocument(record) && (
                      <button
                        className="table-action-icon"
                        onClick={() => handleCopaymentClick(record)}
                        type="button"
                        title="View Copayment Document"
                      >
                        👁️
                      </button>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    {canGenerateRefund(record) && (
                      <button
                        className="table-action-icon"
                        onClick={() => handleGenerateRefund(record)}
                        type="button"
                        title="Generate Refund Letter"
                      >
                        ➕
                      </button>
                    )}
                    {hasRefundToView(record) && (
                      <button
                        className="table-action-icon"
                        onClick={() => handleViewRefund(record)}
                        type="button"
                        title="View Refund Letter"
                      >
                        👁️
                      </button>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    {shouldShowValidateButton(record) && (
                      <button
                        className="validate-button"
                        onClick={() => handleValidateClick(record.voNr)}
                        type="button"
                      >
                        Validate
                      </button>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    {hasVOSlip(record) ? (
                      <button
                        className="table-action-icon"
                        onClick={() => handleSlipPreview(record)}
                        type="button"
                        title="View VO Slip"
                      >
                        👁️
                      </button>
                    ) : (
                      <div 
                        className={`slip-upload-container ${dragStates[record.voNr] ? 'drag-over' : ''} ${uploadingStates[record.voNr] ? 'uploading' : ''}`}
                        onDragOver={(e) => handleTableDragOver(e, record.voNr)}
                        onDragLeave={(e) => handleTableDragLeave(e, record.voNr)}
                        onDrop={(e) => handleTableDrop(e, record.voNr)}
                      >
                        <input
                          type="file"
                          id={`slip-upload-${record.voNr}`}
                          className="slip-upload-input"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVOSlipUpload(record.voNr, file);
                          }}
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor={`slip-upload-${record.voNr}`}
                          className="slip-upload-label"
                          title="Upload VO Slip"
                        >
                          {uploadingStates[record.voNr] ? (
                            <div className="upload-spinner">⏳</div>
                          ) : (
                            '➕'
                          )}
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    {record.billingStatusInsurance === 'Ready to Send' && (
                      <button
                        className="table-action-icon"
                        onClick={() => handleInsuranceInfoClick(record)}
                        type="button"
                        title="View Insurance Information"
                      >
                        👁️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="therapist-summary">
        <div className="summary-item">
          <strong>{selectedRecords.size}</strong> Einträge ausgewählt
        </div>
        <div className="summary-item">
          <strong>{filteredRecords.length}</strong> Einträge angezeigt
        </div>
        <div className="summary-item">
          <strong>{records.length}</strong> Einträge insgesamt
        </div>
      </div>

      {/* Insurance Info Modal */}
      {insuranceInfoRecord && (
        <InsuranceInfoModal
          voRecord={{
            name: insuranceInfoRecord.name,
            voNr: insuranceInfoRecord.voNr,
            heilmittel: insuranceInfoRecord.heilmittel,
            therapeut: insuranceInfoRecord.therapeut,
            ausstDatum: insuranceInfoRecord.ausstDatum,
            behStatus: insuranceInfoRecord.behStatus,
            icdCode: insuranceInfoRecord.icdCode,
            ikNumber: insuranceInfoRecord.ikNumber,
            amountPerTreatment: insuranceInfoRecord.amountPerTreatment
          }}
          numberOfTreatments={parseInt(insuranceInfoRecord.behStatus.split('/')[0]) || 0}
          totalVoValue={
            insuranceInfoRecord.amountPerTreatment && insuranceInfoRecord.behStatus
              ? (parseFloat(insuranceInfoRecord.amountPerTreatment) * parseInt(insuranceInfoRecord.behStatus.split('/')[0])).toFixed(2)
              : '0.00'
          }
          onClose={() => setInsuranceInfoRecord(null)}
          isFromValidation={false}
        />
      )}

      {/* Copayment Document Modal */}
      {copaymentRecord && copaymentRecord.copaymentInfo && copaymentRecord.patientAddress && (
        <CopaymentDocumentModal
          voRecord={{
            name: copaymentRecord.name,
            voNr: copaymentRecord.voNr,
            heilmittel: copaymentRecord.heilmittel,
            therapeut: copaymentRecord.therapeut,
            ausstDatum: copaymentRecord.ausstDatum,
            behStatus: copaymentRecord.behStatus,
            arzt: copaymentRecord.arzt,
            patientAddress: copaymentRecord.patientAddress,
            copaymentInfo: copaymentRecord.copaymentInfo,
            amountPerTreatment: copaymentRecord.amountPerTreatment || '0.00',
            voStatus: copaymentRecord.voStatus
          }}
          initialView={modalView}
          isGenerating={isGeneratingRefund}
          onClose={() => {
            setCopaymentRecord(null);
            setModalView('copayment');
            setIsGeneratingRefund(false);
          }}
          onSwitchView={handleSwitchView}
          onRefundGenerated={handleRefundGenerated}
          onMarkAsAbgebrochen={handleMarkAsAbgebrochen}
        />
      )}

      {/* VO Slip Preview Modal */}
      {previewSlip && (
        <div className="modal-overlay" onClick={() => setPreviewSlip(null)}>
          <div className="modal-content slip-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>VO Slip Preview - VO #{previewSlip.record.voNr}</h3>
              <button
                className="modal-close"
                onClick={() => setPreviewSlip(null)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {previewSlip.file ? (
                <div className="slip-preview-container">
                  {previewSlip.file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(previewSlip.file)}
                      alt={`VO Slip ${previewSlip.record.voNr}`}
                      className="slip-preview-image"
                    />
                  ) : (
                    <div className="pdf-preview">
                      <div className="pdf-icon">📄</div>
                      <p>PDF Preview</p>
                      <p className="file-name">{previewSlip.file.name}</p>
                    </div>
                  )}
                </div>
              ) : previewSlip.record.voSlip ? (
                <div className="slip-preview-container">
                  {previewSlip.record.voSlip.fileType.startsWith('image/') ? (
                    <img
                      src="/sample-vo-slip.jpg"
                      alt={`VO Slip ${previewSlip.record.voNr}`}
                      className="slip-preview-image"
                    />
                  ) : (
                    <div className="pdf-preview">
                      <div className="pdf-icon">📄</div>
                      <p>PDF Preview</p>
                      <p className="file-name">{previewSlip.record.voSlip.fileName}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="modal-actions">
              <button
                className="action-btn secondary"
                onClick={() => setPreviewSlip(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="action-btn primary"
                onClick={() => {
                  if (previewSlip.file) {
                    const url = URL.createObjectURL(previewSlip.file);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = previewSlip.file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  } else if (previewSlip.record.voSlip) {
                    alert('Download functionality would be implemented here');
                  }
                }}
                type="button"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validation;
