import React from 'react';
import { PracticeKeyContact } from '@/types';

interface PhoneCellProps {
  phone: string;
  keyContact?: PracticeKeyContact;
}

const PhoneCell: React.FC<PhoneCellProps> = ({ phone, keyContact }) => {
  const mainPhone = phone;

  if (!keyContact) {
    return <div className="text-sm text-foreground">{mainPhone}</div>;
  }

  const extension = keyContact.extension ? ` ext. ${keyContact.extension}` : '';
  const contactName = keyContact.name.split(' ')[0]; // First name only

  return (
    <div className="text-sm text-foreground">
      <div className="font-medium">{mainPhone}</div>
      <div className="text-xs text-muted-foreground">
        {contactName}
        {extension}
      </div>
    </div>
  );
};

export default PhoneCell;
