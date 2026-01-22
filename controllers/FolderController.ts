import {supabase} from '../services/supabase';
import {Folder} from '../types';

export const FolderController = {
    // Récupérer tous les dossiers de l'utilisateur
    async getAllFolders(userId: string): Promise<Folder[]> {
        const {data, error} = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', userId)
            .eq('is_deleted', false) // On ignore ceux qui sont "supprimés"
            .order('name', {ascending: true});

        if (error) throw error;
        return data || [];
    },

    // Créer un dossier (à la racine ou dans un parent)
    async createFolder(userId: string, name: string, parentId: string | null = null): Promise<Folder> {
        const newFolder = {
            user_id: userId,
            name,
            parent_id: parentId,
            created_at: Date.now(),
            is_deleted: false
        };

        const {data, error} = await supabase
            .from('folders')
            .insert([newFolder])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Renommer un dossier
    async renameFolder(folderId: string, newName: string): Promise<void> {
        const {error} = await supabase
            .from('folders')
            .update({name: newName})
            .eq('id', folderId);

        if (error) throw error;
    },

    // Supprimer un dossier (Soft delete pour la sécurité)
    async deleteFolder(folderId: string): Promise<void> {
        // Note : Pour une vraie suppression, il faudrait gérer les sous-dossiers et fichiers.
        // Ici, on marque juste le dossier comme supprimé.
        const {error} = await supabase
            .from('folders')
            .update({is_deleted: true})
            .eq('id', folderId);

        if (error) throw error;
    },
    // AJOUT : Déplacer un dossier
    async moveFolder(folderId: string, targetFolderId: string | null): Promise<void> {
        // targetFolderId peut être null (déplacer vers la racine)

        // Sécurité simple : on ne peut pas se déplacer sur soi-même
        if (folderId === targetFolderId) return;

        const {error} = await supabase
            .from('folders')
            .update({parent_id: targetFolderId})
            .eq('id', folderId);

        if (error) throw error;
    }


};