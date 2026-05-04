import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onAccessGranted: (role: 'admin' | 'user') => void;
}

export default function LoginPage({ onAccessGranted }: LoginPageProps) {
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 5 || confirmCode.length !== 5) {
      setError("Le code doit comporter exactement 5 chiffres.");
      return;
    }

    if (code !== confirmCode) {
      setError("Les codes ne correspondent pas.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      console.log("Fetching /api/verify-code with code:", code);
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      console.log("Server response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur (${response.status})`);
      }

      const result = await response.json();
      console.log("Server verification result:", result);
      
      if (result.success) {
        onAccessGranted(result.role);
      } else {
        setError(result.message || "Code invalide.");
      }
    } catch (err: any) {
      console.error("Verification error details:", err);
      // If it's a network error, tell the user to check their connection
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.");
      } else {
        setError(`Erreur: ${err.message || "Problème de connexion au serveur"}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-orange flex flex-col items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8 flex justify-center">
           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30">
              <ShieldCheck className="w-12 h-12 text-white" />
           </div>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Filant 225</h1>
        <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-12">
          Accès sécurisé par code
        </p>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="text-gray-800">
            <h2 className="text-xl font-black uppercase mb-2 text-brand-orange">Vérification</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Veuillez entrer votre code à 5 chiffres pour continuer.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                maxLength={5}
                placeholder="Entrer votre code à 5 chiffres"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black tracking-[0.5em] focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                maxLength={5}
                placeholder="Confirmer le code à 5 chiffres"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black tracking-[0.5em] focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase border border-red-100 tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || code.length !== 5 || confirmCode.length !== 5}
            className="w-full flex items-center justify-center gap-4 bg-brand-orange hover:bg-brand-dark-orange text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-[0.95] disabled:opacity-50 shadow-xl"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Valider</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            Vérification sécurisée
          </div>
        </div>

        <p className="mt-8 text-white/50 text-[10px] font-bold uppercase tracking-widest leading-loose">
          © 2024 Filant 225 - Côte d'Ivoire<br/>
          Accès Réservé
        </p>
      </motion.div>
    </div>
  );
}
