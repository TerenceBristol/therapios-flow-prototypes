'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeamForm, User } from '@/components/vo-creation/TeamForm';

import usersDataJson from '@/data/usersData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setUsers(data.users || usersDataJson);
        } else {
          setUsers(usersDataJson as User[]);
        }
      } catch {
        setUsers(usersDataJson as User[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSave = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentUsers = data.users || usersDataJson;
      const updatedUsers = [...currentUsers, newUser];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, users: updatedUsers }));
    } catch {
      // Ignore storage errors
    }

    router.push('/prototypes/vo-creation/team');
  };

  const handleCancel = () => {
    router.push('/prototypes/vo-creation/team');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Nutzer erstellen
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <TeamForm
          mode="create"
          existingMitarbeiterNrs={users.map((u) => u.mitarbeiter_nr)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
