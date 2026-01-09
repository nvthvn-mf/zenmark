import { createClient } from '@supabase/supabase-js';

// Utilisation de import.meta.env pour Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase keys are missing! Check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);