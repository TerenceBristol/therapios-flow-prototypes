import React, { useState, useRef, useEffect } from 'react';

export interface FilterOptions {
  showPendingOnly: boolean;
  showNoFollowUpOnly: boolean;
  sortBy: 'priority' | 'name' | 'pendingCount' | 'lastActivity';
}

interface FiltersDropdownProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const FiltersDropdown: React.FC<FiltersDropdownProps> = ({ filters, onFiltersChange }) => {
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
    (filters.showPendingOnly ? 1 : 0) +
    (filters.showNoFollowUpOnly ? 1 : 0) +
    (filters.sortBy !== 'priority' ? 1 : 0);

  const handleTogglePending = () => {
    onFiltersChange({
      ...filters,
      showPendingOnly: !filters.showPendingOnly
    });
  };

  const handleToggleNoFollowUp = () => {
    onFiltersChange({
      ...filters,
      showNoFollowUpOnly: !filters.showNoFollowUpOnly
    });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
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
        <div className="absolute top-full mt-2 right-0 w-72 bg-background border border-border rounded-lg shadow-lg z-10">
          <div className="p-4">
            {/* Filter Options */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Filters</h4>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showPendingOnly}
                  onChange={handleTogglePending}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Show only practices with pending FVOs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showNoFollowUpOnly}
                  onChange={handleToggleNoFollowUp}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Show only practices with no next follow-up</span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Sort by</h4>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'priority'}
                    onChange={() => handleSortChange('priority')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">⭐ Priority</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'name'}
                    onChange={() => handleSortChange('name')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">⬆ Practice Name (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'pendingCount'}
                    onChange={() => handleSortChange('pendingCount')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">⬇ Pending FVO Count (High to Low)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.sortBy === 'lastActivity'}
                    onChange={() => handleSortChange('lastActivity')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">⬇ Last Activity (Most Recent)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersDropdown;
