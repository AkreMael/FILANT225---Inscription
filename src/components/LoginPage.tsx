import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, CheckCircle2, Phone } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LoginPageProps {
  onAccessGranted: (role: 'admin' | 'user') => void;
}

export default function LoginPage({ onAccessGranted }: LoginPageProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      setError("Le numéro de téléphone doit comporter exactement 10 chiffres.");
      return;
    }

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
      console.log("Verifying credentials...");
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          phoneNumber: `+225${cleanPhone}`,
          code 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur (${response.status})`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Automatically sign in anonymously
        try {
          const userCredential = await signInAnonymously(auth);
          const user = userCredential.user;
          
          // Record connection in Firestore
          await addDoc(collection(db, 'logins'), {
            uid: user.uid,
            phoneNumber: `+225${cleanPhone}`,
            timestamp: serverTimestamp(),
            role: result.role,
            isNewUser: result.role === 'user' // We assume it's a user unless admin
          });
          
          console.log("Connection recorded and signed in");
        } catch (authErr) {
          console.warn("Firebase record failed, continuing:", authErr);
        }
        
        onAccessGranted(result.role);
      } else {
        setError(result.message || "Informations invalides.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Problème de connexion au serveur");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-orange flex flex-col items-center justify-center p-6 text-white overflow-y-auto pt-20 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-8 flex justify-center">
           <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
              <ShieldCheck className="w-10 h-10 text-white" />
           </div>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Filant 225</h1>
        <p className="text-white/70 font-bold uppercase tracking-widest text-[9px] mb-8">
          Accès sécurisé Côte d'Ivoire
        </p>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-5 text-left">
          <div className="text-gray-800 text-center">
            <h2 className="text-xl font-black uppercase mb-1 text-brand-orange">Connexion</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Veuillez renseigner vos accès
            </p>
          </div>

          <div className="space-y-4">
            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Numéro de téléphone</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-200">
                  <Phone className="w-4 h-4 text-brand-orange" />
                  <span className="text-sm font-black text-gray-900">+225</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="07 05 05 26 32"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-24 pr-4 text-sm font-black focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-gray-900"
                />
              </div>
            </div>

            {/* Code Input */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Code d'accès (5 chiffres)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="00000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black tracking-[0.5em] focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Confirmation du code</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="00000"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black tracking-[0.5em] focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase border border-red-100 tracking-wider text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying || phoneNumber.length !== 10 || code.length !== 5 || confirmCode.length !== 5}
            className="w-full flex items-center justify-center gap-4 bg-brand-orange hover:bg-brand-dark-orange text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-[0.95] disabled:opacity-50 shadow-xl"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Valider l'accès</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            Réseau Filant 225 sécurisé
          </div>
        </div>

        <p className="mt-8 text-white/50 text-[9px] font-bold uppercase tracking-widest leading-loose">
          © 2024 Filant 225 - Abidjan, Côte d'Ivoire<br/>
          Réseau d'Intermediation Professionnel
        </p>
      </motion.div>
    </div>
  );
}
