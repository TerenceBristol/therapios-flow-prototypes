'use client';

import React, { useState, useEffect } from 'react';
import './crm/CRM.css';

interface BillingFormData {
  ikNumber: string;
  amountPerTreatment: string;
  numberOfTreatments: string;
  totalVoValue: string;
  notes: string;
}

interface BillingFormErrors {
  ikNumber?: string;
  amountPerTreatment?: string;
  numberOfTreatments?: string;
  totalVoValue?: string;
  notes?: string;
}

interface BillingFormProps {
  numberOfTreatments: number;
  ikNumber: string;
  amountPerTreatment: string;
  onFormSubmit: (formData: BillingFormData) => void;
  onCancel: () => void;
}

const BillingFormSection: React.FC<BillingFormProps> = ({
  numberOfTreatments,
  ikNumber,
  amountPerTreatment,
  onFormSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<BillingFormData>({
    ikNumber: ikNumber || '',
    amountPerTreatment: amountPerTreatment || '',
    numberOfTreatments: '0',
    totalVoValue: '',
    notes: ''
  });

  const [errors, setErrors] = useState<BillingFormErrors>({});

  // Sync external numberOfTreatments with internal form state
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      numberOfTreatments: numberOfTreatments.toString()
    }));
  }, [numberOfTreatments]);

  // Auto-calculate Total VO Value when amount or treatments change
  useEffect(() => {
    const amount = parseFloat(formData.amountPerTreatment) || 0;
    const treatments = parseInt(formData.numberOfTreatments) || 0;
    const total = (amount * treatments).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      totalVoValue: amount > 0 && treatments > 0 ? total : ''
    }));
  }, [formData.amountPerTreatment, formData.numberOfTreatments]);

  const handleInputChange = (field: keyof BillingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  const validateForm = (): boolean => {
    const newErrors: BillingFormErrors = {};

    if (!formData.ikNumber) {
      newErrors.ikNumber = 'IK Number is required';
    } else if (!/^\d+$/.test(formData.ikNumber)) {
      newErrors.ikNumber = 'IK Number must be numeric';
    }

    if (!formData.amountPerTreatment) {
      newErrors.amountPerTreatment = 'Amount per treatment is required';
    } else if (parseFloat(formData.amountPerTreatment) <= 0) {
      newErrors.amountPerTreatment = 'Amount must be greater than 0';
    }

    if (!formData.numberOfTreatments) {
      newErrors.numberOfTreatments = 'Number of treatments is required';
    } else if (parseInt(formData.numberOfTreatments) <= 0) {
      newErrors.numberOfTreatments = 'Number of treatments must be greater than 0';
    }

    if (!formData.totalVoValue) {
      newErrors.totalVoValue = 'Total VO Value is required';
    } else if (parseFloat(formData.totalVoValue) <= 0) {
      newErrors.totalVoValue = 'Total VO Value must be greater than 0';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onFormSubmit(formData);
    }
  };

  // const formatCurrency = (value: string) => {
  //   const numericValue = value.replace(/[^\d.,]/g, '');
  //   return numericValue;
  // };

  return (
    <div className="billing-form-section">
      <h2 className="section-title">Billing Details</h2>
      
      <form onSubmit={handleSubmit} className="billing-form">
        <div className="form-grid">
          {/* IK Number */}
          <div className="form-field">
            <label className="form-label">IK Number *</label>
            <input
              type="text"
              className={`form-input ${errors.ikNumber ? 'form-input-error' : ''}`}
              value={formData.ikNumber}
              onChange={(e) => handleInputChange('ikNumber', e.target.value)}
              placeholder="Enter IK Number"
            />
            {errors.ikNumber && <span className="form-error">{errors.ikNumber}</span>}
          </div>

          {/* Amount Per Treatment */}
          <div className="form-field">
            <label className="form-label">Amount (Per Treatment) *</label>
            <div className="currency-input-wrapper">
              <span className="currency-symbol">€</span>
              <input
                type="number"
                step="0.01"
                className={`form-input currency-input ${errors.amountPerTreatment ? 'form-input-error' : ''}`}
                value={formData.amountPerTreatment}
                onChange={(e) => handleInputChange('amountPerTreatment', e.target.value)}
                placeholder="0.00"
              />
            </div>
            {errors.amountPerTreatment && <span className="form-error">{errors.amountPerTreatment}</span>}
          </div>

          {/* Number of Treatments */}
          <div className="form-field">
            <label className="form-label">Number of Treatments *</label>
            <input
              type="number"
              className={`form-input ${errors.numberOfTreatments ? 'form-input-error' : ''}`}
              value={formData.numberOfTreatments}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            {errors.numberOfTreatments && <span className="form-error">{errors.numberOfTreatments}</span>}
          </div>

          {/* Total VO Value */}
          <div className="form-field">
            <label className="form-label">Total VO Value *</label>
            <div className="currency-input-wrapper">
              <span className="currency-symbol">€</span>
              <input
                type="number"
                step="0.01"
                className={`form-input currency-input ${errors.totalVoValue ? 'form-input-error' : ''}`}
                value={formData.totalVoValue}
                onChange={(e) => handleInputChange('totalVoValue', e.target.value)}
                placeholder="0.00"
              />
            </div>
            {errors.totalVoValue && <span className="form-error">{errors.totalVoValue}</span>}
          </div>
        </div>

        {/* Notes */}
        <div className="form-field full-width">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Optional notes..."
            rows={4}
          />
        </div>

      </form>
    </div>
  );
};

export default BillingFormSection;
