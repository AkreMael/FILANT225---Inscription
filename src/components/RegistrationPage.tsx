import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Briefcase, Truck, Home, Building2, ChevronRight, CheckCircle2, Phone, MapPin, UserCircle } from 'lucide-react';
import { ProfileType, PROFILE_LABELS, PROFILE_FIELDS, UserData } from '../types';

interface RegistrationPageProps {
  onComplete: (data: { profileType: ProfileType; details: Record<string, string> }) => void;
  theme: 'light' | 'dark';
}

const PROFILE_ICONS: Record<ProfileType, React.ReactNode> = {
  client: <User className="w-5 h-5" />,
  travailleur: <Briefcase className="w-5 h-5" />,
  proprietaire: <Truck className="w-5 h-5" />,
  agence: <Home className="w-5 h-5" />,
  entreprise: <Building2 className="w-5 h-5" />,
};

export default function RegistrationPage({ onComplete, theme }: RegistrationPageProps) {
  const [profileType, setProfileType] = useState<ProfileType>('client');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);

  const handleFieldChange = (field: string, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ profileType, details });
  };

  const fields = PROFILE_FIELDS[profileType];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'brand-gradient'} pt-10 pb-20 px-4 md:px-0 transition-colors duration-300`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-6xl font-black ${theme === 'dark' ? 'text-brand-orange' : 'text-white'} font-display tracking-tighter`}
          >
            FILANT <span className={theme === 'dark' ? 'text-white' : 'text-white/80'}>225</span>
          </motion.h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-white'} font-medium mt-2`}>Inscription intelligente</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 card-shadow overflow-hidden"
        >
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Créez votre profil</h2>
            <div className="flex gap-1">
              <div className={`h-1.5 w-8 rounded-full ${step === 1 ? 'bg-brand-orange' : 'bg-green-500'}`} />
              <div className={`h-1.5 w-8 rounded-full ${step === 2 ? 'bg-brand-orange' : step > 2 ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Qui êtes-vous ?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {(Object.keys(PROFILE_LABELS) as ProfileType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProfileType(type)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          profileType === type 
                            ? 'border-brand-orange bg-orange-50 dark:bg-orange-950/20 text-brand-orange' 
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${profileType === type ? 'bg-brand-orange text-white' : 'bg-white dark:bg-gray-800'}`}>
                          {PROFILE_ICONS[type]}
                        </div>
                        <span className="font-bold">{PROFILE_LABELS[type]}</span>
                        {profileType === type && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-6 hover:bg-brand-dark-orange transition-colors"
                  >
                    Suivant <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-brand-orange bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl mb-4">
                    {PROFILE_ICONS[profileType]}
                    <span className="font-bold">{PROFILE_LABELS[profileType]}</span>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="ml-auto text-xs underline font-medium"
                    >
                      Modifier
                    </button>
                  </div>

                  {fields.map((field) => (
                    <div key={field} className="relative">
                      <label className="block text-sm font-semibold text-gray-500 mb-1 ml-1 capitalize">
                        {field}
                      </label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-orange transition-colors">
                            {field.toLowerCase().includes('téléphone') ? <Phone className="w-5 h-5" /> : 
                             field.toLowerCase().includes('ville') ? <MapPin className="w-5 h-5" /> : 
                             <UserCircle className="w-5 h-5" />}
                         </div>
                        <input
                          required
                          type={field.toLowerCase().includes('téléphone') ? 'tel' : 'text'}
                          placeholder={`Entrez votre ${field.toLowerCase()}`}
                          value={details[field] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-brand-orange rounded-2xl py-4 pl-12 pr-4 transition-all outline-none font-medium text-gray-800 dark:text-gray-200"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-8 hover:brightness-110 shadow-lg transition-all"
                  >
                    Valider l'inscription
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-400 py-2 rounded-2xl font-semibold text-sm"
                  >
                    Retour
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        <div className={`mt-8 flex justify-center gap-4 ${theme === 'dark' ? 'text-gray-500' : 'text-white/60'}`}>
           <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1 mx-auto">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Sécurisé</span>
           </div>
           <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-1 mx-auto">
                 <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Briefcase className="w-6 h-6" />
                 </motion.div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Professionnel</span>
           </div>
        </div>
      </div>
    </div>
  );
}
