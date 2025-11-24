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
  const [sortColumn, setSortColumn] = useState<string | null>('pendingFollowUp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'hasIssues' | 'todayOverdue' | 'none'>('all');

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

    // Follow-up and issue filters
    if (followUpFilter !== 'all') {
      result = result.filter(p => {
        if (followUpFilter === 'hasIssues') {
          return p.activeIssueCount > 0;
        } else if (followUpFilter === 'todayOverdue') {
          const urgency = getFollowUpUrgency(p.nextFollowUpDate);
          return urgency === 'urgent' || urgency === 'dueThisWeek';
        } else if (followUpFilter === 'none') {
          return !p.nextFollowUpDate;
        }
        return true;
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
          case 'pendingBestellen':
            aVal = a.pendingBestellenCount;
            bVal = b.pendingBestellenCount;
            break;
          case 'pendingFollowUp':
            aVal = a.pendingFollowUpCount;
            bVal = b.pendingFollowUpCount;
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
      className={`border-b border-border hover:bg-muted/50 transition-colors ${
        practice.activeIssueCount > 0 ? 'border-l-4 border-l-amber-500' : ''
      }`}
    >
      <td className="px-4 py-3.5">
        <div className="font-semibold text-base text-foreground">{practice.name}</div>
      </td>
      <td className="px-4 py-3.5">
        <PhoneCell phone={practice.phone || ''} />
      </td>
      <td className="px-4 py-3.5">
        <ArztCell doctors={practice.doctors} />
      </td>
      <td className="px-4 py-3.5">
        <TodayHoursCell openingHours={practice.openingHours} />
      </td>
      <td className="px-4 py-3.5 text-center">
        <span className="text-sm font-medium text-foreground">
          {practice.pendingBestellenCount > 0 ? practice.pendingBestellenCount : '-'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        <span className="text-sm font-medium text-foreground">
          {practice.pendingFollowUpCount > 0 ? practice.pendingFollowUpCount : '-'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        {practice.activeIssueCount > 0 ? (
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full cursor-help"
            title={practice.latestIssue ? `${practice.latestIssue.issueType || 'Issue'}: ${practice.latestIssue.notes}` : 'Has active issues'}
          >
            {practice.activeIssueCount}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3.5 w-40">
        <div className="text-sm text-foreground">
          {practice.lastActivity ? (
            <span
              className="cursor-help"
              title={`Activity - ${new Date(practice.lastActivity.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}`}
            >
              {new Date(practice.lastActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5 w-52">
        {practice.nextFollowUpDate ? (
          (() => {
            const urgency = getFollowUpUrgency(practice.nextFollowUpDate);
            const colorClasses =
              urgency === 'urgent'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : urgency === 'dueThisWeek'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : urgency === 'future'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : '';

            return (
              <div className={`inline-block px-3 py-1.5 rounded-lg ${colorClasses}`}>
                <div className="text-sm font-medium">
                  {new Date(practice.nextFollowUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                {practice.nextFollowUpTime && (
                  <div className="text-xs mt-0.5">{practice.nextFollowUpTime}</div>
                )}
              </div>
            );
          })()
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-center">
          <button
            onClick={() => onViewPractice(practice.id)}
            className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View
          </button>
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
          {/* Filter Controls: Follow-up and Issues */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Next Activity:</span>
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
              onClick={() => setFollowUpFilter('hasIssues')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'hasIssues'
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              ⚠️ Has Issues
            </button>
            <button
              onClick={() => setFollowUpFilter('todayOverdue')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'todayOverdue'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              🔴 Today + Overdue
            </button>
            <button
              onClick={() => setFollowUpFilter('none')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                followUpFilter === 'none'
                  ? 'bg-gray-100 text-gray-800 border border-gray-200'
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              ⚫ No Next Activity
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
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('name')}
                    aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Practice Name{getSortIndicator('name')}
                  </th>
                  <th className="px-4 py-3.5" role="columnheader">Phone</th>
                  <th className="px-4 py-3.5" role="columnheader">Arzt</th>
                  <th className="px-4 py-3.5" role="columnheader">Today&apos;s Hours</th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('pendingBestellen')}
                    aria-sort={sortColumn === 'pendingBestellen' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Pending Bestellen{getSortIndicator('pendingBestellen')}
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('pendingFollowUp')}
                    aria-sort={sortColumn === 'pendingFollowUp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Pending Follow-up{getSortIndicator('pendingFollowUp')}
                  </th>
                  <th className="px-4 py-3.5" role="columnheader">Issues</th>
                  <th
                    className="px-4 py-3.5 w-40 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('lastActivity')}
                    aria-sort={sortColumn === 'lastActivity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Last Activity{getSortIndicator('lastActivity')}
                  </th>
                  <th
                    className="px-4 py-3.5 w-52 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('nextFollowUp')}
                    aria-sort={sortColumn === 'nextFollowUp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Next Activity{getSortIndicator('nextFollowUp')}
                  </th>
                  <th className="px-4 py-3.5 text-center" role="columnheader">Details</th>
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
