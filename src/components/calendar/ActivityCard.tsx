import React from 'react';
import { Activity, VORecord } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
  availableVOs: VORecord[];
}

export default function ActivityCard({ activity, onClick, availableVOs }: ActivityCardProps) {
  const isTreatmentNoVO = activity.type === 'Treatment (No VO)';

  // Look up patient name from Upload ID
  const getPatientName = (): string => {
    if (!activity.uploadId) return 'Unknown Patient';
    const vo = availableVOs.find((v) => v.uploadId === activity.uploadId);
    return vo?.patientName || 'Unknown Patient';
  };

  return (
    <div
      onClick={onClick}
      className={`border border-gray-300 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
        isTreatmentNoVO ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      {isTreatmentNoVO ? (
        // Treatment (No VO) layout - simplified with gray background
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Treatment (No VO)
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {getPatientName()}
            </div>
          </div>
        </div>
      ) : (
        // Regular activity layout (Pause, Doku, Other)
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">{activity.type}</span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Position #{activity.position} | Duration: {activity.duration || 0} min
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

