'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotificationBell from '@/components/notifications/NotificationBell';
import NotificationBanner from '@/components/notifications/NotificationBanner';
import { sampleNotifications, getUnreadCount, getHighestUrgency } from '@/data/notifications';
import type { Notification } from '@/data/notifications';

export default function NotificationCenterPrototype() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const unreadCount = getUnreadCount(notifications);
  const highestUrgency = getHighestUrgency(notifications);

  // Reset banner dismissed state when notifications are marked as read/unread
  // If unread count becomes 0, keep banner dismissed
  // If unread count increases from 0, show banner again
  useEffect(() => {
    if (unreadCount === 0) {
      setIsBannerDismissed(false);
    }
  }, [unreadCount]);

  const handleViewNotifications = () => {
    setIsPanelOpen(true);
    // Banner stays visible until explicitly dismissed with X button
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
  };

  const handleUpdateNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Flow</h1>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="mr-2">👤</span>
                T Board
              </button>
            </div>

            {/* Right side - User info and Notification Bell */}
            <div className="flex items-center gap-4">
              <NotificationBell
                notifications={notifications}
                onUpdateNotifications={handleUpdateNotifications}
                isPanelOpen={isPanelOpen}
                setIsPanelOpen={setIsPanelOpen}
              />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                  FW
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">Frauke Wolff</div>
                  <div className="text-xs text-gray-500">Therapist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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

      {/* Notification Alert Banner */}
      {unreadCount > 0 && !isBannerDismissed && (
        <NotificationBanner
          unreadCount={unreadCount}
          urgency={highestUrgency}
          onView={handleViewNotifications}
          onDismiss={handleDismissBanner}
        />
      )}

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
    </div>
  );
}
