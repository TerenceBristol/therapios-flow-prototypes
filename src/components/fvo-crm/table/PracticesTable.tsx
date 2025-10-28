import React, { useState, useMemo } from 'react';
import { PracticeWithComputed, PriorityLevel, PracticeDoctor } from '@/types';
import PracticesTableFilters, { PracticesFilterOptions } from './PracticesTableFilters';
import PriorityBadge from './PriorityBadge';
import PhoneCell from './PhoneCell';
import TodayHoursCell from './TodayHoursCell';
import DoctorsCell from './DoctorsCell';
import TableActionButtons from './TableActionButtons';
import { formatDateTimeDisplay } from '@/utils/timeUtils';
import { isOpenToday } from '@/utils/openingHoursUtils';

interface PracticesTableProps {
  practices: PracticeWithComputed[];
  allDoctors: PracticeDoctor[];
  onViewPractice: (practiceId: string) => void;
  onEditPractice: (practiceId: string) => void;
  onAddPractice: () => void;
}

const PracticesTable: React.FC<PracticesTableProps> = ({
  practices,
  allDoctors,
  onViewPractice,
  onEditPractice,
  onAddPractice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PracticesFilterOptions>({
    showPendingOnly: false, // Changed to false to show all practices by default
    showNoFollowUpOnly: false,
    showOpenTodayOnly: false,
    priorityFilters: [],
    contactMethodFilters: [],
    doctorFilter: null,
    facilityFilter: null,
    sortBy: 'priority'
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<PriorityLevel, boolean>>({
    overdue: true,
    dueToday: true,
    thisWeek: true,
    other: false
  });

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get all unique facilities from all doctors
  const allFacilities = useMemo(() => {
    const facilitiesSet = new Set<string>();
    if (allDoctors && Array.isArray(allDoctors)) {
      allDoctors.forEach(doctor => {
        if (doctor.facilities && Array.isArray(doctor.facilities)) {
          doctor.facilities.forEach(facility => facilitiesSet.add(facility));
        }
      });
    }
    return Array.from(facilitiesSet).sort();
  }, [allDoctors]);

  // Apply filters and search
  const filteredPractices = useMemo(() => {
    let result = [...practices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Pending FVOs filter
    if (filters.showPendingOnly) {
      result = result.filter(p => p.pendingVOCount > 0);
    }

    // No follow-up filter
    if (filters.showNoFollowUpOnly) {
      result = result.filter(p => !p.nextFollowUpDate);
    }

    // Open today filter
    if (filters.showOpenTodayOnly) {
      result = result.filter(p => isOpenToday(p.openingHours));
    }

    // Priority filters
    if (filters.priorityFilters.length > 0) {
      result = result.filter(p => filters.priorityFilters.includes(p.priorityLevel));
    }

    // Contact method filters
    if (filters.contactMethodFilters.length > 0) {
      result = result.filter(p => filters.contactMethodFilters.includes(p.preferredContactMethod));
    }

    // Doctor filter
    if (filters.doctorFilter) {
      result = result.filter(p =>
        p.doctors.some(d => d.id === filters.doctorFilter)
      );
    }

    // Facility filter
    if (filters.facilityFilter) {
      result = result.filter(p =>
        p.doctors.some(d => d.facilities.includes(filters.facilityFilter!))
      );
    }

    // Apply sorting
    if (filters.sortBy !== 'priority') {
      switch (filters.sortBy) {
        case 'name':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'pendingCount':
          result.sort((a, b) => b.pendingVOCount - a.pendingVOCount);
          break;
        case 'lastActivity':
          result.sort((a, b) => {
            const aDate = a.lastActivity?.date || '';
            const bDate = b.lastActivity?.date || '';
            return bDate.localeCompare(aDate);
          });
          break;
        case 'nextFollowUp':
          result.sort((a, b) => {
            if (!a.nextFollowUpDate && !b.nextFollowUpDate) return 0;
            if (!a.nextFollowUpDate) return 1;
            if (!b.nextFollowUpDate) return -1;
            return a.nextFollowUpDate.localeCompare(b.nextFollowUpDate);
          });
          break;
      }
    }

    // Column sorting (if a column header was clicked)
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: string | number | undefined;
        let bVal: string | number | undefined;

        switch (sortColumn) {
          case 'name':
            aVal = a.name;
            bVal = b.name;
            break;
          case 'pending':
            aVal = a.pendingVOCount;
            bVal = b.pendingVOCount;
            break;
          case 'batches':
            aVal = a.activeBatchCount;
            bVal = b.activeBatchCount;
            break;
          case 'lastActivity':
            aVal = a.lastActivity?.date || '';
            bVal = b.lastActivity?.date || '';
            break;
          case 'nextFollowUp':
            aVal = a.nextFollowUpDate || '';
            bVal = b.nextFollowUpDate || '';
            break;
          default:
            return 0;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [practices, searchQuery, filters, sortColumn, sortDirection]);

  // Group by priority
  const groupedPractices = useMemo(() => {
    const groups: Record<PriorityLevel, PracticeWithComputed[]> = {
      overdue: [],
      dueToday: [],
      thisWeek: [],
      other: []
    };

    filteredPractices.forEach(practice => {
      groups[practice.priorityLevel].push(practice);
    });

    return groups;
  }, [filteredPractices]);

  const toggleGroup = (priority: PriorityLevel) => {
    setExpandedGroups(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const priorityOrder: PriorityLevel[] = ['overdue', 'dueToday', 'thisWeek', 'other'];

  const renderTableRow = (practice: PracticeWithComputed) => (
    <tr
      key={practice.id}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      <td className="px-4 py-3">
        <PriorityBadge priority={practice.priorityLevel} showLabel={false} />
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{practice.name}</div>
      </td>
      <td className="px-4 py-3">
        <PhoneCell phone={practice.phone} keyContact={practice.keyContacts[0]} />
      </td>
      <td className="px-4 py-3">
        <TodayHoursCell openingHours={practice.openingHours} />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-medium text-foreground">{practice.pendingVOCount}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-medium text-foreground">{practice.activeBatchCount}</span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">
          {practice.lastActivity
            ? `${practice.lastActivity.type} ${new Date(practice.lastActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'None'}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">
          {practice.nextFollowUpDate
            ? formatDateTimeDisplay(practice.nextFollowUpDate, practice.nextFollowUpTime)
            : 'Not scheduled'}
        </div>
      </td>
      <td className="px-4 py-3">
        <DoctorsCell doctors={practice.doctors} />
      </td>
      <td className="px-4 py-3">
        <TableActionButtons
          onView={() => onViewPractice(practice.id)}
          onEdit={() => onEditPractice(practice.id)}
        />
      </td>
    </tr>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-border flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practices..."
              className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {filteredPractices.length} of {practices.length} practices
            </div>
          )}
        </div>

        <PracticesTableFilters
          filters={filters}
          onFiltersChange={setFilters}
          doctors={allDoctors}
          facilities={allFacilities}
        />

        <button
          onClick={onAddPractice}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
        >
          + Add Practice
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filters.sortBy === 'priority' ? (
          // Grouped by priority
          <div className="p-4">
            {priorityOrder.map(priority => {
              const groupPractices = groupedPractices[priority];
              if (groupPractices.length === 0) return null;

              const priorityConfig = {
                overdue: { label: 'OVERDUE', icon: '🔴', color: '#DC2626' },
                dueToday: { label: 'DUE TODAY', icon: '🟡', color: '#F59E0B' },
                thisWeek: { label: 'THIS WEEK', icon: '🔵', color: '#3B82F6' },
                other: { label: 'ALL OTHERS', icon: '⚪', color: '#9CA3AF' }
              }[priority];

              return (
                <div key={priority} className="mb-6">
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroup(priority)}
                    className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted rounded-md transition-colors mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{priorityConfig.icon}</span>
                      <span
                        className="font-semibold text-sm tracking-wide"
                        style={{ color: priorityConfig.color }}
                      >
                        {priorityConfig.label}
                      </span>
                      <span
                        className="text-sm font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${priorityConfig.color}20`,
                          color: priorityConfig.color
                        }}
                      >
                        {groupPractices.length}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-lg">
                      {expandedGroups[priority] ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Group Table */}
                  {expandedGroups[priority] && (
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <th className="px-4 py-3 w-12"></th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                              Practice Name{getSortIndicator('name')}
                            </th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Today&apos;s Hours</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('pending')}>
                              Pending{getSortIndicator('pending')}
                            </th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('batches')}>
                              Batches{getSortIndicator('batches')}
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('lastActivity')}>
                              Last Activity{getSortIndicator('lastActivity')}
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('nextFollowUp')}>
                              Next Follow-up{getSortIndicator('nextFollowUp')}
                            </th>
                            <th className="px-4 py-3">Doctors</th>
                            <th className="px-4 py-3 w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupPractices.map(practice => renderTableRow(practice))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPractices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">🔍</div>
                <p>No practices found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          // Flat table (when not sorting by priority)
          <div className="p-4">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-3 w-12"></th>
                    <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                      Practice Name{getSortIndicator('name')}
                    </th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Today&apos;s Hours</th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('pending')}>
                      Pending{getSortIndicator('pending')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('batches')}>
                      Batches{getSortIndicator('batches')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('lastActivity')}>
                      Last Activity{getSortIndicator('lastActivity')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('nextFollowUp')}>
                      Next Follow-up{getSortIndicator('nextFollowUp')}
                    </th>
                    <th className="px-4 py-3">Doctors</th>
                    <th className="px-4 py-3 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPractices.map(practice => renderTableRow(practice))}
                </tbody>
              </table>
            </div>

            {filteredPractices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">🔍</div>
                <p>No practices found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticesTable;
