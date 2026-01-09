
import { Dexie, Table } from 'dexie';
import { Document, DocumentVersion, SyncState, UserSettings } from '../types';

export class ZenMarkDB extends Dexie {
  documents!: Table<Document>;
  docVersions!: Table<DocumentVersion>;
  syncState!: Table<SyncState>;
  settings!: Table<UserSettings>;

  constructor() {
    super('ZenMarkDB');
    // Renamed 'versions' property to 'docVersions' to resolve conflict with Dexie's 'version' method.
    this.version(1).stores({
      documents: 'id, title, updatedAt, userId, isDeleted',
      docVersions: 'id, documentId, versionNumber',
      syncState: 'documentId, lastSyncedAt, status',
      settings: '++id'
    });
  }
}

export const db = new ZenMarkDB();

// Initialize default settings if they don't exist
export async function ensureSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      theme: 'light',
      autosaveDelay: 2000,
      exportTemplate: 'default'
    });
  }
}
