import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, Bot } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { UserData } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'admin' | 'user';
  time: string;
}

interface ChatPageProps {
  userData: UserData;
  onBack: () => void;
  onNewMessage: () => void;
  theme: 'light' | 'dark';
}

export default function ChatPage({ userData, onBack, onNewMessage, theme }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome-1', text: "Bonjour ! Bienvenue sur l'assistance FILANT225.", sender: 'admin', time: '14:00' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for messages from/to this user using their UID
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
        };
      }) as Message[];

      if (newMessages.length > 0) {
        setMessages(prev => {
          // Keep welcome message and add DB messages
          const welcome = prev.filter(m => m.id.startsWith('welcome-'));
          const existingIds = new Set(welcome.map(m => m.id));
          const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
          return [...welcome, ...uniqueNew];
        });
        
        // Notify if last message is from admin
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.sender === 'admin') {
          onNewMessage();
        }
      }
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    return () => unsubscribe();
  }, [userData?.details?.email, onNewMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    setInput('');
    
    try {
      await addDoc(collection(db, 'messages'), {
        text: input,
        sender: 'user',
        userId: userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] flex flex-col transition-colors duration-300`}>
      <div className="bg-brand-orange p-6 flex items-center gap-4 text-black shrink-0 shadow-md">
        <button onClick={onBack} className="p-2 bg-white/20 rounded-full active:scale-95 transition-transform">
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

      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}
      >
        {messages.map((msg, idx) => (
          <motion.div 
            key={`${msg.id}-${idx}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-orange text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none'
            }`}>
              <p className="text-sm font-medium">{msg.text}</p>
              <span className={`text-[9px] mt-1 block font-bold ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
         <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-orange rounded-xl px-4 py-3 outline-none text-sm transition-all text-gray-900 dark:text-white"
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
