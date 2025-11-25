'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Arzt, Practice, PracticeVO } from '@/types';
import Link from 'next/link';
import SearchableSelect, { SearchableSelectOption } from './SearchableSelect';

interface ArztFormProps {
  initialData?: Arzt | null;
  practices: Practice[];
  vos: PracticeVO[];
  onSave: (arztData: Omit<Arzt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ArztForm: React.FC<ArztFormProps> = ({
  initialData,
  practices,
  vos,
  onSave,
  onCancel,
  isEditing = false
}) => {
  // Form state
  const [arztId, setArztId] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [practiceId, setPracticeId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create practice options for searchable select
  const practiceOptions: SearchableSelectOption[] = useMemo(() => {
    return [
      { value: '', label: 'Unassigned', searchText: 'unassigned none' },
      ...practices.map(practice => ({
        value: practice.id,
        label: `${practice.name} (ID: ${practice.practiceId || practice.id})`,
        searchText: `${practice.name} ${practice.practiceId || practice.id}`
      }))
    ];
  }, [practices]);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setArztId(initialData.arztId?.toString() || '');
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setPracticeId(initialData.practiceId);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Arzt name is required (min 2 characters)';
    }

    if (arztId && !/^\d+$/.test(arztId)) {
      newErrors.arztId = 'Arzt ID must be a number';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      arztId: arztId ? parseInt(arztId) : undefined,
      name: name.trim(),
      practiceId,
      facilities: [], // No longer tracking ERs in Arzt form
      phone: phone || undefined,
      email: email || undefined
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Arzt' : 'Add New Arzt'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? 'Update arzt information' : 'Create a new arzt profile'}
            </p>
          </div>
          <Link
            href="/prototypes/fvo-crm/admin/arzte"
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            ✕ Close
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Arzt ID
                </label>
                <input
                  type="text"
                  value={arztId}
                  onChange={(e) => setArztId(e.target.value)}
                  placeholder="Enter numeric ID"
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.arztId ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.arztId && (
                  <p className="text-sm text-red-500 mt-1">{errors.arztId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Smith"
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.email ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* Practice */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-1">
              Practice
            </label>
            <SearchableSelect
              options={practiceOptions}
              value={practiceId || ''}
              onChange={(value) => setPracticeId(value || undefined)}
              placeholder="Search for a practice..."
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-6 bg-card">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {isEditing ? 'Save Changes' : 'Create Arzt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArztForm;
