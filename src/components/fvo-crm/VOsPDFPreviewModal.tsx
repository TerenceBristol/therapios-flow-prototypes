import React from 'react';
import { PracticeVO, OrderFormType } from '@/types';

interface VOsPDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVOs: PracticeVO[];
  orderType: OrderFormType;
  deliveryType: 'er' | 'teltow';
}

const VOsPDFPreviewModal: React.FC<VOsPDFPreviewModalProps> = ({
  isOpen,
  onClose,
  selectedVOs,
  orderType,
  deliveryType
}) => {
  if (!isOpen || selectedVOs.length === 0) return null;

  // Helper function to format current date as DD.MM.YYYY
  const getCurrentDate = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format treatment details: "anzahl therapyType im Hausbesuch"
  const formatHeilmittel = (vo: PracticeVO): string => {
    return `${vo.anzahl}x ${vo.therapyType} im Hausbesuch`;
  };

  // Get form title based on order type
  const formTitle = orderType === 'initial'
    ? 'Bitte um Ausstellung von Folgeverordnungen'
    : 'Bitte um kurze Rückmeldung zu Folgeverordnungen';

  // Get template content based on orderType + deliveryType
  const getTemplateContent = () => {
    if (orderType === 'initial') {
      // Initial Order templates
      const opening = 'im Auftrag unserer Patient:innen bitten wir um Ausstellung von weiteren Heilmittelverordnungen wie aufgeführt:';

      const delivery = deliveryType === 'er'
        ? 'Wir bitten wir um Hinterlegung der Verordnungen in der Einrichtung. Auf Wunsch senden wir Ihnen dafür gern kostenfrei Freiumschläge zu.'
        : null; // Teltow has address block

      const closing = 'Bitte lassen Sie uns eine kurze Rückmeldung zukommen, sobald die Verordnungen erfolgreich ausgestellt wurden. Wir bedanken uns für die angenehme Zusammenarbeit!';

      return { opening, delivery, closing, middle: null };
    } else {
      // Follow-up Order templates
      const opening = 'wir hoffen, es geht Ihnen gut und möchten uns für die gute Zusammenarbeit bedanken.\n\nUns ist aufgefallen, dass wir für die folgenden Patient:innen derzeit noch keine neuen Verordnungen vorliegen haben:';

      const middle = 'Damit wir die Behandlung ohne Unterbrechung fortsetzen und mögliche Rückfragen von Patient:innen, Angehörigen oder Pflegekräften sicher beantworten können, wäre es hilfreich zu wissen, wann wir mit den angefragten Verordnungen rechnen dürfen.';

      const delivery = deliveryType === 'er'
        ? 'Weiterhin würden wir uns freuen, wenn Sie die Verordnungen in der Einrichtung hinterlegen können. Falls die Rezepte bereits unterwegs sind, freuen wir uns über eine kurze Rückmeldung.'
        : null; // Teltow has address block

      const closing = 'Vielen Dank für Ihre Unterstützung – wir schätzen die Zusammenarbeit mit Ihnen sehr.';

      return { opening, delivery, closing, middle };
    }
  };

  const templateContent = getTemplateContent();

  // Render the consolidated PDF form
  const renderForm = () => {
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
        {/* Date - top right */}
        <div style={{ textAlign: 'right', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {getCurrentDate()}
        </div>

        {/* Title */}
        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.5rem' }}>
          {formTitle}
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '1rem' }}>
          Sehr geehrtes Praxisteam,
        </div>

        {/* Opening text */}
        <div style={{ marginBottom: '1.5rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {templateContent.opening}
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
                Einrichtung
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                Patientenname
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left',
                width: '100px'
              }}>
                Geb.datum
              </th>
              <th style={{
                border: '1px solid #000',
                padding: '0.5rem',
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                textAlign: 'left'
              }}>
                Heilmittel
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedVOs.map((vo) => (
              <tr key={vo.id}>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.facilityName}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.patientName}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {vo.gebDatum}
                </td>
                <td style={{ border: '1px solid #000', padding: '0.5rem' }}>
                  {formatHeilmittel(vo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Middle text (only for follow-up) */}
        {templateContent.middle && (
          <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {templateContent.middle}
          </div>
        )}

        {/* Delivery section */}
        {deliveryType === 'teltow' ? (
          <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {orderType === 'initial' ? (
              <>
                <div>Senden Sie uns die Verordnungen nach Möglichkeit bitte an unsere <strong>Büroadresse</strong>:</div>
                <div style={{ margin: '1rem 0' }}>
                  <div>Therapios</div>
                  <div>- Verordnungsmanagement -</div>
                  <div>Rheinstr. 7F</div>
                  <div>14513 Teltow</div>
                </div>
                <div>Sollte dies nicht möglich sein, so bitten wir um Hinterlegung in der Einrichtung. Auf Wunsch lassen wir Ihnen gern kostenfrei Freiumschläge zukommen.</div>
              </>
            ) : (
              <>
                <div>Weiterhin würden wir uns freuen, wenn Sie die Verordnungen an unsere Büroadresse senden können:</div>
                <div style={{ margin: '1rem 0' }}>
                  <div>Therapios</div>
                  <div>- Verordnungsmanagement -</div>
                  <div>Rheinstr. 7F</div>
                  <div>14513 Teltow</div>
                </div>
                <div>Falls die Rezepte bereits unterwegs sind, freuen wir uns über eine kurze Rückmeldung.</div>
              </>
            )}
          </div>
        ) : (
          templateContent.delivery && (
            <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {templateContent.delivery}
            </div>
          )
        )}

        {/* Contact Info */}
        <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          <div>Für Rückfragen stehen wir Ihnen gerne persönlich zur Verfügung. Sie erreichen uns unter:</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div>Tel: 03328 / 477 23 70</div>
            <div>Fax: 03328 / 477 23 60</div>
          </div>
        </div>

        {/* Closing */}
        <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          {templateContent.closing}
        </div>

        {/* Signature */}
        <div style={{ lineHeight: '1.6' }}>
          <div>Mit freundlichen Grüßen</div>
          <div>Ihr Team Therapios</div>
        </div>
      </div>
    );
  };

  // Handle download
  const handleDownload = () => {
    console.log('Downloading PDF');
    console.log('Order type:', orderType);
    console.log('Delivery type:', deliveryType);
    console.log('Total VOs:', selectedVOs.length);
    alert(`PDF download would start here (mock implementation)\n\nOrder Type: ${orderType === 'initial' ? 'Initial' : 'Follow-up'}\nDelivery: ${deliveryType === 'er' ? 'ER' : 'Teltow'}\nVOs: ${selectedVOs.length}`);
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
              1 form • {selectedVOs.length} VO{selectedVOs.length !== 1 ? 's' : ''} • Delivery: {deliveryType === 'er' ? 'Einrichtung' : 'Teltow Office'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Preview Content - Single Form */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          {renderForm()}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default VOsPDFPreviewModal;
