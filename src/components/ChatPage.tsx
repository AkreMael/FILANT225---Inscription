import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, User, Bot } from 'lucide-react';

interface ChatPageProps {
  onBack: () => void;
}

export default function ChatPage({ onBack }: ChatPageProps) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! Bienvenue sur l'assistance FILANT225.", sender: 'bot', time: '14:00' },
    { id: 2, text: "Comment puis-je vous aider aujourd'hui ?", sender: 'bot', time: '14:00' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Auto response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Un conseiller va vous répondre dans quelques instants. Merci de patienter.", 
        sender: 'bot', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full">
           <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2 shadow-sm">
              <Bot className="w-full h-full text-brand-orange" />
           </div>
           <div>
              <h1 className="text-sm font-bold uppercase tracking-tight">Assistance FILANT</h1>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 rounded-full">En ligne</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-orange text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none'
            }`}>
              <p className="text-sm font-medium">{msg.text}</p>
              <span className={`text-[9px] mt-1 block font-bold ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
         <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-50 border-2 border-transparent focus:border-brand-orange rounded-xl px-4 py-3 outline-none text-sm transition-all"
         />
         <button 
            onClick={handleSend}
            className="bg-brand-orange text-white p-3 rounded-xl shadow-lg active:scale-95 transition-transform"
         >
            <Send className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}
