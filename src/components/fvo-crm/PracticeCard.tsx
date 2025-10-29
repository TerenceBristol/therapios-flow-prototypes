import React from 'react';
import { PracticeWithComputed } from '@/types';

interface PracticeCardProps {
  practice: PracticeWithComputed;
  isSelected: boolean;
  onClick: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ practice, isSelected, onClick }) => {
  // Simple border styling
  const getPriorityStyles = () => {
    return 'border-l-4 border-l-[#3B82F6] bg-[#F9FAFB]';
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'None';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format last activity
  const getLastActivityText = () => {
    if (!practice.lastActivity) return 'None';
    const type = practice.lastActivity.type;
    const date = formatDate(practice.lastActivity.date);
    return `${type} ${date}`;
  };

  // Get quick contact text
  const getQuickContactText = () => {
    const method = practice.preferredContactMethod === 'fax' ? '📠 Fax pref' :
                   practice.preferredContactMethod === 'email' ? '📧 Email pref' :
                   '📞 Phone pref';
    return `📞 ${practice.phone} • ${method}`;
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${getPriorityStyles()}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        rounded-lg p-4 mb-3 cursor-pointer transition-all duration-150
        hover:shadow-md hover:brightness-95
      `}
    >
      {/* Practice Name */}
      <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
        {practice.name}
      </h3>

      {/* Key Metrics */}
      <div className="text-sm font-medium text-foreground mb-1">
        {practice.pendingVOCount === 0 ? (
          <span>✅ No Pending FVOs</span>
        ) : (
          <span>📋 {practice.pendingVOCount} Pending FVOs</span>
        )}
      </div>

      {/* Last Activity */}
      <div className="text-sm text-muted-foreground mb-1">
        📞 Last: {getLastActivityText()}
      </div>

      {/* Next Follow-up */}
      <div className="text-sm text-muted-foreground mb-1">
        📅 Next: {practice.nextFollowUpDate ? formatDate(practice.nextFollowUpDate) : 'Not scheduled'}
      </div>

      {/* Quick Contact */}
      <div className="text-xs text-muted-foreground mt-2">
        {getQuickContactText()}
      </div>
    </div>
  );
};

export default PracticeCard;
