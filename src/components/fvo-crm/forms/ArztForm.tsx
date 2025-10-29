'use client';

import React, { useState, useEffect } from 'react';
import { Arzt, Practice } from '@/types';
import Link from 'next/link';
import MultiSelect, { MultiSelectOption } from './MultiSelect';

// Predefined German ER names
const GERMAN_ERS: MultiSelectOption[] = [
  { value: 'ER Berlin', label: 'ER Berlin' },
  { value: 'ER München', label: 'ER München' },
  { value: 'ER Hamburg', label: 'ER Hamburg' },
  { value: 'ER Köln', label: 'ER Köln' },
  { value: 'ER Frankfurt', label: 'ER Frankfurt' },
  { value: 'ER Stuttgart', label: 'ER Stuttgart' },
  { value: 'ER Düsseldorf', label: 'ER Düsseldorf' },
  { value: 'ER Leipzig', label: 'ER Leipzig' },
  { value: 'ER Dortmund', label: 'ER Dortmund' },
  { value: 'ER Essen', label: 'ER Essen' },
  { value: 'ER Bremen', label: 'ER Bremen' },
  { value: 'ER Dresden', label: 'ER Dresden' },
  { value: 'ER Hannover', label: 'ER Hannover' },
  { value: 'ER Nürnberg', label: 'ER Nürnberg' },
];

interface ArztFormProps {
  initialData?: Arzt | null;
  practices: Practice[];
  onSave: (arztData: Omit<Arzt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ArztForm: React.FC<ArztFormProps> = ({
  initialData,
  practices,
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
  const [facilities, setFacilities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setArztId(initialData.arztId?.toString() || '');
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setPracticeId(initialData.practiceId);
      setFacilities(initialData.facilities || []);
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
      facilities,
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

          {/* Practices */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-1">
              Practice
            </label>
            <select
              value={practiceId || ''}
              onChange={(e) => setPracticeId(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Unassigned</option>
              {practices.map(practice => (
                <option key={practice.id} value={practice.id}>
                  {practice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* ERs */}
          <div className="mb-8">
            <MultiSelect
              label="ERs"
              options={GERMAN_ERS}
              value={facilities}
              onChange={setFacilities}
              placeholder="Select ERs..."
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
