import React from 'react';

interface ModeTooltipProps {
  show: boolean;
}

const ModeTooltip: React.FC<ModeTooltipProps> = ({ show }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 rounded-full pointer-events-none animate-pulse-glow"
      aria-hidden="true"
    />
  );
};

export default ModeTooltip;