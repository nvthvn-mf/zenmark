import React from 'react';
import { Document } from '../types';
import Icon from '../components/Icon';

interface DashboardViewProps {
    user: any;
    documents: Document[];
    onOpenDocument: (doc: Document) => void;
    onCreateDocument: () => void;
    onShowExplorer: () => void;
    onDeleteDocument: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
                                                         user,
                                                         documents,
                                                         onOpenDocument,
                                                         onCreateDocument,
                                                         onShowExplorer,
                                                         onDeleteDocument
                                                     }) => {

    // On ne prend que les 5 derniers documents modifiés pour l'aperçu
    const recentDocs = documents
        .filter(d => !d.isDeleted)
        .slice(0, 5);

    // 3. Nouvelle fonction simplifiée
    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // On empêche toujours l'ouverture du doc
        onDeleteDocument(id); // On appelle la fonction du parent (qui gère la confirm et le state)
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-5xl mx-auto">

                {/* Header Bienvenue */}
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Bonjour, {user?.user_metadata?.first_name || 'utilisateur'} 👋
                    </h1>
                    <p className="text-slate-500 mt-2">Prêt à organiser vos idées aujourd'hui ?</p>
                </header>

                {/* Section Actions Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <button
                        onClick={onCreateDocument}
                        className="flex items-center gap-4 p-6 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 group"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="plus" size={24} />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-lg">Nouveau Document</div>
                            <div className="text-indigo-100 text-sm">Commencez à écrire en Markdown</div>
                        </div>
                    </button>

                    <button
                        onClick={onShowExplorer}
                        className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-2xl text-slate-700 hover:border-indigo-300 transition-all group"
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Icon name="grid" size={24} />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-lg">Mes Dossiers</div>
                            <div className="text-slate-400 text-sm">Explorez votre bibliothèque</div>
                        </div>
                    </button>
                </div>

                {/* Section Récents */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Documents récents</h2>
                        <button
                            onClick={onShowExplorer}
                            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                            Voir tout
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentDocs.length > 0 ? (
                            recentDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => onOpenDocument(doc)}
                                    className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative"
                                >
                                    {/* Bouton de suppression */}
                                    <button
                                        onClick={(e) => handleDeleteClick(e, doc.id)}
                                        className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        title="Supprimer"
                                    >
                                        <Icon name="trash" size={16} />
                                    </button>

                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <Icon name="file" size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 truncate mb-1 pr-8">{doc.title || 'Sans titre'}</h3>
                                    <p className="text-xs text-slate-400">
                                        Modifié le {new Date(doc.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-400">Aucun document récent.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pied de page (Restauré) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Guide de démarrage</h3>
                            <p className="text-indigo-200 text-sm">Apprenez les bases du Markdown</p>
                        </div>
                        {/* Note: Assurez-vous que l'icône 'more' existe dans Icon.tsx, sinon utilisez 'help-circle' */}
                        <Icon name="more" className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer group">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">Export PDF</h3>
                            <p className="text-slate-500 text-sm">Convertissez vos notes en un clic</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-full text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Icon name="download" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardView;