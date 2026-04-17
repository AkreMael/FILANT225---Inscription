import { useState } from 'react';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import ProfilePanel from './components/ProfilePanel';
import NotificationsPage from './components/NotificationsPage';
import ChatPage from './components/ChatPage';
import PaymentPage from './components/PaymentPage';
import { UserData } from './types';
import { motion, AnimatePresence } from 'motion/react';

export type View = 'registration' | 'dashboard' | 'profile' | 'notifications' | 'chat' | 'payment';

export default function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeView, setActiveView] = useState<View>('registration');

  const handleRegistrationComplete = (data: UserData) => {
    setUserData({ ...data, isActivated: false });
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setActiveView('registration');
  };

  const handlePaymentSuccess = () => {
    if (userData) {
      setUserData({ ...userData, isActivated: true });
      setActiveView('dashboard');
    }
  };

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
                <NotificationsPage onBack={() => setActiveView('dashboard')} />
              </motion.div>
            )}

            {activeView === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ChatPage onBack={() => setActiveView('dashboard')} />
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
