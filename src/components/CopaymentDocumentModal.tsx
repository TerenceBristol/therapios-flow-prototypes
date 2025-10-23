'use client';

import React, { useState } from 'react';
import './crm/CRM.css';

// Practice constants
const PRACTICE_INFO = {
  name: 'Therapios iR3 GmbH',
  address: 'Oderstr. 55, 14513 Teltow',
  iban: 'DE63 1001 0123 6293 3753 18',
  bic: 'QNTODEB2XXX',
  bankName: 'Deutsche Bank'
};

interface CopaymentDocumentModalProps {
  voRecord: {
    name: string;
    voNr: string;
    heilmittel: string;
    therapeut: string;
    ausstDatum: string;
    behStatus: string;
    arzt: string;
    patientAddress: {
      nachname: string;
      vorname: string;
      strasse: string;
      plz: string;
      ort: string;
      land: string;
    };
    copaymentInfo: {
      invoiceNumber: string;
      generatedDate: string;
      copaymentAmount: string;
      documentGenerated: boolean;
      refundGenerated: boolean;
      refundAmount: string | null;
      refundDate: string | null;
      refundInvoiceNumber: string | null;
    };
    amountPerTreatment: string;
    voStatus: string;
  };
  initialView?: 'copayment' | 'refund';
  isGenerating?: boolean;
  onClose: () => void;
  onSwitchView?: (view: 'copayment' | 'refund') => void;
  onRefundGenerated?: (voNr: string, refundData: {
    refundAmount: string;
    refundDate: string;
    refundInvoiceNumber: string;
  }) => void;
  onMarkAsAbgebrochen?: (voNr: string, updateFvoStatus: boolean) => void;
}

const CopaymentDocumentModal: React.FC<CopaymentDocumentModalProps> = ({
  voRecord,
  initialView = 'copayment',
  isGenerating = false,
  onClose,
  onSwitchView,
  onRefundGenerated,
  onMarkAsAbgebrochen
}) => {
  const [currentView, setCurrentView] = useState<'copayment' | 'refund'>(initialView);
  const [showAbgebrochenConfirm, setShowAbgebrochenConfirm] = useState(false);

  // Parse behStatus to get completed and prescribed counts
  const [completed, prescribed] = voRecord.behStatus.split('/').map(n => parseInt(n));
  
  // Calculate amounts
  const treatmentCostPerSession = parseFloat(voRecord.amountPerTreatment);
  const originalTotalCost = prescribed * treatmentCostPerSession;
  const originalCopayment = parseFloat(voRecord.copaymentInfo.copaymentAmount);
  
  const actualTotalCost = completed * treatmentCostPerSession;
  const actualCopayment = 10 + (actualTotalCost * 0.10);
  const refundAmount = originalCopayment - actualCopayment;

  // Handle view switching
  const handleLocalSwitchView = (view: 'copayment' | 'refund') => {
    setCurrentView(view);
    if (onSwitchView) {
      onSwitchView(view);
    }
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    const docType = currentView === 'refund' ? 'refund letter' : 'copayment document';
    alert(`PDF download functionality would be implemented here. For this prototype, this would use jsPDF to generate a PDF from the ${docType} preview.`);
  };

  // Handle Mark as Abgebrochen button click
  const handleMarkAsAbgebrochenClick = () => {
    setShowAbgebrochenConfirm(true);
  };

  // Handle Abgebrochen confirmation - Yes (update both statuses)
  const handleConfirmAbgebrochenYes = () => {
    if (onMarkAsAbgebrochen) {
      onMarkAsAbgebrochen(voRecord.voNr, true); // true = update fvoStatus
    }
    setShowAbgebrochenConfirm(false);
  };

  // Handle Abgebrochen confirmation - No (update only voStatus)
  const handleConfirmAbgebrochenNo = () => {
    if (onMarkAsAbgebrochen) {
      onMarkAsAbgebrochen(voRecord.voNr, false); // false = don't update fvoStatus
    }
    setShowAbgebrochenConfirm(false);
  };

  // Handle Abgebrochen confirmation - Cancel
  const handleConfirmAbgebrochenCancel = () => {
    setShowAbgebrochenConfirm(false);
  };

  // Render the appropriate document
  const renderDocument = () => {
    if (currentView === 'refund') {
      return renderRefundLetter();
    }
    return renderCopaymentDocument();
  };

  // Render copayment document
  const renderCopaymentDocument = () => {
    return (
      <div className="copayment-document">
        {/* Header */}
        <div className="document-header">
          <div className="practice-letterhead">
            {PRACTICE_INFO.name}, {PRACTICE_INFO.address}
          </div>
        </div>

        {/* Recipient Address */}
        <div className="recipient-address">
          <div className="address-line">Herr/Frau/Firma</div>
          <div className="address-line">{voRecord.patientAddress.vorname} {voRecord.patientAddress.nachname}</div>
          <div className="address-line">{voRecord.patientAddress.strasse}</div>
          <div className="address-line">{voRecord.patientAddress.plz} {voRecord.patientAddress.ort}</div>
        </div>

        {/* Date and Place */}
        <div className="document-date">
          Teltow, {voRecord.copaymentInfo.generatedDate}
        </div>

        {/* Invoice Title */}
        <div className="document-title">
          <h2>Rechnung {voRecord.copaymentInfo.invoiceNumber}</h2>
          <h3>Zuzahlung zur Heilmittelbehandlung für {voRecord.name}</h3>
        </div>

        {/* Body Text */}
        <div className="document-body">
          <p>Sehr geehrte/r Versicherte/r,</p>
          
          <p>
            Auf Bitten der Wohneinrichtung und auf Grundlage der ärztlichen Verordnung von {voRecord.arzt}, 
            haben wir die Behandlung der oben genannten Person übernommen.
          </p>

          <p>
            Gesetzlich Versicherte sind gemäß § 32 i. V. m. § 61 SGB V verpflichtet, einen Eigenanteil (Zuzahlung) 
            zu den Kosten einer Heilmittelbehandlung zu leisten. Diese setzt sich aus zwei Teilen zusammen:
          </p>

          <ul>
            <li>10 € pro Verordnung (Rezept)</li>
            <li>10 % der Behandlungskosten</li>
          </ul>

          <p>
            Die ärztliche Verordnung (Nr. {voRecord.voNr}) von {voRecord.arzt} vom {voRecord.ausstDatum} umfasst:
          </p>

          <ul>
            <li><strong>{prescribed} × {voRecord.heilmittel}</strong></li>
          </ul>

          <p>
            Daraus ergibt sich ein gesetzlich festgelegter Eigenanteil (Zuzahlung) von:
          </p>

          <div className="copayment-amount">
            <strong>{voRecord.copaymentInfo.copaymentAmount} €</strong>
            <div className="amount-note">(Steuerfreie Leistung gemäß § 4 Nr. 14 UStG)</div>
          </div>

          <p>
            Wir berechnen diesen Betrag im Auftrag der Krankenkasse und bitten Sie, den Betrag bis zum{' '}
            {new Date(new Date(voRecord.copaymentInfo.generatedDate.split('.').reverse().join('-')).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')} auf folgendes Konto zu überweisen:
          </p>
        </div>

        {/* Bank Information */}
        <div className="bank-info">
          <div className="bank-info-box">
            <div className="bank-line"><strong>{PRACTICE_INFO.name}</strong></div>
            <div className="bank-line"><strong>IBAN:</strong> {PRACTICE_INFO.iban}</div>
            <div className="bank-line"><strong>BIC:</strong> {PRACTICE_INFO.bic}</div>
            <div className="bank-line"><strong>Verwendungszweck:</strong> {voRecord.copaymentInfo.invoiceNumber} Zuzahlung {voRecord.patientAddress.nachname}, {voRecord.patientAddress.vorname}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render refund letter
  const renderRefundLetter = () => {
    const usedRefundAmount = voRecord.copaymentInfo.refundGenerated 
      ? voRecord.copaymentInfo.refundAmount 
      : refundAmount.toFixed(2);
    const usedRefundDate = voRecord.copaymentInfo.refundGenerated 
      ? voRecord.copaymentInfo.refundDate 
      : new Date().toLocaleDateString('de-DE');
    const usedRefundInvoice = voRecord.copaymentInfo.refundGenerated 
      ? voRecord.copaymentInfo.refundInvoiceNumber 
      : `${voRecord.copaymentInfo.invoiceNumber}-R`;

    return (
      <div className="copayment-document refund-letter">
        {/* Header */}
        <div className="document-header">
          <div className="practice-letterhead">
            {PRACTICE_INFO.name}, {PRACTICE_INFO.address}
          </div>
        </div>

        {/* Recipient Address */}
        <div className="recipient-address">
          <div className="address-line">Herr/Frau/Firma</div>
          <div className="address-line">{voRecord.patientAddress.vorname} {voRecord.patientAddress.nachname}</div>
          <div className="address-line">{voRecord.patientAddress.strasse}</div>
          <div className="address-line">{voRecord.patientAddress.plz} {voRecord.patientAddress.ort}</div>
        </div>

        {/* Date and Place */}
        <div className="document-date">
          Teltow, {usedRefundDate}
        </div>

        {/* Refund Title */}
        <div className="document-title">
          <h2>Erstattungsbeleg {usedRefundInvoice}</h2>
          <h3>Rechnungskorrektur zur ursprünglichen Rechnung {voRecord.copaymentInfo.invoiceNumber}</h3>
        </div>

        {/* Body Text */}
        <div className="document-body">
          <p>Sehr geehrte/r Versicherte/r,</p>
          
          <p>
            Aufgrund der vorzeitigen Beendigung der ärztlichen Verordnung (Nr. {voRecord.voNr}) 
            von {voRecord.arzt} vom {voRecord.ausstDatum} ergibt sich folgende Rechnungskorrektur:
          </p>

          <div className="calculation-section">
            <h4>Die ärztliche Verordnung umfasst:</h4>
            <ul>
              <li>{prescribed} × {voRecord.heilmittel}</li>
            </ul>
          </div>

          <div className="calculation-section original-invoice">
            <h4>Ursprünglich berechnete Zuzahlung (Rechnung {voRecord.copaymentInfo.invoiceNumber} vom {voRecord.copaymentInfo.generatedDate}):</h4>
            <div className="calculation-details">
              <div className="calc-line">• {prescribed} Behandlungen zu je {treatmentCostPerSession.toFixed(2)}€ = {originalTotalCost.toFixed(2)}€</div>
              <div className="calc-line-spacer"></div>
              <div className="calc-line">Gesetzlich Versicherte sind gemäß § 32 i. V. m. § 61 SGB V verpflichtet,</div>
              <div className="calc-line">einen Eigenanteil (Zuzahlung) zu leisten:</div>
              <div className="calc-line indent">- 10 € pro Verordnung</div>
              <div className="calc-line indent">- 10 % der Behandlungskosten: {(originalTotalCost * 0.10).toFixed(2)}€</div>
              <div className="calc-line-spacer"></div>
              <div className="calc-line total">Ursprüngliche Zuzahlung: {originalCopayment.toFixed(2)}€</div>
            </div>
          </div>

          <div className="calculation-section actual-treatments">
            <h4>Tatsächlich durchgeführte Behandlungen: {completed}</h4>
          </div>

          <div className="calculation-section corrected-invoice">
            <h4>Korrigierte Abrechnung:</h4>
            <div className="calculation-details">
              <div className="calc-line">• {completed} Behandlungen zu je {treatmentCostPerSession.toFixed(2)}€ = {actualTotalCost.toFixed(2)}€</div>
              <div className="calc-line-spacer"></div>
              <div className="calc-line">Korrigierte Zuzahlung gemäß § 32 i. V. m. § 61 SGB V:</div>
              <div className="calc-line indent">- 10 € pro Verordnung</div>
              <div className="calc-line indent">- 10 % der Behandlungskosten: {(actualTotalCost * 0.10).toFixed(2)}€</div>
              <div className="calc-line-spacer"></div>
              <div className="calc-line total">Korrigierte Zuzahlung: {actualCopayment.toFixed(2)}€</div>
            </div>
          </div>

          <div className="refund-amount-highlight">
            <div className="refund-label">Zu erstattender Betrag:</div>
            <div className="refund-value">{usedRefundAmount} €</div>
            <div className="amount-note">(Steuerfreie Leistung gemäß § 4 Nr. 14 UStG)</div>
          </div>

          <p>
            Der Betrag wird auf das von Ihnen angegebene Konto erstattet bzw. bitten wir Sie, 
            diesen bis zum {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')} zu begleichen.
          </p>
        </div>

        {/* Bank Information */}
        <div className="bank-info">
          <div className="bank-info-box">
            <div className="bank-line"><strong>{PRACTICE_INFO.name}</strong></div>
            <div className="bank-line"><strong>IBAN:</strong> {PRACTICE_INFO.iban}</div>
            <div className="bank-line"><strong>BIC:</strong> {PRACTICE_INFO.bic}</div>
            <div className="bank-line"><strong>Verwendungszweck:</strong> {usedRefundInvoice} Erstattung {voRecord.patientAddress.nachname}, {voRecord.patientAddress.vorname}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content copayment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">⏳</div>
              <p>Generating refund letter...</p>
            </div>
          </div>
        )}

        <div className="modal-header">
          <div>
            <h3>{currentView === 'refund' ? 'Refund Letter Preview' : 'Copayment Document Preview'}</h3>
            <div className="document-badges">
              {voRecord.copaymentInfo.documentGenerated && currentView === 'copayment' && (
                <span className="status-badge status-generated">
                  Generated: {voRecord.copaymentInfo.generatedDate}
                </span>
              )}
              {voRecord.copaymentInfo.refundGenerated && currentView === 'refund' && (
                <span className="status-badge status-refund">
                  Refund Issued: {voRecord.copaymentInfo.refundDate}
                </span>
              )}
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body copayment-preview">
          {renderDocument()}
        </div>

        {/* Cross-Navigation Links */}
        <div className="modal-navigation">
          {currentView === 'copayment' && voRecord.copaymentInfo.refundGenerated && (
            <button
              className="nav-link"
              onClick={() => handleLocalSwitchView('refund')}
              type="button"
            >
              🔗 View Refund Letter →
            </button>
          )}
          {currentView === 'refund' && (
            <button
              className="nav-link"
              onClick={() => handleLocalSwitchView('copayment')}
              type="button"
            >
              🔗 View Original Copayment Invoice →
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button
            className="action-btn secondary"
            onClick={onClose}
            type="button"
          >
            Close
          </button>

          {/* Mark as Abgebrochen button - shows when viewing refund */}
          {currentView === 'refund' && onMarkAsAbgebrochen && (
            <button
              className="action-btn danger"
              onClick={handleMarkAsAbgebrochenClick}
              type="button"
            >
              Mark as Abgebrochen
            </button>
          )}
          
          <button
            className="action-btn primary"
            onClick={handleDownloadPDF}
            type="button"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Abgebrochen Confirmation Modal */}
      {showAbgebrochenConfirm && (
        <div className="modal-overlay" onClick={handleConfirmAbgebrochenCancel}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Mark as Abgebrochen</h3>
              <button
                className="modal-close"
                onClick={handleConfirmAbgebrochenCancel}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="confirmation-question">
                You are about to mark VO #{voRecord.voNr} as <strong>Abgebrochen</strong>.
              </p>
              <p className="confirmation-subquestion">
                Should the F.VO status also be set to <strong>&quot;Keine Folge-VO&quot;</strong>?
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="action-btn secondary"
                onClick={handleConfirmAbgebrochenCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="action-btn warning"
                onClick={handleConfirmAbgebrochenNo}
                type="button"
              >
                No
              </button>
              <button
                className="action-btn primary"
                onClick={handleConfirmAbgebrochenYes}
                type="button"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopaymentDocumentModal;

