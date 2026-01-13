import React, { useState, useEffect } from 'react';
import { AuthController } from '../controllers/AuthController';
import Icon from '../components/Icon';

interface ProfileViewProps {
    user: any;
    onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack }) => {
    // --- États pour Infos Personnelles ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // --- États pour Email ---
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initialisation
    useEffect(() => {
        if (user) {
            setFirstName(user.user_metadata?.first_name || '');
            setLastName(user.user_metadata?.last_name || '');
            setCurrentEmail(user.email || '');
            setNewEmail(user.email || ''); // On pré-remplit avec l'actuel
        }
    }, [user]);

    // Gestionnaire : Mise à jour du Profil (Nom/Prénom)
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await AuthController.updateProfile(firstName, lastName);
            setMessage({ type: 'success', text: 'Informations mises à jour avec succès !' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    // Gestionnaire : Mise à jour de l'Email
    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        // Si l'email n'a pas changé, on ne fait rien
        if (newEmail === currentEmail) return;

        if (!confirm(`Attention : Un lien de confirmation sera envoyé à votre nouvelle adresse (${newEmail}) ET à l'ancienne pour valider ce changement. Continuer ?`)) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await AuthController.updateEmail(newEmail);
            setMessage({
                type: 'success',
                text: 'Demande envoyée ! Vérifiez vos DEUX boîtes mail (ancienne et nouvelle) pour confirmer le changement.'
            });
            // On ne vide pas le message tout de suite car c'est une info importante
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

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

                {/* CARTE 2 : Adresse Email */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Icon name="cloud" size={18} className="text-indigo-500" />
                            Adresse Email
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Nécessite une confirmation sur votre nouvelle adresse.</p>
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
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Modifier l'email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Placeholder Sécurité */}
                <div className="opacity-50 pointer-events-none p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400">Section Mot de passe (À venir...)</p>
                </div>

            </div>
        </div>
    );
};

export default ProfileView;