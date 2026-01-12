import React, { useState } from 'react';
import { AuthController } from '../controllers/AuthController';
import Icon from '../components/Icon';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Nouveaux états pour le prénom et le nom
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await AuthController.login(email, password);
      } else {
        // On passe les nouveaux champs au contrôleur
        await AuthController.signUp(email, password, firstName, lastName);
        setNeedsVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

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
              Cliquez dessus pour activer votre compte.
            </p>
            <button
                onClick={() => { setNeedsVerification(false); setIsLogin(true); }}
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">ZenMark</h1>
            <p className="text-slate-500">
              {isLogin ? 'Bon retour parmi nous !' : 'Créez votre compte personnel'}
            </p>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <Icon name="x" size={16} /> {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* CES CHAMPS N'APPARAISSENT QU'À L'INSCRIPTION */}
            {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input
                        type="text"
                        required={!isLogin}
                        placeholder="Jean"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input
                        type="text"
                        required={!isLogin}
                        placeholder="Dupont"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                  type="email"
                  required
                  placeholder="jean.dupont@exemple.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                  <>
                    <Icon name="history" className="animate-spin" /> Traitement...
                  </>
              ) : (
                  isLogin ? 'Se connecter' : "S'inscrire"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  // Reset des champs pour éviter la confusion
                  setFirstName('');
                  setLastName('');
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire gratuitement" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default AuthView;