// zenmark/controllers/DocumentController.ts

import { db } from '../services/db';
import { Document } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { VersionController } from './VersionController';
import { supabase } from '../services/supabase'; // Attention au chemin d'import (../ vs @/)

export const DocumentController = {
  async createDocument(userId: string, title: string = 'Untitled'): Promise<Document> {
    const now = Date.now();
    // Maintenant, ceci correspond parfaitement à l'interface Document corrigée
    const doc: Document = {
      id: uuidv4(),
      userId,
      title,
      content: '',
      createdAt: now,
      updatedAt: now,
      currentVersion: 1,
      tags: [],
      isDeleted: false,
      folderId: null // Initialisé à null (racine)
    };

    await db.documents.add(doc);
    await VersionController.createVersion(doc.id, doc.content, 1);

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
    await db.syncState.update(id, { status: 'pending' });
  },

  async deleteDocument(id: string): Promise<void> {
    // isDeleted est maintenant reconnu
    await db.documents.update(id, { isDeleted: true, updatedAt: Date.now() });
    await db.syncState.update(id, { status: 'pending' });
  },

  // --- C'est ici que la magie du Mapping opère ---
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

    // Mapping SQL (snake_case) vers App (camelCase)
    // C'est indispensable car Supabase renvoie 'created_at' mais votre app veut 'createdAt'
    return data.map((doc: any) => ({
      id: doc.id,
      userId: doc.user_id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.created_at,        // Mapping
      updatedAt: doc.updated_at,        // Mapping
      currentVersion: doc.current_version, // Mapping
      tags: doc.tags,
      isDeleted: doc.is_deleted,        // Mapping
      folderId: doc.folder_id           // Mapping
    }));
  },

  async moveDocument(documentId: string, folderId: string | null): Promise<void> {
    // Note : Dans la base SQL la colonne est 'folder_id', mais l'argument JS est 'folderId'
    const { error } = await supabase
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId);

    if (error) throw error;

    // IMPORTANT : Mettre à jour aussi le local (IndexedDB) pour que l'UI change instantanément
    await db.documents.update(documentId, { folderId: folderId });
  },

  async loadDocument(id: string): Promise<Document | undefined> {
    return await db.documents.get(id);
  }
};