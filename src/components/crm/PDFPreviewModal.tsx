'use client';

import React from 'react';
import { CRMVORecord } from '@/types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'initial' | 'followup';
  doctorName: string;
  selectedVOs: CRMVORecord[];
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  formType,
  doctorName,
  selectedVOs
}) => {
  if (!isOpen) return null;

  // Helper function to format current date as DD.MM.YYYY
  const getCurrentDate = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Helper function to extract treatment count and format treatment details
  const formatTreatmentDetails = (vo: CRMVORecord): string => {
    const treatmentParts = vo.treatmentStatus.split('/');
    const count = treatmentParts.length > 1 ? treatmentParts[1] : treatmentParts[0];
    return `${count} ${vo.heilmittelCode} im Hausbesuch`;
  };

  // Group VOs by facility (ER)
  const facilityGroups = React.useMemo(() => {
    const groups: { [facility: string]: CRMVORecord[] } = {};
    selectedVOs.forEach(vo => {
      if (!groups[vo.facility]) {
        groups[vo.facility] = [];
      }
      groups[vo.facility].push(vo);
    });
    return groups;
  }, [selectedVOs]);

  // Template for Initial Order Form
  const renderInitialOrderForm = (facility: string, vos: CRMVORecord[]) => {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxWidth: '600px',
        textAlign: 'left',
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
          <strong>Folgeverordnungen für Ihren Patienten</strong>
          <div style={{ float: 'right' }}>{getCurrentDate()}</div>
        </div>
        <div style={{ clear: 'both' }}></div>

        <div style={{ marginBottom: '1rem' }}>
          Sehr geehrte Damen und Herren,
        </div>

        <div style={{ marginBottom: '1rem' }}>
          im Auftrag unseres Patienten bitten wir um Ausstellung einer weiteren Heilmittelverordnung wie aufgeführt:
        </div>

        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
          <strong>ER:</strong> {facility}
        </div>

        <table style={{
          width: '100%',
          border: '1px solid #000',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
          fontSize: '0.8rem'
        }}>
          <tbody>
            {vos.map((vo, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientName}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientInfo.dateOfBirth}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {formatTreatmentDetails(vo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginBottom: '1rem' }}>
          Wenn möglich, bitten wir um Zusendung der Heilmittelverordnung an unsere <strong>Büroadresse</strong>:
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div>Therapios</div>
          <div>- Verordnungsmanagement -</div>
          <div>Rheinstr. 7f</div>
          <div>14513 Teltow</div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          Gerne senden wir Ihnen auf Wunsch die benötigten Freiumschläge zu!
        </div>

        <div style={{ marginBottom: '1rem' }}>
          Ist dies nicht möglich, so bitten wir um Hinterlegung in der Einrichtung oder um Rückruf. 
          Für Fragen stehen wir Ihnen gerne persönlich zur Verfügung. Sie erreichen uns unter
        </div>

        <div style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
          <div>Tel: 03328 / 477 23 63</div>
          <div>Fax: 03328 / 477 23 60</div>
        </div>

        <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
          Wir freuen uns über eine kurze Rückmeldung und bedanken uns für die Zusammenarbeit.
        </div>

        <div style={{ fontSize: '0.75rem' }}>
          Mit freundlichen Grüßen<br /><br />
          Therapios GmbH
        </div>
      </div>
    );
  };

  // Template for Follow-up Order Form
  const renderFollowupOrderForm = (facility: string, vos: CRMVORecord[]) => {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxWidth: '600px',
        textAlign: 'left',
        fontSize: '0.875rem'
      }}>
        <div style={{ marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
          <strong>Bitte um kurze Rückmeldung zu Folgeverordnungen</strong>
          <div style={{ float: 'right' }}>{getCurrentDate()}</div>
        </div>
        <div style={{ clear: 'both' }}></div>

        <div style={{ marginBottom: '1rem' }}>
          Sehr geehrtes Praxisteam,
        </div>

        <div style={{ marginBottom: '1rem' }}>
          wir hoffen, es geht Ihnen gut und möchten uns für die gute Zusammenarbeit bedanken.
        </div>

        <div style={{ marginBottom: '1rem' }}>
          Uns ist aufgefallen, dass wir für die folgenden Patient:innen derzeit noch keine neuen Verordnungen vorliegen haben:
        </div>

        <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
          <strong>ER:</strong> {facility}
        </div>

        <table style={{
          width: '100%',
          border: '1px solid #000',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
          fontSize: '0.8rem'
        }}>
          <tbody>
            {vos.map((vo, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientName}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientInfo.dateOfBirth}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {formatTreatmentDetails(vo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginBottom: '1rem' }}>
          Damit wir die Behandlung ohne Unterbrechung fortsetzen und mögliche Rückfragen von Patient:innen, 
          Angehörigen oder Pflegekräften sicher beantworten können, wäre es hilfreich zu wissen, ob und wann 
          wir mit den Verordnungen rechnen dürfen.
        </div>

        <div style={{ marginBottom: '1rem' }}>
          Falls die Rezepte bereits unterwegs sind, betrachten Sie diese Nachricht bitte einfach als gegenstandslos.
        </div>

        <div style={{ marginBottom: '1rem' }}>
          Vielen Dank für Ihre Unterstützung – wir schätzen die Zusammenarbeit mit Ihnen sehr.
        </div>

        <div style={{ fontSize: '0.75rem' }}>
          Mit herzlichen Grüßen<br /><br />
          Ihr Therapios Team
        </div>
      </div>
    );
  };

  const handleDownload = () => {
    // Mock download functionality
    console.log('Downloading PDF:', formType, doctorName, Object.keys(facilityGroups).length, 'pages');
    // In a real implementation, this would trigger the PDF download
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {formType === 'initial' ? 'Initial' : 'Follow-up'} Order Form - {doctorName}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* PDF Preview Content */}
        <div className="pdf-preview-content" style={{ justifyContent: Object.keys(facilityGroups).length > 0 ? 'flex-start' : 'center' }}>
          <div className="pdf-preview-icon">📄</div>
          <div className="pdf-preview-text">
            {formType === 'initial' ? 'Initial Order Form' : 'Follow-up Order Form'}
          </div>
          <div className="pdf-preview-subtext">
            {Object.keys(facilityGroups).length} page{Object.keys(facilityGroups).length !== 1 ? 's' : ''} ready to download for Dr. {doctorName}
          </div>

          {/* Multi-page PDF Content Preview */}
          <div style={{ marginTop: '2rem', width: '100%' }}>
            {Object.entries(facilityGroups).map(([facility, vos], index) => (
              <React.Fragment key={facility}>
                {/* Render the appropriate template based on form type */}
                {formType === 'initial' 
                  ? renderInitialOrderForm(facility, vos)
                  : renderFollowupOrderForm(facility, vos)
                }
                
                {/* Page separator (except for the last page) */}
                {index < Object.keys(facilityGroups).length - 1 && (
                  <div style={{
                    margin: '2rem 0',
                    padding: '0.5rem 0',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#666',
                    borderTop: '2px dashed #ccc',
                    borderBottom: '2px dashed #ccc'
                  }}>
                    ─── Next Page ───
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* PDF Actions */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            width: '100%'
          }}>
            <button className="action-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="action-btn primary" onClick={handleDownload}>
              Download PDF ({Object.keys(facilityGroups).length} page{Object.keys(facilityGroups).length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
