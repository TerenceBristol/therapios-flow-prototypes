import React, { useState } from 'react';
import { PracticeVO, PracticeDoctor } from '@/types';

interface GeneratePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoctor: PracticeDoctor | null;
  selectedVOs: PracticeVO[];
  onGenerate: (deliveryType: 'er' | 'teltow') => void;
}

const GeneratePDFModal: React.FC<GeneratePDFModalProps> = ({
  isOpen,
  onClose,
  selectedDoctor,
  selectedVOs,
  onGenerate
}) => {
  const [deliveryType, setDeliveryType] = useState<'er' | 'teltow'>('er');

  if (!isOpen || !selectedDoctor) return null;

  const handleGenerate = () => {
    onGenerate(deliveryType);
  };

  // Get ER name from first VO (all VOs should have same doctor, so same ER)
  const erName = selectedVOs[0]?.facilityName || 'ER';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Generate Follow-Up Form</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Summary */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Doctor: </span>
              <span className="font-medium text-foreground">{selectedDoctor.name}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Selected VOs: </span>
              <span className="font-medium text-foreground">{selectedVOs.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Facility: </span>
              <span className="font-medium text-foreground">{erName}</span>
            </div>
          </div>

          {/* Delivery Option */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">
              Delivery Address:
            </label>

            <div className="space-y-2">
              {/* ER Option */}
              <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="radio"
                  name="delivery"
                  value="er"
                  checked={deliveryType === 'er'}
                  onChange={(e) => setDeliveryType(e.target.value as 'er' | 'teltow')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">ER Office</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Please deliver to the {erName}
                  </div>
                </div>
              </label>

              {/* Teltow Option */}
              <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/30 transition-colors">
                <input
                  type="radio"
                  name="delivery"
                  value="teltow"
                  checked={deliveryType === 'teltow'}
                  onChange={(e) => setDeliveryType(e.target.value as 'er' | 'teltow')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">Teltow Office</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Therapios, Rheinstr. 7f, 14513 Teltow
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePDFModal;
