import React, { useState, useRef, useEffect } from 'react';
import { Client, Invoice, InvoiceStatus } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { createClientChat, generateSpeechFromText, playAudioBuffer } from '../services/geminiService';
import { Chat } from "@google/genai";
import { Send, Bot, User, Sparkles, Mail, Building, Search, ArrowRight, Volume2, Loader2, Play } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  invoices: Invoice[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const Clients: React.FC<ClientsProps> = ({ clients, invoices }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello. I can analyze client performance or payment history. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!chatRef.current) {
        const contextData = { clients, invoices };
        chatRef.current = createClientChat(contextData);
      }
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, [clients, invoices]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text || "I didn't have a response for that." 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Connection error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlayAudio = async (msgId: string, text: string) => {
    if (audioLoadingId) return;
    setAudioLoadingId(msgId);
    try {
      const audioBuffer = await generateSpeechFromText(text);
      playAudioBuffer(audioBuffer);
    } catch (error) {
      alert("Audio generation failed.");
    } finally {
      setAudioLoadingId(null);
    }
  };

  const getClientRevenue = (clientId: string) => {
    return invoices
      .filter(inv => inv.clientId === clientId && inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0), 0);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8 animate-slide-up max-w-[1600px] mx-auto">
      {/* Client List */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 p-2">
        <div className="p-6 pb-2">
           <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Clients</h2>
           <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-black transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search clients..." 
                 className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all text-sm"
               />
          </div>
        </div>

        <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {clients.map(client => (
            <div key={client.id} className="p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Revenue</p>
                  <p className="font-bold text-gray-900 tabular-nums">
                    {CURRENCY_SYMBOLS[client.currency]}
                    {getClientRevenue(client.id).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant - Modern Chat */}
      <div className="w-full md:w-[400px] flex flex-col h-full bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <div>
               <h2 className="font-bold text-gray-900 text-sm">AI Liaison</h2>
               <p className="text-xs text-gray-400">Gemini Pro Thinking</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user' ? 'bg-gray-100 text-black' : 'bg-black text-white'
              }`}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-gray-100 text-gray-900 rounded-tr-none' 
                    : 'bg-gray-50 text-gray-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'model' && (
                   <button 
                     onClick={() => handlePlayAudio(msg.id, msg.text)}
                     disabled={audioLoadingId !== null}
                     className="text-gray-400 hover:text-black transition-colors"
                   >
                     {audioLoadingId === msg.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                   </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                   <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                   <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                   </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full pl-5 pr-12 py-3.5 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Clients;