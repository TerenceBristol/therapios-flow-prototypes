'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toggle from '@/components/ui/Toggle';
import DisableFVOOrderingModal from '@/components/DisableFVOOrderingModal';
import usersData from '@/data/userManagementData.json';

interface User {
  id: number;
  mitarbeiterId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: boolean;
  allowFVOOrdering: boolean | null;
}

export default function UserManagementTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(usersData as User[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingToggleUserId, setPendingToggleUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleFVO = (userId: number) => {
    const user = users.find(u => u.id === userId);
    
    // If user is a therapist and currently has F.VO ordering enabled, show confirmation modal
    if (user?.role === 'ROLE_THERAPIST' && user.allowFVOOrdering === true) {
      setPendingToggleUserId(userId);
      setIsModalOpen(true);
    } else {
      // Otherwise, toggle directly (enabling doesn't need confirmation)
      setUsers(users.map(u => 
        u.id === userId && u.role === 'ROLE_THERAPIST'
          ? { ...u, allowFVOOrdering: !u.allowFVOOrdering }
          : u
      ));
    }
  };

  const handleConfirmDisable = () => {
    if (pendingToggleUserId !== null) {
      const user = users.find(u => u.id === pendingToggleUserId);
      
      // Update the user's allowFVOOrdering to false
      setUsers(users.map(u => 
        u.id === pendingToggleUserId
          ? { ...u, allowFVOOrdering: false }
          : u
      ));

      // Show success message
      setSuccessMessage(
        `✓ VOs updated to 'By Admin' ordering${user ? ` for ${user.firstName} ${user.lastName}` : ''}`
      );

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }

    // Close modal and reset
    setIsModalOpen(false);
    setPendingToggleUserId(null);
  };

  const handleCancelDisable = () => {
    setIsModalOpen(false);
    setPendingToggleUserId(null);
  };

  const handleEditUser = (userId: number) => {
    router.push(`/prototypes/therapist-fvo-ordering-admin/user/${userId}`);
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'ROLE_SUPER_ADMIN': 'Super Admin',
      'ROLE_ADMIN': 'Admin',
      'ROLE_THERAPIST': 'Therapeut',
      'ROLE_USER': 'Benutzer'
    };
    return roleMap[role] || role;
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-green-900">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Header with Search */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Benutzer suchen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Handynummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Allow F.VO Ordering
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.phone || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {getRoleDisplay(user.role)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {user.status ? (
                      <span className="inline-flex items-center text-green-600">
                        Aktiv ✓
                      </span>
                    ) : (
                      <span className="text-gray-400">Inaktiv</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {user.role === 'ROLE_THERAPIST' ? (
                      <Toggle
                        checked={user.allowFVOOrdering || false}
                        onChange={() => handleToggleFVO(user.id)}
                        size="md"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Bearbeiten"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Zeilen pro Seite</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Erste Seite"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Vorherige Seite"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Nächste Seite"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Letzte Seite"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disable F.VO Ordering Confirmation Modal */}
      <DisableFVOOrderingModal
        isOpen={isModalOpen}
        onClose={handleCancelDisable}
        onConfirm={handleConfirmDisable}
        therapistName={
          pendingToggleUserId 
            ? users.find(u => u.id === pendingToggleUserId)
                ?.firstName + ' ' + users.find(u => u.id === pendingToggleUserId)?.lastName
            : undefined
        }
      />
    </div>
  );
}
