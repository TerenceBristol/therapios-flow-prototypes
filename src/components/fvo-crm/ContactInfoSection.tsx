import React, { useState } from 'react';
import { Practice } from '@/types';
import { getHoursSummary } from '@/utils/openingHoursUtils';

interface ContactInfoSectionProps {
  practice: Practice;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ practice }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatAddress = () => {
    const { street, city, state, zip } = practice.address;
    return `${street}, ${city}, ${state} ${zip}`;
  };

  const getPreferredMethodLabel = () => {
    switch (practice.preferredContactMethod) {
      case 'fax':
        return '📠 Fax';
      case 'email':
        return '📧 Email';
      case 'phone':
        return '📞 Phone';
    }
  };

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Contact Information
        </h3>
        <span className="text-muted-foreground text-sm">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div className="space-y-2 text-sm">
          {/* Address */}
          <div className="flex items-start gap-2">
            <span className="text-lg">🏥</span>
            <span className="text-foreground">{formatAddress()}</span>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-2">
            <span className="text-lg">📞</span>
            <a
              href={`tel:${practice.phone}`}
              className="text-foreground hover:text-primary hover:underline"
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
              <span className="text-lg">📧</span>
              <a
                href={`mailto:${practice.email}`}
                className="text-foreground hover:text-primary hover:underline"
              >
                {practice.email}
              </a>
            </div>
          )}

          {/* Hours */}
          <div className="flex items-start gap-2">
            <span className="text-lg">⏰</span>
            <span className="text-foreground">
              {getHoursSummary(practice.openingHours)}
            </span>
          </div>

          {/* Preferred Contact Method */}
          <div className="flex items-start gap-2">
            <span className="text-lg">⭐</span>
            <span className="text-foreground">Preferred: {getPreferredMethodLabel()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfoSection;
