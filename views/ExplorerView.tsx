import React, { useState, useEffect, useCallback } from 'react';
import { Document, Folder } from '../types';
import { FolderController } from '../controllers/FolderController';
import Icon from '../components/Icon';

interface ExplorerViewProps {
    user: any;
    documents: Document[];
    onOpenDocument: (doc: Document) => void;
    onBack: () => void;
    onCreateDocument: (folderId: string | null) => void; // <--- 1. Nouvelle prop
}

const ExplorerView: React.FC<ExplorerViewProps> = ({
                                                       user,
                                                       documents,
                                                       onOpenDocument,
                                                       onBack,
                                                       onCreateDocument // <--- 2. Récupération
                                                   }) => {
    // ... (États existants inchangés) ...
    const [currentPath, setCurrentPath] = useState<Folder[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // ... (loadFolders et useEffect inchangés) ...
    const loadFolders = useCallback(async () => {
        // ... (code existant)
        try {
            setLoading(true);
            const allFolders = await FolderController.getAllFolders(user.id);
            setFolders(allFolders);
        } catch (err) {
            console.error("Erreur chargement dossiers", err);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    const currentFolders = folders.filter(f => f.parent_id === currentFolderId);

    // Note : On filtre aussi les documents supprimés pour ne pas les voir ici
    const currentDocs = documents.filter(d => (d.folderId || null) === currentFolderId && !d.isDeleted);

    // ... (handleCreateFolder, navigateToFolder, navigateUp inchangés) ...
    const handleCreateFolder = async (e: React.FormEvent) => {
        // ... (code existant)
        e.preventDefault();
        if (!newFolderName.trim()) return;
        try {
            await FolderController.createFolder(user.id, newFolderName, currentFolderId);
            setNewFolderName('');
            setIsCreatingFolder(false);
            await loadFolders();
        } catch (err) {
            alert("Erreur lors de la création du dossier");
        }
    };

    const navigateToFolder = (folder: Folder) => {
        setCurrentPath([...currentPath, folder]);
    };

    const navigateUp = (index: number) => {
        if (index === -1) {
            setCurrentPath([]);
        } else {
            setCurrentPath(currentPath.slice(0, index + 1));
        }
    };

    return (
        <div className="flex-1 h-full flex flex-col bg-slate-50">

            {/* BARRE D'OUTILS */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">

                {/* Fil d'Ariane */}
                <div className="flex items-center gap-2 text-sm text-slate-600 overflow-x-auto no-scrollbar flex-1 mr-4">
                    <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg mr-2" title="Retour Dashboard">
                        <Icon name="home" size={18} />
                    </button>

                    <button
                        onClick={() => navigateUp(-1)}
                        className={`hover:text-indigo-600 font-medium ${currentPath.length === 0 ? 'text-indigo-600' : ''}`}
                    >
                        Mes Fichiers
                    </button>

                    {currentPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <span className="text-slate-300">/</span>
                            <button
                                onClick={() => navigateUp(index)}
                                className={`hover:text-indigo-600 font-medium whitespace-nowrap ${index === currentPath.length - 1 ? 'text-indigo-600' : ''}`}
                            >
                                {folder.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Boutons d'action (MODIFIÉ) */}
                <div className="flex items-center gap-2">
                    {/* Nouveau Fichier */}
                    <button
                        onClick={() => onCreateDocument(currentFolderId)} // <--- Appel avec le dossier courant
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm shadow-indigo-200"
                    >
                        <Icon name="plus" size={16} /> Fichier
                    </button>

                    {/* Nouveau Dossier */}
                    <button
                        onClick={() => setIsCreatingFolder(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                        <Icon name="grid" size={16} /> Dossier
                    </button>
                </div>
            </div>

            {/* ZONE DE CONTENU */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Formulaire création dossier */}
                {isCreatingFolder && (
                    <form onSubmit={handleCreateFolder} className="mb-6 max-w-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center">
                                <Icon name="grid" size={20} />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nom du dossier..."
                                className="flex-1 px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                            />
                            <button type="submit" className="hidden">Valider</button>
                        </div>
                    </form>
                )}

                {/* LISTE DES ÉLÉMENTS */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

                    {/* Dossiers */}
                    {currentFolders.map(folder => (
                        <div
                            key={folder.id}
                            onClick={() => navigateToFolder(folder)}
                            className="group cursor-pointer bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
                        >
                            <div className="w-16 h-12 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors relative">
                                <div className="absolute top-0 left-0 w-6 h-3 bg-inherit rounded-t-md -mt-1 ml-2"></div>
                                <Icon name="grid" size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate w-full px-2 select-none">
                {folder.name}
              </span>
                        </div>
                    ))}

                    {/* Fichiers */}
                    {currentDocs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => onOpenDocument(doc)}
                            className="group cursor-pointer bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
                        >
                            <div className="w-12 h-14 bg-white border border-slate-200 relative shadow-sm group-hover:-translate-y-1 transition-transform">
                                <div className="absolute top-0 right-0 border-t-[12px] border-r-[12px] border-t-slate-100 border-r-slate-50"></div>
                                <div className="p-1 mt-2 text-[6px] text-slate-300 space-y-1 overflow-hidden h-full">
                                    <div className="h-0.5 bg-current w-3/4"></div>
                                    <div className="h-0.5 bg-current w-full"></div>
                                    <div className="h-0.5 bg-current w-5/6"></div>
                                    <div className="h-0.5 bg-current w-full"></div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full">
                <span className="text-sm font-medium text-slate-700 truncate w-full px-2 select-none">
                  {doc.title || 'Sans titre'}
                </span>
                                <span className="text-[10px] text-slate-400">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                    ))}

                    {/* État Vide */}
                    {currentFolders.length === 0 && currentDocs.length === 0 && !isCreatingFolder && (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-block p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
                                <Icon name="search" size={24} />
                            </div>
                            <p className="text-slate-500 mb-4">Ce dossier est vide.</p>
                            <button
                                onClick={() => onCreateDocument(currentFolderId)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                            >
                                Créer un premier fichier
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExplorerView;