import React, { useState, useRef, useEffect } from 'react';
import { PriorityLevel, PreferredContactMethod, PracticeDoctor } from '@/types';

export interface PracticesFilterOptions {
  showPendingOnly: boolean;
  showNoFollowUpOnly: boolean;
  showOpenTodayOnly: boolean;
  priorityFilters: PriorityLevel[];
  contactMethodFilters: PreferredContactMethod[];
  doctorFilter: string | null;
  facilityFilter: string | null;
  sortBy: 'priority' | 'name' | 'pendingCount' | 'lastActivity' | 'nextFollowUp';
}

interface PracticesTableFiltersProps {
  filters: PracticesFilterOptions;
  onFiltersChange: (filters: PracticesFilterOptions) => void;
  doctors: PracticeDoctor[];
  facilities: string[];
}

const PracticesTableFilters: React.FC<PracticesTableFiltersProps> = ({
  filters,
  onFiltersChange,
  doctors,
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
    (filters.showPendingOnly ? 1 : 0) +
    (filters.showNoFollowUpOnly ? 1 : 0) +
    (filters.showOpenTodayOnly ? 1 : 0) +
    filters.priorityFilters.length +
    filters.contactMethodFilters.length +
    (filters.doctorFilter ? 1 : 0) +
    (filters.facilityFilter ? 1 : 0) +
    (filters.sortBy !== 'priority' ? 1 : 0);

  const handleToggle = (key: keyof PracticesFilterOptions) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key as keyof typeof filters]
    });
  };

  const handlePriorityToggle = (priority: PriorityLevel) => {
    const updated = filters.priorityFilters.includes(priority)
      ? filters.priorityFilters.filter(p => p !== priority)
      : [...filters.priorityFilters, priority];

    onFiltersChange({
      ...filters,
      priorityFilters: updated
    });
  };

  const handleContactMethodToggle = (method: PreferredContactMethod) => {
    const updated = filters.contactMethodFilters.includes(method)
      ? filters.contactMethodFilters.filter(m => m !== method)
      : [...filters.contactMethodFilters, method];

    onFiltersChange({
      ...filters,
      contactMethodFilters: updated
    });
  };

  const handleDoctorChange = (doctorId: string) => {
    onFiltersChange({
      ...filters,
      doctorFilter: doctorId || null
    });
  };

  const handleFacilityChange = (facility: string) => {
    onFiltersChange({
      ...filters,
      facilityFilter: facility || null
    });
  };

  const handleSortChange = (sortBy: PracticesFilterOptions['sortBy']) => {
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
        <div className="absolute top-full mt-2 right-0 w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Basic Filters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Quick Filters</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showPendingOnly}
                    onChange={() => handleToggle('showPendingOnly')}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Show only practices with pending FVOs</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showNoFollowUpOnly}
                    onChange={() => handleToggle('showNoFollowUpOnly')}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Show only practices with no next follow-up</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showOpenTodayOnly}
                    onChange={() => handleToggle('showOpenTodayOnly')}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Show only practices open today</span>
                </label>
              </div>
            </div>

            {/* Priority Filters */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Priority</h4>
              <div className="space-y-2">
                {(['overdue', 'dueToday', 'thisWeek', 'other'] as PriorityLevel[]).map(priority => (
                  <label key={priority} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.priorityFilters.includes(priority)}
                      onChange={() => handlePriorityToggle(priority)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground capitalize">
                      {priority === 'overdue' && '🔴 Overdue'}
                      {priority === 'dueToday' && '🟡 Due Today'}
                      {priority === 'thisWeek' && '🔵 This Week'}
                      {priority === 'other' && '⚪ Other'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Method Filters */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Contact Method</h4>
              <div className="space-y-2">
                {(['phone', 'fax', 'email'] as PreferredContactMethod[]).map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.contactMethodFilters.includes(method)}
                      onChange={() => handleContactMethodToggle(method)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground capitalize">
                      {method === 'phone' && '📞 Phone'}
                      {method === 'fax' && '📠 Fax'}
                      {method === 'email' && '📧 Email'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Doctor Filter */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Filter by Doctor</h4>
              <select
                value={filters.doctorFilter || ''}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
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
                  { value: 'priority', label: '⭐ Priority' },
                  { value: 'name', label: '⬆ Practice Name (A-Z)' },
                  { value: 'pendingCount', label: '⬇ Pending FVO Count (High to Low)' },
                  { value: 'lastActivity', label: '⬇ Last Activity (Most Recent)' },
                  { value: 'nextFollowUp', label: '⬆ Next Follow-up (Soonest)' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.sortBy === option.value}
                      onChange={() => handleSortChange(option.value as PracticesFilterOptions['sortBy'])}
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

export default PracticesTableFilters;
