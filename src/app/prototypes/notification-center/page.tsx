'use client';

import Link from 'next/link';

export default function NotificationCenterPrototype() {
  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-blue-100 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="text-blue-600">✨</div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900 text-sm">New Feature</div>
              <div className="text-sm text-blue-800">We have a new feature on the blabva</div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">
            Hallo Frauke Wolff, ich hoffe, Du hast einen wundervollen Tag.
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Deine Übersicht</h2>
        </div>

        {/* Refresh button */}
        <div className="mb-4">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aktualisieren um neue VOs zu sehen
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button className="px-6 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">
              Offene VOs (19)
            </button>
            <button className="px-6 py-3 text-sm text-gray-600 hover:text-gray-900">
              Geteilte VOs (2)
            </button>
            <button className="px-6 py-3 text-sm text-gray-600 hover:text-gray-900">
              Abgeschlossene VOs (95)
            </button>
            <button className="px-6 py-3 text-sm text-gray-600 hover:text-gray-900">
              Kalender
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>Spalten anzeigen</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                <option>ECH</option>
              </select>
              <div className="flex-1"></div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen"
                  className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">VO Nr.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">TB</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Einrichtung</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tage s.l. Beh.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Primärer Therapeut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Geteilter Therapeut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Beh. Wbh</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Organizer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Heilmittel</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Beh. Status (#/#)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Abgelehnte Beh.</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Doppel-B</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample rows */}
                {[
                  { name: 'Verena Baier', vo: '4529-4', facility: 'KG-H', status: '0 / 6' },
                  { name: 'Christel Brandt', vo: '4748-2', facility: 'KG-H', status: '0 / 36' },
                  { name: 'Irmgard Bubert', vo: '4346-4', facility: 'KG-H', status: '0 / 6' },
                  { name: 'Ingrid Dretzko', vo: '4325-3', facility: 'KG-H', status: '0 / 36' },
                  { name: 'Rosemarie Eberle', vo: '4339-3', facility: 'KG-H', status: '0 / 6' },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-900 font-mono text-xs">{row.vo}</td>
                    <td className="px-4 py-3 text-gray-600">Nein</td>
                    <td className="px-4 py-3 text-gray-900">
                      Domicil-Seniorenpflegeheim Amendestraße
                    </td>
                    <td className="px-4 py-3 text-gray-900">0</td>
                    <td className="px-4 py-3 text-gray-900">F. Wolff</td>
                    <td className="px-4 py-3 text-gray-400">-</td>
                    <td className="px-4 py-3 text-gray-900">0</td>
                    <td className="px-4 py-3 text-gray-900">{row.facility}</td>
                    <td className="px-4 py-3 text-gray-900">
                      <button className="text-blue-600 hover:text-blue-800">
                        <select className="text-sm border-none bg-transparent">
                          <option>Select</option>
                        </select>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-mono text-xs">{row.status}</td>
                    <td className="px-4 py-3 text-gray-900">0</td>
                    <td className="px-4 py-3 text-gray-900">{index === 1 || index === 3 ? 'Ja' : 'Nein'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
