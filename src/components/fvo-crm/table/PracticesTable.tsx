import React, { useState, useMemo } from 'react';
import { PracticeWithComputed, Arzt } from '@/types';
import PhoneCell from './PhoneCell';
import TodayHoursCell from './TodayHoursCell';
import ArztCell from './ArztCell';

interface PracticesTableProps {
  practices: PracticeWithComputed[];
  allDoctors: Arzt[];
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
  const [sortColumn, setSortColumn] = useState<string | null>('pending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Apply search and sorting
  const filteredPractices = useMemo(() => {
    let result = [...practices];

    // Search filter - search both practice names AND doctor names
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => {
        // Search in practice name
        const matchesPracticeName = p.name.toLowerCase().includes(query);

        // Search in doctor names
        const matchesDoctorName = p.doctors.some(d =>
          d.name.toLowerCase().includes(query)
        );

        return matchesPracticeName || matchesDoctorName;
      });
    }

    // Column sorting
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
          case 'lastActivity':
            aVal = a.lastActivity?.date || '';
            bVal = b.lastActivity?.date || '';
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
  }, [practices, searchQuery, sortColumn, sortDirection]);

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

  const renderTableRow = (practice: PracticeWithComputed) => (
    <tr
      key={practice.id}
      onClick={() => onViewPractice(practice.id)}
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3">
        <div className="font-medium text-foreground">{practice.name}</div>
      </td>
      <td className="px-4 py-3">
        <PhoneCell phone={practice.phone} />
      </td>
      <td className="px-4 py-3">
        <ArztCell doctors={practice.doctors} />
      </td>
      <td className="px-4 py-3">
        <TodayHoursCell openingHours={practice.openingHours} />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-foreground">{practice.pendingVOCount}</span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">
          {practice.lastActivity
            ? `${practice.lastActivity.type} ${new Date(practice.lastActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'None'}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search practices or doctors..."
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

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                    Practice Name{getSortIndicator('name')}
                  </th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Arzt</th>
                  <th className="px-4 py-3">Today&apos;s Hours</th>
                  <th className="px-4 py-3 text-center cursor-pointer hover:text-foreground font-bold" onClick={() => handleSort('pending')}>
                    Pending{getSortIndicator('pending')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('lastActivity')}>
                    Last Activity{getSortIndicator('lastActivity')}
                  </th>
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
              {searchQuery && (
                <p className="text-sm mt-2">Try adjusting your search</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticesTable;
