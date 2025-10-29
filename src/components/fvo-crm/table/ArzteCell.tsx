import React, { useState } from 'react';
import { Arzt } from '@/types';

interface ArzteCellProps {
  doctors: Arzt[];
}

const ArzteCell: React.FC<ArzteCellProps> = ({ doctors }) => {
  const [hoveredArzt, setHoveredArzt] = useState<string | null>(null);

  if (doctors.length === 0) {
    return <div className="text-sm text-muted-foreground">No ärzte</div>;
  }

  // Display first 2 ärzte, then show "+X more"
  const displayDoctors = doctors.slice(0, 2);
  const remainingCount = doctors.length - 2;

  return (
    <div className="text-sm text-foreground">
      {displayDoctors.map((arzt, index) => (
        <div
          key={arzt.id}
          className="relative inline-block"
          onMouseEnter={() => setHoveredArzt(arzt.id)}
          onMouseLeave={() => setHoveredArzt(null)}
        >
          <span className="hover:text-primary cursor-default">
            {arzt.name.replace('Dr. ', '')}
          </span>
          {index < displayDoctors.length - 1 && remainingCount === 0 && (
            <span className="text-muted-foreground">, </span>
          )}

          {/* Tooltip */}
          {hoveredArzt === arzt.id && arzt.facilities.length > 0 && (
            <div className="absolute z-50 left-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg p-2 whitespace-nowrap">
              <div className="text-xs font-semibold text-foreground mb-1">
                ERs:
              </div>
              {arzt.facilities.map((facility, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">
                  • {facility}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="text-muted-foreground ml-1">+{remainingCount} more</span>
      )}
    </div>
  );
};

export default ArzteCell;
