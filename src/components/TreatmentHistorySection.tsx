'use client';

import React, { useState } from 'react';
import './crm/CRM.css';

interface TreatmentSession {
  date: string;
  session: number;
  notes: string;
  therapeut: string;
}

interface NewTreatmentForm {
  date: string;
  notes: string;
  therapeut: string;
}

interface TreatmentHistoryProps {
  treatmentHistory: TreatmentSession[];
  allConfirmed: boolean;
  onAllConfirmedChange: (confirmed: boolean) => void;
  onTreatmentUpdate: (sessionNumber: number, updatedTreatment: Partial<TreatmentSession>) => void;
  onTreatmentAdd: (newTreatment: Omit<TreatmentSession, 'session'>) => void;
  onTreatmentDelete: (sessionNumber: number) => void;
}

const TreatmentHistorySection: React.FC<TreatmentHistoryProps> = ({
  treatmentHistory,
  allConfirmed,
  onAllConfirmedChange,
  onTreatmentUpdate,
  onTreatmentAdd,
  onTreatmentDelete
}) => {
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [editingTherapeut, setEditingTherapeut] = useState<number | null>(null);
  const [tempValues, setTempValues] = useState<{[key: number]: Partial<TreatmentSession>}>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTreatment, setNewTreatment] = useState<NewTreatmentForm>({
    date: '',
    notes: '',
    therapeut: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleToggleAllConfirmation = () => {
    onAllConfirmedChange(!allConfirmed);
  };

  const validateDate = (dateString: string): boolean => {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const checkDateDuplicate = (dateString: string, excludeSession?: number): boolean => {
    return treatmentHistory.some(treatment => 
      treatment.date === dateString && treatment.session !== excludeSession
    );
  };

  const handleDateEdit = (sessionNumber: number, value: string) => {
    setTempValues(prev => ({
      ...prev,
      [sessionNumber]: { ...prev[sessionNumber], date: value }
    }));
  };

  const handleDateSave = (sessionNumber: number) => {
    const newDate = tempValues[sessionNumber]?.date;
    if (!newDate) return;

    const newErrors: {[key: string]: string} = {};

    if (!validateDate(newDate)) {
      newErrors[`date-${sessionNumber}`] = 'Invalid date format (DD.MM.YYYY)';
    } else if (checkDateDuplicate(newDate, sessionNumber)) {
      newErrors[`date-${sessionNumber}`] = 'Date already exists for another treatment';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    onTreatmentUpdate(sessionNumber, { date: newDate });
    setEditingDate(null);
    setTempValues(prev => {
      const updated = { ...prev };
      delete updated[sessionNumber];
      return updated;
    });
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[`date-${sessionNumber}`];
      return updated;
    });
  };

  const handleDateCancel = (sessionNumber: number) => {
    setEditingDate(null);
    setTempValues(prev => {
      const updated = { ...prev };
      delete updated[sessionNumber];
      return updated;
    });
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[`date-${sessionNumber}`];
      return updated;
    });
  };

  const formatDateForInput = (dateString: string): string => {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatDateForDisplay = (inputDate: string): string => {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleAddTreatment = () => {
    const newErrors: {[key: string]: string} = {};

    if (!newTreatment.date) {
      newErrors['new-date'] = 'Date is required';
    } else if (!validateDate(newTreatment.date)) {
      newErrors['new-date'] = 'Invalid date format (DD.MM.YYYY)';
    } else if (checkDateDuplicate(newTreatment.date)) {
      newErrors['new-date'] = 'Date already exists for another treatment';
    }

    if (!newTreatment.notes.trim()) {
      newErrors['new-notes'] = 'Notes are required';
    }

    if (!newTreatment.therapeut.trim()) {
      newErrors['new-therapeut'] = 'Therapeut is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    onTreatmentAdd({
      date: newTreatment.date,
      notes: newTreatment.notes,
      therapeut: newTreatment.therapeut
    });

    setNewTreatment({ date: '', notes: '', therapeut: '' });
    setShowAddForm(false);
    setErrors({});
  };

  const handleCancelAdd = () => {
    setNewTreatment({ date: '', notes: '', therapeut: '' });
    setShowAddForm(false);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated['new-date'];
      delete updated['new-notes'];
      delete updated['new-therapeut'];
      return updated;
    });
  };

  const handleDelete = (sessionNumber: number) => {
    onTreatmentDelete(sessionNumber);
    setDeleteConfirm(null);
  };

  return (
    <div className="treatment-history-section">
      <h2 className="section-title">Treatment History</h2>
      
      {/* Confirmation Status Banner */}
      {allConfirmed && (
        <div className="confirmation-banner">
          <span className="confirmation-icon">✅</span>
          <span>All treatments confirmed</span>
        </div>
      )}
      
      <div className="treatment-history-card">
        {/* Treatment History Table */}
        <div className="treatment-history-table-container">
          <table className="treatment-history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Datum</th>
                <th>Notes</th>
                <th>Therapeut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {treatmentHistory.map((session, index) => (
                <tr key={index} className={allConfirmed ? 'confirmed-row' : ''}>
                  <td>{session.session}</td>
                  <td>
                    {editingDate === session.session ? (
                      <div className="edit-date-container">
                        <input
                          type="date"
                          className="edit-date-input"
                          value={tempValues[session.session]?.date ? formatDateForInput(tempValues[session.session].date!) : formatDateForInput(session.date)}
                          onChange={(e) => handleDateEdit(session.session, formatDateForDisplay(e.target.value))}
                        />
                        <div className="edit-actions">
                          <button
                            className="save-btn"
                            onClick={() => handleDateSave(session.session)}
                            type="button"
                          >
                            ✓
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => handleDateCancel(session.session)}
                            type="button"
                          >
                            ✗
                          </button>
                        </div>
                        {errors[`date-${session.session}`] && (
                          <div className="error-message">{errors[`date-${session.session}`]}</div>
                        )}
                      </div>
                    ) : (
                      <span
                        className="clickable-date"
                        onClick={() => {
                          setEditingDate(session.session);
                          setTempValues(prev => ({ ...prev, [session.session]: { date: session.date } }));
                        }}
                      >
                        {session.date}
                      </span>
                    )}
                  </td>
                  <td>{session.notes}</td>
                  <td>{session.therapeut}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteConfirm(session.session)}
                      type="button"
                      title="Delete treatment"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Add New Treatment Row */}
              {showAddForm && (
                <tr className="add-treatment-row">
                  <td>{treatmentHistory.length + 1}</td>
                  <td>
                    <div className="add-field-container">
                      <input
                        type="date"
                        className={`add-input ${errors['new-date'] ? 'error' : ''}`}
                        value={newTreatment.date ? formatDateForInput(newTreatment.date) : ''}
                        onChange={(e) => {
                          setNewTreatment(prev => ({ ...prev, date: formatDateForDisplay(e.target.value) }));
                          if (errors['new-date']) {
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated['new-date'];
                              return updated;
                            });
                          }
                        }}
                      />
                      {errors['new-date'] && <div className="error-message">{errors['new-date']}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="add-field-container">
                      <input
                        type="text"
                        className={`add-input ${errors['new-notes'] ? 'error' : ''}`}
                        placeholder="Treatment notes..."
                        value={newTreatment.notes}
                        onChange={(e) => {
                          setNewTreatment(prev => ({ ...prev, notes: e.target.value }));
                          if (errors['new-notes']) {
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated['new-notes'];
                              return updated;
                            });
                          }
                        }}
                      />
                      {errors['new-notes'] && <div className="error-message">{errors['new-notes']}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="add-field-container">
                      <input
                        type="text"
                        className={`add-input ${errors['new-therapeut'] ? 'error' : ''}`}
                        placeholder="Therapeut name..."
                        value={newTreatment.therapeut}
                        onChange={(e) => {
                          setNewTreatment(prev => ({ ...prev, therapeut: e.target.value }));
                          if (errors['new-therapeut']) {
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated['new-therapeut'];
                              return updated;
                            });
                          }
                        }}
                      />
                      {errors['new-therapeut'] && <div className="error-message">{errors['new-therapeut']}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="add-actions">
                      <button
                        className="save-btn"
                        onClick={handleAddTreatment}
                        type="button"
                      >
                        ✓
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={handleCancelAdd}
                        type="button"
                      >
                        ✗
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Add Treatment Button and Confirmation */}
          {!showAddForm && (
            <div className="treatment-actions-container">
              <button
                className="add-treatment-btn"
                onClick={() => setShowAddForm(true)}
                type="button"
              >
                + Add Treatment
              </button>
              <button
                className="confirm-all-btn"
                onClick={handleToggleAllConfirmation}
                type="button"
              >
                {allConfirmed ? 'Unconfirm All' : 'Confirm All'}
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm !== null && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button
                  className="modal-close"
                  onClick={() => setDeleteConfirm(null)}
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete treatment #{deleteConfirm}?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => setDeleteConfirm(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => handleDelete(deleteConfirm)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentHistorySection;
