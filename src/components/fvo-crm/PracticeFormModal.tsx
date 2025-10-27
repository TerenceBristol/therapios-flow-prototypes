import React, { useState, useEffect } from 'react';
import { Practice, PracticeKeyContact, PreferredContactMethod } from '@/types';

interface PracticeFormModalProps {
  isOpen: boolean;
  practice?: Practice | null;
  onClose: () => void;
  onSave: (practice: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const PracticeFormModal: React.FC<PracticeFormModalProps> = ({
  isOpen,
  practice,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>('phone');
  const [keyContacts, setKeyContacts] = useState<PracticeKeyContact[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load practice data if editing
  useEffect(() => {
    if (isOpen) {
      if (practice) {
        setName(practice.name);
        setStreet(practice.address.street);
        setCity(practice.address.city);
        setState(practice.address.state);
        setZip(practice.address.zip);
        setPhone(practice.phone);
        setFax(practice.fax || '');
        setEmail(practice.email || '');
        setHours(practice.hours || '');
        setPreferredContactMethod(practice.preferredContactMethod);
        setKeyContacts(practice.keyContacts);
        setNotes(practice.notes || '');
      } else {
        // Reset form for new practice
        setName('');
        setStreet('');
        setCity('');
        setState('');
        setZip('');
        setPhone('');
        setFax('');
        setEmail('');
        setHours('');
        setPreferredContactMethod('phone');
        setKeyContacts([]);
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, practice]);

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

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // At least one contact method required
    if (!phone.trim() && !fax.trim() && !email.trim()) {
      newErrors.general = 'At least one contact method (phone, fax, or email) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      name: name.trim(),
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim()
      },
      phone: phone.trim(),
      fax: fax.trim() || undefined,
      email: email.trim() || undefined,
      hours: hours.trim() || undefined,
      preferredContactMethod,
      keyContacts: keyContacts.filter(c => c.name.trim()),
      notes: notes.trim() || undefined
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {practice ? 'Edit Practice' : 'Add New Practice'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {errors.general}
              </div>
            )}

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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
              <label className="block text-sm font-medium text-foreground mb-1">
                Hours
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., Mon-Fri 8am-5pm"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preferred Contact Method *
              </label>
              <select
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value as PreferredContactMethod)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="fax">Fax</option>
              </select>
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                {practice ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PracticeFormModal;
