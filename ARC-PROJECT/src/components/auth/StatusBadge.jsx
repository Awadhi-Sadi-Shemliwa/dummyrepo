import React from 'react';

const statusStyles = {
  green: 'border-brand-gold text-brand-gold bg-brand-gold/10',
  orange: 'border-brand-gold/60 text-brand-gold bg-brand-gold/10',
  red: 'border-brand-red text-brand-red bg-brand-red/10',
};

const StatusBadge = ({ status, label }) => {
  const style = statusStyles[status] || statusStyles.orange;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;