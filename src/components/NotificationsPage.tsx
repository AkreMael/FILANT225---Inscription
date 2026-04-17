import { motion } from 'motion/react';
import { ChevronLeft, Bell, MessageCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationsPageProps {
  onBack: () => void;
}

const NOTIFICATIONS = [
  { id: 1, title: 'Bienvenue sur FILANT225', message: 'Votre inscription a été validée avec succès.', time: 'À l\'instant', icon: <Info className="text-blue-500" /> },
  { id: 2, title: 'Activation', message: 'Activez votre mise en relation pour commencer à recevoir des offres.', time: 'Il y a 2 min', icon: <AlertCircle className="text-brand-orange" /> },
];

export default function NotificationsPage({ onBack }: NotificationsPageProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-tight">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {NOTIFICATIONS.map((notif) => (
          <div key={notif.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                {notif.icon}
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h3 className="font-bold text-gray-900 text-sm">{notif.title}</h3>
                   <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
             </div>
          </div>
        ))}
        
        {NOTIFICATIONS.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
             <Bell className="w-16 h-16 mb-2" />
             <p className="font-bold">Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
