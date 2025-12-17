import React from 'react';
import { Invoice, InvoiceStatus, Client } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { Plus, Search, Filter, ArrowUpRight, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface InvoiceListProps {
  invoices: Invoice[];
  clients: Client[];
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, clients }) => {
  const navigate = useNavigate();
  
  const getClientName = (invoice: Invoice) => {
    if (invoice.clientName) return invoice.clientName;
    return clients.find(c => c.id === invoice.clientId)?.name || 'Unknown Client';
  };

  const calculateTotal = (inv: Invoice) => inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-gray-100 text-gray-700';
      case InvoiceStatus.OVERDUE: return 'bg-rose-50 text-rose-600'; 
      case InvoiceStatus.SENT: return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoices</h1>
        </div>
        <Link 
          to="/invoices/new"
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-gray-200 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 p-2">
        {/* Filters */}
        <div className="p-4 flex gap-4 items-center">
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-black transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search invoices..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all text-sm"
                />
             </div>
             <button className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                <Filter className="w-4 h-4" />
             </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-50">
                <th className="px-6 py-4 font-semibold pl-8">Details</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-24 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-50 p-4 rounded-full">
                           <FileText className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">No invoices yet</p>
                      </div>
                   </td>
                </tr>
              ) : invoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                >
                  <td className="px-6 py-5 pl-8">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{getClientName(invoice)}</span>
                        <span className="text-xs text-gray-400 font-mono mt-0.5">{invoice.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-gray-900 text-right tabular-nums">
                    {CURRENCY_SYMBOLS[invoice.currency]}
                    {calculateTotal(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right pr-8">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                       <ArrowUpRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;