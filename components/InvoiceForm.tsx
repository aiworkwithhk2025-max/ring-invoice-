import React, { useState, useEffect } from 'react';
import { Invoice, Client, InvoiceStatus, Currency, LineItem } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, Sparkles, ChevronLeft, ArrowLeft } from 'lucide-react';
import { generateSmartInvoiceItems } from '../services/geminiService';

interface InvoiceFormProps {
  invoices: Invoice[];
  clients: Client[];
  onSave: (invoice: Invoice) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoices, clients, onSave }) => {
  const navigate = useNavigate();
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
        // Prepare initial data, ensuring clientName is populated if clientId exists
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
      alert(`Failed to generate items: ${error.message || "Unknown error"}. Please check API key.`);
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

    // Try to find if the name matches an existing client to maintain linkage, otherwise treat as custom
    const matchedClient = clients.find(c => c.name.toLowerCase() === formData.clientName?.toLowerCase());

    const invoiceToSave: Invoice = {
      ...(formData as Invoice),
      id: formData.id || Math.random().toString(36).substr(2, 9),
      createdAt: formData.createdAt || new Date().toISOString(),
      clientId: matchedClient ? matchedClient.id : (formData.clientId || ''),
      clientName: formData.clientName, // Explicitly save the name
    };
    onSave(invoiceToSave);
    navigate('/invoices');
  };

  const subtotal = (formData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalTax = (formData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/invoices')}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? `Edit Invoice ${formData.number}` : 'New Invoice'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditing ? 'Update invoice details' : 'Create a new invoice for your client'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Details Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <input
              type="text"
              required
              placeholder="Enter client name"
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={formData.clientName || ''}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">Currency</label>
             <select
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
             >
                {Object.values(Currency).map(c => <option key={c} value={c}>{c} ({CURRENCY_SYMBOLS[c]})</option>)}
             </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input
              type="text"
              required
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={formData.number || ''}
              onChange={(e) => handleInputChange('number', e.target.value)}
            />
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">Status</label>
             <select
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as InvoiceStatus)}
             >
                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Issued Date</label>
            <input
              type="date"
              required
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={formData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              required
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              value={formData.dueDate || ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
        </div>

        {/* AI Drafter Section */}
        <div className="bg-brand-50 p-6 rounded-xl border border-brand-200">
           <div className="flex items-center gap-2 mb-3">
             <Sparkles className="w-5 h-5 text-brand-700" />
             <h3 className="font-semibold text-gray-900">AI Invoice Drafter</h3>
           </div>
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="e.g., 'Web design for March 20 hours at $50/hr and server setup $200'" 
               className="flex-1 p-2.5 rounded-lg border-brand-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm bg-white"
               value={aiPrompt}
               onChange={(e) => setAiPrompt(e.target.value)}
             />
             <button
               type="button"
               onClick={handleSmartGenerate}
               disabled={isAiLoading || !aiPrompt}
               className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-400 disabled:opacity-50 transition-colors text-sm font-bold whitespace-nowrap"
             >
               {isAiLoading ? 'Generating...' : 'Auto-Fill Items'}
             </button>
           </div>
           <p className="text-xs text-brand-700 mt-2">Powered by Gemini. Describe your work and let AI populate the line items.</p>
        </div>

        {/* Line Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
             <button 
                type="button" 
                onClick={addItem}
                className="text-brand-700 hover:text-brand-800 text-sm font-medium flex items-center gap-1"
             >
               <Plus className="w-4 h-4" /> Add Item
             </button>
          </div>
          
          <div className="space-y-4">
             {/* Header */}
             <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
             </div>

             {formData.items?.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-gray-50 group transition-colors">
                   <div className="col-span-6">
                      <input 
                        type="text" 
                        required
                        placeholder="Item description"
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 px-0 py-1"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                   </div>
                   <div className="col-span-2">
                      <input 
                        type="number" 
                        min="0"
                        className="w-full text-right bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 px-0 py-1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      />
                   </div>
                   <div className="col-span-2">
                      <input 
                        type="number" 
                        min="0"
                        className="w-full text-right bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 px-0 py-1"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      />
                   </div>
                   <div className="col-span-1 text-right font-medium text-gray-700">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                   </div>
                   <div className="col-span-1 text-right">
                      <button 
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col items-end gap-2">
             <div className="flex justify-between w-64 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{CURRENCY_SYMBOLS[formData.currency as Currency]}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between w-64 text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium">{CURRENCY_SYMBOLS[formData.currency as Currency]}{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
             <div className="flex justify-between w-64 text-lg font-bold text-gray-900 mt-2">
                <span>Total</span>
                <span>{CURRENCY_SYMBOLS[formData.currency as Currency]}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
           <button
             type="button"
             onClick={() => navigate('/invoices')}
             className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
           >
             Cancel
           </button>
           <button
             type="submit"
             className="px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-400 font-bold shadow-sm transition-colors flex items-center gap-2"
           >
             <Save className="w-4 h-4" />
             Save Invoice
           </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;