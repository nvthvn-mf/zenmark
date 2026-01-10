import React, { useState } from 'react';
import { AuthController } from '../controllers/AuthController';
import Icon from '../components/Icon'; // On réutilise ton composant Icon

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Nouvel état pour savoir si on doit afficher le message de confirmation
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await AuthController.login(email, password);
      } else {
        await AuthController.signUp(email, password);
        // Si l'inscription réussit, on affiche le message
        setNeedsVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false); // On arrête le chargement seulement en cas d'erreur
    } finally {
      // Si c'est un login, le chargement s'arrête via le démontage du composant (redirection)
      // Si c'est une inscription réussie, on garde le loading à false pour afficher l'UI
      if (!isLogin && !error) setLoading(false);
    }
  };

  // Si l'utilisateur doit vérifier son email, on affiche cette vue spécifique
  if (needsVerification) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="check" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Vérifiez vos emails</h2>
            <p className="text-slate-600 mb-6">
              Un lien de confirmation a été envoyé à <strong>{email}</strong>.
              <br />
              Cliquez dessus pour activer votre compte et vous connecter.
            </p>
            <button
                onClick={() => {
                  setNeedsVerification(false);
                  setIsLogin(true); // On le renvoie vers le login
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ZenMark</h1>
            <p className="text-slate-500">Your minimalist markdown companion.</p>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default AuthView;