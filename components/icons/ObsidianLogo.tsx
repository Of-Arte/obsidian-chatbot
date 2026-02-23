import React from 'react';

const ObsidianLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="24" height="24" fill="black" />
        </svg>
    );
};

export default ObsidianLogo;
