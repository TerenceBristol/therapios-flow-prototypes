import React, { useState, useMemo } from 'react';
import { Arzt, Practice } from '@/types';
import ArzteTableFilters, { ArzteFilterOptions } from './ArzteTableFilters';

interface ArzteTableProps {
  arzte: Arzt[];
  practices: Practice[];
  onEdit: (arztId: string) => void;
  onAdd: () => void;
}

const ArzteTable: React.FC<ArzteTableProps> = ({
  arzte,
  practices,
  onEdit,
  onAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ArzteFilterOptions>({
    practiceFilter: null,
    facilityFilter: null,
    sortBy: 'name'
  });

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get all unique facilities
  const allFacilities = useMemo(() => {
    const facilitiesSet = new Set<string>();
    arzte.forEach(arzt => {
      arzt.facilities.forEach(facility => facilitiesSet.add(facility));
    });
    return Array.from(facilitiesSet).sort();
  }, [arzte]);

  // Apply filters and search
  const filteredArzte = useMemo(() => {
    let result = [...arzte];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(query));
    }

    // Practice filter
    if (filters.practiceFilter) {
      result = result.filter(a => a.practiceId === filters.practiceFilter);
    }

    // Facility filter
    if (filters.facilityFilter) {
      result = result.filter(a => a.facilities.includes(filters.facilityFilter!));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'practiceCount':
        // Sort by whether they have a practice or not
        result.sort((a, b) => {
          const aHasPractice = a.practiceId ? 1 : 0;
          const bHasPractice = b.practiceId ? 1 : 0;
          return bHasPractice - aHasPractice;
        });
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
            aVal = a.practiceId ? 1 : 0;
            bVal = b.practiceId ? 1 : 0;
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
  }, [arzte, searchQuery, filters, sortColumn, sortDirection]);

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
              placeholder="Search ärzte..."
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
              Showing {filteredArzte.length} of {arzte.length} ärzte
            </div>
          )}
        </div>

        <ArzteTableFilters
          filters={filters}
          onFiltersChange={setFilters}
          practices={practices}
          facilities={allFacilities}
        />

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
        >
          + Add Arzt
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <th className="px-4 py-3 w-20">
                  ID
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                  Arzt Name{getSortIndicator('name')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('practices')}>
                  Practices{getSortIndicator('practices')}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('facilities')}>
                  ERs{getSortIndicator('facilities')}
                </th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArzte.map(arzt => (
                <tr
                  key={arzt.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm text-muted-foreground">{arzt.arztId || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{arzt.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {arzt.practiceId ? (
                        practices.find(p => p.id === arzt.practiceId)?.name || 'Unknown'
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">
                      {arzt.facilities.length > 0 ? (
                        <>
                          <span className="font-medium">{arzt.facilities.length}</span>
                          {arzt.facilities.length <= 2 ? (
                            <span className="text-muted-foreground"> - {arzt.facilities.join(', ')}</span>
                          ) : (
                            <span className="text-muted-foreground"> ERs</span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(arzt.id)}
                      className="p-2 hover:bg-muted rounded-md transition-colors text-primary hover:text-primary/80"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredArzte.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">🔍</div>
              <p>No ärzte found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArzteTable;
