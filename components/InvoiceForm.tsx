import React, { useState, useEffect } from 'react';
import { Invoice, Client, InvoiceStatus, Currency, LineItem } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, Zap, ArrowLeft, Loader2, Calendar, User } from 'lucide-react';
import { generateSmartInvoiceItems } from '../services/geminiService';

interface InvoiceFormProps {
  invoices: Invoice[];
  clients: Client[];
  onSave: (invoice: Invoice) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoices, clients, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = id && id !== 'new';

  const emptyItem: LineItem = {
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
  };

  const [formData, setFormData] = useState<Partial<Invoice>>({
    number: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: InvoiceStatus.DRAFT,
    currency: Currency.INR,
    items: [{ ...emptyItem, id: Date.now().toString() }],
    clientName: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const existing = invoices.find(inv => inv.id === id);
      if (existing) {
        const initialData = { ...existing };
        if (!initialData.clientName && initialData.clientId) {
          const matchedClient = clients.find(c => c.id === initialData.clientId);
          if (matchedClient) {
            initialData.clientName = matchedClient.name;
          }
        }
        setFormData(initialData);
      }
    }
  }, [id, isEditing, invoices, clients]);

  useEffect(() => {
    if (location.state?.smartItems) {
       const smartItems: any[] = location.state.smartItems;
       const itemsWithIds = smartItems.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          taxRate: 0,
       }));
       setFormData(prev => ({ ...prev, items: itemsWithIds }));
       window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleInputChange = (field: keyof Invoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { ...emptyItem, id: Date.now().toString() }],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSmartGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const generatedItems = await generateSmartInvoiceItems(aiPrompt);
      const itemsWithIds = generatedItems.map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        taxRate: 0, 
      }));
      setFormData(prev => ({ ...prev, items: itemsWithIds }));
    } catch (error: any) {
      console.error("Generation failed", error);
      alert("Failed to generate items.");
    } finally {
      setIsAiLoading(false);
      setAiPrompt('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) {
      alert("Please enter a client name");
      return;
    }
    const matchedClient = clients.find(c => c.name.toLowerCase() === formData.clientName?.toLowerCase());
    const invoiceToSave: Invoice = {
      ...(formData as Invoice),
      id: formData.id || Math.random().toString(36).substr(2, 9),
      createdAt: formData.createdAt || new Date().toISOString(),
      clientId: matchedClient ? matchedClient.id : (formData.clientId || ''),
      clientName: formData.clientName,
    };
    onSave(invoiceToSave);
    navigate('/invoices');
  };

  const subtotal = (formData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = (formData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#fafafa]/90 backdrop-blur-sm z-10 py-4">
        <button 
          onClick={() => navigate('/invoices')}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-gray-200 hover:border-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? `Edit ${formData.number}` : 'New Invoice'}
          </h1>
        </div>
        <div className="flex gap-3">
             <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-white transition-colors text-sm"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-gray-200 text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Send
              </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Details */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                 <User className="w-3 h-3" /> Client
              </label>
              <input
                type="text"
                placeholder="Client Name"
                className="w-full text-lg font-medium p-3 -ml-3 rounded-lg border-2 border-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                value={formData.clientName || ''}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Number</label>
               <input
                 type="text"
                 className="w-full text-lg font-mono p-3 -ml-3 rounded-lg border-2 border-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-gray-700"
                 value={formData.number || ''}
                 onChange={(e) => handleInputChange('number', e.target.value)}
               />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                 <Calendar className="w-3 h-3" /> Issued
              </label>
              <input
                type="date"
                className="w-full p-3 -ml-3 rounded-lg border-2 border-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-gray-700"
                value={formData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                 <Calendar className="w-3 h-3" /> Due
              </label>
              <input
                type="date"
                className="w-full p-3 -ml-3 rounded-lg border-2 border-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-gray-700"
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
            
             <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Currency</label>
                <select
                    className="w-full p-3 -ml-3 rounded-lg border-2 border-transparent hover:bg-gray-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all bg-transparent"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
                >
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
        </div>

        {/* AI Helper - Clean */}
        <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gray-700 rounded-full blur-2xl opacity-20 -mr-8 -mt-8"></div>
           <div className="relative z-10 flex gap-4 items-center">
               <div className="p-3 bg-white/10 rounded-xl">
                   <Zap className="w-5 h-5 text-white" />
               </div>
               <div className="flex-1">
                   <h3 className="font-bold text-sm">Magic Fill</h3>
                   <input 
                     type="text" 
                     placeholder="E.g. 'Web design 10h @ $50'" 
                     className="w-full bg-transparent border-none p-0 text-gray-300 placeholder:text-gray-500 focus:ring-0 text-sm mt-0.5"
                     value={aiPrompt}
                     onChange={(e) => setAiPrompt(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSmartGenerate())}
                   />
               </div>
               <button
                 onClick={handleSmartGenerate}
                 disabled={isAiLoading || !aiPrompt}
                 className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
               >
                 {isAiLoading ? '...' : 'Run'}
               </button>
           </div>
        </div>

        {/* Line Items - Clean Table */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-900">Items</h3>
          </div>
          
          <div className="space-y-1">
             <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase px-3 mb-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
             </div>

             {formData.items?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl hover:bg-gray-50 group transition-all">
                   <div className="col-span-6">
                      <input 
                        type="text" 
                        placeholder="Item"
                        className="w-full bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                   </div>
                   <div className="col-span-2">
                      <input 
                        type="number" 
                        className="w-full text-right bg-transparent border-none p-0 focus:ring-0 text-gray-600"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      />
                   </div>
                   <div className="col-span-2">
                      <input 
                        type="number" 
                        className="w-full text-right bg-transparent border-none p-0 focus:ring-0 text-gray-600"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                   </div>
                   <div className="col-span-1 text-right font-bold text-gray-900 tabular-nums">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                   </div>
                   <div className="col-span-1 text-right">
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             ))}
          </div>

          <button 
             onClick={addItem}
             className="mt-4 text-sm font-semibold text-gray-900 hover:text-gray-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit"
           >
             <Plus className="w-4 h-4" /> Add Item
           </button>

          <div className="mt-12 flex flex-col items-end gap-3 pt-8 border-t border-gray-50">
             <div className="flex justify-between w-64 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{CURRENCY_SYMBOLS[formData.currency as Currency]}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between w-64 text-sm">
                <span className="text-gray-500">Tax (0%)</span>
                <span className="font-medium text-gray-900">{CURRENCY_SYMBOLS[formData.currency as Currency]}{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between w-64 text-2xl font-bold text-gray-900 mt-2">
                <span>Total</span>
                <span>{CURRENCY_SYMBOLS[formData.currency as Currency]}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;