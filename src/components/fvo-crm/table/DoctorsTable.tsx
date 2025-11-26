import React, { useState, useMemo } from 'react';
import { PracticeDoctor, Practice } from '@/types';
import DoctorsTableFilters, { DoctorsFilterOptions } from './DoctorsTableFilters';
import TableActionButtons from './TableActionButtons';

interface DoctorsTableProps {
  doctors: PracticeDoctor[];
  practices: Practice[];
  onViewDoctor: (doctorId: string) => void;
  onEditDoctor: (doctorId: string) => void;
  onAddDoctor: () => void;
}

const DoctorsTable: React.FC<DoctorsTableProps> = ({
  doctors,
  practices,
  onViewDoctor,
  onEditDoctor,
  onAddDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DoctorsFilterOptions>({
    practiceFilter: null,
    facilityFilter: null,
    sortBy: 'name'
  });

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get all unique facilities
  const allFacilities = useMemo(() => {
    const facilitiesSet = new Set<string>();
    doctors.forEach(doctor => {
      doctor.facilities.forEach(facility => facilitiesSet.add(facility));
    });
    return Array.from(facilitiesSet).sort();
  }, [doctors]);

  // Apply filters and search
  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(query));
    }

    // Practice filter
    if (filters.practiceFilter) {
      result = result.filter(d => d.practiceId === filters.practiceFilter);
    }

    // Facility filter
    if (filters.facilityFilter) {
      result = result.filter(d => d.facilities.includes(filters.facilityFilter!));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'facilityCount':
        result.sort((a, b) => b.facilities.length - a.facilities.length);
        break;
    }

    // Column sorting (if a column header was clicked)
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sortColumn) {
          case 'name':
            aVal = a.name;
            bVal = b.name;
            break;
          case 'practices':
            aVal = a.practiceId || '';
            bVal = b.practiceId || '';
            break;
          case 'facilities':
            aVal = a.facilities.length;
            bVal = b.facilities.length;
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
  }, [doctors, searchQuery, filters, sortColumn, sortDirection]);

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

  const getPracticeName = (practiceId?: string) => {
    if (!practiceId) return 'None';
    return practices.find(p => p.id === practiceId)?.name || 'Unknown';
  };

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
              placeholder="Search doctors..."
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
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
          )}
        </div>

        <DoctorsTableFilters
          filters={filters}
          onFiltersChange={setFilters}
          practices={practices}
          facilities={allFacilities}
        />

        <button
          onClick={onAddDoctor}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
        >
          + Add Doctor
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1e3a5f]">
              <tr className="text-left text-xs font-semibold text-[#d4b896] uppercase tracking-wide">
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                  Doctor Name{getSortIndicator('name')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('practices')}>
                  Practices{getSortIndicator('practices')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('facilities')}>
                  Facilities/ERs{getSortIndicator('facilities')}
                </th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doctor => (
                <tr
                  key={doctor.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{doctor.name}</div>
                    {doctor.specialty && (
                      <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {doctor.practiceId ? (
                        <span className="text-muted-foreground">{getPracticeName(doctor.practiceId)}</span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {doctor.facilities.length > 0 ? (
                        <>
                          <span className="font-medium">{doctor.facilities.length}</span>
                          {doctor.facilities.length <= 2 ? (
                            <span className="text-muted-foreground"> - {doctor.facilities.join(', ')}</span>
                          ) : (
                            <span className="text-muted-foreground"> facilities</span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {doctor.phone || <span className="text-muted-foreground">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TableActionButtons
                      onView={() => onViewDoctor(doctor.id)}
                      onEdit={() => onEditDoctor(doctor.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">🔍</div>
              <p>No doctors found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsTable;
