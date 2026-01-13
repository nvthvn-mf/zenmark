import React, { useState, useEffect } from 'react';
import MainView from './views/MainView';
import AuthView from './views/AuthView';
import { AuthController } from './controllers/AuthController';
import { ensureSettings } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Nouvel état pour savoir si on est en train de réinitialiser le mot de passe
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      await ensureSettings();
      const currentUser = await AuthController.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    init();

    // On écoute l'événement 'event' en plus de la session
    const subscription = AuthController.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      // @ts-ignore
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
    );
  }

  // LOGIQUE D'AFFICHAGE :
  // 1. Si on est en mode recovery, on force l'affichage de AuthView en mode 'UPDATE_PASSWORD'
  if (isRecoveryMode) {
    return <AuthView initialMode="UPDATE_PASSWORD" onRecoveryDone={() => setIsRecoveryMode(false)} />;
  }

  // 2. Sinon, comportement normal
  return user ? <MainView user={user} /> : <AuthView />;
};

export default App;