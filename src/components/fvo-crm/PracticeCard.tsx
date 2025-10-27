import React from 'react';
import { PracticeWithComputed } from '@/types';

interface PracticeCardProps {
  practice: PracticeWithComputed;
  isSelected: boolean;
  onClick: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ practice, isSelected, onClick }) => {
  // Priority styling
  const getPriorityStyles = () => {
    switch (practice.priorityLevel) {
      case 'overdue':
        return 'border-l-4 border-l-[#DC2626] bg-[#FEF2F2]';
      case 'dueToday':
        return 'border-l-4 border-l-[#F59E0B] bg-[#FFFBEB]';
      case 'thisWeek':
        return 'border-l-4 border-l-[#3B82F6] bg-[#EFF6FF]';
      default:
        return 'border-l-4 border-l-[#9CA3AF] bg-[#F9FAFB]';
    }
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
    if (practice.keyContacts.length > 0) {
      const contact = practice.keyContacts[0];
      const name = contact.name;
      const ext = contact.extension ? ` ext. ${contact.extension}` : '';
      const method = practice.preferredContactMethod === 'fax' ? '📠 Fax pref' :
                     practice.preferredContactMethod === 'email' ? '📧 Email pref' :
                     '📞 Phone pref';
      return `🤝 ${name}${ext} • ${method}`;
    }
    return `📞 ${practice.phone} • ${practice.preferredContactMethod === 'fax' ? '📠 Fax pref' :
                                    practice.preferredContactMethod === 'email' ? '📧 Email pref' :
                                    '📞 Phone pref'}`;
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
          <span>📋 {practice.pendingVOCount} Pending FVOs • {practice.activeBatchCount} Batches</span>
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
