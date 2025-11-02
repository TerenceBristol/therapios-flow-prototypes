import { useContext } from 'react';
import { FVOCRMContext, FVOCRMContextValue } from '@/contexts/FVOCRMContext';

/**
 * Custom hook to access FVO CRM context
 * Throws error if used outside of FVOCRMProvider
 *
 * @returns FVOCRMContextValue
 * @throws Error if used outside provider
 */
export function useFVOCRM(): FVOCRMContextValue {
  const context = useContext(FVOCRMContext);

  if (!context) {
    throw new Error('useFVOCRM must be used within an FVOCRMProvider');
  }

  return context;
}
