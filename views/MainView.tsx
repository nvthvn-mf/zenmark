import React, { useState, useEffect, useCallback } from 'react';
import { Document, DocumentVersion, SyncState, AppStatus } from '../types';
import { DocumentController } from '../controllers/DocumentController';
import { SyncController } from '../controllers/SyncController';
import { VersionController } from '../controllers/VersionController';
import { ExportController } from '../controllers/ExportController';
import { AuthController } from '../controllers/AuthController';
import MilkdownEditor from '../components/MilkdownEditor';
import Icon from '../components/Icon';
import ProfileView from './ProfileView';
import DashboardView from './DashboardView';
import ExplorerView from './ExplorerView';

interface MainViewProps {
  user: any;
}

const MainView: React.FC<MainViewProps> = ({ user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<AppStatus>(AppStatus.ONLINE);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  // États de navigation
  const [showProfile, setShowProfile] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false); // <--- 2. Nouvel état pour l'explorateur

  const loadDocs = useCallback(async () => {
    const docs = await DocumentController.getAllDocuments(user.id);
    setDocuments(docs);
  }, [user.id]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  // Sync Logic
  useEffect(() => {
    const performSync = async () => {
      setSyncStatus(AppStatus.SYNCING);
      try {
        await SyncController.syncAll(user.id);
        await loadDocs();
        setSyncStatus(navigator.onLine ? AppStatus.ONLINE : AppStatus.OFFLINE);
      } catch (err) {
        console.error('Sync failed', err);
        setSyncStatus(AppStatus.OFFLINE);
      }
    };
    performSync();
    const interval = setInterval(performSync, 30000);
    return () => clearInterval(interval);
  }, [user.id, loadDocs]);

  const handleCreate = async () => {
    const newDoc = await DocumentController.createDocument(user.id);
    setDocuments([newDoc, ...documents]);
    setActiveDoc(newDoc);
    setShowExplorer(false); // On ferme l'explorateur si on crée depuis la sidebar
  };

  const handleUpdateContent = async (content: string) => {
    if (!activeDoc) return;
    const now = Date.now();
    const updatedDoc = { ...activeDoc, content, updatedAt: now };
    setActiveDoc(updatedDoc);
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    await DocumentController.updateDocument(activeDoc.id, { content });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    await DocumentController.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id)); // C'est CETTE ligne qui met à jour l'interface !
    if (activeDoc?.id === id) setActiveDoc(null);
  };

  const openHistory = async () => {
    if (!activeDoc) return;
    const history = await VersionController.getVersionHistory(activeDoc.id);
    setVersions(history);
    setShowHistory(true);
  };

  const handleRollback = async (version: DocumentVersion) => {
    if (!activeDoc) return;
    if (!confirm(`Rollback to version ${version.versionNumber}?`)) return;
    const restoredContent = await VersionController.rollbackToVersion(activeDoc.id, version.id);
    setActiveDoc({ ...activeDoc, content: restoredContent, currentVersion: activeDoc.currentVersion + 1 });
    setShowHistory(false);
  };

  const filteredDocs = documents.filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">

        {/* --- SIDEBAR --- */}
        <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white transition-all duration-300">

          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              Z
            </div>
            <span className="hidden lg:block ml-3 font-bold text-slate-800 text-lg">ZenMark</span>
          </div>

          {/* Navigation */}
          <div className="p-3 lg:p-4 space-y-1">
            <button
                onClick={() => {
                  setActiveDoc(null);
                  setShowProfile(false);
                  setShowExplorer(false); // Retour au Dashboard pur
                }}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl transition-all ${
                    !activeDoc && !showProfile && !showExplorer ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon name="home" size={20} />
              <span className="hidden lg:block">Accueil</span>
            </button>

            <button
                onClick={handleCreate}
                className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Icon name="plus" size={20} />
              <span className="hidden lg:block">Nouveau</span>
            </button>
          </div>

          <div className="mt-4 px-3 lg:px-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 hidden lg:block">Documents Récents</div>
            {/* Liste simplifiée pour sidebar */}
            <div className="space-y-1 max-h-[40vh] overflow-y-auto no-scrollbar">
              {filteredDocs.slice(0, 10).map(doc => ( // On limite à 10 pour la sidebar
                  <div
                      key={doc.id}
                      onClick={() => { setActiveDoc(doc); setShowExplorer(false); setShowProfile(false); }}
                      className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                          activeDoc?.id === doc.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Icon name="file" size={16} className={`flex-shrink-0 ${activeDoc?.id === doc.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="hidden lg:block truncate text-sm flex-1">{doc.title || 'Sans titre'}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* Footer Sidebar */}
          <div className="mt-auto p-4 border-t border-slate-100">
            <div className="flex items-center justify-center lg:justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${syncStatus === AppStatus.ONLINE ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="hidden lg:block text-xs text-slate-500 capitalize">{syncStatus}</span>
              </div>

              <button
                  onClick={() => { setShowProfile(true); setActiveDoc(null); setShowExplorer(false); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Paramètres"
              >
                <Icon name="settings" size={18} />
              </button>
              <button onClick={() => AuthController.logout()} className="text-slate-400 hover:text-slate-600">
                <Icon name="logout" size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">

          {showProfile ? (
              /* CAS 1 : MODE PROFIL */
              <ProfileView
                  user={user}
                  onBack={() => setShowProfile(false)}
              />
          ) : showExplorer ? (
              /* CAS 2 : MODE EXPLORATEUR (Nouveau) */
              <ExplorerView
                  user={user}
                  documents={documents}
                  onOpenDocument={(doc) => {
                    setActiveDoc(doc);
                    setShowExplorer(false); // On ferme l'explorateur quand on ouvre un doc
                  }}
                  onBack={() => setShowExplorer(false)}
              />
          ) : activeDoc ? (
              /* CAS 3 : MODE ÉDITEUR */
              <>
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
                  <div className="flex-1 mr-4">
                    <input
                        className="w-full text-lg font-bold text-slate-800 focus:outline-none placeholder-slate-300"
                        value={activeDoc.title}
                        placeholder="Titre du document..."
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setActiveDoc({ ...activeDoc, title: newTitle });
                          DocumentController.updateDocument(activeDoc.id, { title: newTitle });
                        }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={openHistory} title="History" className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                      <Icon name="history" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <button onClick={() => ExportController.exportToHTML(activeDoc.title, activeDoc.content)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                      <Icon name="download" />
                    </button>
                    <button onClick={() => ExportController.exportToPDF()} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                      <Icon name="search" />
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                  <MilkdownEditor
                      content={activeDoc.content}
                      onChange={handleUpdateContent}
                  />
                </div>
              </>
          ) : (
              /* CAS 4 : MODE DASHBOARD */
              <DashboardView
                  user={user}
                  documents={documents}
                  onOpenDocument={setActiveDoc}
                  onCreateDocument={handleCreate}
                  onShowExplorer={() => setShowExplorer(true)} // Déclencheur Explorateur
              />
          )}
        </main>

        {/* History Modal */}
        {showHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-lg font-bold">Historique</h2>
                  <button onClick={() => setShowHistory(false)}><Icon name="x" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {versions.map(v => (
                      <div key={v.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 cursor-pointer" onClick={() => handleRollback(v)}>
                        <div>
                          <span className="font-bold text-slate-800">v{v.versionNumber}</span>
                          <span className="text-xs text-slate-400 ml-2">{new Date(v.createdAt).toLocaleString()}</span>
                        </div>
                        <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">Restaurer</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default MainView;