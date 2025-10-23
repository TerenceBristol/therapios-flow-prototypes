import React from 'react';
import { CalendarTreatment } from '@/types';

interface TreatmentCardProps {
  treatment: CalendarTreatment;
  onClick: () => void;
}

export default function TreatmentCard({ treatment, onClick }: TreatmentCardProps) {
  const isRejected = treatment.patientRejected;
  const isPlanned = treatment.behandlungsart === 'Geplant';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-300 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-900">
                {treatment.patientName}
              </span>
            </div>
            {isRejected && (
              <div className="mt-1 text-xs font-medium text-red-600">
                Rejected: {treatment.behStatus}
              </div>
            )}
            {isPlanned && (
              <div className="mt-1 text-xs font-medium text-orange-600">
                Rejected: {treatment.behStatus}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-600">
          {treatment.behStatus}
        </div>

        <div className="text-xs text-gray-500 italic">
          Akt. VO {treatment.voNumber} | Beh. Status {treatment.behStatus}
        </div>

        {treatment.notes && (
          <div className="text-xs text-gray-700 mt-1 line-clamp-2">
            {treatment.notes}
          </div>
        )}
      </div>
    </div>
  );
}

