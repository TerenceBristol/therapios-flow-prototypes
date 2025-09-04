import React from 'react';
import { PrototypeMetadata } from '@/types';

interface PrototypeCardProps {
  prototype: PrototypeMetadata;
  onClick?: () => void;
}

export const PrototypeCard: React.FC<PrototypeCardProps> = ({ prototype, onClick }) => {
  return (
    <div 
      className="group cursor-pointer bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      {/* Placeholder wireframe visual */}
      <div className="aspect-[4/3] bg-muted rounded-md mb-4 flex items-center justify-center">
        <div className="w-full h-full p-4 space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-8 bg-muted-foreground/10 rounded"></div>
            <div className="h-8 bg-muted-foreground/10 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div>
        <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {prototype.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {prototype.description}
        </p>
        
        {/* Tags */}
        {prototype.tags && prototype.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {prototype.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrototypeCard;
