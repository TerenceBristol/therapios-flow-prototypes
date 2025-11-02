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
  onOpenActivities?: (practiceId: string) => void;
}

const PracticesTable: React.FC<PracticesTableProps> = ({
  practices,
  allDoctors,
  onViewPractice,
  onEditPractice,
  onAddPractice,
  onOpenActivities
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>('pending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'urgent' | 'dueThisWeek' | 'none'>('all');

  // Helper function to classify follow-up urgency
  const getFollowUpUrgency = (nextFollowUpDate?: string): 'urgent' | 'dueThisWeek' | 'future' | 'none' => {
    if (!nextFollowUpDate) return 'none';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUpDate = new Date(nextFollowUpDate);
    followUpDate.setHours(0, 0, 0, 0);

    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Urgent: Overdue or due today (immediate action needed)
    if (diffDays <= 0) return 'urgent';
    // This Week: Due within next 7 days (1-7 days from now)
    if (diffDays <= 7) return 'dueThisWeek';
    return 'future';
  };

  // Apply search and sorting
  const filteredPractices = useMemo(() => {
    let result = [...practices];

    // Follow-up urgency filter
    if (followUpFilter !== 'all') {
      result = result.filter(p => {
        const urgency = getFollowUpUrgency(p.nextFollowUpDate);
        return urgency === followUpFilter;
      });
    }

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
  }, [practices, searchQuery, sortColumn, sortDirection, followUpFilter]);

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
        <PhoneCell phone={practice.phone || ''} />
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
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">
          {practice.nextFollowUpDate ? (
            <div>
              <div>{new Date(practice.nextFollowUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              {practice.nextFollowUpTime && (
                <div className="text-xs text-muted-foreground">{practice.nextFollowUpTime}</div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center">
          {onOpenActivities && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenActivities(practice.id);
              }}
              className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
              title="View activities & follow-ups"
              aria-label="View activities & follow-ups"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
          )}
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
        <div className="mt-3 space-y-3">
          {/* Filter Controls: Follow-up Urgency */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Follow-up:</span>
            <button
              onClick={() => setFollowUpFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFollowUpFilter('urgent')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'urgent'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              🔴 Urgent
            </button>
            <button
              onClick={() => setFollowUpFilter('dueThisWeek')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'dueThisWeek'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              📅 This Week
            </button>
            <button
              onClick={() => setFollowUpFilter('none')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'none'
                  ? 'bg-gray-100 text-gray-800 border border-gray-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              ⚫ No Follow-up
            </button>
          </div>

          {/* Results count */}
          {(searchQuery || followUpFilter !== 'all') && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredPractices.length} of {practices.length} practices
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('name')}
                    aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Practice Name{getSortIndicator('name')}
                  </th>
                  <th className="px-4 py-3" role="columnheader">Phone</th>
                  <th className="px-4 py-3" role="columnheader">Arzt</th>
                  <th className="px-4 py-3" role="columnheader">Today&apos;s Hours</th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer hover:text-foreground font-bold"
                    onClick={() => handleSort('pending')}
                    aria-sort={sortColumn === 'pending' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Pending{getSortIndicator('pending')}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('lastActivity')}
                    aria-sort={sortColumn === 'lastActivity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Last Activity{getSortIndicator('lastActivity')}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('nextFollowUp')}
                    aria-sort={sortColumn === 'nextFollowUp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Next Follow-up{getSortIndicator('nextFollowUp')}
                  </th>
                  <th className="px-4 py-3 text-center" role="columnheader">Activities</th>
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
