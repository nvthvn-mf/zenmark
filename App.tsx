
import React, { useState, useEffect } from 'react';
import MainView from './views/MainView';
import AuthView from './views/AuthView';
import { AuthController } from './controllers/AuthController';
import { ensureSettings } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await ensureSettings();
      const currentUser = await AuthController.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    init();

    const subscription = AuthController.onAuthStateChange((user) => {
      setUser(user);
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
        <p className="text-slate-500 font-medium">Restoring session...</p>
      </div>
    );
  }

  return user ? <MainView user={user} /> : <AuthView />;
};

export default App;
