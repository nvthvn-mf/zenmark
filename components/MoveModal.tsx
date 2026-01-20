import React, { useMemo } from 'react';
import { Folder } from '../types';
import Icon from './Icon';

interface MoveModalProps {
    itemToMove: { id: string; name: string; type: 'file' | 'folder' } | null;
    folders: Folder[]; // Tous les dossiers disponibles
    onMove: (targetFolderId: string | null) => void;
    onClose: () => void;
}

const MoveModal: React.FC<MoveModalProps> = ({ itemToMove, folders, onMove, onClose }) => {
    if (!itemToMove) return null;

    // Filtrage intelligent :
    // Si on déplace un dossier, on ne doit pas pouvoir le mettre DANS lui-même (sinon boucle infinie)
    const availableFolders = useMemo(() => {
        if (itemToMove.type === 'file') return folders;
        return folders.filter(f => f.id !== itemToMove.id); // On exclut le dossier lui-même
    }, [folders, itemToMove]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Icon name="logout" size={18} /> {/* Icone qui ressemble à une flèche sortante */}
                        Déplacer "{itemToMove.name}" vers...
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Liste des destinations */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">

                    {/* Option 1 : La Racine */}
                    <button
                        onClick={() => onMove(null)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-all text-left group"
                    >
                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Icon name="home" size={20} />
                        </div>
                        <span className="font-medium">Racine (Mes Fichiers)</span>
                    </button>

                    <div className="h-px bg-slate-100 my-2 mx-4" />

                    {/* Option 2 : Les Dossiers */}
                    {availableFolders.length > 0 ? (
                        availableFolders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => onMove(folder.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-all text-left group"
                            >
                                <div className="w-10 h-10 bg-white border border-slate-200 group-hover:border-indigo-200 rounded-lg flex items-center justify-center">
                                    <Icon name="grid" size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium truncate">{folder.name}</span>
                                    {/* Petit helper pour voir si c'est un sous-dossier (si parent_id existe) */}
                                    {folder.parent_id && <span className="text-[10px] text-slate-400">Sous-dossier</span>}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Aucun autre dossier disponible.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MoveModal;