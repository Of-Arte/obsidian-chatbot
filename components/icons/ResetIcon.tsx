
import React from 'react';

const ResetIcon: React.FC = () => (
  <svg 
    className="w-6 h-6" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M4 4v5h5M20 20v-5h-5M4 4l16 16"
    ></path>
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 4v5h-5M4 20v-5h5M4 20L20 4"
    ></path>
  </svg>
);

export default ResetIcon;
