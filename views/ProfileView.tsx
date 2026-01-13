import React, { useState, useEffect } from 'react';
import { AuthController } from '../controllers/AuthController';
import Icon from '../components/Icon';

interface ProfileViewProps {
    user: any;
    onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack }) => {
    // --- Infos Personnelles ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // --- Email ---
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');

    // --- Mot de passe (NOUVEAU) ---
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFirstName(user.user_metadata?.first_name || '');
            setLastName(user.user_metadata?.last_name || '');
            setCurrentEmail(user.email || '');
            setNewEmail(user.email || '');
        }
    }, [user]);

    // Helper pour afficher les messages
    const showMessage = (type: string, text: string) => {
        setMessage({ type, text });
        if (type === 'success') {
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await AuthController.updateProfile(firstName, lastName);
            showMessage('success', 'Informations mises à jour avec succès !');
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newEmail === currentEmail) return;
        if (!confirm(`Attention : Un lien de confirmation sera envoyé à ${newEmail} ET à l'ancienne adresse.`)) return;

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await AuthController.updateEmail(newEmail);
            showMessage('success', 'Demande envoyée ! Vérifiez vos DEUX boîtes mail.');
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Gestionnaire pour le mot de passe
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (password !== confirmPassword) {
            showMessage('error', 'Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            showMessage('error', 'Le mot de passe doit faire au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            await AuthController.updatePassword(oldPassword, password);
            showMessage('success', 'Mot de passe modifié avec succès !');
            // Reset des champs
            setOldPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showMessage('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6 pb-12">

                {/* En-tête */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <Icon name="home" size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Paramètres du compte</h1>
                </div>

                {/* Message Global */}
                {message.text && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                        <Icon name={message.type === 'success' ? 'check' : 'x'} size={20} className="mt-0.5" />
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                {/* CARTE 1 : Infos Personnelles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Icon name="file" size={18} className="text-indigo-500" />
                            Identité
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* CARTE 2 : Email */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Icon name="cloud" size={18} className="text-indigo-500" />
                            Adresse Email
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email actuel</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || newEmail === currentEmail}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    Modifier l'email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* CARTE 3 : Sécurité (NOUVEAU) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Icon name="settings" size={18} className="text-indigo-500" /> {/* On utilise settings faute de cadenas */}
                            Sécurité
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Modifiez votre mot de passe</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdatePassword} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ancien mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !oldPassword || !password}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    Changer le mot de passe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileView;