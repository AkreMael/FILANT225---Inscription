import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, CreditCard, Landmark, Smartphone, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function PaymentPage({ onBack, onSuccess }: PaymentPageProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    // Simulate redirection to external payment link
    console.log('Redirecting to payment gateway...');
    
    // In a real app, window.location.href = '...';
    // For this prototype, we simulate a return after 2 seconds
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full cursor-pointer">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-tight">Paiement Sécurisé</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-brand-orange/20 text-center">
           <p className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-1">Total à payer</p>
           <h2 className="text-5xl font-black text-gray-900 font-display">7 100 <span className="text-xl">FCFA</span></h2>
           <div className="flex items-center justify-center gap-2 text-green-600 mt-4 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              Paiement 100% sécurisé
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Choisir un mode de paiement</h3>
           
           <div className="space-y-3">
              <button className="w-full flex items-center gap-4 p-5 bg-white border-2 border-brand-orange rounded-2xl">
                 <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-brand-orange">
                    <Smartphone className="w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <p className="font-bold text-gray-900 leading-tight text-sm">Mobile Money</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Orange, MTN, Wave</p>
                 </div>
                 <div className="ml-auto w-5 h-5 rounded-full border-4 border-brand-orange" />
              </button>

              <button className="w-full flex items-center gap-4 p-5 bg-gray-50 border-2 border-transparent rounded-2xl opacity-50 grayscale">
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400">
                    <CreditCard className="w-6 h-6" />
                 </div>
                 <div className="text-left">
                    <p className="font-bold text-gray-900 leading-tight text-sm">Carte Bancaire</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Visa, Mastercard</p>
                 </div>
              </button>
           </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
           <button 
              disabled={loading}
              onClick={handleConfirm}
              className="w-full bg-brand-red text-white py-5 rounded-2xl font-display text-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-red-200 active:scale-95 transition-all disabled:opacity-70"
           >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  REDirection...
                </>
              ) : (
                <>
                  CONFIRMER ET PAYER
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
           </button>
           <p className="text-[10px] text-center text-gray-400 font-bold px-10 uppercase leading-relaxed">
             En cliquant, vous acceptez les conditions générales de FILANT225
           </p>
        </div>
      </div>
    </div>
  );
}
