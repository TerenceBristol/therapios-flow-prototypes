'use client';

import React, { useState, useEffect } from 'react';
import { Practice, PracticeKeyContact, OpeningHours } from '@/types';
import OpeningHoursEditor from '../OpeningHoursEditor';
import { createDefaultOpeningHours } from '@/utils/openingHoursUtils';
import Link from 'next/link';

interface PracticeFormProps {
  initialData?: Practice | null;
  onSave: (practice: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const PracticeForm: React.FC<PracticeFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [practiceId, setPracticeId] = useState<string>('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(createDefaultOpeningHours());
  const [keyContacts, setKeyContacts] = useState<PracticeKeyContact[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setPracticeId(initialData.practiceId?.toString() || '');
      setName(initialData.name);
      setAddress(initialData.address || '');
      setPhone(initialData.phone);
      setFax(initialData.fax || '');
      setEmail(initialData.email || '');
      setOpeningHours(initialData.openingHours);
      setKeyContacts(initialData.keyContacts);
    }
  }, [initialData]);

  const addKeyContact = () => {
    setKeyContacts([
      ...keyContacts,
      { name: '', role: '', phone: '', extension: '', email: '' }
    ]);
  };

  const updateKeyContact = (index: number, field: keyof PracticeKeyContact, value: string) => {
    const updated = [...keyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setKeyContacts(updated);
  };

  const removeKeyContact = (index: number) => {
    setKeyContacts(keyContacts.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Practice name is required (min 2 characters)';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone is required';
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

    onSave({
      practiceId: practiceId ? parseInt(practiceId) : undefined,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      fax: fax.trim() || undefined,
      email: email.trim() || undefined,
      openingHours,
      keyContacts: keyContacts.filter(c => c.name.trim())
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

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.phone ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Opening Hours
            </label>
            <OpeningHoursEditor
              openingHours={openingHours}
              onChange={setOpeningHours}
            />
          </div>

          {/* Key Contacts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Key Contacts
              </label>
              <button
                type="button"
                onClick={addKeyContact}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                + Add Contact
              </button>
            </div>

            {keyContacts.map((contact, index) => (
              <div key={index} className="mb-3 p-3 border border-border rounded-md bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Contact {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyContact(index)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateKeyContact(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={contact.role || ''}
                    onChange={(e) => updateKeyContact(index, 'role', e.target.value)}
                    placeholder="Role"
                    className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="tel"
                    value={contact.phone || ''}
                    onChange={(e) => updateKeyContact(index, 'phone', e.target.value)}
                    placeholder="Phone"
                    className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={contact.extension || ''}
                    onChange={(e) => updateKeyContact(index, 'extension', e.target.value)}
                    placeholder="Extension"
                    className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => updateKeyContact(index, 'email', e.target.value)}
                    placeholder="Email"
                    className="col-span-2 px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
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
