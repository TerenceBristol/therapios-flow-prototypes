import React from 'react';
import { PriorityLevel } from '@/types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showLabel?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showLabel = true }) => {
  const getConfig = () => {
    switch (priority) {
      case 'overdue':
        return {
          label: 'OVERDUE',
          color: '#DC2626',
          bgColor: '#FEE2E2',
          icon: '🔴'
        };
      case 'dueToday':
        return {
          label: 'DUE TODAY',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          icon: '🟡'
        };
      case 'thisWeek':
        return {
          label: 'THIS WEEK',
          color: '#3B82F6',
          bgColor: '#DBEAFE',
          icon: '🔵'
        };
      default:
        return {
          label: 'OTHER',
          color: '#9CA3AF',
          bgColor: '#F3F4F6',
          icon: '⚪'
        };
    }
  };

  const config = getConfig();

  if (!showLabel) {
    return <span className="text-lg">{config.icon}</span>;
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: config.bgColor,
        color: config.color
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

export default PriorityBadge;
