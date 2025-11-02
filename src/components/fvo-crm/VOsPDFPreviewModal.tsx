import React, { useState, useMemo } from 'react';
import { PracticeVO, PracticeDoctor, OrderFormType } from '@/types';

interface VOsPDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVOs: PracticeVO[];
  doctors: PracticeDoctor[];
  orderType: OrderFormType;
  deliveryType: 'er' | 'teltow';
}

const VOsPDFPreviewModal: React.FC<VOsPDFPreviewModalProps> = ({
  isOpen,
  onClose,
  selectedVOs,
  doctors,
  orderType,
  deliveryType
}) => {
  // Group VOs by doctor
  const vosByDoctor = useMemo(() => {
    const grouped = new Map<string, { doctor: PracticeDoctor; vos: PracticeVO[] }>();

    selectedVOs.forEach(vo => {
      const doctor = doctors.find(d => d.id === vo.doctorId);
      if (!doctor) return;

      if (!grouped.has(vo.doctorId)) {
        grouped.set(vo.doctorId, { doctor, vos: [] });
      }
      grouped.get(vo.doctorId)!.vos.push(vo);
    });

    return Array.from(grouped.values());
  }, [selectedVOs, doctors]);

  if (!isOpen || vosByDoctor.length === 0) return null;

  // Helper function to format current date as DD.MM.YYYY
  const getCurrentDate = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format treatment details: "anzahl therapyType im Hausbesuch"
  const formatTreatmentDetails = (vo: PracticeVO): string => {
    return `${vo.anzahl} ${vo.therapyType} im Hausbesuch`;
  };

  // Get ER name from first VO
  const erName = selectedVOs[0]?.facilityName || 'ER';

  // Delivery address text
  const deliveryAddress = deliveryType === 'er'
    ? `Please deliver to the ${erName}`
    : 'Therapios, Rheinstr. 7f, 14513 Teltow';

  // Get form title based on order type
  const formTitle = orderType === 'initial'
    ? 'Bestellung von Erstverordnungen'
    : 'Bitte um kurze Rückmeldung zu Folgeverordnungen';

  // Get greeting text based on order type
  const greetingText = orderType === 'initial'
    ? 'wir möchten folgende Erstverordnungen für unsere Patienten bestellen.'
    : 'wir warten noch auf die Folgeverordnungen für unsere unten genannten Patienten. Bitte geben Sie uns kurz Bescheid, ob die Rezepte fertig sind bzw. wann wir damit rechnen können.';

  // Render PDF form
  const renderForm = (doctor: PracticeDoctor, vos: PracticeVO[]) => {
    return (
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
            {formTitle}
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.875rem' }}>
            {getCurrentDate()}
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '1rem' }}>
          Sehr geehrtes Praxisteam {doctor.name},
        </div>

        {/* Body text */}
        <div style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
          {greetingText}
        </div>

        {/* ER Name */}
        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
          <strong>ER:</strong> {erName}
        </div>

        {/* Patient Table */}
        <table style={{
          width: '100%',
          border: '1px solid #000',
          borderCollapse: 'collapse',
          marginBottom: '1.5rem',
          fontSize: '0.8rem'
        }}>
          <thead>
            <tr>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                Patient Name
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left',
                width: '100px'
              }}>
                Geb. Datum
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left',
                width: '100px'
              }}>
                {orderType === 'initial' ? 'Date' : 'Bestelt Date'}
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {vos.map((vo, index) => (
              <tr key={vo.id}>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientName}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.gebDatum}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.statusDate}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {formatTreatmentDetails(vo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Delivery Address */}
        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
          <strong>Delivery:</strong> {deliveryAddress}
        </div>

        {/* Closing */}
        <div style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
          Vielen Dank für Ihre Unterstützung!
        </div>

        {/* Contact Info */}
        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#666' }}>
          <div><strong>Therapios</strong></div>
          <div>Rheinstr. 7f, 14513 Teltow</div>
          <div>Tel: 03328 / 477 23 63</div>
          <div>Fax: 03328 / 477 23 60</div>
        </div>
      </div>
    );
  };

  // Handle download for individual doctor
  const handleDownload = (doctorName: string, vosCount: number) => {
    console.log('Downloading PDF for doctor:', doctorName);
    console.log('Order type:', orderType);
    console.log('Delivery type:', deliveryType);
    console.log('Selected VOs:', vosCount);
    alert(`PDF download would start here (mock implementation)\n\nDoctor: ${doctorName}\nVOs: ${vosCount}`);
  };

  const handleDownloadAll = () => {
    console.log('Downloading all PDFs');
    console.log('Total forms:', vosByDoctor.length);
    console.log('Total VOs:', selectedVOs.length);
    alert(`All PDFs download would start here (mock implementation)\n\nForms: ${vosByDoctor.length}\nTotal VOs: ${selectedVOs.length}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              PDF Preview - {orderType === 'initial' ? 'Initial' : 'Follow-up'} Order Form
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {vosByDoctor.length} form{vosByDoctor.length !== 1 ? 's' : ''} • {selectedVOs.length} VO{selectedVOs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Preview Content - All Forms */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <div className="space-y-8">
            {vosByDoctor.map((group, index) => (
              <div key={group.doctor.id}>
                {/* Doctor Section Header */}
                <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg border-2 border-primary shadow-sm">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Form {index + 1}: Dr. {group.doctor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.vos.length} VO{group.vos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(group.doctor.name, group.vos.length)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>

                {/* Form Preview */}
                {renderForm(group.doctor, group.vos)}

                {/* Page Break Indicator (not for last form) */}
                {index < vosByDoctor.length - 1 && (
                  <div className="my-8 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-400"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-muted/20 px-4 py-1 text-sm font-medium text-gray-600 uppercase tracking-wide">
                        Page Break
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 font-medium text-sm"
          >
            Close
          </button>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All {vosByDoctor.length > 1 ? `(${vosByDoctor.length} Forms)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VOsPDFPreviewModal;
