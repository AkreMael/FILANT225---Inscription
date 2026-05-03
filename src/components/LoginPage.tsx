import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError(null);
    
    try {
      console.log("Starting Google Login...");
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid automatic "connection failed" on some browsers
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      console.log("Login result:", result.user?.email);
      
      if (result.user) {
        // Redirection should be handled by App.tsx through onAuthStateChanged
        // but we call the callback just in case
        onLoginSuccess(result.user);
      }
    } catch (error: any) {
      console.error("Firebase Login Detailed Error:", error);
      
      let message = "La connexion a échoué.";
      if (error.code === 'auth/popup-blocked') {
        message = "La fenêtre de connexion a été bloquée par votre navigateur. Veuillez autoriser les popups.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = "La fenêtre de connexion a été fermée avant la fin.";
      } else if (error.code === 'auth/unauthorised-domain') {
        message = "Ce domaine n'est pas autorisé dans la console Firebase.";
      } else if (error.message) {
        message = `Erreur: ${error.message}`;
      }
      
      setError(message);
    } finally {
      setIsLoggingIn(false);
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
          Vérification d'identité obligatoire
        </p>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="text-gray-800">
            <h2 className="text-xl font-black uppercase mb-2">Accès Sécurisé</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Pour accéder aux services de Filant 225, vous devez valider votre identité avec un compte Google.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-[0.95] disabled:opacity-50 shadow-xl"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Vérifier mon identité Google
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            Connexion en temps réel via Firebase
          </div>
        </div>

        <p className="mt-8 text-white/50 text-[10px] font-bold uppercase tracking-widest">
          © 2024 Filant 225 - Côte d'Ivoire
        </p>
      </motion.div>
    </div>
  );
}
