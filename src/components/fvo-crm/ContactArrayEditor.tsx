'use client';

import React, { useState } from 'react';
import { PracticeContact } from '@/types';

interface ContactArrayEditorProps {
  contacts: PracticeContact[];
  onChange: (contacts: PracticeContact[]) => void;
  error?: string;
}

const ContactArrayEditor: React.FC<ContactArrayEditorProps> = ({
  contacts,
  onChange,
  error
}) => {
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const addContact = () => {
    const newContact: PracticeContact = {
      id: `contact-${Date.now()}`,
      name: '',
      phone: '',
      role: '',
      note: '',
      isPrimary: contacts.length === 0 // First contact is primary by default
    };
    onChange([...contacts, newContact]);
    setExpandedContactId(newContact.id);
  };

  const removeContact = (id: string) => {
    const updatedContacts = contacts.filter(c => c.id !== id);

    // If removing primary contact, make first remaining contact primary
    const wasPrimary = contacts.find(c => c.id === id)?.isPrimary;
    if (wasPrimary && updatedContacts.length > 0) {
      updatedContacts[0].isPrimary = true;
    }

    onChange(updatedContacts);
  };

  const updateContact = (id: string, field: keyof PracticeContact, value: string | boolean) => {
    const updatedContacts = contacts.map(c => {
      if (c.id === id) {
        // If setting this contact as primary, unset others
        if (field === 'isPrimary' && value === true) {
          return { ...c, isPrimary: true };
        }
        return { ...c, [field]: value };
      } else if (field === 'isPrimary' && value === true) {
        // Unset primary on other contacts
        return { ...c, isPrimary: false };
      }
      return c;
    });
    onChange(updatedContacts);
  };

  const toggleExpanded = (id: string) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-foreground">
          Contact Numbers *
        </label>
        <button
          type="button"
          onClick={addContact}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          + Add Contact
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-2">{error}</p>
      )}

      {contacts.length === 0 ? (
        <div className="border border-border rounded-md p-4 text-center text-muted-foreground text-sm">
          No contacts added. Click &quot;Add Contact&quot; to add a phone number.
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact, index) => (
            <div
              key={contact.id}
              className="border border-border rounded-md bg-background"
            >
              {/* Contact Header (Always Visible) */}
              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpanded(contact.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-foreground">
                    {contact.phone || <span className="text-muted-foreground italic">No phone</span>}
                  </span>
                  {contact.isPrimary && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  {contact.name && (
                    <span className="text-sm text-muted-foreground">
                      • {contact.name}
                    </span>
                  )}
                  {contact.role && (
                    <span className="text-sm text-muted-foreground">
                      ({contact.role})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeContact(contact.id);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm px-2 py-1"
                  >
                    Remove
                  </button>
                  <span className="text-muted-foreground">
                    {expandedContactId === contact.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Contact Details (Expandable) */}
              {expandedContactId === contact.id && (
                <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                      placeholder="+49 123 456789"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                      placeholder="e.g., Maria, Front Desk"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={contact.role || ''}
                      onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                      placeholder="e.g., Receptionist, Manager"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Note
                    </label>
                    <input
                      type="text"
                      value={contact.note || ''}
                      onChange={(e) => updateContact(contact.id, 'note', e.target.value)}
                      placeholder="e.g., Best for scheduling, Available mornings only"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Primary Contact Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`primary-${contact.id}`}
                      checked={contact.isPrimary}
                      onChange={(e) => updateContact(contact.id, 'isPrimary', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <label
                      htmlFor={`primary-${contact.id}`}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Set as primary contact
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        Add multiple contact numbers with optional names and notes. One contact must be marked as primary.
      </p>
    </div>
  );
};

export default ContactArrayEditor;
