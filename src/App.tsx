import { useState, useEffect, useCallback } from 'react';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import ProfilePanel from './components/ProfilePanel';
import NotificationsPage from './components/NotificationsPage';
import ChatPage from './components/ChatPage';
import PaymentPage from './components/PaymentPage';
import MissionsPage from './components/MissionsPage';
import LocalisationPage from './components/LocalisationPage';
import { UserData, Notification, Mission } from './types';
import { motion, AnimatePresence } from 'motion/react';

export type View = 'registration' | 'dashboard' | 'profile' | 'notifications' | 'chat' | 'payment' | 'missions' | 'localisation';

export default function App() {
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

  const [activeView, setActiveView] = useState<View>(() => {
    return localStorage.getItem('filant225_user') ? 'dashboard' : 'registration';
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
      id: Date.now(),
      title,
      message,
      time: 'À l\'instant',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const addMission = useCallback((title: string) => {
    setUserData(prev => {
      if (!prev) return null;
      const newMission: Mission = {
        id: Date.now(),
        title,
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

  const handleRegistrationComplete = useCallback((data: { profileType: any; details: Record<string, string> }) => {
    const newUser: UserData = { 
      ...data, 
      isActivated: false, 
      missions: [
        { id: 1, title: 'Livraison express Abidjan', date: '15/04/2026', status: 'terminée' },
        { id: 2, title: 'Maintenance équipement', date: '16/04/2026', status: 'terminée' }
      ],
      isAvailable: true,
      theme
    };
    setUserData(newUser);
    addNotification('Bienvenue', 'Votre inscription a été validée avec succès.', 'success');
    setActiveView('dashboard');
  }, [addNotification, theme]);

  const handleLogout = useCallback(() => {
    setUserData(null);
    setNotifications([]);
    localStorage.removeItem('filant225_user');
    localStorage.removeItem('filant225_notifications');
    setActiveView('registration');
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setUserData(prev => {
      if (!prev) return null;
      return { ...prev, isActivated: true };
    });
    addNotification('Paiement réussi', 'Votre mise en relation est désormais active !', 'success');
    addMission('Première mission activée');
    setActiveView('dashboard');
  }, [addNotification, addMission]);

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
      <AnimatePresence mode="wait">
        {activeView === 'registration' && (
          <motion.div key="registration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <RegistrationPage onComplete={handleRegistrationComplete} theme={theme} />
          </motion.div>
        )}
        
        {userData && (
          <>
            <motion.div 
              key={activeView} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="min-h-screen"
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
                  onBack={navigateToDashboard} 
                  onNewMessage={handleNewChatMessage}
                  theme={theme}
                />
              )}

              {activeView === 'missions' && (
                <MissionsPage 
                  missions={userData.missions}
                  onBack={navigateToDashboard}
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
