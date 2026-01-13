
import { supabase } from '../services/supabase';

export const AuthController = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim()
        }
      }
    });
    if (error) throw error;
    return data.user;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },


  async updateProfile(firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim()
      }
    });
    if (error) throw error;
    return data.user;
  },
  async updateEmail(newEmail: string) {
    // Supabase gère la double confirmation automatiquement
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data.user;
  },

  // Dans zenmark/controllers/AuthController.ts

  async updatePassword(oldPassword: string, newPassword: string) {
    // 1. On récupère l'email de l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Utilisateur non identifié");

    // 2. VÉRIFICATION : On essaie de se reconnecter avec l'ANCIEN mot de passe
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });

    if (signInError) {
      // Si la connexion échoue, c'est que l'ancien mot de passe est faux
      throw new Error("L'ancien mot de passe est incorrect.");
    }

    // 3. Si c'est bon, on met à jour avec le NOUVEAU mot de passe
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;
    return data.user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  }
};
