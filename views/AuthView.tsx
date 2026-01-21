import React, {useState, useEffect} from 'react';
import {AuthController} from '../controllers/AuthController';
import Icon from '../components/Icon';

// On ajoute le mode UPDATE_PASSWORD
type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'UPDATE_PASSWORD';

interface AuthViewProps {
    initialMode?: AuthMode;
    onRecoveryDone?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({initialMode = 'LOGIN', onRecoveryDone}) => {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    // Si la prop change (venant de App.tsx), on met à jour le mode local
    useEffect(() => {
        if (initialMode) setMode(initialMode);
    }, [initialMode]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Pour la confirmation

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'LOGIN') {
                await AuthController.login(email, password);
            } else if (mode === 'SIGNUP') {
                await AuthController.signUp(email, password, firstName, lastName);
                setSuccessMsg("Compte créé ! Vérifiez vos emails pour confirmer.");
            } else if (mode === 'FORGOT_PASSWORD') {
                await AuthController.sendPasswordResetEmail(email);
                setSuccessMsg("Si cet email existe, un lien de réinitialisation a été envoyé.");
            }
            // NOUVEAU CAS : Définition du nouveau mot de passe
            else if (mode === 'UPDATE_PASSWORD') {
                if (password !== confirmPassword) {
                    throw new Error("Les mots de passe ne correspondent pas.");
                }
                await AuthController.resetPassword(password);
                setSuccessMsg("Mot de passe modifié avec succès ! Vous allez être redirigé...");

                // Après 2 secondes, on quitte le mode recovery
                setTimeout(() => {
                    if (onRecoveryDone) onRecoveryDone();
                    setMode('LOGIN'); // Ou laisser l'utilisateur connecté selon le choix
                }, 2000);
            }

        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            if (mode !== 'LOGIN' || error) setLoading(false);
        }
    };

    // Affichage succès simple
    if (successMsg && mode !== 'UPDATE_PASSWORD') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div
                        className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="check" size={32}/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Opération réussie</h2>
                    <p className="text-slate-600 mb-6">{successMsg}</p>
                    <button
                        onClick={() => {
                            setSuccessMsg('');
                            setMode('LOGIN');
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">ZenMark</h1>
                    <p className="text-slate-500">
                        {mode === 'LOGIN' && 'Bon retour parmi nous !'}
                        {mode === 'SIGNUP' && 'Créez votre compte personnel'}
                        {mode === 'FORGOT_PASSWORD' && 'Réinitialisation du mot de passe'}
                        {mode === 'UPDATE_PASSWORD' && 'Définissez votre nouveau mot de passe'}
                    </p>
                </div>

                {error && (
                    <div
                        className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                        <Icon name="x" size={16}/> {error}
                    </div>
                )}

                {/* Message de succès temporaire pour le reset */}
                {successMsg && mode === 'UPDATE_PASSWORD' && (
                    <div
                        className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm flex items-center gap-2">
                        <Icon name="check" size={16}/> {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* CHAMPS PRÉNOM/NOM (SIGNUP) */}
                    {mode === 'SIGNUP' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                <input type="text" required placeholder="Jean"
                                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                <input type="text" required placeholder="Dupont"
                                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                            </div>
                        </div>
                    )}

                    {/* EMAIL (SAUF UPDATE_PASSWORD car on le connait déjà via la session) */}
                    {mode !== 'UPDATE_PASSWORD' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" required placeholder="jean.dupont@exemple.com"
                                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                    )}

                    {/* MOT DE PASSE (LOGIN, SIGNUP, UPDATE_PASSWORD) */}
                    {mode !== 'FORGOT_PASSWORD' && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700">
                                    {mode === 'UPDATE_PASSWORD' ? 'Nouveau mot de passe' : 'Mot de passe'}
                                </label>
                                {mode === 'LOGIN' && (
                                    <button type="button" onClick={() => setMode('FORGOT_PASSWORD')}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Oublié
                                        ?</button>
                                )}
                            </div>
                            <input type="password" required placeholder="••••••••"
                                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                    )}

                    {/* CONFIRMATION MOT DE PASSE (UPDATE_PASSWORD SEULEMENT) */}
                    {mode === 'UPDATE_PASSWORD' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de
                                passe</label>
                            <input type="password" required placeholder="••••••••"
                                   className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                        {loading ? <><Icon name="history" className="animate-spin"/> Traitement...</> :
                            mode === 'LOGIN' ? 'Se connecter' :
                                mode === 'SIGNUP' ? "S'inscrire" :
                                    mode === 'FORGOT_PASSWORD' ? 'Envoyer le lien' :
                                        'Enregistrer le mot de passe'
                        }
                    </button>
                </form>

                {/* Navigation bas de page (Sauf Update Password) */}
                {mode !== 'UPDATE_PASSWORD' && (
                    <div className="mt-8 text-center pt-6 border-t border-slate-100 space-y-2">
                        {mode === 'LOGIN' ? (
                            <button onClick={() => {
                                setMode('SIGNUP');
                                setError('');
                            }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">Pas
                                encore de compte ? S'inscrire gratuitement</button>
                        ) : (
                            <button onClick={() => {
                                setMode('LOGIN');
                                setError('');
                            }}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">Déjà
                                un compte ? Se connecter</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthView;