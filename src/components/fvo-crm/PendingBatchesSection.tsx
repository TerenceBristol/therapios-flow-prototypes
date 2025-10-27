import React, { useState } from 'react';
import { PracticeBatch, PracticeVO } from '@/types';
import BatchItem from './BatchItem';

interface PendingBatchesSectionProps {
  batches: PracticeBatch[];
  vos: PracticeVO[];
}

const PendingBatchesSection: React.FC<PendingBatchesSectionProps> = ({ batches, vos }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter to only pending batches (batches with at least one non-received VO)
  const pendingBatches = batches.filter(batch => {
    const batchVOs = vos.filter(vo => batch.voIds.includes(vo.id));
    return batchVOs.some(vo => vo.status !== 'Received');
  });

  // Sort by sent date descending (newest first)
  const sortedBatches = [...pendingBatches].sort((a, b) => {
    return new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime();
  });

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          📦 Pending Batches
        </h3>
        <span className="text-muted-foreground text-sm">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3">
          {sortedBatches.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              ✅ No pending batches
            </div>
          ) : (
            sortedBatches.map(batch => (
              <BatchItem
                key={batch.id}
                batch={batch}
                vos={vos}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PendingBatchesSection;
