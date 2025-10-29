import React from 'react';

interface PhoneCellProps {
  phone: string;
}

const PhoneCell: React.FC<PhoneCellProps> = ({ phone }) => {
  return <div className="text-sm text-foreground">{phone}</div>;
};

export default PhoneCell;
