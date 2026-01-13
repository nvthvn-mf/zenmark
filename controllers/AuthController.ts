import { supabase } from '../services/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const AuthController = {
  // ... (Vos fonctions login, signUp, logout existantes restent identiques) ...
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

  // --- NOUVEAU : Méthodes pour le profil et le reset ---

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
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    return data.user;
  },

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin // Redirige vers localhost:3000
    });
    if (error) throw error;
  },

  // Cette fonction change le mot de passe SANS demander l'ancien.
  // Elle ne fonctionne que si l'utilisateur est connecté (ce qui est le cas après le clic sur le lien).
  async resetPassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data.user;
  },

  // Cette fonction change le mot de passe EN VÉRIFIANT l'ancien (pour le profil)
  async updatePasswordWithCheck(oldPassword: string, newPassword: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("Utilisateur non identifié");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword
    });

    if (signInError) throw new Error("L'ancien mot de passe est incorrect.");

    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) throw updateError;
    return data.user;
  },

  // MODIFICATION CRITIQUE : On passe l'événement au callback pour détecter PASSWORD_RECOVERY
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
};