import React from 'react';

const ObsidianLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
    return (
        <svg
            viewBox="0 0 256 256"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Top facets */}
            <path d="M128 16 L208 80 L128 144 Z" fill="#a78bfa" />
            <path d="M128 16 L48 80 L128 144 Z" fill="#8b5cf6" />

            {/* Bottom facets */}
            <path d="M48 80 L128 240 L128 144 Z" fill="#7c3aed" />
            <path d="M208 80 L128 240 L128 144 Z" fill="#5b21b6" />
        </svg>
    );
};

export default ObsidianLogo;
