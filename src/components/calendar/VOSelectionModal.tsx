import React, { useState, useMemo } from 'react';
import { VORecord } from '@/types';

interface VOSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVO: (vo: VORecord) => void;
  availableVOs: VORecord[];
}

type SortColumn = 'patientName' | 'voNumber' | 'treatmentStatus' | 'heilmittel';
type SortDirection = 'asc' | 'desc';

export default function VOSelectionModal({
  isOpen,
  onClose,
  onSelectVO,
  availableVOs,
}: VOSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortColumn>('patientName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Parse treatment status to completion percentage
  const parseCompletionPercentage = (status: string): number => {
    const [current, total] = status.split('/').map(Number);
    return total > 0 ? current / total : 0;
  };

  // Handle column header click for sorting
  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort VOs
  const filteredAndSortedVOs = useMemo(() => {
    // First, filter by search query
    let result = availableVOs;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (vo) =>
          vo.patientName.toLowerCase().includes(query) ||
          vo.voNumber.toLowerCase().includes(query)
      );
    }

    // Then, sort
    result = [...result].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (sortBy) {
        case 'patientName':
          compareA = a.patientName.toLowerCase();
          compareB = b.patientName.toLowerCase();
          break;
        case 'voNumber':
          compareA = a.voNumber.toLowerCase();
          compareB = b.voNumber.toLowerCase();
          break;
        case 'treatmentStatus':
          compareA = parseCompletionPercentage(a.treatmentStatus);
          compareB = parseCompletionPercentage(b.treatmentStatus);
          break;
        case 'heilmittel':
          compareA = a.heilmittelCode.toLowerCase();
          compareB = b.heilmittelCode.toLowerCase();
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [availableVOs, searchQuery, sortBy, sortDirection]);

  if (!isOpen) return null;

  // Render sort indicator
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortBy !== column) return null;
    
    return (
      <span className="ml-1 text-blue-600">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select VO for Treatment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name or VO number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* VO Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredAndSortedVOs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No active VOs found for this therapist
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th
                      onClick={() => handleSort('patientName')}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Patient Name
                      <SortIndicator column="patientName" />
                    </th>
                    <th
                      onClick={() => handleSort('voNumber')}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      VO Number
                      <SortIndicator column="voNumber" />
                    </th>
                    <th
                      onClick={() => handleSort('treatmentStatus')}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Treatment Status
                      <SortIndicator column="treatmentStatus" />
                    </th>
                    <th
                      onClick={() => handleSort('heilmittel')}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      Heilmittel
                      <SortIndicator column="heilmittel" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      VO Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedVOs.map((vo, index) => (
                    <tr
                      key={vo.id}
                      onClick={() => onSelectVO(vo)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {vo.patientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {vo.voNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {vo.treatmentStatus}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {vo.heilmittelCode}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          {vo.voStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

