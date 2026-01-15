
export interface UserSettings {
  theme: 'light' | 'dark';
  autosaveDelay: number;
  exportTemplate: string;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null; // null = à la racine
  name: string;
  createdAt: number;
  is_deleted?: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  tags?: string[];
  is_deleted?: boolean;
  folder_id?: string | null; // NOUVEAU : null = racine
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

export interface AuthState {
  user: any | null;
  loading: boolean;
}
