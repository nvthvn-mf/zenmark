// zenmark/types.ts

export interface Document {
  id: string;
  userId: string;          // AJOUTÉ (Manquait)
  title: string;
  content: string;
  createdAt: number;       // AJOUTÉ (Manquait)
  updatedAt: number;
  currentVersion: number;  // AJOUTÉ (Manquait)
  tags?: string[];
  isDeleted?: boolean;     // RENOMMÉ (était is_deleted) pour correspondre à votre Controller
  folderId?: string | null; // RENOMMÉ (était folder_id) pour uniformiser
}

// ... Les autres interfaces (Folder, DocumentVersion, etc.) restent inchangées
export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  createdAt: number;
  is_deleted?: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autosaveDelay: number;
  exportTemplate: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: string;
  createdAt: number;
  authorDeviceId: string;
}

export interface SyncState {
  documentId: string;
  lastSyncedAt: number;
  status: 'synced' | 'pending' | 'conflict';
}

export enum AppStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SYNCING = 'syncing'
}