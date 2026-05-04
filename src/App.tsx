import { useState, useEffect, useCallback } from 'react';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import ProfilePanel from './components/ProfilePanel';
import NotificationsPage from './components/NotificationsPage';
import ChatPage from './components/ChatPage';
import PaymentPage from './components/PaymentPage';
import MissionsPage from './components/MissionsPage';
import LocalisationPage from './components/LocalisationPage';
import AdminPage from './components/AdminPage';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { UserData, Notification, Mission } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { testFirebaseConnection } from './lib/firebase';
import { Home, MessageSquare, ShieldCheck, MapPin, Lock, Phone, X } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';

export type View = 'registration' | 'dashboard' | 'profile' | 'notifications' | 'chat' | 'payment' | 'missions' | 'localisation' | 'admin';

export default function App() {
  const [firebaseStatus, setFirebaseStatus] = useState<'testing' | 'success' | 'failed'>('testing');
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeView, setActiveView] = useState<View>('registration');
  const [sessionRole, setSessionRole] = useState<'admin' | 'user' | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);
  const [adminViewingUser, setAdminViewingUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged: user =", user?.email || (user?.isAnonymous ? 'Anonymous' : 'None'), "UID =", user?.uid);
      
      if (user) {
        // Admin detection
        if (user.email === 'filantmael225@gmail.com' || sessionRole === 'admin') {
          console.log("Admin detected, redirecting to admin dashboard");
          setSessionRole('admin');
          setActiveView('admin');
          setIsAuthReady(true);
          setIsCheckingProfile(false);
          return;
        }

        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data() as UserData;
            // Only consider profile complete if details exists
            if (data.details && Object.keys(data.details).length > 0) {
              setUserData(data);
              setSessionRole('user');
              if (activeView === 'registration') {
                setActiveView('dashboard');
              }
            } else {
              setActiveView('registration');
              setUserData(null);
            }
          } else {
            setActiveView('registration');
            setUserData(null);
          }

          // Sync basic info quietly
          await setDoc(userRef, {
            email: user.email || 'Anonyme',
            displayName: user.displayName || 'Utilisateur',
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Error in onAuthStateChanged profile sync:", e);
        } finally {
          setIsAuthReady(true);
          setIsCheckingProfile(false);
        }
      } else {
        // Automatically sign in anonymously if not logged in
        try {
          console.log("Auto-signing in anonymously...");
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auto sign-in failed:", err);
          setIsAuthReady(true);
          setIsCheckingProfile(false);
        }
        
        setActiveView('registration');
        setUserData(null);
        setSessionRole(null);
      }
    });
    return () => unsubscribe();
  }, [activeView, sessionRole]);

  const handleAdminLogin = async () => {
    setIsAdminVerifying(true);
    setAdminError(null);
    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: adminPhone })
      });
      
      const result = await response.json();
      if (result.success) {
        setSessionRole('admin');
        setActiveView('admin');
        setIsAdminLoginOpen(false);
        setAdminPhone('');
      } else {
        setAdminError(result.message || "Erreur de connexion");
      }
    } catch (err) {
      setAdminError("Erreur serveur");
    } finally {
      setIsAdminVerifying(false);
    }
  };

  useEffect(() => {
    async function checkFirebase() {
      const isConnected = await testFirebaseConnection();
      setFirebaseStatus(isConnected ? 'success' : 'failed');
    }
    checkFirebase();
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('filant225_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('filant225_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('filant225_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem('filant225_user', JSON.stringify({ ...userData, theme }));
    } else {
      localStorage.removeItem('filant225_user');
    }
  }, [userData, theme]);

  useEffect(() => {
    localStorage.setItem('filant225_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      time: 'À l\'instant',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const syncUserData = useCallback(async (data: UserData) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          ...data,
          uid: user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log("Firestore sync successful for UID:", user.uid);
      } catch (e) {
        console.error("Firestore sync failed:", e);
      }
    }
  }, []);

  const addMission = useCallback((title: string, category: Mission['category'] = 'autre') => {
    setUserData(prev => {
      if (!prev) return null;
      const newMission: Mission = {
        id: Date.now(),
        title,
        category,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'en cours'
      };
      const updated = { ...prev, missions: [newMission, ...(prev.missions || [])] };
      syncUserData(updated); // Sync to Firestore
      return updated;
    });
    addNotification('Nouvelle mission', `La mission "${title}" a été ajoutée à votre historique.`, 'info');
  }, [addNotification, syncUserData]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const hasUnread = prev.some(n => !n.read);
      if (!hasUnread) return prev;
      return prev.map(n => ({ ...n, read: true }));
    });
  }, []);

  const handleUpdateUser = useCallback((updates: Partial<UserData>) => {
    if (updates.theme) setTheme(updates.theme as 'light' | 'dark');
    setUserData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      syncUserData(updated); // Sync to Firestore
      return updated;
    });
  }, [syncUserData]);

  const handleRegistrationComplete = useCallback(async (data: { profileType: any; details: Record<string, string> }) => {
    const newUser: UserData = { 
      ...data, 
      isActivated: false, 
      missions: [
        { id: 1, title: 'Plomberie', category: 'plomberie', date: '15/04/2026', status: 'terminée' },
        { id: 2, title: 'Magasin centre-ville', category: 'immobilier', date: '16/04/2026', status: 'terminée' },
        { id: 3, title: 'Bétonnière', category: 'equipement', date: '17/04/2026', status: 'en cours' }
      ],
      isAvailable: true,
      theme,
      createdAt: new Date().toISOString()
    };
    
    // Save to Firestore automatically
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        console.log("Saving user profile to Firestore for UID:", user.uid);
        await setDoc(userRef, {
          ...newUser,
          uid: user.uid,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log("Profile saved successfully.");
        
        // ONLY AFTER SUCCESSFUL SAVE, we update state and navigate
        setUserData(newUser);
        addNotification('Bienvenue', 'Votre inscription a été validée avec succès.', 'success');
        setActiveView('dashboard');
        setSessionRole('user');
      } else {
        console.warn("No Firebase user found. Authentication required before saving to DB.");
        alert("Erreur: Authentification requise. Veuillez réessayer.");
      }
    } catch (e) {
      console.error("Error saving user to DB:", e);
      alert("Une erreur est survenue lors de l'enregistrement de votre profil. Veuillez réessayer.");
    }
  }, [addNotification, theme]);

  const handleLogout = useCallback(() => {
    setUserData(null);
    setNotifications([]);
    setSessionRole(null);
    localStorage.removeItem('filant225_user');
    localStorage.removeItem('filant225_notifications');
    setActiveView('login');
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    let updatedUser: UserData | null = null;
    setUserData(prev => {
      if (!prev) return null;
      updatedUser = { ...prev, isActivated: true };
      return updatedUser;
    });
    
    addNotification('Paiement réussi', 'Votre mise en relation est désormais active !', 'success');
    
    // Map profileType to mission category
    let category: Mission['category'] = 'autre';
    if (userData?.profileType === 'travailleur') category = 'plomberie';
    else if (userData?.profileType === 'proprietaire') category = 'equipement';
    else if (userData?.profileType === 'agence') category = 'immobilier';
    
    addMission('Activation des services', category);
    setActiveView('dashboard');

    // Sync activation to DB
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { isActivated: true, updatedAt: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.error("Error updating activation status:", e);
      }
    }
  }, [addNotification, addMission, userData?.profileType, userData?.details?.email]);

  const navigateToDashboard = useCallback(() => setActiveView('dashboard'), []);
  const navigateToNotifications = useCallback(() => setActiveView('notifications'), []);
  const navigateToChat = useCallback(() => setActiveView('chat'), []);
  const navigateToMissions = useCallback(() => setActiveView('missions'), []);
  const navigateToPayment = useCallback(() => setActiveView('payment'), []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const handleNewChatMessage = useCallback(() => {
    addNotification('Nouveau message', 'Vous avez reçu un message de l\'assistance.', 'info');
  }, [addNotification]);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-white'}`}>
      {(!isAuthReady || isCheckingProfile) ? (
        <div className="min-h-screen flex items-center justify-center bg-brand-orange">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Initialisation...</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
        {activeView === 'registration' && (
          <motion.div key="registration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <RegistrationPage onComplete={handleRegistrationComplete} theme={theme} />
          </motion.div>
        )}
        
        {sessionRole === 'admin' ? (
          <motion.div 
            key="admin-root" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen pb-24"
          >
            {activeView === 'admin' ? (
              <AdminPage 
                onBack={() => {}} 
                onViewMissions={(user) => {
                  setAdminViewingUser(user);
                  setActiveView('missions');
                }}
              />
            ) : activeView === 'missions' && adminViewingUser ? (
              <MissionsPage 
                missions={adminViewingUser.missions}
                onBack={() => {
                  setAdminViewingUser(null);
                  setActiveView('admin');
                }}
                theme={theme}
              />
            ) : (
              <AdminPage 
                onBack={() => {}} 
                onViewMissions={(user) => {
                  setAdminViewingUser(user);
                  setActiveView('missions');
                }}
              />
            )}

            {/* Admin Logout Button */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
              <button 
                onClick={() => {
                  setSessionRole(null);
                  setActiveView('login');
                  auth.signOut();
                }}
                className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest leading-none shadow-xl shadow-red-500/20 active:scale-95 transition-all text-[10px]"
              >
                Déconnexion
              </button>
            </div>
          </motion.div>
        ) : (userData && ['dashboard', 'profile', 'notifications', 'chat', 'payment', 'missions', 'localisation'].includes(activeView)) && (
          <>
            <motion.div 
              key={activeView} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="min-h-screen pb-24"
            >
              {activeView === 'dashboard' && (
                <Dashboard 
                  userData={userData} 
                  onNavigate={(view) => view === 'profile' ? openProfile() : setActiveView(view)} 
                  unreadCount={unreadCount}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                />
              )}

              {activeView === 'notifications' && (
                <NotificationsPage 
                  notifications={notifications}
                  onBack={navigateToDashboard} 
                  onMarkAsRead={markNotificationsAsRead}
                  theme={theme}
                />
              )}

              {activeView === 'chat' && (
                <ChatPage 
                  userData={userData}
                  onBack={navigateToDashboard} 
                  onNewMessage={handleNewChatMessage}
                  theme={theme}
                />
              )}

              {activeView === 'missions' && (
                <MissionsPage 
                  missions={adminViewingUser ? adminViewingUser.missions : (userData?.missions || [])}
                  onBack={() => {
                    if (adminViewingUser) {
                      setAdminViewingUser(null);
                      setActiveView('admin');
                    } else {
                      navigateToDashboard();
                    }
                  }}
                  theme={theme}
                />
              )}

              {activeView === 'payment' && (
                <PaymentPage 
                  onBack={navigateToDashboard} 
                  onSuccess={handlePaymentSuccess}
                  theme={theme}
                />
              )}

              {activeView === 'localisation' && (
                <LocalisationPage 
                  onBack={navigateToDashboard}
                  theme={theme}
                />
              )}

              {activeView === 'admin' && (
                <AdminPage 
                  onBack={navigateToDashboard}
                  onViewMissions={(user) => {
                    setAdminViewingUser(user);
                    setActiveView('missions');
                  }}
                />
              )}
            </motion.div>

            <AnimatePresence>
              {isProfileOpen && (
                <ProfilePanel 
                  userData={userData} 
                  onBack={closeProfile} 
                  onLogout={() => { handleLogout(); closeProfile(); }}
                  onUpdateUser={handleUpdateUser}
                />
              )}
            </AnimatePresence>

            {/* Persistent Bottom Navigation */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 z-40 transition-transform duration-300 ${activeView === 'registration' ? 'translate-y-full' : 'translate-y-0'}`}>
              <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex justify-between items-center px-4 py-2">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeView === 'dashboard' ? 'text-brand-orange' : 'text-gray-400'}`}
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase">Accueil</span>
                </button>
                <button 
                  onClick={() => setActiveView('chat')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeView === 'chat' ? 'text-brand-orange' : 'text-gray-400'}`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase">Messages</span>
                </button>
                {(auth.currentUser?.email === 'filantmael225@gmail.com' || sessionRole === 'admin') && (
                  <button 
                    onClick={() => setActiveView('admin')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeView === 'admin' ? 'text-brand-orange' : 'text-gray-400'}`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase">Admin DB</span>
                  </button>
                )}
                <button 
                  onClick={() => setActiveView('localisation')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${activeView === 'localisation' ? 'text-brand-orange' : 'text-gray-400'}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase">Cartes</span>
                </button>
              </div>
            </div>
          </>
        )}
        {/* Admin Secret Access Button */}
        {sessionRole !== 'admin' && (
          <button 
            onClick={() => setIsAdminLoginOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-8 h-8 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-brand-orange transition-all"
            title="Admin access"
          >
            <Lock className="w-3 h-3" />
          </button>
        )}

        {/* Admin Login Modal */}
        <AnimatePresence>
          {isAdminLoginOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black uppercase text-brand-orange">Accès Admin</h2>
                   <button onClick={() => setIsAdminLoginOpen(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Numéro Administrateur</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="0705052632"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black"
                        />
                      </div>
                   </div>
                   
                   {adminError && (
                     <p className="text-[10px] text-red-500 font-bold uppercase text-center">{adminError}</p>
                   )}
                   
                   <button 
                     onClick={handleAdminLogin}
                     disabled={isAdminVerifying}
                     className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-orange/20"
                   >
                     {isAdminVerifying ? "Vérification..." : "Se connecter"}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </AnimatePresence>
      )}
    </div>
  );
}
