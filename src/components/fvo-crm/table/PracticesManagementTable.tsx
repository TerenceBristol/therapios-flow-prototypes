'use client';

import React, { useState, useMemo } from 'react';
import { Practice, Arzt } from '@/types';
import PhoneCell from './PhoneCell';
import TodayHoursCell from './TodayHoursCell';
import ArzteCell from './ArzteCell';

interface PracticesManagementTableProps {
  practices: Practice[];
  doctors: Arzt[];
  onEdit: (practiceId: string) => void;
  onAdd: () => void;
}

type SortColumn = 'name' | 'phone' | 'city' | 'doctors';

const PracticesManagementTable: React.FC<PracticesManagementTableProps> = ({
  practices,
  doctors,
  onEdit,
  onAdd
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter practices
  const filteredPractices = useMemo(() => {
    let result = [...practices];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.phone.includes(query)
      );
    }

    // Doctor filter
    if (doctorFilter) {
      result = result.filter(p => {
        const practiceDoctors = doctors.filter(doc => doc.practiceId === p.id);
        return practiceDoctors.some(doc => doc.id === doctorFilter);
      });
    }

    return result;
  }, [practices, searchQuery, doctorFilter, doctors]);

  // Sort practices
  const sortedPractices = useMemo(() => {
    const result = [...filteredPractices];

    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortColumn) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'phone':
          compareValue = a.phone.localeCompare(b.phone);
          break;
        case 'city':
          compareValue = a.address.localeCompare(b.address);
          break;
        case 'doctors': {
          const aDoctors = doctors.filter(doc => doc.practiceId === a.id).length;
          const bDoctors = doctors.filter(doc => doc.practiceId === b.id).length;
          compareValue = aDoctors - bDoctors;
          break;
        }
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [filteredPractices, sortColumn, sortDirection, doctors]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Get doctors for each practice
  const getPracticeDoctors = (practiceId: string) => {
    return doctors.filter(doc => doc.practiceId === practiceId);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Search and Add Button */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search practices by name, city, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Doctor Filter */}
          <select
            value={doctorFilter || ''}
            onChange={(e) => setDoctorFilter(e.target.value || null)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Ärzte</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>

          {/* Add Practice Button */}
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
          >
            + Add Practice
          </button>
        </div>

        {/* Active Filters Info */}
        {(searchQuery || doctorFilter) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {sortedPractices.length} of {practices.length} practices</span>
            {(searchQuery || doctorFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDoctorFilter(null);
                }}
                className="text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80"
              >
                Practice Name{getSortIndicator('name')}
              </th>
              <th
                onClick={() => handleSort('phone')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80"
              >
                Phone{getSortIndicator('phone')}
              </th>
              <th
                onClick={() => handleSort('city')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80"
              >
                Address{getSortIndicator('city')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Hours
              </th>
              <th
                onClick={() => handleSort('doctors')}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/80"
              >
                Ärzte{getSortIndicator('doctors')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPractices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🔍</div>
                  <div>No practices found</div>
                  {(searchQuery || doctorFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setDoctorFilter(null);
                      }}
                      className="mt-2 text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              sortedPractices.map((practice) => {
                const practiceDoctors = getPracticeDoctors(practice.id);

                return (
                  <tr
                    key={practice.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{practice.name}</div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3">
                      <PhoneCell
                        phone={practice.phone}
                        keyContact={practice.keyContacts[0]}
                      />
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground">
                        {practice.address}
                      </div>
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3">
                      <TodayHoursCell openingHours={practice.openingHours} />
                    </td>

                    {/* Doctors */}
                    <td className="px-4 py-3">
                      <ArzteCell doctors={practiceDoctors} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onEdit(practice.id)}
                        className="p-2 hover:bg-muted rounded-md transition-colors text-primary hover:text-primary/80"
                        title="Edit"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PracticesManagementTable;
