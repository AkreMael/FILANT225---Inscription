import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  LogOut, 
  User, 
  Clock, 
  CreditCard, 
  Moon, 
  Info, 
  Eye, 
  X, 
  CheckCircle2, 
  Camera, 
  Sun
} from 'lucide-react';
import { UserData, PROFILE_LABELS } from '../types';

interface ProfilePanelProps {
  userData: UserData;
  onBack: () => void;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<UserData>) => void;
}

type ProfileSubView = 'availability' | 'identity' | 'info' | null;

export default function ProfilePanel({ userData, onBack, onLogout, onUpdateUser }: ProfilePanelProps) {
  const [subView, setSubView] = useState<ProfileSubView>(null);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  const toggleTheme = () => {
    onUpdateUser({ theme: userData.theme === 'light' ? 'dark' : 'light' });
  };

  const toggleAvailability = () => {
    onUpdateUser({ isAvailable: !userData.isAvailable });
  };

  const RegistrationPopup = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => setShowRegistrationPopup(false)}
    >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 shadow-2xl space-y-6"
        >
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Inscription</h2>
            <button onClick={() => setShowRegistrationPopup(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

        <div className="space-y-4">
          <InfoItem label="Type de compte" value={PROFILE_LABELS[userData.profileType]} />
          {Object.entries(userData.details).map(([key, value]) => (
            <div key={key}>
              <InfoItem label={key} value={value} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => setShowRegistrationPopup(false)}
          className="w-full bg-brand-orange text-black py-4 rounded-2xl font-bold uppercase tracking-wide shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 transition-transform"
        >
          Fermer
        </button>
      </motion.div>
    </motion.div>
  );

  const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );

  const renderSubView = () => {
    switch (subView) {
      case 'availability':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-gray-950">
            <SubHeader title="Disponibilité" onBack={() => setSubView(null)} />
            <div className="p-8 space-y-8 flex-1">
              <div className="flex flex-col items-center text-center space-y-4 pt-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500 ${userData.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Clock className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {userData.isAvailable ? 'Disponible' : 'Non disponible'}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    {userData.isAvailable 
                      ? 'Votre profil est visible par les clients.' 
                      : 'Votre profil est masqué temporairement.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white uppercase text-sm">Activer le statut</span>
                    <button 
                      onClick={toggleAvailability}
                      className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ${userData.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${userData.isAvailable ? 'translate-x-8' : 'translate-x-0'}`} />
                    </button>
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">
                   En activant votre disponibilité, vous acceptez de recevoir des notifications pour de nouvelles missions.
                 </p>
              </div>
            </div>
          </div>
        );
      case 'identity':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-gray-950">
            <SubHeader title="Pièce d'identité" onBack={() => setSubView(null)} />
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-2">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Documents enregistrés</h3>
                 <p className="text-xs text-gray-500 font-medium">Ajoutez ou remplacez vos documents officiels pour vérifier votre compte.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <IDCardSlot label="Recto (Face avant)" status={!!userData.idDocuments?.recto} />
                 <IDCardSlot label="Verso (Face arrière)" status={!!userData.idDocuments?.verso} />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 text-blue-600 dark:text-blue-400">
                 <CheckCircle2 className="w-5 h-5 shrink-0" />
                 <p className="text-[10px] font-bold uppercase leading-relaxed">
                   La vérification manuelle par nos administrateurs peut prendre jusqu'à 24h ouvrées.
                 </p>
              </div>
            </div>
          </div>
        );
      case 'info':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-gray-950">
            <SubHeader title="Informations" onBack={() => setSubView(null)} />
            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
               <div className="flex flex-col items-center text-center space-y-4 pt-4">
                  <div className="text-6xl font-black italic text-brand-orange font-display tracking-tighter">
                    FILANT<span className="text-gray-900 dark:text-white">225</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-10 leading-relaxed">
                    Votre partenaire de confiance pour la main d'œuvre en Côte d'Ivoire
                  </p>
               </div>

               <div className="space-y-6">
                  <Section title="Description des services">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      FILANT225 est une plateforme dynamique facilitant la mise en relation entre prestataires de services qualifiés et clients potentiels. Nous rigoureusement sélectionnons nos partenaires pour garantir une qualité optimale.
                    </p>
                  </Section>

                  <Section title="Aide & Contact">
                    <div className="space-y-3">
                       <ContactButton label="Support Technique" value="support@filant225.ci" />
                       <ContactButton label="Service Commercial" value="+225 01 02 03 04 05" />
                    </div>
                  </Section>

                  <div className="pt-10 text-center">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Version 1.2.0 • 2026 FILANT225</p>
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="bg-brand-orange p-6 flex items-center gap-4 text-black shadow-lg">
              <button 
                onClick={onBack} 
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-black uppercase tracking-tight">MON PROFIL</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 pb-24">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full border-[5px] border-brand-orange flex items-center justify-center relative shadow-xl">
            <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <User className="w-16 h-16 text-gray-200" />
            </div>
            <div className={`absolute bottom-2 right-2 w-7 h-7 rounded-full border-4 border-white dark:border-gray-950 ${userData.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          
          <h2 className="text-2xl font-black mt-6 text-gray-900 dark:text-white uppercase tracking-tighter font-display leading-none text-center">
            {userData.details['Nom utilisateur'] || userData.details['Nom'] || 'UTILISATEUR'}
          </h2>
          
          <button 
            onClick={() => setShowRegistrationPopup(true)}
            className="flex items-center gap-2 text-[#7A8C9F] text-sm font-bold hover:opacity-70 transition-opacity mt-1.5 px-4 py-1"
          >
            Afficher l'inscription
            <Eye className="w-5 h-5 opacity-60" />
          </button>

          <div className="mt-2 px-6 py-1 bg-[#FEE2E2] rounded-full border border-orange-100">
            <span className="text-[#FF6600] text-[10px] font-black uppercase tracking-widest">
              {PROFILE_LABELS[userData.profileType]}
            </span>
          </div>
        </div>

              <div className="grid grid-cols-1 gap-5 px-2">
                <ProfileButton 
                  icon={<div className="p-3 border-2 border-black/20 rounded-full"><Clock className="w-8 h-8 text-black" /></div>} 
                  label="DISPONIBILITÉ" 
                  onClick={() => setSubView('availability')}
                />
                <ProfileButton 
                  icon={<CreditCard className="w-10 h-10 text-black" />} 
                  label="PIÈCE D'IDENTITÉ AUTO-VERSO" 
                  onClick={() => setSubView('identity')}
                />
                <ProfileButton 
                  icon={<div className="w-12 h-12 bg-blue-900 dark:bg-yellow-100 rounded-full flex items-center justify-center border-2 border-white/20 dark:border-yellow-200 shadow-lg transition-transform hover:scale-105 active:scale-95">
                    {userData.theme === 'dark' ? (
                      <Sun className="w-8 h-8 text-yellow-600 fill-yellow-500" />
                    ) : (
                      <Moon className="w-8 h-8 text-white fill-yellow-400" />
                    )}
                  </div>} 
                  label="MODE SOMBRE" 
                  onClick={toggleTheme}
                  status={userData.theme === 'dark' ? 'OUI' : 'NON'}
                />
                <ProfileButton 
                  icon={<div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-white/20"><Info className="w-8 h-8 text-white" /></div>} 
                  label="INFORMATIONS" 
                  onClick={() => setSubView('info')}
                />
              </div>

              <div className="pt-4 pb-4 px-2">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-[#F1F3F5] dark:bg-gray-900/50 text-[#D31D21] rounded-2xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95"
                >
                  <LogOut className="w-5 h-5 rotate-180" />
                  Se déconnecter
                </motion.button>
              </div>
            </div>
          </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Overlay background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
      />

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
        className="relative w-[85%] md:w-[400px] h-full bg-white dark:bg-gray-950 shadow-2xl flex flex-col transition-colors duration-300"
      >
        <AnimatePresence mode="wait">
          <motion.div
             key={subView ? subView : 'main'}
             initial={{ opacity: 0, x: subView ? 20 : -20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: subView ? -20 : 20 }}
             transition={{ duration: 0.2 }}
             className="h-full"
          >
            {renderSubView()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showRegistrationPopup && <RegistrationPopup />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function SubHeader({ title, onBack }: { title: string, onBack: () => void }) {
  return (
    <div className="bg-brand-orange p-6 flex items-center gap-4 text-black shadow-lg">
      <button onClick={onBack} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-95">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-black uppercase tracking-tight">{title}</h1>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b dark:border-gray-800 pb-2">{title}</h4>
      {children}
    </div>
  );
}

function ContactButton({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function ProfileButton({ icon, label, onClick, status }: { icon: React.ReactNode, label: string, onClick: () => void, status?: string }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-6 p-6 bg-[#959595] rounded-[1.8rem] shadow-none border-none transition-all text-left relative group active:scale-95"
    >
      <div className="w-14 h-14 flex items-center justify-center text-black shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-white uppercase tracking-tight text-xl leading-tight">{label}</h3>
        {status && (
          <p className="text-[11px] font-black tracking-widest mt-0.5 text-white/70 uppercase">
            {status}
          </p>
        )}
      </div>
    </motion.button>
  );
}

function IDCardSlot({ label, status }: { label: string, status: boolean }) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex flex-col items-center text-center space-y-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${status ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-brand-orange'}`}>
        {status ? <CheckCircle2 className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{label}</h4>
        <p className="text-[10px] font-black uppercase text-gray-400 mt-1">{status ? 'Document ajouté' : 'Aucun document'}</p>
      </div>
      <button className="text-xs font-black uppercase tracking-widest text-brand-orange hover:underline">
        {status ? 'Remplacer' : 'Ajouter'}
      </button>
    </div>
  );
}
