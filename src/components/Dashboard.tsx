import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, MapPin, Info, QrCode, MessageSquare, X, Smartphone, CheckCircle2, Moon, Sun, ClipboardCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { UserData, PROFILE_LABELS } from '../types';
import { View } from '../App';

interface DashboardProps {
  userData: UserData;
  onNavigate: (view: View) => void;
  unreadCount: number;
  onUpdateUser: (updates: Partial<UserData>) => void;
  theme: 'light' | 'dark';
}

export default function Dashboard({ userData, onNavigate, unreadCount, onUpdateUser, theme }: DashboardProps) {
  const [showQR, setShowQR] = useState(false);

  const toggleTheme = () => {
    onUpdateUser({ theme: theme === 'light' ? 'dark' : 'light' });
  };
  
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', year: 'numeric' };
  const dateString = today.toLocaleDateString('fr-FR', options).toUpperCase();
  
  const qrDataString = [
    `Nom: ${userData.details['Nom utilisateur'] || userData.details['Nom'] || 'N/A'}`,
    `Ville: ${userData.details['Ville actuelle'] || userData.details['Ville'] || 'N/A'}`,
    `Numéro: ${userData.details['Numéro de téléphone'] || userData.details['Téléphone'] || 'N/A'}`,
    `Métier: ${userData.details['Métier'] || PROFILE_LABELS[userData.profileType]}`,
  ].join('\n');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative transition-colors duration-300">
      {/* Top Header */}
      <div className="bg-brand-orange pt-4 pb-2 px-6 flex justify-between items-start text-black shadow-md transition-colors duration-300">
        <button 
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center border-2 border-black overflow-hidden shadow-sm">
             <User className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase mt-1">Profil</span>
        </button>
        
        <div className="flex items-start gap-4">
           {/* Ivory Coast Flag */}
           <div className="flex flex-col items-center">
              <div className="h-12 flex items-center">
                 <div className="flex w-12 h-8 border border-black/20 shadow-sm overflow-hidden rounded-sm">
                    <div className="bg-[#FF8200] flex-1"></div>
                    <div className="bg-white flex-1"></div>
                    <div className="bg-[#009E60] flex-1"></div>
                 </div>
              </div>
              <span className="text-[10px] font-black uppercase mt-1 invisible">Flag</span>
           </div>

           {/* Notifications */}
           <div className="flex flex-col items-center">
              <div className="h-12 flex items-center">
                 <button 
                   onClick={() => onNavigate('notifications')}
                   className="relative cursor-pointer active:scale-110 transition-transform"
                 >
                    <Bell className="w-10 h-10 fill-black" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-white text-brand-orange text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-black shadow-sm">
                        {unreadCount}
                      </div>
                    )}
                 </button>
              </div>
              <span className="text-[10px] font-black uppercase mt-1 invisible">Notif</span>
           </div>

           {/* Theme Toggle */}
           <div className="flex flex-col items-center">
              <div className="h-12 flex items-center">
                 <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 bg-white/20 dark:bg-black/10 rounded-full flex items-center justify-center cursor-pointer active:scale-110 transition-transform border border-black/10 shadow-sm"
                 >
                    {theme === 'dark' ? (
                      <Sun className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Moon className="w-6 h-6 text-black fill-black/10" />
                    )}
                 </button>
              </div>
              <span className="text-[10px] font-black uppercase mt-1 invisible">Mode</span>
           </div>
        </div>
      </div>

      <div className="bg-brand-orange py-2 px-4 text-center">
         <p className="text-sm font-bold text-black flex items-center justify-center gap-2">
           DATE DU JOUR <span className="text-white ml-2">{dateString.replace(' ', ' \\ ')}</span>
         </p>
      </div>

      {/* Main Brand Header */}
      <div className="bg-[#442200] py-6 px-4 flex justify-center items-center gap-4 relative overflow-hidden">
         <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
         <h1 className="text-7xl font-black text-brand-orange italic font-display tracking-tighter shrink-0">
           FILANT <span className="text-white">225</span>
         </h1>
         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
            <Info className="w-7 h-7 text-black stroke-[3]" />
         </div>
      </div>

      {/* Grid Content */}
      <div className={`${theme === 'dark' ? 'bg-gray-950' : 'brand-gradient'} p-6 space-y-6 flex-1 min-h-[60vh] transition-colors duration-300`}>
         <div className="grid grid-cols-2 gap-4">
            <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => onNavigate('missions')}
               className="bg-[#EEEEEE] rounded-3xl p-4 flex flex-col items-center justify-center aspect-square shadow-inner cursor-pointer border-4 border-transparent hover:border-brand-orange/30 transition-all group"
            >
               <div className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-sm transition-colors">
                  <ClipboardCheck className="w-20 h-20 text-brand-orange" />
                  {userData.missions.length > 0 && (
                     <div className="absolute top-2 right-2 bg-brand-red text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {userData.missions.length}
                     </div>
                  )}
               </div>
               <span className="text-[10px] text-center mt-2 font-black text-black uppercase leading-tight tracking-tighter">
                  Mes missions
               </span>
            </motion.button>

            <motion.div 
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowQR(userData.isActivated)}
               className={`bg-[#EEEEEE] rounded-3xl p-4 flex flex-col items-center justify-center aspect-square shadow-inner group cursor-pointer border-4 transition-colors ${
                 userData.isActivated ? 'border-brand-orange' : 'border-[#3399FF]'
               }`}
            >
               <div className={`relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden shadow-sm transition-colors ${
                  userData.isActivated ? 'bg-white' : 'bg-transparent'
               }`}>
                  <QrCode className={`w-24 h-24 ${userData.isActivated ? 'text-black opacity-100' : 'text-blue-400 opacity-50'}`} />
                  {!userData.isActivated && (
                    <div className="absolute inset-0 bg-gray-200/40 backdrop-blur-[1px] flex items-center justify-center">
                       <span className="bg-black/60 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">DÉSACTIVÉ</span>
                    </div>
                  )}
               </div>
               <span className="text-[10px] text-center mt-2 font-black text-black uppercase leading-tight tracking-tighter">
                 {userData.isActivated ? 'cliquez pour afficher votre carte' : 'cliquez pour activer votre carte'}
               </span>
            </motion.div>
          </div>

         <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => !userData.isActivated && onNavigate('payment')}
            className={`w-full py-6 rounded-[2.5rem] shadow-[0_8px_0_0_rgba(150,0,0,0.5)] active:shadow-none translate-y-[-4px] active:translate-y-0 transition-all font-display text-2xl font-black uppercase tracking-wider ${
              userData.isActivated ? 'bg-green-600 text-white shadow-[0_8px_0_0_rgba(0,100,0,0.5)]' : 'bg-brand-red text-white'
            }`}
         >
            {userData.isActivated ? (
              <div className="flex items-center justify-center gap-3">
                 MISE EN RELATION ACTIVE
                 <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <>
                 ACTIVER LA MISE EN RELATION - 7 100 F
                 <p className="text-sm font-bold opacity-80 normal-case mt-1 tracking-tight">Cliquez pour activer votre mise en relation professionnelle</p>
              </>
            )}
         </motion.button>
 
         <div className="flex justify-center gap-8 pt-4">
            <div className="flex flex-col items-center">
               <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('chat')}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,102,0,0.3)] border-4 border-brand-orange group cursor-pointer"
               >
                  <MessageSquare className="w-12 h-12 text-brand-orange fill-brand-orange/10 group-hover:fill-brand-orange transition-colors" />
               </motion.button>
               <span className="text-[10px] font-black text-black dark:text-white mt-2 uppercase tracking-wide text-center">Message assistant</span>
            </div>

            <div className="flex flex-col items-center">
               <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onNavigate('localisation')}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,102,0,0.3)] border-4 border-brand-orange group cursor-pointer"
               >
                  <MapPin className="w-12 h-12 text-brand-orange fill-brand-orange/10 group-hover:fill-brand-orange transition-colors" />
               </motion.button>
               <span className="text-[10px] font-black text-black dark:text-white mt-2 uppercase tracking-wide text-center">Localisation</span>
            </div>
         </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
             <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden flex flex-col items-center text-center pb-8 shadow-2xl border-4 border-brand-orange"
             >
                <div className="bg-brand-orange w-full p-6 text-black relative">
                   <h2 className="text-2xl font-black uppercase tracking-tighter">Votre Carte QR</h2>
                   <button onClick={() => setShowQR(false)} className="absolute right-6 top-6 bg-white/20 p-1 rounded-full">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                
                <div className="p-8 bg-white rounded-3xl mt-6 shadow-inner border-2 border-gray-50">
                   <QRCodeSVG 
                      value={qrDataString} 
                      size={200}
                      level="H"
                      includeMargin={false}
                   />
                </div>
                
                <div className="mt-8 px-6 space-y-4">
                   <div className="space-y-1">
                      <p className="text-3xl font-black text-gray-900 leading-none font-display uppercase tracking-tighter">
                        {userData.details['Nom utilisateur'] || userData.details['Nom'] || 'N/A'}
                      </p>
                      <p className="text-brand-orange font-bold uppercase tracking-widest text-sm italic">
                        {userData.details['Métier'] || PROFILE_LABELS[userData.profileType]}
                      </p>
                   </div>
                   
                   <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2 text-gray-700 font-bold">
                         <MapPin className="w-4 h-4 text-brand-orange" />
                         <span className="text-sm">{userData.details['Ville actuelle'] || userData.details['Ville'] || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700 font-bold">
                         <Smartphone className="w-4 h-4 text-brand-orange" />
                         <span className="text-sm">{userData.details['Numéro de téléphone'] || userData.details['Téléphone'] || 'N/A'}</span>
                      </div>
                   </div>

                   <p className="text-[10px] text-gray-400 font-bold uppercase border-2 border-green-500 rounded-full py-1 px-4 mt-6">
                     Profil actif & vérifié
                   </p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
