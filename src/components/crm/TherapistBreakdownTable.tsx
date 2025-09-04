'use client';

import React, { useState, useMemo } from 'react';
import { TherapistBreakdown } from '@/types';

interface TherapistBreakdownTableProps {
  therapists: TherapistBreakdown[];
}

type SortField = 'name' | 'fertigVOCount';
type SortDirection = 'asc' | 'desc';

const TherapistBreakdownTable: React.FC<TherapistBreakdownTableProps> = ({ therapists }) => {
  const [sortField, setSortField] = useState<SortField>('fertigVOCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedTherapists = useMemo(() => {
    return [...therapists].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'fertigVOCount') {
        comparison = a.fertigVOCount - b.fertigVOCount;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [therapists, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with appropriate default direction
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return '⇅'; // Neutral sort icon
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatERList = (erList: string[]) => {
    return erList.join(', ');
  };

  return (
    <div className="vo-table-container">
      <div className="vo-table-scroll">
        <table className="vo-table">
          <thead>
            <tr>
              <th 
                className="vo-table-header therapist-table-sortable" 
                onClick={() => handleSort('name')}
              >
                Therapist Name {getSortIcon('name')}
              </th>
              <th className="vo-table-header">
                ER
              </th>
              <th 
                className="vo-table-header therapist-table-sortable" 
                onClick={() => handleSort('fertigVOCount')}
              >
                # of Fertig VOs {getSortIcon('fertigVOCount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTherapists.map((therapist, index) => (
              <tr 
                key={therapist.id} 
                className={`vo-table-row ${index % 2 === 0 ? 'vo-table-row-even' : 'vo-table-row-odd'}`}
              >
                <td className="vo-table-cell therapist-name-cell">
                  {therapist.name}
                </td>
                <td className="vo-table-cell therapist-er-cell">
                  {formatERList(therapist.er)}
                </td>
                <td className="vo-table-cell therapist-count-cell">
                  <span className="fertig-vo-count">
                    {therapist.fertigVOCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TherapistBreakdownTable;
