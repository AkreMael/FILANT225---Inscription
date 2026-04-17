import { motion } from 'motion/react';
import { ChevronLeft, LogOut, User, MapPin, Phone, Briefcase, Calendar } from 'lucide-react';
import { UserData, PROFILE_LABELS } from '../types';

interface ProfilePanelProps {
  userData: UserData;
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfilePanel({ userData, onBack, onLogout }: ProfilePanelProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-tight">Mon Profil</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex flex-col items-center">
           <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-brand-orange flex items-center justify-center relative shadow-lg">
              <User className="w-12 h-12 text-gray-400" />
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${userData.isActivated ? 'bg-green-500' : 'bg-gray-400'}`} />
           </div>
           <h2 className="text-2xl font-black mt-4 text-gray-900 font-display">
             {userData.details['Nom utilisateur'] || userData.details['Nom'] || 'Utilisateur'}
           </h2>
           <span className="bg-orange-100 text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1">
             {PROFILE_LABELS[userData.profileType]}
           </span>
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Informations personnelles</h3>
           
           <div className="grid grid-cols-1 gap-4">
              {Object.entries(userData.details).map(([key, value]) => (
                 <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-orange">
                       {key.toLowerCase().includes('ville') ? <MapPin className="w-5 h-5" /> :
                        key.toLowerCase().includes('téléphone') || key.toLowerCase().includes('numéro') ? <Phone className="w-5 h-5" /> :
                        key.toLowerCase().includes('métier') ? <Briefcase className="w-5 h-5" /> :
                        <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{key}</p>
                       <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <div className="pt-6">
           <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-colors"
           >
              <LogOut className="w-5 h-5" />
              Se déconnecter
           </button>
        </div>
      </div>
    </div>
  );
}
