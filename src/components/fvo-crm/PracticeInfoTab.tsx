import React from 'react';
import { PracticeWithComputed, PracticeDoctor } from '@/types';
import OpeningHoursDisplay from './OpeningHoursDisplay';
import VacationBanner from './VacationBanner';

interface PracticeInfoTabProps {
  practice: PracticeWithComputed;
  doctors: PracticeDoctor[];
}

const PracticeInfoTab: React.FC<PracticeInfoTabProps> = ({ practice, doctors }) => {

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      {/* Single-Column Layout */}
      <div className="space-y-6">

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
              <span>📞</span> Contact Information
            </h3>

            <div className="space-y-3 pl-2 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg p-4 border border-border shadow-sm">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <div className="text-foreground">
                    {practice.address}
                  </div>
                </div>

                {/* Contact Numbers */}
                {practice.contacts && practice.contacts.length > 0 ? (
                  <div className="space-y-2">
                    {practice.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-2 p-2 rounded-md border border-transparent hover:border-border hover:bg-background/50 transition-all"
                      >
                        <span className="text-lg">📞</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-primary hover:underline font-medium"
                            >
                              {contact.phone}
                            </a>
                            {contact.isPrimary && (
                              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          {(contact.name || contact.role) && (
                            <div className="text-sm text-muted-foreground">
                              {contact.name}
                              {contact.name && contact.role && ' • '}
                              {contact.role}
                            </div>
                          )}
                          {contact.note && (
                            <div className="text-xs text-muted-foreground mt-0.5 italic">
                              {contact.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : practice.phone ? (
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📞</span>
                    <a
                      href={`tel:${practice.phone}`}
                      className="text-primary hover:underline"
                    >
                      {practice.phone}
                    </a>
                  </div>
                ) : null}

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
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
              <span>🕒</span> Opening Hours
            </h3>
            <div>
              <OpeningHoursDisplay openingHours={practice.openingHours} />
            </div>
          </div>

          {/* Doctors */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
              <span>👨‍⚕️</span> Doctors ({doctors.length})
            </h3>
            <div className="space-y-2">
              {doctors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No doctors assigned</p>
              ) : (
                doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className="border border-border rounded-md px-3 py-2 bg-background hover:border-primary/50 hover:shadow-sm transition-all"
                  >
                    {/* Compact Single-Line Format */}
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {doctor.name} • {doctor.specialty || 'General Practice'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                        {doctor.phone && (
                          <a href={`tel:${doctor.phone}`} className="text-primary hover:underline flex items-center gap-1">
                            <span>📞</span> {doctor.phone}
                          </a>
                        )}
                        {doctor.email && (
                          <a href={`mailto:${doctor.email}`} className="text-primary hover:underline flex items-center gap-1">
                            <span>✉️</span> {doctor.email}
                          </a>
                        )}
                        {doctor.facilities && doctor.facilities.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>🏥</span> {doctor.facilities.length} {doctor.facilities.length === 1 ? 'ER' : 'ERs'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vacation Schedule */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
              <span>🏖️</span> Vacation Schedule
            </h3>
            <div>
              <VacationBanner
                vacationPeriods={practice.vacationPeriods || []}
                doctors={doctors}
              />
            </div>
          </div>
      </div>
    </div>
  );
};

export default PracticeInfoTab;
