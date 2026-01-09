
export interface UserSettings {
  theme: 'light' | 'dark';
  autosaveDelay: number;
  exportTemplate: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  currentVersion: number;
  tags: string[];
  isDeleted: boolean;
  userId: string;
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
