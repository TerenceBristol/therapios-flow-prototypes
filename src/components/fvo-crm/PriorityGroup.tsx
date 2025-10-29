import React from 'react';

// Legacy component - no longer used in main prototype
type PriorityLevel = 'overdue' | 'dueToday' | 'thisWeek' | 'other';

interface PriorityGroupProps {
  priorityLevel: PriorityLevel;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const PriorityGroup: React.FC<PriorityGroupProps> = ({
  priorityLevel,
  count,
  isExpanded,
  onToggle,
  children
}) => {
  // Get group configuration
  const getGroupConfig = () => {
    switch (priorityLevel) {
      case 'overdue':
        return {
          label: 'OVERDUE',
          icon: '🔴',
          color: '#DC2626'
        };
      case 'dueToday':
        return {
          label: 'DUE TODAY',
          icon: '🟡',
          color: '#F59E0B'
        };
      case 'thisWeek':
        return {
          label: 'THIS WEEK',
          icon: '🔵',
          color: '#3B82F6'
        };
      default:
        return {
          label: 'ALL OTHERS',
          icon: '⚪',
          color: '#9CA3AF'
        };
    }
  };

  const config = getGroupConfig();

  return (
    <div className="mb-4">
      {/* Group Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-muted rounded-md transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span
            className="font-semibold text-sm tracking-wide"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          <span
            className="text-sm font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color
            }}
          >
            {count}
          </span>
        </div>
        <span className="text-muted-foreground text-lg">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default PriorityGroup;
