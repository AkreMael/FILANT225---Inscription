import { useState, useEffect } from 'react';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import ProfilePanel from './components/ProfilePanel';
import NotificationsPage from './components/NotificationsPage';
import ChatPage from './components/ChatPage';
import PaymentPage from './components/PaymentPage';
import MissionsPage from './components/MissionsPage';
import { UserData, Notification, Mission } from './types';
import { motion, AnimatePresence } from 'motion/react';

export type View = 'registration' | 'dashboard' | 'profile' | 'notifications' | 'chat' | 'payment' | 'missions';

export default function App() {
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
    if (userData) {
      localStorage.setItem('filant225_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('filant225_user');
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem('filant225_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: Date.now(),
      title,
      message,
      time: 'À l\'instant',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addMission = (title: string) => {
    if (!userData) return;
    const newMission: Mission = {
      id: Date.now(),
      title,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'en cours'
    };
    setUserData(prev => prev ? { ...prev, missions: [newMission, ...prev.missions] } : null);
    addNotification('Nouvelle mission', `La mission "${title}" a été ajoutée à votre historique.`, 'info');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRegistrationComplete = (data: { profileType: any; details: Record<string, string> }) => {
    const newUser: UserData = { 
      ...data, 
      isActivated: false, 
      missions: [
        { id: 1, title: 'Livraison express Abidjan', date: '15/04/2026', status: 'terminée' },
        { id: 2, title: 'Maintenance équipement', date: '16/04/2026', status: 'terminée' }
      ] 
    };
    setUserData(newUser);
    addNotification('Bienvenue', 'Votre inscription a été validée avec succès.', 'success');
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setNotifications([]);
    localStorage.clear();
    setActiveView('registration');
  };

  const handlePaymentSuccess = () => {
    if (userData) {
      setUserData({ ...userData, isActivated: true });
      addNotification('Paiement réussi', 'Votre mise en relation est désormais active !', 'success');
      addMission('Première mission activée');
      setActiveView('dashboard');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <AnimatePresence mode="wait">
        {activeView === 'registration' && (
          <motion.div key="registration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <RegistrationPage onComplete={handleRegistrationComplete} />
          </motion.div>
        )}
        
        {userData && (
          <>
            {activeView === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard 
                  userData={userData} 
                  onNavigate={setActiveView} 
                  unreadCount={unreadCount}
                />
              </motion.div>
            )}

            {activeView === 'profile' && (
              <motion.div key="profile" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}>
                <ProfilePanel 
                  userData={userData} 
                  onBack={() => setActiveView('dashboard')} 
                  onLogout={handleLogout}
                />
              </motion.div>
            )}

            {activeView === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <NotificationsPage 
                  notifications={notifications}
                  onBack={() => setActiveView('dashboard')} 
                  onMarkAsRead={markNotificationsAsRead}
                />
              </motion.div>
            )}

            {activeView === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ChatPage 
                  onBack={() => setActiveView('dashboard')} 
                  onNewMessage={() => addNotification('Nouveau message', 'Vous avez reçu un message de l\'assistance.', 'info')}
                />
              </motion.div>
            )}

            {activeView === 'missions' && (
              <motion.div key="missions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MissionsPage 
                  missions={userData.missions}
                  onBack={() => setActiveView('dashboard')}
                />
              </motion.div>
            )}

            {activeView === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <PaymentPage 
                  onBack={() => setActiveView('dashboard')} 
                  onSuccess={handlePaymentSuccess}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
