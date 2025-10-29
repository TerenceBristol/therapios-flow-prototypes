import React, { useState, useEffect } from 'react';
import { PracticeDoctor, Practice } from '@/types';

interface DoctorFormModalProps {
  isOpen: boolean;
  practices: Practice[];
  onClose: () => void;
  onSave: (doctorData: Omit<PracticeDoctor, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  practices,
  onClose,
  onSave
}) => {
  // Form state
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [practiceId, setPracticeId] = useState<string | undefined>(undefined);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSpecialty('');
      setPhone('');
      setEmail('');
      setPracticeId(undefined);
      setFacilities([]);
      setNotes('');
      setNewFacility('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Doctor name is required (min 2 characters)';
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
      name: name.trim(),
      practiceId,
      facilities,
      phone: phone || undefined,
      email: email || undefined,
      specialty: specialty || undefined,
      notes: notes || undefined
    });

    onClose();
  };

  const selectPractice = (newPracticeId: string) => {
    setPracticeId(newPracticeId === practiceId ? undefined : newPracticeId);
  };

  const addFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()]);
      setNewFacility('');
    }
  };

  const removeFacility = (facility: string) => {
    setFacilities(facilities.filter(f => f !== facility));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-[90%] max-w-3xl max-h-[90%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Add New Doctor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Basic Information
            </h3>
            <div className="space-y-3">
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., Internal Medicine"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
          <div className="border-t border-border my-6" />

          {/* Practices */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Assign to Practices
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
              {practices.map(practice => (
                <label key={practice.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={practiceId === practice.id}
                    onChange={() => selectPractice(practice.id)}
                    className="w-4 h-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{practice.name}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Selected: {practiceId ? '1 practice' : 'None'}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Facilities */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Facilities / ERs
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                placeholder="Type facility name and press Enter"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={addFacility}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
            {facilities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {facilities.map(facility => (
                  <div
                    key={facility}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-full text-sm"
                  >
                    <span className="text-foreground">{facility}</span>
                    <button
                      onClick={() => removeFacility(facility)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No facilities added yet</div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
              Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes about this doctor..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Create Doctor
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;
