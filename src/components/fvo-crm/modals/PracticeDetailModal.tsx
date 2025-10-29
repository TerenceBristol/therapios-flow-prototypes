import React, { useState, useEffect } from 'react';
import {
  Practice,
  PracticeWithComputed,
  PracticeActivity,
  PracticeBatch,
  PracticeVO,
  PracticeDoctor,
  PracticeKeyContact,
  PreferredContactMethod,
  OpeningHours
} from '@/types';
import OpeningHoursDisplay from '../OpeningHoursDisplay';
import OpeningHoursEditor from '../OpeningHoursEditor';
import ActivityLogSection from '../ActivityLogSection';
import PendingBatchesSection from '../PendingBatchesSection';
import QuickStatsSection from '../QuickStatsSection';
import { createDefaultOpeningHours } from '@/utils/openingHoursUtils';

interface PracticeDetailModalProps {
  isOpen: boolean;
  practice: PracticeWithComputed | null;
  activities: PracticeActivity[];
  batches: PracticeBatch[];
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  allDoctors: PracticeDoctor[];
  onClose: () => void;
  onSave: (practiceData: Omit<Practice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddActivity: () => void;
}

const PracticeDetailModal: React.FC<PracticeDetailModalProps> = ({
  isOpen,
  practice,
  activities,
  batches,
  vos,
  doctors,
  allDoctors,
  onClose,
  onSave,
  onAddActivity
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(createDefaultOpeningHours());
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>('phone');
  const [keyContacts, setKeyContacts] = useState<PracticeKeyContact[]>([]);
  const [assignedDoctorIds, setAssignedDoctorIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Load practice data when modal opens or practice changes
  useEffect(() => {
    if (practice && isOpen) {
      setName(practice.name);
      setPhone(practice.phone);
      setFax(practice.fax || '');
      setEmail(practice.email || '');
      const addressParts = practice.address.split(',').map(s => s.trim());
      setStreet(addressParts[0] || '');
      setCity(addressParts[1] || '');
      const stateZip = (addressParts[2] || '').split(' ');
      setState(stateZip[0] || '');
      setZip(stateZip[1] || '');
      setOpeningHours(practice.openingHours);
      setPreferredContactMethod(practice.preferredContactMethod);
      setKeyContacts(practice.keyContacts);
      setAssignedDoctorIds(practice.doctors.map(d => d.id));
      setNotes(practice.notes || '');
      setIsEditMode(false);
    }
  }, [practice, isOpen]);

  const handleSave = () => {
    if (!practice) return;

    onSave({
      name,
      phone,
      fax: fax || undefined,
      email: email || undefined,
      address: `${street}, ${city}, ${state} ${zip}`,
      openingHours,
      preferredContactMethod,
      keyContacts,
      notes: notes || undefined
    });

    setIsEditMode(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (practice) {
      setName(practice.name);
      setPhone(practice.phone);
      setFax(practice.fax || '');
      setEmail(practice.email || '');
      const addressParts = practice.address.split(',').map(s => s.trim());
      setStreet(addressParts[0] || '');
      setCity(addressParts[1] || '');
      const stateZip = (addressParts[2] || '').split(' ');
      setState(stateZip[0] || '');
      setZip(stateZip[1] || '');
      setOpeningHours(practice.openingHours);
      setPreferredContactMethod(practice.preferredContactMethod);
      setKeyContacts(practice.keyContacts);
      setAssignedDoctorIds(practice.doctors.map(d => d.id));
      setNotes(practice.notes || '');
    }
    setIsEditMode(false);
  };

  const addKeyContact = () => {
    setKeyContacts([...keyContacts, { name: '', role: '', phone: '', extension: '', email: '' }]);
  };

  const updateKeyContact = (index: number, field: keyof PracticeKeyContact, value: string) => {
    const updated = [...keyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setKeyContacts(updated);
  };

  const removeKeyContact = (index: number) => {
    setKeyContacts(keyContacts.filter((_, i) => i !== index));
  };

  const toggleDoctorAssignment = (doctorId: string) => {
    if (assignedDoctorIds.includes(doctorId)) {
      setAssignedDoctorIds(assignedDoctorIds.filter(id => id !== doctorId));
    } else {
      setAssignedDoctorIds([...assignedDoctorIds, doctorId]);
    }
  };

  if (!isOpen || !practice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-2xl w-[95%] h-[95%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Practice' : practice.name}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Edit practice"
              >
                ✏️
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - 40% */}
          <div className="w-[40%] border-r border-border overflow-y-auto p-6">
            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Contact Information
              </h3>
              {isEditMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Practice Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
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
                  <div className="grid grid-cols-2 gap-3">
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
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      value={preferredContactMethod}
                      onChange={(e) => setPreferredContactMethod(e.target.value as PreferredContactMethod)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="phone">📞 Phone</option>
                      <option value="fax">📠 Fax</option>
                      <option value="email">📧 Email</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🏥</span>
                    <span className="text-foreground">
                      {practice.address}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📞</span>
                    <span className="text-foreground">{practice.phone}</span>
                  </div>
                  {practice.fax && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📠</span>
                      <span className="text-foreground">{practice.fax}</span>
                    </div>
                  )}
                  {practice.email && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📧</span>
                      <span className="text-foreground">{practice.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-foreground">
                      Preferred: {practice.preferredContactMethod === 'phone' ? '📞 Phone' : practice.preferredContactMethod === 'fax' ? '📠 Fax' : '📧 Email'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Opening Hours */}
            <div className="mb-6">
              {isEditMode ? (
                <OpeningHoursEditor
                  openingHours={openingHours}
                  onChange={setOpeningHours}
                />
              ) : (
                <OpeningHoursDisplay openingHours={practice.openingHours} prominent={true} />
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Doctors at Practice */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Doctors at this Practice
              </h3>
              {isEditMode ? (
                <div className="space-y-2">
                  {allDoctors.map(doctor => (
                    <label key={doctor.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignedDoctorIds.includes(doctor.id)}
                        onChange={() => toggleDoctorAssignment(doctor.id)}
                        className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{doctor.name}</div>
                        {doctor.facilities.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Facilities: {doctor.facilities.join(', ')}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                doctors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No doctors listed</div>
                ) : (
                  <div className="space-y-2">
                    {doctors.map(doctor => (
                      <div key={doctor.id} className="text-sm">
                        <div className="font-medium text-foreground">• {doctor.name}</div>
                        {doctor.facilities.length > 0 && (
                          <div className="ml-3 text-xs text-muted-foreground">
                            Facilities: {doctor.facilities.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Key Contacts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Key Contacts
                </h3>
                {isEditMode && (
                  <button
                    onClick={addKeyContact}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    + Add
                  </button>
                )}
              </div>
              {isEditMode ? (
                <div className="space-y-3">
                  {keyContacts.map((contact, index) => (
                    <div key={index} className="p-3 border border-border rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Contact {index + 1}</span>
                        <button
                          onClick={() => removeKeyContact(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateKeyContact(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={contact.role || ''}
                        onChange={(e) => updateKeyContact(index, 'role', e.target.value)}
                        placeholder="Role (optional)"
                        className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="tel"
                          value={contact.phone || ''}
                          onChange={(e) => updateKeyContact(index, 'phone', e.target.value)}
                          placeholder="Phone"
                          className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={contact.extension || ''}
                          onChange={(e) => updateKeyContact(index, 'extension', e.target.value)}
                          placeholder="Ext."
                          className="px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <input
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => updateKeyContact(index, 'email', e.target.value)}
                        placeholder="Email"
                        className="w-full px-2 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                  {keyContacts.length === 0 && (
                    <div className="text-sm text-muted-foreground">No key contacts added yet</div>
                  )}
                </div>
              ) : (
                practice.keyContacts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No key contacts listed</div>
                ) : (
                  <div className="space-y-2">
                    {practice.keyContacts.map((contact, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-foreground">
                          • {contact.name} {contact.role && `(${contact.role})`}
                        </div>
                        {contact.phone && (
                          <div className="ml-3 text-muted-foreground">
                            📞 {contact.phone}{contact.extension && ` ext. ${contact.extension}`}
                          </div>
                        )}
                        {contact.email && (
                          <div className="ml-3 text-muted-foreground">
                            📧 {contact.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* Quick Stats */}
            {!isEditMode && <QuickStatsSection practice={practice} />}

            {/* Divider */}
            {!isEditMode && <div className="border-t border-border my-6" />}

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Notes
              </h3>
              {isEditMode ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this practice..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              ) : (
                practice.notes ? (
                  <div className="text-sm text-foreground p-3 bg-muted/50 rounded-lg border border-border">
                    {practice.notes}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No notes</div>
                )
              )}
            </div>
          </div>

          {/* Right Side - 60% */}
          <div className="w-[60%] overflow-y-auto p-6">
            {!isEditMode && (
              <>
                {/* Activity Log */}
                <ActivityLogSection
                  activities={activities}
                  onAddActivity={onAddActivity}
                />

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Pending Batches */}
                <PendingBatchesSection batches={batches} vos={vos} />
              </>
            )}
          </div>
        </div>

        {/* Footer - Save/Cancel buttons when in edit mode */}
        {isEditMode && (
          <div className="border-t border-border p-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeDetailModal;
