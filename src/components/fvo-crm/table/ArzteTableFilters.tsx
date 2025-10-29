import React, { useState, useRef, useEffect } from 'react';
import { Practice } from '@/types';

export interface ArzteFilterOptions {
  practiceFilter: string | null;
  facilityFilter: string | null;
  sortBy: 'name' | 'practiceCount' | 'facilityCount';
}

interface ArzteTableFiltersProps {
  filters: ArzteFilterOptions;
  onFiltersChange: (filters: ArzteFilterOptions) => void;
  practices: Practice[];
  facilities: string[];
}

const ArzteTableFilters: React.FC<ArzteTableFiltersProps> = ({
  filters,
  onFiltersChange,
  practices,
  facilities
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count active filters
  const activeFilterCount =
    (filters.practiceFilter ? 1 : 0) +
    (filters.facilityFilter ? 1 : 0) +
    (filters.sortBy !== 'name' ? 1 : 0);

  const handlePracticeChange = (practiceId: string) => {
    onFiltersChange({
      ...filters,
      practiceFilter: practiceId || null
    });
  };

  const handleFacilityChange = (facility: string) => {
    onFiltersChange({
      ...filters,
      facilityFilter: facility || null
    });
  };

  const handleSortChange = (sortBy: ArzteFilterOptions['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors flex items-center gap-2"
      >
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            {activeFilterCount}
          </span>
        )}
        <span className="text-sm">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Practice Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Filter by Practice</h4>
              <select
                value={filters.practiceFilter || ''}
                onChange={(e) => handlePracticeChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All practices</option>
                {practices.map(practice => (
                  <option key={practice.id} value={practice.id}>
                    {practice.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Facility Filter */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Filter by Facility</h4>
              <select
                value={filters.facilityFilter || ''}
                onChange={(e) => handleFacilityChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All facilities</option>
                {facilities.map(facility => (
                  <option key={facility} value={facility}>
                    {facility}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Sort by</h4>
              <div className="space-y-1">
                {[
                  { value: 'name', label: '⬆ Arzt Name (A-Z)' },
                  { value: 'practiceCount', label: '⬇ Number of Practices (High to Low)' },
                  { value: 'facilityCount', label: '⬇ Number of ERs (High to Low)' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.sortBy === option.value}
                      onChange={() => handleSortChange(option.value as ArzteFilterOptions['sortBy'])}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArzteTableFilters;
