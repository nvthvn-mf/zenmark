
import { db } from '../services/db';
import { Document } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { VersionController } from './VersionController';
import {supabase} from "@/services/supabase.ts";

export const DocumentController = {
  async createDocument(userId: string, title: string = 'Untitled'): Promise<Document> {
    const now = Date.now();
    const doc: Document = {
      id: uuidv4(),
      title,
      content: '',
      createdAt: now,
      updatedAt: now,
      currentVersion: 1,
      tags: [],
      isDeleted: false,
      userId
    };

    await db.documents.add(doc);
    await VersionController.createVersion(doc.id, doc.content, 1);
    
    // Mark for sync
    await db.syncState.put({
      documentId: doc.id,
      lastSyncedAt: 0,
      status: 'pending'
    });

    return doc;
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    const existing = await db.documents.get(id);
    if (!existing) return;

    const updatedAt = Date.now();
    const updatedDoc = { ...existing, ...updates, updatedAt };

    await db.documents.update(id, updatedDoc);

    // Update sync status
    await db.syncState.update(id, { status: 'pending' });
  },

  async deleteDocument(id: string): Promise<void> {
    await db.documents.update(id, { isDeleted: true, updatedAt: Date.now() });
    await db.syncState.update(id, { status: 'pending' });
  },

  // Modifiez la méthode getAllDocuments existante
  async getAllDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    // Mapping pour convertir le snake_case (SQL) en camelCase (TS) si besoin
    // Notre interface utilise updatedAt mais la base updated_at, on s'assure de mapper correctement
    return data.map((doc: any) => ({
      ...doc,
      updatedAt: doc.updated_at,
      folder_id: doc.folder_id // On s'assure de bien le récupérer
    }));
  },
  async moveDocument(documentId: string, folderId: string | null): Promise<void> {
    const { error } = await supabase
        .from('documents')
        .update({ folder_id: folderId }) // folderId peut être null (retour racine)
        .eq('id', documentId);

    if (error) throw error;
  },

  async loadDocument(id: string): Promise<Document | undefined> {
    return await db.documents.get(id);
  }
};
