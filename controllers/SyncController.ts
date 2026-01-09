
import { db } from '../services/db';
import { supabase } from '../services/supabase';
import { Document, SyncState } from '../types';

export const SyncController = {
  async syncAll(userId: string): Promise<void> {
    if (!navigator.onLine) return;

    // 1. Sync local changes to cloud
    const pendingSyncs = await db.syncState.where('status').equals('pending').toArray();
    for (const sync of pendingSyncs) {
      await this.syncLocalToCloud(sync.documentId, userId);
    }

    // 2. Fetch remote changes
    await this.syncCloudToLocal(userId);
  },

  async syncLocalToCloud(documentId: string, userId: string): Promise<void> {
    const localDoc = await db.documents.get(documentId);
    if (!localDoc) return;

    // Check cloud for existing doc to handle conflict
    const { data: cloudDoc, error: fetchError } = await supabase
      .from('documents')
      .select('updated_at')
      .eq('id', documentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (cloudDoc && cloudDoc.updated_at > localDoc.updatedAt) {
      // Conflict detected! Remote is newer.
      await db.syncState.update(documentId, { status: 'conflict' });
      return;
    }

    // Push local to cloud
    const { error: upsertError } = await supabase
      .from('documents')
      .upsert({
        id: localDoc.id,
        user_id: userId,
        title: localDoc.title,
        content: localDoc.content,
        created_at: localDoc.createdAt,
        updated_at: localDoc.updatedAt,
        current_version: localDoc.currentVersion,
        tags: localDoc.tags,
        is_deleted: localDoc.isDeleted
      });

    if (upsertError) throw upsertError;

    // Update local sync status
    await db.syncState.update(documentId, {
      lastSyncedAt: Date.now(),
      status: 'synced'
    });
  },

  async syncCloudToLocal(userId: string): Promise<void> {
    const { data: cloudDocs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    for (const cloudDoc of cloudDocs) {
      const localDoc = await db.documents.get(cloudDoc.id);
      
      const remoteUpdatedAt = cloudDoc.updated_at;
      const localUpdatedAt = localDoc?.updatedAt || 0;

      if (!localDoc || remoteUpdatedAt > localUpdatedAt) {
        // Cloud is newer or new document
        const mappedDoc: Document = {
          id: cloudDoc.id,
          userId: cloudDoc.user_id,
          title: cloudDoc.title,
          content: cloudDoc.content,
          createdAt: cloudDoc.created_at,
          updatedAt: cloudDoc.updated_at,
          currentVersion: cloudDoc.current_version,
          tags: cloudDoc.tags || [],
          isDeleted: cloudDoc.is_deleted
        };

        await db.documents.put(mappedDoc);
        await db.syncState.put({
          documentId: cloudDoc.id,
          lastSyncedAt: Date.now(),
          status: 'synced'
        });
      }
    }
  },

  async resolveConflict(documentId: string, strategy: 'cloud' | 'local', userId: string): Promise<void> {
    if (strategy === 'cloud') {
      const { data: cloudDoc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;

      await db.documents.update(documentId, {
        title: cloudDoc.title,
        content: cloudDoc.content,
        updatedAt: cloudDoc.updated_at,
        currentVersion: cloudDoc.current_version,
        isDeleted: cloudDoc.is_deleted
      });
    } else {
      // Strategy is local: Just force push local
      await this.syncLocalToCloud(documentId, userId);
    }
    
    await db.syncState.update(documentId, { status: 'synced' });
  }
};
