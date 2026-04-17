import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsPageProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkAsRead: () => void;
}

const ICON_MAP = {
  info: <Info className="text-blue-500" />,
  alert: <AlertCircle className="text-brand-orange" />,
  success: <CheckCircle2 className="text-green-500" />,
};

export default function NotificationsPage({ notifications, onBack, onMarkAsRead }: NotificationsPageProps) {
  useEffect(() => {
    // Mark as read when page opens
    onMarkAsRead();
  }, [onMarkAsRead]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full cursor-pointer hover:bg-white/30">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold uppercase tracking-tight leading-none">Notifications</h1>
          <span className="text-[10px] font-bold opacity-60 uppercase">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {notifications.map((notif) => (
          <motion.div 
            key={notif.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-4 p-4 bg-gray-50 rounded-2xl border ${notif.read ? 'border-gray-100 opacity-80' : 'border-brand-orange/30 shadow-sm bg-white'}`}
          >
             <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                {ICON_MAP[notif.type]}
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h3 className="font-bold text-gray-900 text-sm">{notif.title}</h3>
                   <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
             </div>
          </motion.div>
        ))}
        
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-12 h-12 text-gray-300" />
             </div>
             <p className="font-bold text-gray-600">0 notification</p>
             <p className="text-xs text-gray-400 mt-1">Vous n'avez aucun message pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
