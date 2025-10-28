'use client';

import React, { useState } from 'react';
import { PracticeWithComputed, PracticeActivity, PracticeBatch, PracticeVO, PracticeDoctor } from '@/types';
import OpeningHoursDisplay from '../OpeningHoursDisplay';
import ActivityLogSection from '../ActivityLogSection';
import AddActivityModal from '../AddActivityModal';
import { formatDate } from '@/utils/timeUtils';

interface PracticeCRMModalProps {
  isOpen: boolean;
  practice: PracticeWithComputed | null;
  activities: PracticeActivity[];
  batches: PracticeBatch[];
  vos: PracticeVO[];
  doctors: PracticeDoctor[];
  onClose: () => void;
  onAddActivity: (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => void;
}

const PracticeCRMModal: React.FC<PracticeCRMModalProps> = ({
  isOpen,
  practice,
  activities,
  batches,
  vos,
  doctors,
  onClose,
  onAddActivity
}) => {
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    contact: true,
    hours: true,
    doctors: true,
    keyContacts: true,
    stats: true,
    notes: true,
    activities: true,
    batches: true
  });

  if (!isOpen || !practice) return null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddActivity = (activity: Omit<PracticeActivity, 'id' | 'createdAt'>) => {
    onAddActivity(activity);
    setIsAddActivityModalOpen(false);
  };

  // Get pending VOs
  const pendingVOs = vos.filter(vo => vo.status === 'Pending');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-card rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{practice.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">Practice Information</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Close"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Content - Split Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Practice Information (40%) */}
            <div className="w-[40%] border-r border-border overflow-y-auto p-6 space-y-6">

              {/* Contact Information */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('contact')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  <span className="text-muted-foreground">{expandedSections.contact ? '▲' : '▼'}</span>
                </button>

                {expandedSections.contact && (
                  <div className="space-y-2 pl-2">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📍</span>
                      <div className="text-foreground">
                        <div>{practice.address.street}</div>
                        <div>{practice.address.city}, {practice.address.state} {practice.address.zip}</div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📞</span>
                      <a
                        href={`tel:${practice.phone}`}
                        className="text-primary hover:underline"
                      >
                        {practice.phone}
                      </a>
                    </div>

                    {/* Fax */}
                    {practice.fax && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">📠</span>
                        <span className="text-foreground">{practice.fax}</span>
                      </div>
                    )}

                    {/* Email */}
                    {practice.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">✉️</span>
                        <a
                          href={`mailto:${practice.email}`}
                          className="text-primary hover:underline"
                        >
                          {practice.email}
                        </a>
                      </div>
                    )}

                    {/* Preferred Contact Method */}
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⭐</span>
                      <span className="text-foreground">
                        Preferred: {practice.preferredContactMethod === 'phone' ? 'Phone' :
                                   practice.preferredContactMethod === 'fax' ? 'Fax' : 'Email'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Opening Hours */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('hours')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Opening Hours</h3>
                  <span className="text-muted-foreground">{expandedSections.hours ? '▲' : '▼'}</span>
                </button>

                {expandedSections.hours && (
                  <div className="pl-2">
                    <OpeningHoursDisplay openingHours={practice.openingHours} prominent />
                  </div>
                )}
              </div>

              {/* Doctors */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('doctors')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Doctors</h3>
                  <span className="text-muted-foreground">{expandedSections.doctors ? '▲' : '▼'}</span>
                </button>

                {expandedSections.doctors && (
                  <div className="pl-2 space-y-2">
                    {doctors.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No doctors assigned</p>
                    ) : (
                      doctors.map(doctor => (
                        <div key={doctor.id} className="border border-border rounded-md p-3">
                          <div className="font-medium text-foreground">{doctor.name}</div>
                          {doctor.specialty && (
                            <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                          )}
                          {doctor.facilities && doctor.facilities.length > 0 && (
                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Facilities:</span> {doctor.facilities.join(', ')}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Key Contacts */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('keyContacts')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Key Contacts</h3>
                  <span className="text-muted-foreground">{expandedSections.keyContacts ? '▲' : '▼'}</span>
                </button>

                {expandedSections.keyContacts && (
                  <div className="pl-2 space-y-2">
                    {practice.keyContacts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No key contacts</p>
                    ) : (
                      practice.keyContacts.map((contact, index) => (
                        <div key={index} className="border border-border rounded-md p-3">
                          <div className="font-medium text-foreground">{contact.name}</div>
                          {contact.role && (
                            <div className="text-sm text-muted-foreground">{contact.role}</div>
                          )}
                          {contact.phone && (
                            <div className="text-sm text-foreground">
                              📞 {contact.phone}
                              {contact.extension && <span> ext. {contact.extension}</span>}
                            </div>
                          )}
                          {contact.email && (
                            <div className="text-sm text-foreground">✉️ {contact.email}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('stats')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                  <span className="text-muted-foreground">{expandedSections.stats ? '▲' : '▼'}</span>
                </button>

                {expandedSections.stats && (
                  <div className="pl-2 grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-md p-3">
                      <div className="text-2xl font-bold text-foreground">{practice.pendingVOCount}</div>
                      <div className="text-sm text-muted-foreground">Pending FVOs</div>
                    </div>
                    <div className="bg-muted rounded-md p-3">
                      <div className="text-2xl font-bold text-foreground">{practice.activeBatchCount}</div>
                      <div className="text-sm text-muted-foreground">Active Batches</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {practice.notes && (
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('notes')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="text-lg font-semibold text-foreground">Notes</h3>
                    <span className="text-muted-foreground">{expandedSections.notes ? '▲' : '▼'}</span>
                  </button>

                  {expandedSections.notes && (
                    <div className="pl-2">
                      <p className="text-foreground whitespace-pre-wrap">{practice.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side - Activities & Batches (60%) */}
            <div className="w-[60%] overflow-y-auto p-6 space-y-6">

              {/* Activity Log */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('activities')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
                  <span className="text-muted-foreground">{expandedSections.activities ? '▲' : '▼'}</span>
                </button>

                {expandedSections.activities && (
                  <ActivityLogSection
                    activities={activities}
                    onAddActivity={() => setIsAddActivityModalOpen(true)}
                  />
                )}
              </div>

              {/* Pending Batches */}
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('batches')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">Pending Batches</h3>
                  <span className="text-muted-foreground">{expandedSections.batches ? '▲' : '▼'}</span>
                </button>

                {expandedSections.batches && (
                  <div className="space-y-2">
                    {batches.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No pending batches</p>
                    ) : (
                      batches.map(batch => {
                        const batchVOs = vos.filter(vo => vo.batchId === batch.id);
                        const pendingCount = batchVOs.filter(vo => vo.status === 'Pending').length;

                        return (
                          <div key={batch.id} className="border border-border rounded-md p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-foreground">
                                  Batch sent {formatDate(batch.sentDate)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  via {batch.deliveryMethod}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-foreground">{pendingCount}</div>
                                <div className="text-xs text-muted-foreground">pending</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {batchVOs.length} total FVOs in batch
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        onSave={handleAddActivity}
        practiceId={practice.id}
      />
    </>
  );
};

export default PracticeCRMModal;
