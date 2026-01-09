
import { db } from '../services/db';
import { Document } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { VersionController } from './VersionController';

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

  async getAllDocuments(userId: string): Promise<Document[]> {
    return await db.documents
      .where('userId')
      .equals(userId)
      .and(doc => !doc.isDeleted)
      .reverse()
      .sortBy('updatedAt');
  },

  async loadDocument(id: string): Promise<Document | undefined> {
    return await db.documents.get(id);
  }
};
