import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Eye, Search, ShieldCheck, User as UserIcon, Clock, LogIn } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { UserData } from '../types';

interface AdminUser extends UserData {
  id: string;
}

interface LoginRecord {
  id: string;
  phoneNumber: string;
  timestamp: any;
  role: string;
  uid: string;
}

interface AdminPageProps {
  onBack: () => void;
  onViewMissions: (user: AdminUser) => void;
}

export default function AdminPage({ onBack, onViewMissions }: AdminPageProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logins'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Real-time synchronization for users
    const usersQ = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];
      setUsers(usersData);
      setLoading(false);
      setAccessDenied(false);
    }, (error) => {
      console.error("Admin user listener error:", error);
      setLoading(false);
      if (error.code === 'permission-denied') setAccessDenied(true);
    });

    // Real-time synchronization for logins
    const loginsQ = query(collection(db, 'logins'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeLogins = onSnapshot(loginsQ, (snapshot) => {
      const loginsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoginRecord[];
      setLogins(loginsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeLogins();
    };
  }, []);

  const sendMessage = async (userId: string) => {
    const message = prompt('Envoyer un message à l\'utilisateur (le message apparaîtra dans sa boîte de réception) :');
    if (message) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: message,
          sender: 'admin',
          userId: userId, // UID of the recipient
          timestamp: serverTimestamp()
        });
        alert('Message envoyé avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'envoie du message:', error);
        alert('Échec de l\'envoi du message.');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    Object.values(user.details || {}).some(val => String(val || '').toLowerCase().includes((searchTerm || '').toLowerCase())) ||
    (user.profileType || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (user.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (user.details?.phoneNumber || '').includes(searchTerm)
  );

  const filteredLogins = logins.filter(login => 
    login.phoneNumber.includes(searchTerm) || 
    login.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    login.uid.includes(searchTerm)
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-950 flex flex-col pb-20">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-orange" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Base de Données</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Administration Filant 225</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-colors"
          >
            Fermer
          </button>
        </div>

        <div className="flex gap-4 mb-6">
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === 'users' ? 'bg-brand-orange text-white overflow-hidden shadow-lg shadow-brand-orange/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
           >
              <Users className="w-4 h-4" />
              Comptes ({users.length})
           </button>
           <button 
             onClick={() => setActiveTab('logins')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${activeTab === 'logins' ? 'bg-brand-orange text-white overflow-hidden shadow-lg shadow-brand-orange/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
           >
              <LogIn className="w-4 h-4" />
              Connexions ({logins.length})
           </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={`Rechercher dans ${activeTab === 'users' ? 'les comptes' : 'les connexions'}...`}
            className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-orange transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement...</p>
          </div>
        ) : accessDenied ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 px-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Accès Restreint</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed">
                Connectez-vous avec un compte administrateur.
              </p>
            </div>
          </div>
        ) : (
          activeTab === 'users' ? (
          <div className="grid gap-6">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 overflow-hidden">
                      {user.idDocuments?.recto ? (
                         <img src={user.idDocuments.recto} alt="ID" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                          user.isActivated ? 'bg-green-100 text-green-600' : 'bg-brand-orange/10 text-brand-orange'
                        }`}>
                          {user.profileType}
                        </span>
                        {user.isAvailable && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                        {user.details?.firstName || user.details?.Nom ||'Sans Nom'} {user.details?.lastName || ''}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        ID: {user.id.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Créé le</p>
                    <p className="text-xs font-black text-gray-700 dark:text-gray-300">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* All detailed info from form */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl mb-6 border border-gray-100 dark:border-gray-700">
                   {Object.entries(user.details || {}).map(([key, value]) => (
                     <div key={key}>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{key}</p>
                       <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{value || 'N/A'}</p>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onViewMissions(user)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                  >
                    <Eye className="w-4 h-4 text-brand-orange" />
                    Voir missions ({user.missions?.length || 0})
                  </button>
                  <button 
                    onClick={() => sendMessage(user.id)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-brand-orange text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:bg-brand-dark-orange transition-all active:scale-[0.98]"
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer Message
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pb-20">
             {filteredLogins.map((login) => (
               <motion.div
                 key={login.id}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 text-left"
               >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${login.role === 'admin' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <LogIn className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                       <p className="font-black text-gray-900 dark:text-white text-xs">{login.phoneNumber}</p>
                       <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${login.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {login.role}
                       </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                       <Clock className="w-3 h-3" />
                       {login.timestamp?.toDate ? login.timestamp.toDate().toLocaleString() : 'Récemment'}
                    </div>
                 </div>
                 <div className="text-[8px] font-bold text-gray-300 dark:text-gray-700 uppercase">
                    {login.uid.slice(0, 6)}
                 </div>
               </motion.div>
             ))}
             {filteredLogins.length === 0 && (
               <div className="py-20 text-center opacity-40 font-bold uppercase text-[10px] tracking-widest">Aucune connexion enregistrée</div>
             )}
          </div>
        )
      )}
    </main>
    </div>
  );
}
