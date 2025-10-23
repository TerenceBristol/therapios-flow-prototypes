'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import VOInformationSection from '@/components/VOInformationSection';
import ValidationChecksSection from '@/components/ValidationChecksSection';
import TreatmentHistorySection from '@/components/TreatmentHistorySection';
import BillingFormSection from '@/components/BillingFormSection';
import InsuranceInfoModal from '@/components/InsuranceInfoModal';
import validationData from '@/data/validationData.json';
import { useVOStatus } from '@/contexts/VOStatusContext';

interface ValidationRecord {
  id: string;
  name: string;
  voNr: string;
  heilmittel: string;
  einrichtung: string;
  therapeut: string;
  ausstDatum: string;
  transferStatus: string;
  behStatus: string;
  arzt: string;
  tb: string;
  fvoStatus: string;
  bestelltDatum: string;
  fvo: string;
  voStatus: string;
  icdCode?: string;
  zzBefreiung?: string;
  ikNumber?: string;
  amountPerTreatment?: string;
  voSlip?: {
    fileName: string;
    uploadDate: string;
    fileType: string;
    fileSize: number;
  };
  treatmentHistory?: Array<{
    date: string;
    session: number;
    notes: string;
    therapeut: string;
  }>;
}

interface ValidationFormPageProps {
  params: Promise<{
    voNr: string;
  }>;
}

export default function ValidationBillingFormPage({ params }: ValidationFormPageProps) {
  const router = useRouter();
  const { updateBillingStatusInsurance, getUploadedSlip, setUploadedSlip } = useVOStatus();
  const [voNr, setVoNr] = useState<string>('');
  const [voRecord, setVoRecord] = useState<ValidationRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allConfirmed, setAllConfirmed] = useState<boolean>(false);
  const [treatmentHistory, setTreatmentHistory] = useState<Array<{
    date: string;
    session: number;
    notes: string;
    therapeut: string;
  }>>([]);
  const [voSlipFile, setVoSlipFile] = useState<File | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState<boolean>(false);
  const [allValidationChecksComplete, setAllValidationChecksComplete] = useState<boolean>(false);

  useEffect(() => {
    // Unwrap params Promise
    params.then(({ voNr }) => {
      setVoNr(voNr);
      
      // Find the VO record by voNr
      const record = (validationData as ValidationRecord[]).find(r => r.voNr === voNr);
      setVoRecord(record || null);
      
      // Check if there's an uploaded slip in context for this VO
      const uploadedSlip = getUploadedSlip(voNr);
      if (uploadedSlip) {
        setVoSlipFile(uploadedSlip);
      }
      
      // Initialize treatment history state based on behStatus
      if (record) {
        const treatmentCount = record.behStatus ? parseInt(record.behStatus.split('/')[0]) : 0;
        
        // Use existing treatment history if available, otherwise generate placeholder data
        if (record.treatmentHistory && record.treatmentHistory.length > 0) {
          setTreatmentHistory([...record.treatmentHistory]);
        } else if (treatmentCount > 0) {
          // Generate placeholder treatment data based on behStatus numerator
          const placeholderTreatments = Array.from({ length: treatmentCount }, (_, index) => ({
            date: new Date(2025, 0, 13 + index * 2).toLocaleDateString('de-DE'), // Generate dates starting from 13.01.2025
            session: index + 1,
            notes: index === 0 ? 'Initial assessment completed' : 
                   index === 1 ? 'Basic mobility exercises' :
                   index === 2 ? 'Patient showed improvement' :
                   index === 3 ? 'Continued progress noted' :
                   index === 4 ? 'Advanced exercises introduced' :
                   index % 3 === 0 ? 'Strength building session' :
                   index % 3 === 1 ? 'Balance and coordination work' : 'Pain management techniques',
            therapeut: 'A. Schöner'
          }));
          setTreatmentHistory(placeholderTreatments);
        }
      }
    });
  }, [params, getUploadedSlip]);

  const handleFormSubmit = () => {
    // Form data handling can be implemented here when needed
  };

  const handleVOChecksPassed = async () => {
    if (!voRecord) return;

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update Billing Status (Insurance) to 'Ready to Send' using context
    updateBillingStatusInsurance(voNr, 'Ready to Send');
    
    // Stop submitting state and show insurance info modal
    setIsSubmitting(false);
    setShowInsuranceModal(true);
  };

  const handleInsuranceModalClose = () => {
    setShowInsuranceModal(false);
    // Navigate back to dashboard
    router.push('/prototypes/validation-billing');
  };

  const handleForFixing = async () => {
    if (!voRecord) return;

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update Billing Status (Insurance) to 'For Fixing' using context
    updateBillingStatusInsurance(voNr, 'For Fixing');
    
    // Show success message and navigate back
    alert(`VO #${voNr} marked for fixing - Billing Status (Insurance) updated to 'For Fixing'`);
    router.push('/prototypes/validation-billing');
  };

  const handleCancel = () => {
    router.push('/prototypes/validation-billing');
  };


  const handleTreatmentUpdate = (sessionNumber: number, updatedTreatment: Partial<{
    date: string;
    session: number;
    notes: string;
    therapeut: string;
  }>) => {
    setTreatmentHistory(prev => 
      prev.map(treatment => 
        treatment.session === sessionNumber 
          ? { ...treatment, ...updatedTreatment }
          : treatment
      )
    );
  };

  const handleTreatmentAdd = (newTreatment: Omit<{
    date: string;
    session: number;
    notes: string;
    therapeut: string;
  }, 'session'>) => {
    const nextSessionNumber = Math.max(...treatmentHistory.map(t => t.session), 0) + 1;
    setTreatmentHistory(prev => [
      ...prev,
      {
        ...newTreatment,
        session: nextSessionNumber
      }
    ]);
  };

  const handleTreatmentDelete = (sessionNumber: number) => {
    setTreatmentHistory(prev => prev.filter(treatment => treatment.session !== sessionNumber));
  };

  // Handle VO slip upload
  const handleVOSlipUpload = async (file: File) => {
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
    setIsUploading(true);

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 1000));

    setVoSlipFile(file);
    // Also store in context so it's accessible from dashboard
    setUploadedSlip(voNr, file);
    setIsUploading(false);
  };

  // Handle drag events for validation page
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the main container
    if ((e.target as HTMLElement).classList.contains('slip-upload-area')) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVOSlipUpload(files[0]);
    }
  };

  // Handle zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  if (!voRecord) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                VO Not Found
              </h1>
              <p className="text-muted-foreground">
                The VO with number &quot;{voNr}&quot; was not found.
              </p>
              <Link href="/prototypes/validation-billing" className="text-primary hover:underline mt-4 inline-block">
                ← Back to Validation + Billing Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasVOSlip = voRecord.voSlip || voSlipFile;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-8">
        {/* Back Link */}
        <div className="container mx-auto px-4">
          <Link 
            href="/prototypes/validation-billing" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Back to Validation + Billing Dashboard
          </Link>
        </div>
        
        {/* Validation Form Content */}
        <div className="container mx-auto px-4">
          <div className="max-w-7xl">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              VO Validation + Billing - VO #{voNr}
            </h1>
            
            {/* VO Information Section */}
            <VOInformationSection
              patientName={voRecord.name}
              heilmittel={voRecord.heilmittel}
              behStatus={voRecord.behStatus}
              zzBefreiung={voRecord.zzBefreiung || 'Not specified'}
              icdCode={voRecord.icdCode || 'Not available'}
              therapeut={voRecord.therapeut}
              voStatus={voRecord.voStatus}
              voNr={voRecord.voNr}
              einrichtung={voRecord.einrichtung}
            />

            {/* Validation Checks Section */}
            <ValidationChecksSection
              voRecord={voRecord}
              onValidationChange={setAllValidationChecksComplete}
            />

            {/* Treatment History and VO Slip Side by Side */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Treatment History Section - Left Side */}
              <div>
                <TreatmentHistorySection
                  treatmentHistory={treatmentHistory}
                  allConfirmed={allConfirmed}
                  onAllConfirmedChange={setAllConfirmed}
                  onTreatmentUpdate={handleTreatmentUpdate}
                  onTreatmentAdd={handleTreatmentAdd}
                  onTreatmentDelete={handleTreatmentDelete}
                />
              </div>

              {/* VO Slip Section - Right Side */}
              <div>
                <div className="vo-slip-section">
                  <h2 className="section-title">VO Slip</h2>
                  <div className="vo-slip-card">
                    {hasVOSlip ? (
                      <div className="slip-preview-container">
                        {/* Zoom Controls */}
                        <div className="zoom-controls">
                          <button 
                            className="zoom-btn" 
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 0.5}
                            type="button"
                          >
                            -
                          </button>
                          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                          <button 
                            className="zoom-btn" 
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 3}
                            type="button"
                          >
                            +
                          </button>
                          <button className="zoom-btn" onClick={handleZoomReset} type="button">
                            Reset
                          </button>
                        </div>
                        
                        {/* Image/File Preview */}
                        <div className="slip-preview-wrapper">
                          <div 
                            className="slip-preview-zoom-container"
                            style={{ 
                              width: `${100 * zoomLevel}%`,
                              height: `${100 * zoomLevel}%`,
                              minWidth: '100%',
                              minHeight: '100%'
                            }}
                          >
                            {voSlipFile ? (
                              voSlipFile.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(voSlipFile)}
                                  alt={`VO Slip ${voNr}`}
                                  className="slip-preview-image"
                                  style={{ 
                                    transform: `scale(${zoomLevel})`
                                  }}
                                />
                              ) : (
                                <div className="pdf-preview" style={{ transform: `scale(${zoomLevel})` }}>
                                  <div className="pdf-icon">📄</div>
                                  <p>PDF Preview</p>
                                  <p className="file-name">{voSlipFile.name}</p>
                                </div>
                              )
                            ) : voRecord.voSlip ? (
                              voRecord.voSlip.fileType.startsWith('image/') ? (
                                <img
                                  src="/sample-vo-slip.jpg"
                                  alt={`VO Slip ${voNr}`}
                                  className="slip-preview-image"
                                  style={{ 
                                    transform: `scale(${zoomLevel})`
                                  }}
                                />
                              ) : (
                                <div className="pdf-preview" style={{ transform: `scale(${zoomLevel})` }}>
                                  <div className="pdf-icon">📄</div>
                                  <p>PDF Preview</p>
                                  <p className="file-name">{voRecord.voSlip.fileName}</p>
                                </div>
                              )
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className={`slip-upload-area ${isDragging ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="vo-slip-upload"
                          className="slip-upload-input"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVOSlipUpload(file);
                          }}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="vo-slip-upload" className="slip-upload-label">
                          <div className="upload-content">
                            {isUploading ? (
                              <>
                                <div className="upload-spinner large">⏳</div>
                                <span>Uploading...</span>
                              </>
                            ) : isDragging ? (
                              <>
                                <span className="upload-icon">📤</span>
                                <span>Drop file here</span>
                              </>
                            ) : (
                              <>
                                <span className="upload-icon">📁</span>
                                <span>Drop files here or click to upload</span>
                                <span className="file-types">JPG, PNG, PDF (max 10MB)</span>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Form Section */}
            <BillingFormSection
              numberOfTreatments={allConfirmed ? treatmentHistory.length : 0}
              ikNumber={voRecord.ikNumber || ''}
              amountPerTreatment={voRecord.amountPerTreatment || ''}
              onFormSubmit={handleFormSubmit}
              onCancel={handleCancel}
            />

            {/* Validation Action Buttons */}
            <div className="validation-actions">
              <button
                className="action-btn secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </button>
              <button
                className="action-btn danger"
                onClick={handleForFixing}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Processing...' : 'For Fixing'}
              </button>
              <button
                className="action-btn primary"
                onClick={handleVOChecksPassed}
                disabled={isSubmitting || !allValidationChecksComplete}
                type="button"
              >
                {isSubmitting ? 'Processing...' : 'VO Checks Passed'}
                {!isSubmitting && !allValidationChecksComplete && (
                  <span className="button-progress"> (Complete all validation checks)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Insurance Info Modal */}
      {showInsuranceModal && voRecord && (
        <InsuranceInfoModal
          voRecord={{
            name: voRecord.name,
            voNr: voRecord.voNr,
            heilmittel: voRecord.heilmittel,
            therapeut: voRecord.therapeut,
            ausstDatum: voRecord.ausstDatum,
            behStatus: voRecord.behStatus,
            icdCode: voRecord.icdCode,
            ikNumber: voRecord.ikNumber || '',
            amountPerTreatment: voRecord.amountPerTreatment || ''
          }}
          numberOfTreatments={treatmentHistory.length}
          totalVoValue={
            voRecord.amountPerTreatment && treatmentHistory.length > 0
              ? (parseFloat(voRecord.amountPerTreatment) * treatmentHistory.length).toFixed(2)
              : '0.00'
          }
          onClose={handleInsuranceModalClose}
          isFromValidation={true}
        />
      )}
    </div>
  );
}

