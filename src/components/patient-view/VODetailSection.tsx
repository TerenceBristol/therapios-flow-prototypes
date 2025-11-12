'use client';

import { VO } from '@/data/voTypesAlt';

interface VODetailSectionProps {
  vo: VO;
}

export default function VODetailSection({ vo }: VODetailSectionProps) {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6 animate-slideDown">
      <div className="grid grid-cols-4 gap-x-6 gap-y-4">
        {/* Row 1: Doku, Protokolle, Primärer Therapeut, Geteilter Therapeut */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Doku</div>
          <button
            className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open documentation modal
            }}
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Protokolle</div>
          <button
            className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open protocols modal
            }}
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Primärer Therapeut</div>
          <div className="text-sm text-gray-900">{vo.primaererTherapeut}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Geteilter Therapeut</div>
          <div className="text-sm text-gray-900">{vo.geteilterTherapeut || '–'}</div>
        </div>

        {/* Row 2: Frequenz, TB, Einrichtung, Doppel-Beh. */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Frequenz</div>
          <div className="text-sm text-gray-900">{vo.frequenz || '–'}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">TB</div>
          <div className="text-sm text-gray-900">{vo.tb}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Einrichtung</div>
          <div className="text-sm text-gray-900">{vo.einrichtung}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Doppel-Beh.</div>
          <div className="text-sm text-gray-900">{vo.doppelB}</div>
        </div>

        {/* Row 3: Abgelehnte Beh., Beh. Wbh, Ausst. Datum, Arzt */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Abgelehnte Beh.</div>
          <div className="text-sm text-gray-900">{vo.abgelehnteBeh}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Beh. Wbh</div>
          <div className="text-sm text-gray-900">{vo.behWbh}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Ausst. Datum</div>
          <div className="text-sm text-gray-900">{vo.ausstDatum || '–'}</div>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-1">Arzt</div>
          <div className="text-sm text-gray-900">{vo.arzt || '–'}</div>
        </div>

        {/* Row 4: Transfer Status, F-VO Status (conditional) */}
        {vo.fVoStatus && (
          <>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">F-VO Status</div>
              <div className="text-sm text-gray-900">{vo.fVoStatus}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
