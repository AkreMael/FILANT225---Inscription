import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Clipboard, Search, LocateFixed, Navigation } from 'lucide-react';

interface LocalisationPageProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export default function LocalisationPage({ onBack, theme }: LocalisationPageProps) {
  const [destination, setDestination] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState<string>('Localisation en cours...');
  const [isGpsActive, setIsGpsActive] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsGpsActive(true);
          // Simple reverse geocoding mock or just show "Position GPS Active"
          // In a real app we'd fetch from an API
          setCity('ABIDJAN, CÔTE D\'IVOIRE'); 
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGpsActive(false);
          setCity('GPS DÉSACTIVÉ');
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDestination(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0E17]' : 'bg-gray-100'} flex flex-col text-white font-sans`}>
      {/* Header */}
      <div className="bg-[#111827] p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#5588FF] uppercase tracking-tighter leading-none">LOCALISATION</h1>
            <p className="text-[8px] font-bold text-gray-500 uppercase mt-1 tracking-widest">FILANT*225 • SYSTÈME INTÉGRÉ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3B82F6]"></div>
          <MapPin className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 space-y-8 flex flex-col">
        {/* Destination Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SAISIR DESTINATION</label>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isGpsActive ? 'text-blue-400' : 'text-red-400'}`}>
              {isGpsActive ? 'GPS ACTIF' : 'GPS INACTIF'}
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 bg-black rounded-2xl border-2 border-white/10 p-4 focus-within:border-blue-500/50 transition-colors flex items-center">
              <input 
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Coordonnées, Lien ou Adresse..."
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-300 placeholder:text-gray-700"
              />
            </div>
            <button 
              onClick={handlePaste}
              className="bg-[#3B41FF] w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform"
            >
              <Clipboard className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase">COLLER</span>
            </button>
          </div>

          <button className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl flex items-center justify-center gap-3 border border-white/5 transition-colors group">
            <Search className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <span className="text-xs font-black text-gray-500 group-hover:text-white uppercase tracking-widest">AFFICHER SUR LA CARTE</span>
          </button>
        </div>

        {/* GPS Terminal Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
          {/* Decorative Background circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-64 h-64 border border-dashed border-blue-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
            <div className="absolute w-80 h-80 border border-blue-500/10 rounded-full"></div>
          </div>

          <div className="relative z-10 text-center space-y-2 mb-10">
            <MapPin className="w-10 h-10 text-[#5588FF] mx-auto mb-4 drop-shadow-[0_0_10px_#3B82F6]" />
            <h2 className="text-3xl font-black uppercase tracking-[0.2em] font-display">TERMINAL GPS</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">PRÊT POUR LE CALCUL D'ITINÉRAIRE.</p>
          </div>

          {/* Calculator Card */}
          <div className="w-full max-w-sm bg-[#111827] rounded-[3rem] p-4 flex flex-col items-center gap-6 shadow-2xl border border-white/5 group bg-gradient-to-b from-[#111827] to-[#0A0E17]">
             <div className="w-full aspect-video rounded-[2.5rem] bg-[#0A0E17] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent)] animate-pulse"></div>
                <div className="relative flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl animate-pulse"></div>
                    <MapPin className="w-32 h-32 text-gray-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#5588FF]" />
                    <span className="text-sm font-black uppercase tracking-tighter text-white/80">CALCULER L'ITINÉRAIRE</span>
                  </div>
                </div>
             </div>

             {/* GPS Data Display */}
             <div className="w-full grid grid-cols-2 gap-4 px-4 pb-4">
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Ville Actuelle</p>
                  <p className="text-[10px] font-black text-blue-400 uppercase truncate">{city}</p>
                </div>
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Coordonnées</p>
                  <p className="text-[10px] font-black text-blue-400 uppercase truncate">
                    {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'RECHERCHE...'}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Live Indicator Footer */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
            <LocateFixed className="w-3 h-3 text-blue-400" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">Position en Temps Réel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
