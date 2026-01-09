
import React, { useState, useEffect, useCallback } from 'react';
import { Document, DocumentVersion, SyncState, AppStatus } from '../types';
import { DocumentController } from '../controllers/DocumentController';
import { SyncController } from '../controllers/SyncController';
import { VersionController } from '../controllers/VersionController';
import { ExportController } from '../controllers/ExportController';
import { AuthController } from '../controllers/AuthController';
import MilkdownEditor from '../components/MilkdownEditor';
import Icon from '../components/Icon';

interface MainViewProps {
  user: any;
}

const MainView: React.FC<MainViewProps> = ({ user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [search, setSearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<AppStatus>(AppStatus.ONLINE);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});

  const loadDocs = useCallback(async () => {
    const docs = await DocumentController.getAllDocuments(user.id);
    setDocuments(docs);
    if (docs.length > 0 && !activeDoc) {
      setActiveDoc(docs[0]);
    }
  }, [user.id, activeDoc]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  // Handle Sync
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
    const interval = setInterval(performSync, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [user.id, loadDocs]);

  const handleCreate = async () => {
    const newDoc = await DocumentController.createDocument(user.id);
    setDocuments([newDoc, ...documents]);
    setActiveDoc(newDoc);
  };

  const handleUpdateContent = async (content: string) => {
    if (!activeDoc) return;
    const now = Date.now();
    
    // Optimistic update
    const updatedDoc = { ...activeDoc, content, updatedAt: now };
    setActiveDoc(updatedDoc);
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));

    // Persist
    await DocumentController.updateDocument(activeDoc.id, { content });
  };

  const handleSaveVersion = async () => {
    if (!activeDoc) return;
    const newVersionNum = activeDoc.currentVersion + 1;
    await VersionController.createVersion(activeDoc.id, activeDoc.content, newVersionNum);
    await DocumentController.updateDocument(activeDoc.id, { currentVersion: newVersionNum });
    setActiveDoc({ ...activeDoc, currentVersion: newVersionNum });
    alert('Version checkpoint saved!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await DocumentController.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
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
    if (!confirm(`Rollback to version ${version.versionNumber}? This will create a new current version.`)) return;
    
    const restoredContent = await VersionController.rollbackToVersion(activeDoc.id, version.id);
    setActiveDoc({ ...activeDoc, content: restoredContent, currentVersion: activeDoc.currentVersion + 1 });
    setShowHistory(false);
  };

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white">
        <div className="p-6 border-bottom">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-900">ZenMark</h1>
            <div className="flex items-center gap-2">
              <span title={syncStatus} className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === AppStatus.ONLINE ? 'bg-green-500' : 
                syncStatus === AppStatus.SYNCING ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'
              }`} />
              <button onClick={() => AuthController.logout()} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                <Icon name="settings" size={18} />
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <Icon name="plus" size={18} />
            New Document
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id}
              onClick={() => setActiveDoc(doc)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeDoc?.id === doc.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{doc.title || 'Untitled'}</p>
                <p className="text-xs opacity-60 truncate">{new Date(doc.updatedAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <p className="text-sm">No documents found</p>
            </div>
          )}
        </nav>
      </aside>

      {/* Editor Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-sm overflow-hidden relative">
        {activeDoc ? (
          <>
            {/* Header / Toolbar */}
            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur sticky top-0 z-10 no-print">
              <div className="flex-1 mr-4">
                <input 
                  className="w-full text-xl font-bold focus:outline-none placeholder-slate-300"
                  value={activeDoc.title}
                  placeholder="Untitled Document"
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setActiveDoc({ ...activeDoc, title: newTitle });
                    DocumentController.updateDocument(activeDoc.id, { title: newTitle });
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleSaveVersion} title="Save Version" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Icon name="history" />
                </button>
                <button onClick={openHistory} title="View History" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Icon name="more" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button onClick={() => ExportController.exportToHTML(activeDoc.title, activeDoc.content)} title="Export HTML" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Icon name="download" />
                </button>
                <button onClick={() => ExportController.exportToPDF()} title="Print/PDF" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Icon name="search" />
                </button>
              </div>
            </header>

            {/* Editor Component */}
            <MilkdownEditor 
              content={activeDoc.content} 
              onChange={handleUpdateContent} 
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Icon name="plus" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select or create a document to get started</p>
            </div>
          </div>
        )}
      </main>

      {/* History Modal Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Version History</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="x" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {versions.map(v => (
                <div key={v.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-slate-900">Version {v.versionNumber}</p>
                    <p className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{v.content.substring(0, 50)}...</p>
                  </div>
                  <button 
                    onClick={() => handleRollback(v)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
              {versions.length === 0 && (
                <div className="text-center py-10 text-slate-400">No versions saved yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainView;
