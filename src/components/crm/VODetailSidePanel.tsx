'use client';

import React from 'react';
import { CRMVORecord } from '@/types';

interface VODetailSidePanelProps {
  vo: CRMVORecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const VODetailSidePanel: React.FC<VODetailSidePanelProps> = ({ vo, isOpen, onClose }) => {
  if (!vo) return null;

  const formatDate = (dateString: string): string => {
    try {
      let date: Date;
      
      // Handle dd.mm.yyyy format
      if (dateString.includes('.')) {
        const [day, month, year] = dateString.split('.');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Fallback for other formats (like ISO timestamps)
        date = new Date(dateString);
      }
      
      // Check if this looks like a simple date (no time) vs timestamp
      if (dateString.includes('.') && !dateString.includes('T')) {
        // Simple date format - don't show time
        return date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        // Timestamp format - show date and time
        return date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return dateString;
    }
  };

  const getColumnDisplayName = (column: string): string => {
    const columnNames: Record<string, string> = {
      'bestelt': 'Bestelt',
      'overdue-7-days': '>7 days Bestelt',
      'first-followup': '1st Follow up',
      'first-followup-overdue-7-days': '> 7 days after 1st follow up',
      'second-followup': '2nd Follow up',
      'erhalten': 'Erhalten'
    };
    return columnNames[column] || column;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="side-panel-backdrop" onClick={onClose} />
      )}
      
      {/* Side Panel */}
      <div className={`side-panel ${isOpen ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h2 className="side-panel-title">VO Details</h2>
          <button className="side-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="side-panel-content">
          {/* VO Overview */}
          <div className="detail-section">
            <h3>VO Overview</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">VO Number:</span>
                <span className="detail-value">{vo.voNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">F-VO Number:</span>
                <span className="detail-value">{vo.fvoNumber || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Issue Date:</span>
                <span className="detail-value">{formatDate(vo.issueDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Bestelt Date:</span>
                <span className="detail-value">{vo.besteltDate ? formatDate(vo.besteltDate) : '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Beh Status:</span>
                <span className="detail-value">{vo.treatmentStatus}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Heilmittel:</span>
                <span className="detail-value">{vo.treatmentType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Facility:</span>
                <span className="detail-value">{vo.facility}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Therapist:</span>
                <span className="detail-value">{vo.therapist}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{vo.type}</span>
              </div>

            </div>
          </div>



          {/* Doctor Information */}
          <div className="detail-section">
            <h3>Doctor Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{vo.doctorInfo.name}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  <a href={`tel:${vo.doctorInfo.phone}`}>{vo.doctorInfo.phone}</a>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  <a href={`mailto:${vo.doctorInfo.email}`}>{vo.doctorInfo.email}</a>
                </span>
              </div>
            </div>
          </div>



          {/* Timeline */}
          <div className="detail-section">
            <h3>Timeline</h3>
            <div className="timeline">
              {vo.timeline.map((event, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-action">{event.action}</div>
                    <div className="timeline-timestamp">{formatDate(event.timestamp)}</div>
                    {event.column && (
                      <div className="timeline-column">→ {getColumnDisplayName(event.column)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="detail-section">
            <h3>Notes</h3>
            <div className="notes-list">
              {vo.notes.length > 0 ? (
                vo.notes.map((note, index) => (
                  <div key={index} className="note-item">
                    • {note}
                  </div>
                ))
              ) : (
                <div className="no-notes">No notes available</div>
              )}
            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default VODetailSidePanel;
