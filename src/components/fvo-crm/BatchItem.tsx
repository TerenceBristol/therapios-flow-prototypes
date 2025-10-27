import React, { useState } from 'react';
import { PracticeBatch, PracticeVO, FVOCRMVOStatus } from '@/types';

interface BatchItemProps {
  batch: PracticeBatch;
  vos: PracticeVO[];
}

const BatchItem: React.FC<BatchItemProps> = ({ batch, vos }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBatchVOs = () => {
    return vos.filter(vo => batch.voIds.includes(vo.id));
  };

  const getMostCommonStatus = () => {
    const batchVOs = getBatchVOs();
    const statusCount: Record<string, number> = {};

    batchVOs.forEach(vo => {
      statusCount[vo.status] = (statusCount[vo.status] || 0) + 1;
    });

    if (Object.keys(statusCount).length > 1) return 'Mixed Statuses';

    return Object.keys(statusCount)[0] || 'Unknown';
  };

  const getStatusColor = (status: FVOCRMVOStatus) => {
    switch (status) {
      case 'To Order':
        return 'text-[#9CA3AF]';
      case 'Ordered':
        return 'text-[#3B82F6]';
      case 'To Follow Up':
        return 'text-[#F59E0B]';
      case 'Followed Up':
        return 'text-[#F59E0B]';
      case 'To Call':
        return 'text-[#F97316]';
      case 'Called':
        return 'text-[#F97316]';
      case 'Received':
        return 'text-[#10B981]';
      default:
        return 'text-muted-foreground';
    }
  };

  const batchVOs = getBatchVOs();
  const status = getMostCommonStatus();

  return (
    <div className="mb-3 border border-border rounded-lg overflow-hidden">
      {/* Batch Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 cursor-pointer hover:bg-muted transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
            <span className="font-medium text-foreground">
              Batch #{batch.id.replace('batch-', '')} (Sent {formatDate(batch.sentDate)})
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1 ml-6">
          Status: {status} • {batchVOs.length} FVOs
        </div>
      </div>

      {/* Batch VOs */}
      {isExpanded && (
        <div className="border-t border-border">
          {batchVOs.map(vo => (
            <div
              key={vo.id}
              className="p-3 border-b border-border last:border-b-0 bg-background"
            >
              <div className="font-medium text-foreground">
                ✅ {vo.patientName}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {vo.therapyType} • <span className={getStatusColor(vo.status)}>{vo.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Since: {formatDate(vo.statusTimestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchItem;
