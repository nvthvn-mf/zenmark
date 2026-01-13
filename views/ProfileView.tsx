import React, { useState, useEffect } from 'react';
import { AuthController } from '../controllers/AuthController';
import Icon from '../components/Icon';

interface ProfileViewProps {
    user: any;
    onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initialisation des champs avec les données actuelles
    useEffect(() => {
        if (user?.user_metadata) {
            setFirstName(user.user_metadata.first_name || '');
            setLastName(user.user_metadata.last_name || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await AuthController.updateProfile(firstName, lastName);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

            // On fait disparaître le message après 3 secondes
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Une erreur est survenue' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">

                {/* En-tête avec bouton retour */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-full transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <Icon name="home" size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Paramètres du compte</h1>
                </div>

                {/* Carte : Informations Personnelles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Icon name="file" size={18} className="text-indigo-500" /> {/* Icône temporaire, on peut mettre 'user' si dispo */}
                            Informations personnelles
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Mettez à jour vos informations d'identité</p>
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
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Zone de notification */}
                            {message.text && (
                                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Placeholder pour les futures sections */}
                <div className="opacity-50 pointer-events-none p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400">Sections Email & Sécurité (À venir...)</p>
                </div>

            </div>
        </div>
    );
};

export default ProfileView;