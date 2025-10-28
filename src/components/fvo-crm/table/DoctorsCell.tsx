import React, { useState } from 'react';
import { PracticeDoctor } from '@/types';

interface DoctorsCellProps {
  doctors: PracticeDoctor[];
}

const DoctorsCell: React.FC<DoctorsCellProps> = ({ doctors }) => {
  const [hoveredDoctor, setHoveredDoctor] = useState<string | null>(null);

  if (doctors.length === 0) {
    return <div className="text-sm text-muted-foreground">No doctors</div>;
  }

  // Display first 2 doctors, then show "+X more"
  const displayDoctors = doctors.slice(0, 2);
  const remainingCount = doctors.length - 2;

  return (
    <div className="text-sm text-foreground">
      {displayDoctors.map((doctor, index) => (
        <div
          key={doctor.id}
          className="relative inline-block"
          onMouseEnter={() => setHoveredDoctor(doctor.id)}
          onMouseLeave={() => setHoveredDoctor(null)}
        >
          <span className="hover:text-primary cursor-default">
            {doctor.name.replace('Dr. ', '')}
          </span>
          {index < displayDoctors.length - 1 && remainingCount === 0 && (
            <span className="text-muted-foreground">, </span>
          )}

          {/* Tooltip */}
          {hoveredDoctor === doctor.id && doctor.facilities.length > 0 && (
            <div className="absolute z-50 left-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg p-2 whitespace-nowrap">
              <div className="text-xs font-semibold text-foreground mb-1">
                Facilities:
              </div>
              {doctor.facilities.map((facility, idx) => (
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

export default DoctorsCell;
