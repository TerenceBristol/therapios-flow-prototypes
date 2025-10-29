import React from 'react';
import { PracticeVO, PracticeDoctor } from '@/types';

interface VOsPDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVOs: PracticeVO[];
  selectedDoctor: PracticeDoctor | null;
  deliveryType: 'er' | 'teltow';
}

const VOsPDFPreviewModal: React.FC<VOsPDFPreviewModalProps> = ({
  isOpen,
  onClose,
  selectedVOs,
  selectedDoctor,
  deliveryType
}) => {
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

  // Handle download (mock for now)
  const handleDownload = () => {
    console.log('Downloading PDF for doctor:', selectedDoctor?.name);
    console.log('Delivery type:', deliveryType);
    console.log('Selected VOs:', selectedVOs.length);
    alert('PDF download would start here (mock implementation)');
  };

  if (!isOpen || !selectedDoctor) return null;

  // Get ER name from first VO
  const erName = selectedVOs[0]?.facilityName || 'ER';

  // Delivery address text
  const deliveryAddress = deliveryType === 'er'
    ? `Please deliver to the ${erName}`
    : 'Therapios, Rheinstr. 7f, 14513 Teltow';

  // Render Follow-Up Order Form (always use this template)
  const renderFollowUpForm = () => {
    return (
      <div style={{
        marginBottom: '2rem',
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
            Bitte um kurze Rückmeldung zu Folgeverordnungen
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.875rem' }}>
            {getCurrentDate()}
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '1rem' }}>
          Sehr geehrtes Praxisteam {selectedDoctor.name},
        </div>

        {/* Body text */}
        <div style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
          wir warten noch auf die Folgeverordnungen für unsere unten genannten Patienten.
          Bitte geben Sie uns kurz Bescheid, ob die Rezepte fertig sind bzw. wann wir damit rechnen können.
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
                Bestelt Date
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
            {selectedVOs.map((vo, index) => (
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">PDF Preview - Follow-Up Form</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedVOs.length} VO{selectedVOs.length !== 1 ? 's' : ''} for Dr. {selectedDoctor.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* PDF Content (scrollable) */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          {renderFollowUpForm()}
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
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default VOsPDFPreviewModal;
