'use client';

import { useState } from 'react';
import { VO } from '@/data/voTypesAlt';
import VOTableRowV2 from './VOTableRowV2';

interface PatientSectionV2Props {
  patientName: string;
  patientId: string;
  vos: VO[];
  activeVOs: VO[];
  nonActiveVOs: VO[];
  selectedVOs: Set<string>;
  onVOCheck: (voId: string, checked: boolean) => void;
}

export default function PatientSectionV2({
  patientName,
  patientId,
  vos,
  activeVOs,
  nonActiveVOs,
  selectedVOs,
  onVOCheck
}: PatientSectionV2Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveVOs = activeVOs.length > 0;
  // Show active VOs if they exist, otherwise show first non-active VO
  const vosToShow = hasActiveVOs ? activeVOs : nonActiveVOs.slice(0, 1);
  const nonActiveCount = nonActiveVOs.length;
  const remainingCount = hasActiveVOs ? nonActiveCount : nonActiveCount - 1;

  return (
    <tbody className="shadow-md bg-gray-50 mb-3">
      {/* Active VO Rows (or first completed VO if no active) */}
      {vosToShow.map((vo) => (
        <VOTableRowV2
          key={vo.id}
          vo={vo}
          patientName={patientName}
          isChecked={selectedVOs.has(vo.id!)}
          onCheck={onVOCheck}
          showCheckbox={vo.voStatus === 'Aktiv'}
        />
      ))}

      {/* Remaining Non-Active VO Rows (when expanded) */}
      {isExpanded && (hasActiveVOs ? nonActiveVOs : nonActiveVOs.slice(1)).map((vo) => (
        <VOTableRowV2
          key={vo.id}
          vo={vo}
          patientName={patientName}
          isChecked={false}
          onCheck={onVOCheck}
          showCheckbox={false}
        />
      ))}

      {/* Expand Button Row - always at the end */}
      <tr className="bg-gray-50">
        <td colSpan={18} className="px-4 py-2 text-left">
          {remainingCount > 0 ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {isExpanded ? 'Hide' : 'Show'} {remainingCount} {hasActiveVOs ? '' : 'more '}completed {remainingCount === 1 ? 'VO' : 'VOs'}
            </button>
          ) : hasActiveVOs ? (
            <span className="text-gray-400 text-sm">No completed VOs yet</span>
          ) : null}
        </td>
      </tr>
    </tbody>
  );
}
