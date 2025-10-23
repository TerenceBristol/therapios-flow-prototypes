'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toggle from '@/components/ui/Toggle';
import DisableFVOOrderingModal from '@/components/DisableFVOOrderingModal';

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

interface UserEditFormProps {
  user: User;
}

export default function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(user);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit - just go back
    router.push('/prototypes/therapist-fvo-ordering-admin');
  };

  const handleCancel = () => {
    router.push('/prototypes/therapist-fvo-ordering-admin');
  };

  const handleToggleFVOChange = (checked: boolean) => {
    // If trying to disable (unchecked) and currently enabled, show confirmation modal
    if (!checked && formData.allowFVOOrdering === true) {
      setIsModalOpen(true);
    } else {
      // Otherwise, toggle directly (enabling doesn't need confirmation)
      setFormData({ ...formData, allowFVOOrdering: checked });
    }
  };

  const handleConfirmDisable = () => {
    // Update formData to disable F.VO ordering
    setFormData({ ...formData, allowFVOOrdering: false });

    // Show success message
    setSuccessMessage(`✓ VOs updated to 'By Admin' ordering for ${formData.firstName} ${formData.lastName}`);

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    // Close modal
    setIsModalOpen(false);
  };

  const handleCancelDisable = () => {
    setIsModalOpen(false);
  };

  const getRoleOptions = () => [
    { value: 'ROLE_SUPER_ADMIN', label: 'Super Admin' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_THERAPIST', label: 'Therapeut' },
    { value: 'ROLE_USER', label: 'Benutzer' }
  ];

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

        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Nutzer bearbeiten
        </button>

        {/* Form */}
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nutzer Rolle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {getRoleOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee ID */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mitarbeiter-Nr.
              </label>
              <input
                type="text"
                value={formData.mitarbeiterId}
                onChange={(e) => setFormData({ ...formData, mitarbeiterId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* First Name and Last Name */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Handy Nummer (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Aktiv</span>
              </label>
            </div>

            {/* Allow F.VO Ordering - Only for Therapists */}
            {formData.role === 'ROLE_THERAPIST' && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Allow F.VO Ordering
                </label>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={formData.allowFVOOrdering || false}
                    onChange={handleToggleFVOChange}
                    size="md"
                  />
                  <span className="text-sm text-gray-600">
                    {formData.allowFVOOrdering ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Neues Passwort (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leer lassen, um nicht zu ändern"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Aktualisieren
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Disable F.VO Ordering Confirmation Modal */}
      <DisableFVOOrderingModal
        isOpen={isModalOpen}
        onClose={handleCancelDisable}
        onConfirm={handleConfirmDisable}
        therapistName={`${formData.firstName} ${formData.lastName}`}
      />
    </div>
  );
}
