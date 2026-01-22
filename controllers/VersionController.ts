import {db} from '../services/db';
import {DocumentVersion} from '../types';
import {v4 as uuidv4} from 'uuid';

export const VersionController = {
    async createVersion(documentId: string, content: string, versionNumber: number): Promise<void> {
        const version: DocumentVersion = {
            id: uuidv4(),
            documentId,
            versionNumber,
            content,
            createdAt: Date.now(),
            authorDeviceId: navigator.userAgent
        };
        // Use renamed docVersions property from ZenMarkDB
        await db.docVersions.add(version);
    },

    async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
        // Use renamed docVersions property from ZenMarkDB
        return await db.docVersions
            .where('documentId')
            .equals(documentId)
            .reverse()
            .sortBy('versionNumber');
    },

    async rollbackToVersion(documentId: string, versionId: string): Promise<string> {
        // Use renamed docVersions property from ZenMarkDB
        const version = await db.docVersions.get(versionId);
        if (!version) throw new Error('Version not found');

        const doc = await db.documents.get(documentId);
        if (!doc) throw new Error('Document not found');

        const newVersionNumber = doc.currentVersion + 1;
        const now = Date.now();

        // Update document with content from chosen version
        await db.documents.update(documentId, {
            content: version.content,
            currentVersion: newVersionNumber,
            updatedAt: now
        });

        // Create a NEW version for history (so we never lose the previous state)
        await this.createVersion(documentId, version.content, newVersionNumber);

        // Mark for sync
        await db.syncState.update(documentId, {status: 'pending'});

        return version.content;
    }
};
