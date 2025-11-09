'use client';

import { forwardRef } from 'react';
import { VO } from '@/data/voTypesAlt';

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
  const isActive = vo.voStatus === 'Aktiv';

  return (
    <tr
      ref={ref}
      className={`
        border-b border-gray-200
        ${!isActive ? 'opacity-70 bg-gray-50' : 'hover:bg-gray-50'}
        ${highlighted ? 'bg-yellow-100 transition-colors duration-300' : ''}
        ${className}
      `}
    >
      {/* 1. Checkbox */}
      <td className="px-3 py-3 text-center">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onCheck(vo.id!, e.target.checked)}
            className="rounded border-gray-300 cursor-pointer"
          />
        )}
      </td>

      {/* 2. Name */}
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{patientName}</td>

      {/* 3. Organizer */}
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

      {/* 4. Tage s.l. Beh */}
      <td className="px-3 py-3 text-center text-sm text-gray-900">{vo.tageSeit}</td>

      {/* 5. VO Nr. */}
      <td className="px-3 py-3 text-sm text-gray-900 font-mono">{vo.voNr}</td>

      {/* 6. VO Status */}
      <td className="px-3 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(vo.voStatus)}`}>
          {vo.voStatus}
        </span>
      </td>

      {/* 7. Doku (Eye icon) */}
      <td className="px-3 py-3 text-center">
        <button
          className="hover:bg-gray-100 p-1 rounded"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open documentation modal
          }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </td>

      {/* 8. Heilmittel */}
      <td className="px-3 py-3 text-sm text-gray-900">{vo.heilmittel}</td>

      {/* 9. ICD (NEW COLUMN) */}
      <td className="px-3 py-3 text-sm text-gray-900 font-mono">
        {vo.icdCode}
      </td>

      {/* 10. TB */}
      <td className="px-3 py-3 text-center text-sm text-gray-600">{vo.tb}</td>

      {/* 11. Einrichtung */}
      <td className="px-3 py-3 text-gray-700 text-sm">{vo.einrichtung}</td>

      {/* 12. Primärer Therapeut */}
      <td className="px-3 py-3 text-gray-900 text-sm">{vo.primaererTherapeut}</td>

      {/* 13. Geteilter Therapeut */}
      <td className="px-3 py-3 text-gray-900 text-sm">{vo.geteilterTherapeut}</td>

      {/* 14. Beh. Wbh */}
      <td className="px-3 py-3 text-center text-sm text-gray-900">{vo.behWbh}</td>

      {/* 15. Abgelehnte Beh. */}
      <td className="px-3 py-3 text-center text-sm text-gray-900">{vo.abgelehnteBeh}</td>

      {/* 16. Doppel-B */}
      <td className="px-3 py-3 text-center text-sm text-gray-600">{vo.doppelB}</td>

      {/* 17. Frequenz */}
      <td className="px-3 py-3 text-center text-gray-700 text-sm">{vo.frequenz || '–'}</td>

      {/* 18. Arzt */}
      <td className="px-3 py-3 text-gray-900 text-sm">{vo.arzt || '–'}</td>
    </tr>
  );
});

VOTableRowV2.displayName = 'VOTableRowV2';

export default VOTableRowV2;
