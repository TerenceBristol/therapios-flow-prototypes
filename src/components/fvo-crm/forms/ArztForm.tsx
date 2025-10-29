'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Arzt, Practice, PracticeVO } from '@/types';
import Link from 'next/link';

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

  // Compute doctor's VOs and ERs
  const doctorVOs = useMemo(() => {
    if (!initialData?.id) return [];
    return vos.filter(vo => vo.doctorId === initialData.id);
  }, [vos, initialData]);

  const computedERs = useMemo(() => {
    const uniqueERs = [...new Set(doctorVOs.map(vo => vo.facilityName))];
    return uniqueERs.sort();
  }, [doctorVOs]);

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
      facilities: computedERs, // Use computed ERs from VOs
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

          {/* ERs - Computed from VOs */}
          <div className="mb-8">
            {computedERs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {computedERs.map(er => (
                  <div
                    key={er}
                    className="px-3 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground"
                  >
                    {er}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No VOs yet - ERs will appear once VOs are assigned to this doctor
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-8" />

          {/* VOs Table */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Verordnungen ({doctorVOs.length})
            </h3>
            {doctorVOs.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <th className="px-4 py-3">Patient Name</th>
                        <th className="px-4 py-3">Heilmittel</th>
                        <th className="px-4 py-3">Anzahl</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Status Date</th>
                        <th className="px-4 py-3">Facility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorVOs.map(vo => (
                        <tr
                          key={vo.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-foreground">{vo.patientName}</td>
                          <td className="px-4 py-3 text-sm text-foreground font-mono">{vo.therapyType}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{vo.anzahl}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-muted border border-border rounded text-xs">
                              {vo.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{vo.statusDate}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{vo.facilityName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-border rounded-lg bg-muted/20">
                <div className="text-4xl mb-4">📋</div>
                <p>No VOs assigned to this doctor yet</p>
                <p className="text-sm mt-2">VOs will appear here once they are created</p>
              </div>
            )}
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
