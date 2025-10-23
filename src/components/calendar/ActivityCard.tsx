import React from 'react';
import { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export default function ActivityCard({ activity, onClick }: ActivityCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-300 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">{activity.type}</span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Position #{activity.position} | Duration: {activity.duration} min
          </div>
        </div>
      </div>
    </div>
  );
}

