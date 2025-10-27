import React, { useState, useMemo } from 'react';
import { PracticeWithComputed, PriorityLevel } from '@/types';
import SearchBar from './SearchBar';
import FiltersDropdown, { FilterOptions } from './FiltersDropdown';
import PriorityGroup from './PriorityGroup';
import PracticeCard from './PracticeCard';

interface PriorityQueuePanelProps {
  practices: PracticeWithComputed[];
  selectedPracticeId: string | null;
  onSelectPractice: (practiceId: string) => void;
}

const PriorityQueuePanel: React.FC<PriorityQueuePanelProps> = ({
  practices,
  selectedPracticeId,
  onSelectPractice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    showPendingOnly: true,
    showNoFollowUpOnly: false,
    sortBy: 'priority'
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<PriorityLevel, boolean>>({
    overdue: true,
    dueToday: true,
    thisWeek: true,
    other: false
  });

  // Filter and sort practices
  const filteredPractices = useMemo(() => {
    let result = [...practices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Apply pending filter
    if (filters.showPendingOnly) {
      result = result.filter(p => p.pendingVOCount > 0);
    }

    // Apply no follow-up filter
    if (filters.showNoFollowUpOnly) {
      result = result.filter(p => !p.nextFollowUpDate);
    }

    // Apply sorting
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
      case 'priority':
      default:
        // Priority is already calculated, keep as is for grouping
        break;
    }

    return result;
  }, [practices, searchQuery, filters]);

  // Group practices by priority
  const practicesByPriority = useMemo(() => {
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

  const priorityOrder: PriorityLevel[] = ['overdue', 'dueToday', 'thisWeek', 'other'];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={filteredPractices.length}
          totalCount={practices.length}
        />
        <div className="flex justify-end">
          <FiltersDropdown
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* Practice Groups */}
      <div className="flex-1 overflow-y-auto p-4">
        {priorityOrder.map(priority => {
          const groupPractices = practicesByPriority[priority];
          if (groupPractices.length === 0) return null;

          return (
            <PriorityGroup
              key={priority}
              priorityLevel={priority}
              count={groupPractices.length}
              isExpanded={expandedGroups[priority]}
              onToggle={() => toggleGroup(priority)}
            >
              {groupPractices.map(practice => (
                <PracticeCard
                  key={practice.id}
                  practice={practice}
                  isSelected={selectedPracticeId === practice.id}
                  onClick={() => onSelectPractice(practice.id)}
                />
              ))}
            </PriorityGroup>
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
    </div>
  );
};

export default PriorityQueuePanel;
