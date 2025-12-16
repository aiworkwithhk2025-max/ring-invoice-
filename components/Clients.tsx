import React, { useState, useRef, useEffect } from 'react';
import { Client, Invoice, InvoiceStatus } from '../types';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';
import { createClientChat } from '../services/geminiService';
import { Chat } from "@google/genai";
import { Send, Bot, User, Sparkles, Mail, Phone, MapPin, Building, Search } from 'lucide-react';

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
    { id: '1', role: 'model', text: 'Hello! I am your AI Client Liaison. Ask me about your clients or let me help you draft emails.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session
  useEffect(() => {
    try {
      if (!chatRef.current) {
        // Prepare context data
        const contextData = {
          clients,
          invoices: invoices.map(inv => ({
            number: inv.number,
            clientId: inv.clientId,
            amount: inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0),
            currency: inv.currency,
            status: inv.status,
            date: inv.date,
            dueDate: inv.dueDate
          }))
        };
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
      console.error("Chat error", error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "I'm having trouble connecting to the AI service right now." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to calculate total revenue per client
  const getClientRevenue = (clientId: string) => {
    return invoices
      .filter(inv => inv.clientId === clientId && inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0), 0);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Left Column: Client List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Manage your relationships</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search clients..." 
               className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white shadow-sm"
             />
        </div>

        <div className="overflow-y-auto pr-2 space-y-4 pb-4">
          {clients.map(client => {
            const revenue = getClientRevenue(client.id);
            return (
              <div key={client.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-brand-200 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{client.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Building className="w-3 h-3" />
                        <span>{client.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      {CURRENCY_SYMBOLS[client.currency]}
                      {revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-500">
                       ID: {client.vatId || 'N/A'}
                     </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: AI Assistant */}
      <div className="w-full md:w-96 flex flex-col h-[600px] md:h-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex-shrink-0">
        <div className="p-4 bg-brand-600 text-white flex items-center gap-2 shadow-sm">
          <div className="bg-white/20 p-1.5 rounded-lg">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">AI Client Liaison</h2>
            <p className="text-xs text-brand-100">Ask about clients or draft emails</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-gray-200' : 'bg-brand-100'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-brand-600" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-white text-gray-900 rounded-tr-none border border-gray-100' 
                  : 'bg-brand-600 text-white rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                   <Bot className="w-4 h-4 text-brand-600" />
                </div>
                <div className="bg-brand-600 p-3 rounded-2xl rounded-tl-none flex gap-1">
                   <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-75" />
                   <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Clients;
