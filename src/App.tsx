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
import LoginPage from './components/LoginPage';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { UserData, Notification, Mission } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { testFirebaseConnection } from './lib/firebase';
import { Home, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

export type View = 'login' | 'registration' | 'dashboard' | 'profile' | 'notifications' | 'chat' | 'payment' | 'missions' | 'localisation' | 'admin';

export default function App() {
  const [firebaseStatus, setFirebaseStatus] = useState<'testing' | 'success' | 'failed'>('testing');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged: user =", user?.email);
      setIsAuthReady(true);
      
      if (user) {
        // Handle Admin auto-redirect
        if (user.email === 'filantmael225@gmail.com') {
          console.log("Admin detected, redirecting to admin dashboard");
          setActiveView('admin');
          return;
        }

        // Check if user already has a profile
        try {
          console.log("Checking Firestore for existing profile for UID:", user.uid);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists() && userSnap.data().profileType) {
            console.log("Existing profile found, redirecting to dashboard");
            const data = userSnap.data() as UserData;
            setUserData(data);
            setActiveView('dashboard');
          } else {
            console.log("No profile found, redirecting to registration");
            setActiveView('registration');
          }

          // Always sync basic info
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Error in onAuthStateChanged profile sync:", e);
          // Fallback to registration if sync fails but user is logged in
          setActiveView('registration');
        }
      } else {
        console.log("No user logged in, showing login page");
        setActiveView('login');
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('filant225_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('filant225_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<View>('login');

  const [adminViewingUser, setAdminViewingUser] = useState<UserData | null>(null);

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
      id: Date.now(),
      title,
      message,
      time: 'À l\'instant',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
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
      return { ...prev, missions: [newMission, ...prev.missions] };
    });
    addNotification('Nouvelle mission', `La mission "${title}" a été ajoutée à votre historique.`, 'info');
  }, [addNotification]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const hasUnread = prev.some(n => !n.read);
      if (!hasUnread) return prev; // Avoid unnecessary re-render if nothing changes
      return prev.map(n => ({ ...n, read: true }));
    });
  }, []);

  const handleUpdateUser = useCallback((updates: Partial<UserData>) => {
    if (updates.theme) setTheme(updates.theme as 'light' | 'dark');
    setUserData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

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
    
    setUserData(newUser);
    addNotification('Bienvenue', 'Votre inscription a été validée avec succès.', 'success');
    setActiveView('dashboard');

    // Save to Firestore automatically
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        console.log("Saving user profile to Firestore:", user.uid);
        await setDoc(userRef, {
          ...newUser,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log("Profile saved successfully.");
      } else {
        console.warn("No Firebase user found. Authentication required before saving to DB.");
      }
    } catch (e) {
      console.error("Error saving user to DB:", e);
    }
  }, [addNotification, theme]);

  const handleLogout = useCallback(() => {
    setUserData(null);
    setNotifications([]);
    localStorage.removeItem('filant225_user');
    localStorage.removeItem('filant225_notifications');
    setActiveView('registration');
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
  }, [addNotification, addMission, userData?.profileType, userData?.details.email]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-white'}`}>
      {!isAuthReady ? (
        <div className="min-h-screen flex items-center justify-center bg-brand-orange">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Initialisation...</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
        {activeView === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginPage onLoginSuccess={(user) => {
               if (user.email === 'filantmael225@gmail.com') {
                 setActiveView('admin');
               } else {
                 setActiveView('registration');
               }
            }} />
          </motion.div>
        )}

        {activeView === 'registration' && (
          <motion.div key="registration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <RegistrationPage onComplete={handleRegistrationComplete} theme={theme} />
          </motion.div>
        )}
        
        {(auth.currentUser?.email === 'filantmael225@gmail.com') ? (
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
                onClick={() => auth.signOut()}
                className="bg-red-500 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest leading-none shadow-xl shadow-red-500/20 active:scale-95 transition-all text-[10px]"
              >
                Déconnexion Admin
              </button>
            </div>
          </motion.div>
        ) : userData && (
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
                {auth.currentUser?.email === 'filantmael225@gmail.com' && (
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
      </AnimatePresence>
      )}
    </div>
  );
}
