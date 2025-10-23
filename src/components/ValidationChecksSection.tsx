'use client';

import React, { useState, useEffect } from 'react';

interface VORecord {
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
  voStatus: string;
  icdCode?: string;
  zzBefreiung?: string;
  ikNumber?: string;
  amountPerTreatment?: string;
}

interface ValidationCheck {
  id: string;
  label: string;
  type: 'system' | 'manual';
  checkFunction?: (voRecord: VORecord) => boolean;
}

interface ValidationCheckState {
  checked: boolean;
  validatedBy: 'system' | 'admin' | null;
}

interface ValidationChecksSectionProps {
  voRecord: VORecord;
  onValidationChange?: (allChecksComplete: boolean) => void;
}

const VALIDATION_CHECKS: ValidationCheck[] = [
  {
    id: 'validity-period',
    label: 'Prescription within validity period (not expired)',
    type: 'system',
    checkFunction: (vo) => {
      // Check if prescription is not expired (within ~90 days typically)
      const issueDate = new Date(vo.ausstDatum.split('.').reverse().join('-'));
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 90 && vo.voStatus !== 'Abgelaufen';
    }
  },
  {
    id: 'icd-format',
    label: 'ICD-10 code format is valid',
    type: 'system',
    checkFunction: (vo) => {
      // Check if ICD code exists and matches basic format (e.g., M25.56, I89.0)
      return !!(vo.icdCode && /^[A-Z]\d{2}(\.\d{1,2})?$/.test(vo.icdCode));
    }
  },
  {
    id: 'insurance-verified',
    label: 'Patient insurance information verified',
    type: 'system',
    checkFunction: (vo) => {
      // Check if IK number exists and is valid format
      return !!(vo.ikNumber && vo.ikNumber.length >= 9);
    }
  },
  {
    id: 'no-duplicate',
    label: 'No duplicate VO detected in system',
    type: 'system',
    checkFunction: () => {
      // For prototype, always return true (no duplicates)
      // In real system, this would check against database
      return true;
    }
  },
  {
    id: 'data-completeness',
    label: 'Prescription data completeness check',
    type: 'system',
    checkFunction: (vo) => {
      // Check if essential fields are present
      return !!(vo.name && vo.heilmittel && vo.therapeut && vo.arzt && vo.behStatus);
    }
  },
  {
    id: 'doctor-signature',
    label: "Doctor's signature visible and legible",
    type: 'manual'
  },
  {
    id: 'slip-quality',
    label: 'VO slip document quality acceptable',
    type: 'manual'
  },
  {
    id: 'treatment-matches',
    label: 'Treatment type matches prescription order',
    type: 'manual'
  },
  {
    id: 'copayment-docs',
    label: 'Copayment exemption documentation attached (if required)',
    type: 'manual'
  },
  {
    id: 'therapist-qualification',
    label: 'Therapist qualification matches treatment type',
    type: 'manual'
  },
  {
    id: 'treatment-quantity',
    label: 'Treatment quantity within normal range for diagnosis',
    type: 'manual'
  }
];

const ValidationChecksSection: React.FC<ValidationChecksSectionProps> = ({ 
  voRecord,
  onValidationChange 
}) => {
  const [checkStates, setCheckStates] = useState<Record<string, ValidationCheckState>>({});

  // Initialize check states based on VO data
  useEffect(() => {
    const initialStates: Record<string, ValidationCheckState> = {};
    
    VALIDATION_CHECKS.forEach(check => {
      if (check.type === 'system' && check.checkFunction) {
        // System checks: run validation function
        const isValid = check.checkFunction(voRecord);
        initialStates[check.id] = {
          checked: isValid,
          validatedBy: isValid ? 'system' : null
        };
      } else {
        // Manual checks: start unchecked
        initialStates[check.id] = {
          checked: false,
          validatedBy: null
        };
      }
    });
    
    setCheckStates(initialStates);
  }, [voRecord]);

  // Notify parent when validation state changes
  useEffect(() => {
    const allChecked = Object.values(checkStates).every(state => state.checked);
    if (onValidationChange) {
      onValidationChange(allChecked);
    }
  }, [checkStates, onValidationChange]);

  const handleCheckboxChange = (checkId: string) => {
    setCheckStates(prev => {
      const currentState = prev[checkId];
      const newChecked = !currentState.checked;
      
      return {
        ...prev,
        [checkId]: {
          checked: newChecked,
          validatedBy: newChecked ? 'admin' : null
        }
      };
    });
  };

  const completedChecks = Object.values(checkStates).filter(state => state.checked).length;
  const totalChecks = VALIDATION_CHECKS.length;

  return (
    <div className="validation-checks-section">
      <div className="section-header">
        <h2 className="section-title">Validation Checks</h2>
        <div className="progress-indicator">
          <span className={completedChecks === totalChecks ? 'progress-complete' : 'progress-incomplete'}>
            {completedChecks} of {totalChecks} checks completed
          </span>
        </div>
      </div>
      
      <div className="validation-checks-card">
        <div className="checks-list">
          {VALIDATION_CHECKS.map(check => {
            const state = checkStates[check.id];
            if (!state) return null;

            return (
              <div 
                key={check.id} 
                className={`check-item ${state.checked ? 'checked' : 'unchecked'} ${state.validatedBy || 'none'}`}
              >
                <div className="check-main">
                  <input
                    type="checkbox"
                    id={`check-${check.id}`}
                    className="check-checkbox"
                    checked={state.checked}
                    onChange={() => handleCheckboxChange(check.id)}
                  />
                  <span className="check-icon" title={check.type === 'system' ? 'System check' : 'Manual check'}>
                    {check.type === 'system' ? '🤖' : '👤'}
                  </span>
                  <label htmlFor={`check-${check.id}`} className="check-label">
                    {check.label}
                  </label>
                </div>
                <div className="check-status">
                  {state.validatedBy === 'system' && (
                    <span className="validation-badge system">Validated by: System</span>
                  )}
                  {state.validatedBy === 'admin' && (
                    <span className="validation-badge admin">Validated by: Admin</span>
                  )}
                  {!state.validatedBy && (
                    <span className="validation-badge not-validated">Not validated</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValidationChecksSection;

