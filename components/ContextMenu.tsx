import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface ContextMenuProps {
    onRename: () => void;
    onDelete: () => void;
    onMove: () => void;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ onRename, onDelete, onMove, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute right-2 top-10 bg-white rounded-lg shadow-xl border border-slate-200 z-50 w-40 overflow-hidden py-1 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()} // Empêche le clic de traverser vers le dossier
        >
            <button
                onClick={onRename}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
            >
                <Icon name="file" size={14} /> {/* Faute d'icone 'edit', file fait l'affaire */}
                Renommer
            </button>

            <button
                onClick={onMove}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
            >
                <Icon name="logout" size={14} /> {/* Icone flèche/sortie pour 'Déplacer' */}
                Déplacer
            </button>

            <div className="h-px bg-slate-100 my-1 mx-2" />

            <button
                onClick={onDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
                <Icon name="trash" size={14} />
                Supprimer
            </button>
        </div>
    );
};

export default ContextMenu;