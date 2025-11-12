'use client';

import { forwardRef, useState } from 'react';
import { VO } from '@/data/voTypesAlt';
import VODetailSection from './VODetailSection';

interface VOTableRowV2Props {
  vo: VO;
  patientName: string;
  isChecked: boolean;
  onCheck: (voId: string, checked: boolean) => void;
  showCheckbox: boolean;
  className?: string;
  highlighted?: boolean;
}

// Get status badge styling based on VO status
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Aktiv':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Fertig Behandelt':
      return 'bg-gray-700 text-white border-gray-700';
    case 'Abgelaufen':
      return 'bg-gray-700 text-white border-gray-700';
    case 'Abgerechnet':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Abgebrochen':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

const VOTableRowV2 = forwardRef<HTMLTableRowElement, VOTableRowV2Props>(
  ({ vo, patientName, isChecked, onCheck, showCheckbox, className = '', highlighted = false }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isActive = vo.voStatus === 'Aktiv';

    const handleExpandToggle = () => {
      setIsExpanded(!isExpanded);
    };

    const handleRowClick = (e: React.MouseEvent) => {
      // Don't expand if clicking on interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('input, select, button')) {
        return;
      }
      handleExpandToggle();
    };

    return (
      <>
        {/* Main Row */}
        <tr
          ref={ref}
          onClick={handleRowClick}
          className={`
            border-b border-gray-200 cursor-pointer transition-colors
            ${isExpanded ? 'bg-gray-100' : 'hover:bg-gray-50'}
            ${!isActive ? 'opacity-70' : ''}
            ${highlighted ? 'bg-yellow-100' : ''}
            ${className}
          `}
        >
          {/* 1. Expand Icon */}
          <td className="px-3 py-3 text-center w-10">
            <button
              onClick={handleExpandToggle}
              className="hover:bg-gray-200 p-1 rounded transition-colors"
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-150 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </td>

          {/* 2. Checkbox */}
          <td className="px-3 py-3 text-center w-10">
            {showCheckbox && (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => onCheck(vo.id!, e.target.checked)}
                className="rounded border-gray-300 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </td>

          {/* 3. Name */}
          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{patientName}</td>

          {/* 4. VO Nr. */}
          <td className="px-3 py-3 text-sm text-gray-900 font-mono">{vo.voNr}</td>

          {/* 5. HM (Heilmittel) */}
          <td className="px-3 py-3 text-sm text-gray-900">{vo.heilmittel}</td>

          {/* 6. T.sl. Beh (Days since last treatment) */}
          <td className="px-3 py-3 text-center text-sm text-gray-900">{vo.tageSeit}</td>

          {/* 7. Beh. Status */}
          <td className="px-3 py-3 text-center text-sm text-gray-900">{vo.behStatus}</td>

          {/* 8. Organizer */}
          <td className="px-3 py-3">
            <select
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 cursor-pointer"
              defaultValue={vo.organizer || 'Planned'}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="Planned">Planned</option>
              <option value="Treated">Treated</option>
            </select>
          </td>

          {/* 9. VO Status */}
          <td className="px-3 py-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                vo.voStatus
              )}`}
            >
              {vo.voStatus}
            </span>
          </td>
        </tr>

        {/* Detail Row - Conditionally Rendered */}
        {isExpanded && (
          <tr>
            <td colSpan={9} className="p-0">
              <VODetailSection vo={vo} />
            </td>
          </tr>
        )}
      </>
    );
  }
);

VOTableRowV2.displayName = 'VOTableRowV2';

export default VOTableRowV2;
