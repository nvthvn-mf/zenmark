import React from 'react';
import { Document } from '../types';
import Icon from '../components/Icon';

interface DashboardViewProps {
    user: any;
    documents: Document[];
    onOpenDocument: (doc: Document) => void;
    onCreateDocument: () => void;
    onShowExplorer: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, documents, onOpenDocument, onCreateDocument, onShowExplorer }) => {
    // On prend les 6 derniers documents modifiés
    const recentDocs = documents.slice(0, 6);

    // Petit helper pour extraire un aperçu du texte sans le markdown
    const getPreview = (content: string) => {
        return content.replace(/[#*`_]/g, '').substring(0, 100) + (content.length > 100 ? '...' : '');
    };

    // Salutation dynamique
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-8 md:p-12">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header / Banner */}
                <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            {greeting}, {user?.user_metadata?.first_name || user?.email?.split('@')[0]} 👋                        </h1>
                        <p className="text-slate-500 text-lg max-w-lg">
                            Prêt à capturer vos idées ? Vous avez {documents.length} document{documents.length > 1 ? 's' : ''} dans votre espace.
                        </p>

                        <button
                            onClick={onCreateDocument}
                            className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                        >
                            <Icon name="plus" size={20} />
                            Nouveau Document
                        </button>
                    </div>

                    {/* Décoration d'arrière-plan abstraite */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-60" />
                    <div className="absolute bottom-0 right-20 w-40 h-40 bg-purple-50 rounded-full blur-2xl translate-y-1/3 opacity-60" />
                </div>

                {/* Section Récents */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Icon name="clock" className="text-indigo-500" />
                            Modifiés récemment
                        </h2>
                        <button
                            onClick={onShowExplorer}
                            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                            Voir tout
                        </button>
                    </div>

                    {recentDocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => onOpenDocument(doc)}
                                    className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex flex-col h-48"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Icon name="file" size={20} />
                                        </div>
                                        <span className="text-xs text-slate-400">
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                                    </div>

                                    <h3 className="font-bold text-slate-800 mb-2 truncate pr-4">
                                        {doc.title || 'Sans titre'}
                                    </h3>

                                    <p className="text-sm text-slate-500 line-clamp-3 flex-1">
                                        {doc.content ? getPreview(doc.content) : <span className="italic opacity-50">Vide...</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Icon name="file" size={24} />
                            </div>
                            <p className="text-slate-500">Aucun document pour le moment.</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Guide de démarrage</h3>
                            <p className="text-indigo-200 text-sm">Apprenez les bases du Markdown</p>
                        </div>
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