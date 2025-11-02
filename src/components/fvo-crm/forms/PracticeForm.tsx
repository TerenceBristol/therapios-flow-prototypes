'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Practice, OpeningHours, Arzt, PracticeContact, VacationPeriod } from '@/types';
import OpeningHoursEditor from '../OpeningHoursEditor';
import ContactArrayEditor from '../ContactArrayEditor';
import VacationManager from '../VacationManager';
import { createDefaultOpeningHours } from '@/utils/openingHoursUtils';
import Link from 'next/link';

interface PracticeFormProps {
  initialData?: Practice | null;
  doctors: Arzt[];
  onSave: (practice: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const PracticeForm: React.FC<PracticeFormProps> = ({
  initialData,
  doctors,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [practiceId, setPracticeId] = useState<string>('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contacts, setContacts] = useState<PracticeContact[]>([]);
  const [phone, setPhone] = useState(''); // Deprecated - kept for migration
  const [fax, setFax] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(createDefaultOpeningHours());
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get doctors for this practice
  const practiceDoctors = useMemo(() => {
    if (!initialData?.id) return [];
    return doctors.filter(doc => doc.practiceId === initialData.id);
  }, [doctors, initialData]);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setPracticeId(initialData.practiceId?.toString() || '');
      setName(initialData.name);
      setAddress(initialData.address || '');

      // Initialize contacts array
      if (initialData.contacts && initialData.contacts.length > 0) {
        setContacts(initialData.contacts);
      } else if (initialData.phone) {
        // Migrate old phone field to contacts array
        setContacts([{
          id: `contact-${Date.now()}`,
          name: '',
          phone: initialData.phone,
          role: '',
          note: '',
          isPrimary: true
        }]);
      }

      setPhone(initialData.phone || ''); // Keep for migration
      setFax(initialData.fax || '');
      setEmail(initialData.email || '');
      setOpeningHours(initialData.openingHours);
      setVacationPeriods(initialData.vacationPeriods || []);
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Practice name is required (min 2 characters)';
    }

    // Validate contacts array
    if (contacts.length === 0) {
      newErrors.contacts = 'At least one contact number is required';
    } else {
      // Check that at least one contact has a phone number
      const hasValidPhone = contacts.some(c => c.phone.trim().length > 0);
      if (!hasValidPhone) {
        newErrors.contacts = 'At least one contact must have a phone number';
      }

      // Check that exactly one contact is marked as primary
      const primaryCount = contacts.filter(c => c.isPrimary).length;
      if (primaryCount === 0) {
        newErrors.contacts = 'One contact must be marked as primary';
      } else if (primaryCount > 1) {
        newErrors.contacts = 'Only one contact can be marked as primary';
      }
    }

    if (practiceId && !/^\d+$/.test(practiceId)) {
      newErrors.practiceId = 'Practice ID must be a number';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Get primary contact phone for backward compatibility
    const primaryContact = contacts.find(c => c.isPrimary);
    const primaryPhone = primaryContact?.phone || contacts[0]?.phone || '';

    onSave({
      practiceId: practiceId ? parseInt(practiceId) : undefined,
      name: name.trim(),
      address: address.trim(),
      contacts: contacts, // New contacts array
      phone: primaryPhone, // Deprecated - kept for backward compatibility
      fax: fax.trim() || undefined,
      email: email.trim() || undefined,
      openingHours,
      vacationPeriods: vacationPeriods.length > 0 ? vacationPeriods : undefined
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Practice' : 'Add New Practice'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? 'Update practice information' : 'Create a new practice'}
            </p>
          </div>
          <Link
            href="/prototypes/fvo-crm/admin/practices"
            className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            ✕ Close
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Practice ID */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Practice ID
            </label>
            <input
              type="text"
              value={practiceId}
              onChange={(e) => setPracticeId(e.target.value)}
              placeholder="Enter numeric ID"
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.practiceId ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.practiceId && (
              <p className="text-sm text-red-500 mt-1">{errors.practiceId}</p>
            )}
          </div>

          {/* Practice Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Practice Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="123 Main Street, Springfield, IL 62701"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Contact Numbers (Multiple) */}
          <ContactArrayEditor
            contacts={contacts}
            onChange={setContacts}
            error={errors.contacts}
          />

          {/* Fax and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Fax
              </label>
              <input
                type="tel"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
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
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Doctors at this Practice */}
          {isEditing && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Ärzte at this Practice
              </h3>
              {practiceDoctors.length > 0 ? (
                <div className="space-y-2">
                  {practiceDoctors.map(doctor => (
                    <div key={doctor.id} className="text-sm text-foreground">
                      • {doctor.name}
                      {doctor.facilities.length > 0 && (
                        <span className="text-muted-foreground ml-2">
                          ({doctor.facilities.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No doctors assigned to this practice
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {isEditing && <div className="border-t border-border my-6" />}

          <div>
            <OpeningHoursEditor
              openingHours={openingHours}
              onChange={setOpeningHours}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Vacation Periods */}
          <div>
            <VacationManager
              vacationPeriods={vacationPeriods}
              onChange={setVacationPeriods}
              doctors={practiceDoctors}
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
            {isEditing ? 'Update Practice' : 'Create Practice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeForm;
