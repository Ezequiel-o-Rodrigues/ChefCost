import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Camera, Mic, Square, Loader2, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { assistantService } from '../services/assistantService';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  type: 'text' | 'image' | 'audio';
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChefAssistant: React.FC = () => {
  const { userEmail } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      type: 'text',
      sender: 'assistant',
      content: 'Olá! Eu sou o Assistente do Chef. Como posso te ajudar hoje? Posso cadastrar ingredientes, receitas ou processar comprovantes.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendText = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText;
    setInputText('');
    addMessage({ type: 'text', sender: 'user', content: text });
    
    setIsLoading(true);
    try {
      const response = await assistantService.sendMessage(text, userEmail || 'guest');
      addMessage({
        type: 'text',
        sender: 'assistant',
        content: response.response || response.message || 'Recebido! Estou processando seu pedido.'
      });
    } catch (error) {
      addMessage({ 
        type: 'text', 
        sender: 'assistant', 
        content: 'Desculpe, tive um problema ao conectar com o servidor. Tente novamente mais tarde.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    addMessage({ 
      type: 'text', 
      sender: 'user', 
      content: `Enviando arquivo: ${file.name}` 
    });
    
    setIsLoading(true);
    try {
      const response = await assistantService.sendFile(file, userEmail || 'guest');
      addMessage({
        type: 'text',
        sender: 'assistant',
        content: response.response || response.message || 'Arquivo recebido com sucesso! Vou processar agora.'
      });
    } catch (error) {
      addMessage({ 
        type: 'text', 
        sender: 'assistant', 
        content: 'Erro ao enviar o arquivo. Verifique sua conexão.' 
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        
        addMessage({ 
          type: 'text', 
          sender: 'user', 
          content: '🎙️ Mensagem de voz enviada' 
        });

        setIsLoading(true);
        try {
          const response = await assistantService.sendFile(audioFile, userEmail || 'guest');
          addMessage({
            type: 'text',
            sender: 'assistant',
            content: response.response || response.message || 'Áudio recebido! Estou ouvindo e processando.'
          });
        } catch (error) {
          addMessage({ 
            type: 'text', 
            sender: 'assistant', 
            content: 'Não consegui processar seu áudio.' 
          });
        } finally {
          setIsLoading(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      addMessage({ 
        type: 'text', 
        sender: 'assistant', 
        content: 'Não consegui acessar seu microfone. Verifique as permissões.' 
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-28 right-6 w-14 h-14 bg-burgundy text-white rounded-full flex items-center justify-center shadow-2xl z-50 cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <Bot size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pastel-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-burgundy-light"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="fixed bottom-36 right-6 w-[calc(100vw-3rem)] sm:w-96 max-h-[500px] h-[60vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col border border-gray-100"
          >
            {/* Header */}
            <div className="bg-burgundy p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Assistente do Chef</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">Online e Inteligente</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-creme/30 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-burgundy text-white rounded-tr-none shadow-md'
                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[9px] mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-burgundy" />
                    <span className="text-xs text-gray-500">O Chef está pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              {isRecording ? (
                <div className="flex items-center justify-between bg-creme p-3 rounded-2xl">
                  <div className="flex items-center gap-3 text-burgundy">
                    <div className="w-2 h-2 bg-burgundy rounded-full animate-pulse" />
                    <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="bg-burgundy text-white p-2 rounded-xl flex items-center gap-2 text-sm font-medium"
                  >
                    <Square size={16} fill="currentColor" />
                    Parar e Enviar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder="Como posso ajudar?"
                      className="flex-1 bg-creme p-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20"
                    />
                    <button
                      onClick={handleSendText}
                      disabled={isLoading || !inputText.trim()}
                      className="bg-burgundy text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-around border-t border-gray-50 pt-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-burgundy transition-colors"
                    >
                      <div className="w-10 h-10 bg-creme rounded-xl flex items-center justify-center">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase">Foto</span>
                    </button>
                    
                    <button 
                      onClick={startRecording}
                      className="flex flex-col items-center gap-1 text-gray-400 hover:text-burgundy transition-colors"
                    >
                      <div className="w-10 h-10 bg-creme rounded-xl flex items-center justify-center">
                        <Mic size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase">Voz</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
