import React, { useState, useMemo } from 'react';
import { PracticeWithComputed, Arzt } from '@/types';
import { convertTo12Hour } from '@/utils/timeUtils';
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

  // Calculate totals for summary cards
  const totals = useMemo(() => {
    return practices.reduce(
      (acc, practice) => ({
        pendingBestellen: acc.pendingBestellen + practice.pendingBestellenCount,
        pendingFollowUp: acc.pendingFollowUp + practice.pendingFollowUpCount,
        activeIssues: acc.activeIssues + practice.activeIssueCount
      }),
      { pendingBestellen: 0, pendingFollowUp: 0, activeIssues: 0 }
    );
  }, [practices]);

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
      <td className="px-4 py-3.5 whitespace-nowrap">
        <PhoneCell phone={practice.phone || ''} />
      </td>
      <td className="px-4 py-3.5">
        <ArztCell doctors={practice.doctors} />
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <TodayHoursCell openingHours={practice.openingHours} />
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap">
        <span className="text-sm font-medium text-foreground">
          {practice.pendingBestellenCount > 0 ? practice.pendingBestellenCount : '-'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap">
        <span className="text-sm font-medium text-foreground">
          {practice.pendingFollowUpCount > 0 ? practice.pendingFollowUpCount : '-'}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center whitespace-nowrap">
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
      <td className="px-4 py-3.5 whitespace-nowrap">
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
      <td className="px-4 py-3.5 whitespace-nowrap">
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
                  <div className="text-xs mt-0.5">{convertTo12Hour(practice.nextFollowUpTime)}</div>
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
      {/* Summary Cards */}
      <div className="p-4 border-b border-border bg-muted/10">
        <div className="grid grid-cols-3 gap-4">
          {/* Pending Bestellen Card */}
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totals.pendingBestellen}</div>
              <div className="text-sm text-muted-foreground">Pending Bestellen</div>
            </div>
          </div>

          {/* Pending Follow-up Card */}
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totals.pendingFollowUp}</div>
              <div className="text-sm text-muted-foreground">Pending Follow-up</div>
            </div>
          </div>

          {/* Active Issues Card */}
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totals.activeIssues}</div>
              <div className="text-sm text-muted-foreground">Active Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-4">
          {/* Tab-style Filters */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => setFollowUpFilter('all')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                followUpFilter === 'all'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
              {followUpFilter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setFollowUpFilter('hasIssues')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                followUpFilter === 'hasIssues'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Has Issues
              {followUpFilter === 'hasIssues' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setFollowUpFilter('todayOverdue')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                followUpFilter === 'todayOverdue'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today + Overdue
              {followUpFilter === 'todayOverdue' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setFollowUpFilter('none')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                followUpFilter === 'none'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              No Next Activity
              {followUpFilter === 'none' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {/* Search Bar (fixed width, right side) */}
          <div className="relative w-72 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practices or doctors..."
              className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
        </div>

      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-[#1e3a5f] sticky top-0 z-10">
                <tr className="text-left text-xs font-semibold text-[#d4b896] uppercase tracking-wide">
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('name')}
                    aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Practice Name{getSortIndicator('name')}
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap" role="columnheader">Phone</th>
                  <th className="px-4 py-3.5" role="columnheader">Arzt</th>
                  <th className="px-4 py-3.5 whitespace-nowrap" role="columnheader">Today&apos;s Hours</th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('pendingBestellen')}
                    aria-sort={sortColumn === 'pendingBestellen' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Pending Bestellen{getSortIndicator('pendingBestellen')}
                  </th>
                  <th
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('pendingFollowUp')}
                    aria-sort={sortColumn === 'pendingFollowUp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Pending Follow-up{getSortIndicator('pendingFollowUp')}
                  </th>
                  <th className="px-4 py-3.5 whitespace-nowrap" role="columnheader">Issues</th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('lastActivity')}
                    aria-sort={sortColumn === 'lastActivity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Last Activity{getSortIndicator('lastActivity')}
                  </th>
                  <th
                    className="px-4 py-3.5 cursor-pointer hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort('nextFollowUp')}
                    aria-sort={sortColumn === 'nextFollowUp' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    Next Activity{getSortIndicator('nextFollowUp')}
                  </th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap" role="columnheader">Details</th>
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
