import React from 'react';
import { PracticeDoctor } from '@/types';

interface ArztCellProps {
  doctors: PracticeDoctor[];
}

const ArztCell: React.FC<ArztCellProps> = ({ doctors }) => {
  if (!doctors || doctors.length === 0) {
    return <div className="text-sm text-muted-foreground">No doctor</div>;
  }

  const firstDoctor = doctors[0];
  const additionalCount = doctors.length - 1;

  return (
    <div className="text-sm text-foreground">
      <span>{firstDoctor.name}</span>
      {additionalCount > 0 && (
        <span className="text-muted-foreground ml-1">+{additionalCount} more</span>
      )}
    </div>
  );
};

export default ArztCell;
