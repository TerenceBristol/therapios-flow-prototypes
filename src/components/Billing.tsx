'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import validationData from '@/data/validationData.json';
import { useVOStatus } from '@/contexts/VOStatusContext';
import { ValidationRecord, VOStatus, BillingStatusInsurance, BillingStatusCopayment } from '@/types';
import './crm/CRM.css';

const Validation: React.FC = () => {
  const router = useRouter();
  const { 
    getVOStatus, 
    getBillingStatusInsurance, 
    getBillingStatusCopayment,
    updateVOStatus,
    updateBillingStatusInsurance,
    updateBillingStatusCopayment
  } = useVOStatus();
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [voStatusFilter, setVoStatusFilter] = useState<string>('');
  const [einrichtungFilter, setEinrichtungFilter] = useState<string>('');
  const [therapeutFilter, setTherapeutFilter] = useState<string>('');

  // Apply status changes from context to records
  const records = useMemo(() => {
    return (validationData as ValidationRecord[]).map(record => ({
      ...record,
      voStatus: getVOStatus(record.voNr, record.voStatus) as VOStatus,
      billingStatusInsurance: getBillingStatusInsurance(record.voNr, record.billingStatusInsurance) as BillingStatusInsurance,
      billingStatusCopayment: getBillingStatusCopayment(record.voNr, record.billingStatusCopayment) as BillingStatusCopayment
    }));
  }, [getVOStatus, getBillingStatusInsurance, getBillingStatusCopayment]);

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

  // Navigate to validation form
  const handleValidateClick = (voNr: string) => {
    router.push(`/prototypes/validation/${voNr}`);
  };

  return (
    <div className="crm-dashboard">
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
                <th className="vo-table-header">VO Validation</th>
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
                    <select
                      className="status-dropdown"
                      value={record.voStatus}
                      onChange={(e) => handleVOStatusChange(record.voNr, e.target.value as VOStatus, record)}
                    >
                      <option value="Aktiv">Aktiv</option>
                      <option value="Abgebrochen">Abgebrochen</option>
                      <option value="Fertig Behandelt">Fertig Behandelt</option>
                      <option value="Abgerechnet">Abgerechnet</option>
                      <option value="Abgelaufen">Abgelaufen</option>
                    </select>
                  </td>
                  <td className="vo-table-cell">
                    <select
                      className="status-dropdown"
                      value={record.billingStatusInsurance}
                      onChange={(e) => handleBillingInsuranceStatusChange(record.voNr, e.target.value as BillingStatusInsurance)}
                    >
                      <option value="">(no status)</option>
                      <option value="Ready to Send">Ready to Send</option>
                      <option value="For Fixing">For Fixing</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td className="vo-table-cell">
                    {record.zzBefreiung === 'ja' ? (
                      <select
                        className="status-dropdown"
                        value={record.billingStatusCopayment}
                        onChange={(e) => handleBillingCopaymentStatusChange(record.voNr, e.target.value as BillingStatusCopayment)}
                      >
                        <option value="">(no status)</option>
                        <option value="Paid">Paid</option>
                        <option value="For Refund">For Refund</option>
                      </select>
                    ) : (
                      <span className="status-not-applicable">-</span>
                    )}
                  </td>
                  <td className="vo-table-cell">
                    <button
                      className="validate-button"
                      onClick={() => handleValidateClick(record.voNr)}
                      type="button"
                    >
                      Validate
                    </button>
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
    </div>
  );
};

export default Validation;
