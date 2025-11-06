'use client';

import { VO } from '@/data/voTypes';

interface VOTableRowProps {
  vo: VO;
  isChecked: boolean;
  onCheck: (voId: string, checked: boolean) => void;
  showCheckbox: boolean;
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

export default function VOTableRow({ vo, isChecked, onCheck, showCheckbox }: VOTableRowProps) {
  const isActive = vo.voStatus === 'Aktiv';

  return (
    <tr className={`border-b border-gray-100 ${!isActive ? 'opacity-70' : 'hover:bg-gray-50'}`}>
      {/* Checkbox */}
      <td className="px-4 py-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => onCheck(vo.id!, e.target.checked)}
            className="rounded border-gray-300 cursor-pointer"
          />
        )}
      </td>

      {/* VO Nr. */}
      <td className="px-4 py-3 text-gray-900 font-mono text-xs">{vo.voNr}</td>

      {/* VO Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(vo.voStatus)}`}>
          {vo.voStatus}
        </span>
      </td>

      {/* Beh. Status (#/#) */}
      <td className="px-4 py-3 text-gray-900 font-mono text-xs">{vo.behStatus}</td>

      {/* Doku */}
      <td className="px-4 py-3 text-center">
        <svg className="w-5 h-5 text-gray-400 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </td>

      {/* Einrichtung */}
      <td className="px-4 py-3 text-gray-900">{vo.einrichtung}</td>

      {/* TB */}
      <td className="px-4 py-3 text-gray-600">{vo.tb}</td>

      {/* Beh. Wbh */}
      <td className="px-4 py-3 text-gray-900">{vo.behWbh}</td>

      {/* Organizer */}
      <td className="px-4 py-3">
        <select
          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
          defaultValue={vo.organizer || 'Planned'}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="Planned">Planned</option>
          <option value="Treated">Treated</option>
        </select>
      </td>

      {/* Heilmittel */}
      <td className="px-4 py-3 text-gray-900">{vo.heilmittel}</td>

      {/* Abgelehnte Beh. */}
      <td className="px-4 py-3 text-gray-900">{vo.abgelehnteBeh}</td>

      {/* Doppel-B */}
      <td className="px-4 py-3 text-gray-900">{vo.doppelB}</td>
    </tr>
  );
}
