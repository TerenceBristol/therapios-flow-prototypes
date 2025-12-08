'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EntityTable, Column } from '@/components/vo-creation';

import usersDataJson from '@/data/usersData.json';

const STORAGE_KEY = 'vo-creation-prototype-data';

export interface User {
  id: string;
  mitarbeiter_nr: string;
  vorname: string;
  nachname: string;
  email: string;
  handy_nummer: string | null;
  status: 'Aktiv' | 'Inaktiv';
  rolle: 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_THERAPIST' | 'ROLE_USER';
  allow_fvo_ordering: boolean;
}

const roleLabels: Record<string, string> = {
  ROLE_SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  ROLE_ADMIN: 'ROLE_ADMIN',
  ROLE_THERAPIST: 'ROLE_THERAPIST',
  ROLE_USER: 'ROLE_USER',
};

export default function TeamListPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.users) {
            setUsers(data.users);
          } else {
            // Add users to existing data
            const initialUsers = usersDataJson as User[];
            const newData = { ...data, users: initialUsers };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            setUsers(initialUsers);
          }
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

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return users;
    return users.filter((u) => u.rolle === roleFilter);
  }, [users, roleFilter]);

  const columns: Column<User>[] = [
    {
      key: 'mitarbeiter_nr',
      header: 'ID',
      width: '80px',
      render: (user) => (
        <span className="font-mono text-gray-500">{user.mitarbeiter_nr}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (user) => `${user.vorname} ${user.nachname}`,
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (user) => (
        <span className="text-gray-600">{user.email}</span>
      ),
    },
    {
      key: 'handy_nummer',
      header: 'Handynummer',
      render: (user) => (
        <span className="text-gray-600">{user.handy_nummer || '-'}</span>
      ),
    },
    {
      key: 'rolle',
      header: 'Rolle',
      render: (user) => (
        <span className="text-gray-600">{roleLabels[user.rolle] || user.rolle}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex items-center gap-1 ${user.status === 'Aktiv' ? 'text-green-700' : 'text-red-700'}`}>
          {user.status}
          {user.status === 'Aktiv' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      ),
    },
    {
      key: 'allow_fvo_ordering',
      header: 'Allow F.VO Ordering',
      render: (user) => (
        <div className="flex items-center">
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${
              user.allow_fvo_ordering ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                user.allow_fvo_ordering ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    router.push(`/prototypes/vo-creation/team/edit/${user.id}`);
  };

  const handleCreate = () => {
    router.push('/prototypes/vo-creation/team/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <EntityTable
        title="Benutzer verwalten"
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Benutzer suchen"
        searchFields={['vorname', 'nachname', 'email', 'mitarbeiter_nr']}
        onEdit={handleEdit}
        onCreate={handleCreate}
        createLabel="+ Nutzer hinzufügen"
        getRowId={(user) => user.id}
        filters={
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Rollen</option>
            <option value="ROLE_SUPER_ADMIN">Super Admin</option>
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_THERAPIST">Therapist</option>
            <option value="ROLE_USER">User</option>
          </select>
        }
      />
    </div>
  );
}
