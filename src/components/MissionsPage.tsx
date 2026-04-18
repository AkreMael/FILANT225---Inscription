import { motion } from 'motion/react';
import { ChevronLeft, ClipboardCheck, CheckCircle2, Clock, XCircle, MoreVertical } from 'lucide-react';
import { Mission } from '../types';

interface MissionsPageProps {
  missions: Mission[];
  onBack: () => void;
  theme: 'light' | 'dark';
}

const STATUS_ICONS = {
  'terminée': <CheckCircle2 className="w-5 h-5 text-green-500" />,
  'en cours': <Clock className="w-5 h-5 text-brand-orange" />,
  'annulée': <XCircle className="w-5 h-5 text-red-500" />,
};

const STATUS_COLORS = {
  'terminée': 'bg-green-50 text-green-700 border-green-100',
  'en cours': 'bg-orange-50 text-brand-orange border-orange-100',
  'annulée': 'bg-red-50 text-red-700 border-red-100',
};

export default function MissionsPage({ missions, onBack, theme }: MissionsPageProps) {
  const completedMissions = missions.filter(m => m.status === 'terminée').length;

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white'} z-50 flex flex-col overflow-hidden transition-colors duration-300`}>
      {/* Header */}
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black shadow-lg z-10 shrink-0">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight leading-none">Historique des missions</h1>
          <p className="text-[10px] font-bold opacity-70 uppercase mt-1">
            {completedMissions} mission{completedMissions !== 1 ? 's' : ''} effectuée{completedMissions !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Counter Banner */}
      <div className="bg-[#442200] p-4 flex justify-between items-center text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-black" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Total des missions</span>
        </div>
        <div className="text-3xl font-black text-brand-orange font-display">
          {missions.length < 10 ? `0${missions.length}` : missions.length}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-4 pb-24 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        {missions.length > 0 ? (
          missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{mission.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Effectuée le {mission.date}
                  </p>
                </div>
                <button className="text-gray-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${STATUS_COLORS[mission.status]}`}>
                  {STATUS_ICONS[mission.status]}
                  {mission.status}
                </div>
                <button className="text-brand-orange text-[10px] font-black uppercase tracking-widest hover:underline px-2">
                  Voir détails
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <ClipboardCheck className="w-20 h-20 mb-4" />
            <p className="font-bold uppercase tracking-widest">Aucune mission pour le moment</p>
          </div>
        )}

        {/* Info Box */}
        {missions.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Félicitations ! Vous avez effectué <strong>{completedMissions} missions</strong>. 
              Chaque mission validée augmente votre indice de confiance auprès des clients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
