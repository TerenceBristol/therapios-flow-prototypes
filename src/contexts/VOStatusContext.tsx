'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VOStatusContextType {
  voStatusChanges: { [voNr: string]: string };
  fvoStatusChanges: { [voNr: string]: string };
  billingStatusInsuranceChanges: { [voNr: string]: string };
  billingStatusCopaymentChanges: { [voNr: string]: string };
  updateVOStatus: (voNr: string, newStatus: string) => void;
  updateFVOStatus: (voNr: string, newFvoStatus: string) => void;
  updateBothStatuses: (voNr: string, newVoStatus: string, newFvoStatus: string) => void;
  updateBillingStatusInsurance: (voNr: string, newStatus: string) => void;
  updateBillingStatusCopayment: (voNr: string, newStatus: string) => void;
  getVOStatus: (voNr: string, originalStatus: string) => string;
  getFVOStatus: (voNr: string, originalFvoStatus: string) => string;
  getBillingStatusInsurance: (voNr: string, originalStatus: string) => string;
  getBillingStatusCopayment: (voNr: string, originalStatus: string) => string;
  resetStatuses: () => void;
  uploadedSlips: { [voNr: string]: File };
  setUploadedSlip: (voNr: string, file: File) => void;
  getUploadedSlip: (voNr: string) => File | undefined;
  removeUploadedSlip: (voNr: string) => void;
}

const VOStatusContext = createContext<VOStatusContextType | undefined>(undefined);

interface VOStatusProviderProps {
  children: ReactNode;
}

export const VOStatusProvider: React.FC<VOStatusProviderProps> = ({ children }) => {
  const [voStatusChanges, setVOStatusChanges] = useState<{ [voNr: string]: string }>({});
  const [fvoStatusChanges, setFVOStatusChanges] = useState<{ [voNr: string]: string }>({});
  const [billingStatusInsuranceChanges, setBillingStatusInsuranceChanges] = useState<{ [voNr: string]: string }>({});
  const [billingStatusCopaymentChanges, setBillingStatusCopaymentChanges] = useState<{ [voNr: string]: string }>({});
  const [uploadedSlips, setUploadedSlips] = useState<{ [voNr: string]: File }>({});

  const updateVOStatus = (voNr: string, newStatus: string) => {
    setVOStatusChanges(prev => ({
      ...prev,
      [voNr]: newStatus
    }));
  };

  const updateFVOStatus = (voNr: string, newFvoStatus: string) => {
    setFVOStatusChanges(prev => ({
      ...prev,
      [voNr]: newFvoStatus
    }));
  };

  const updateBothStatuses = (voNr: string, newVoStatus: string, newFvoStatus: string) => {
    setVOStatusChanges(prev => ({
      ...prev,
      [voNr]: newVoStatus
    }));
    setFVOStatusChanges(prev => ({
      ...prev,
      [voNr]: newFvoStatus
    }));
  };

  const getVOStatus = (voNr: string, originalStatus: string): string => {
    return voStatusChanges[voNr] || originalStatus;
  };

  const getFVOStatus = (voNr: string, originalFvoStatus: string): string => {
    return fvoStatusChanges[voNr] || originalFvoStatus;
  };

  const updateBillingStatusInsurance = (voNr: string, newStatus: string) => {
    setBillingStatusInsuranceChanges(prev => ({
      ...prev,
      [voNr]: newStatus
    }));
  };

  const updateBillingStatusCopayment = (voNr: string, newStatus: string) => {
    setBillingStatusCopaymentChanges(prev => ({
      ...prev,
      [voNr]: newStatus
    }));
  };

  const getBillingStatusInsurance = (voNr: string, originalStatus: string): string => {
    return billingStatusInsuranceChanges[voNr] || originalStatus;
  };

  const getBillingStatusCopayment = (voNr: string, originalStatus: string): string => {
    return billingStatusCopaymentChanges[voNr] || originalStatus;
  };

  const resetStatuses = () => {
    setVOStatusChanges({});
    setFVOStatusChanges({});
    setBillingStatusInsuranceChanges({});
    setBillingStatusCopaymentChanges({});
  };

  const setUploadedSlip = (voNr: string, file: File) => {
    setUploadedSlips(prev => ({
      ...prev,
      [voNr]: file
    }));
  };

  const getUploadedSlip = (voNr: string): File | undefined => {
    return uploadedSlips[voNr];
  };

  const removeUploadedSlip = (voNr: string) => {
    setUploadedSlips(prev => {
      const updated = { ...prev };
      delete updated[voNr];
      return updated;
    });
  };

  return (
    <VOStatusContext.Provider value={{
      voStatusChanges,
      fvoStatusChanges,
      billingStatusInsuranceChanges,
      billingStatusCopaymentChanges,
      updateVOStatus,
      updateFVOStatus,
      updateBothStatuses,
      updateBillingStatusInsurance,
      updateBillingStatusCopayment,
      getVOStatus,
      getFVOStatus,
      getBillingStatusInsurance,
      getBillingStatusCopayment,
      resetStatuses,
      uploadedSlips,
      setUploadedSlip,
      getUploadedSlip,
      removeUploadedSlip
    }}>
      {children}
    </VOStatusContext.Provider>
  );
};

export const useVOStatus = (): VOStatusContextType => {
  const context = useContext(VOStatusContext);
  if (context === undefined) {
    throw new Error('useVOStatus must be used within a VOStatusProvider');
  }
  return context;
};
