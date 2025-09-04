import React from 'react';
import { PrototypeMetadata } from '@/types';
import PrototypeCard from './PrototypeCard';

interface SectionProps {
  title: string;
  prototypes: PrototypeMetadata[];
  onPrototypeClick?: (prototype: PrototypeMetadata) => void;
}

export const Section: React.FC<SectionProps> = ({ title, prototypes, onPrototypeClick }) => {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
      
      {prototypes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No prototypes yet</p>
          <p className="text-sm">Prototypes added to this section will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypes.map((prototype) => (
            <PrototypeCard
              key={prototype.id}
              prototype={prototype}
              onClick={() => onPrototypeClick?.(prototype)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Section;
