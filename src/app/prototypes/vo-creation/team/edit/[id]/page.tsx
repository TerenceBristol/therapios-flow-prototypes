'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamForm, User } from '@/components/vo-creation/TeamForm';

import usersDataJson from '@/data/usersData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        let loadedUsers: User[];

        if (stored) {
          const data = JSON.parse(stored);
          loadedUsers = data.users || usersDataJson;
        } else {
          loadedUsers = usersDataJson as User[];
        }

        setUsers(loadedUsers);
        const user = loadedUsers.find((u) => u.id === userId);
        if (user) {
          setCurrentUser(user);
        }
      } catch {
        const fallbackUsers = usersDataJson as User[];
        setUsers(fallbackUsers);
        const user = fallbackUsers.find((u) => u.id === userId);
        if (user) {
          setCurrentUser(user);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [userId]);

  const handleSave = (userData: Omit<User, 'id'>) => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...userData,
      id: currentUser.id,
    };

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const currentUsers = data.users || usersDataJson;
      const updatedUsers = currentUsers.map((u: User) =>
        u.id === currentUser.id ? updatedUser : u
      );
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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Benutzer nicht gefunden</h2>
          <p className="text-gray-500 mb-4">Der angeforderte Benutzer existiert nicht.</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Zurück zur Liste
          </button>
        </div>
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
          Nutzer bearbeiten
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <TeamForm
          mode="edit"
          initialUser={currentUser}
          existingMitarbeiterNrs={users
            .filter((u) => u.id !== currentUser.id)
            .map((u) => u.mitarbeiter_nr)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
