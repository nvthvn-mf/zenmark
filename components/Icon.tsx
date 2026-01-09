import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = "", size = 20 }) => {
    // Correction: Ajout des Fragments (<>...</>) pour les icônes à multiples éléments
    const icons: Record<string, React.ReactElement> = {
        plus: <path d="M12 5v14M5 12h14" />,
        trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />,
        search: (
            <>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </>
        ),
        cloud: <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5-.5-3.1-3.2-5.5-6.1-5.5-2.7 0-5.1 2-5.8 4.6-2.5.4-4.2 2.5-4.2 5 0 2.8 2.2 5 5 5h10.5z" />,
        cloudOff: <path d="m2 2 20 20M5.782 5.782A7 7 0 0 0 9 18h8.5a4.5 4.5 0 0 0 1.307-.193m2.59-2.59A4.5 4.5 0 0 0 22 14.5c0-2.3-1.7-4.2-3.9-4.5-.5-3.1-3.2-5.5-6.1-5.5-1.58 0-3 0.73-3.9 1.88" />,
        history: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0 0V3m0 5h5" />,
        settings: (
            <>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ),
        download: <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
        more: (
            <>
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
            </>
        ),
        check: <path d="M20 6 9 17l-5-5" />,
        x: <path d="M18 6 6 18M6 6l12 12" />
    };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {icons[name] || null}
        </svg>
    );
};

export default Icon;