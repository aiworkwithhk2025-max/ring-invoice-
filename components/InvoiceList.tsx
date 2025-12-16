import React from 'react';
import { Invoice, InvoiceStatus, Client } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { Plus, Search, Filter, MoreVertical, FileText } from 'lucide-react';
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

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case InvoiceStatus.OVERDUE: return 'bg-rose-100 text-rose-700 border-rose-200';
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Manage and track your invoices</p>
        </div>
        <Link 
          to="/invoices/new"
          className="flex items-center justify-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-400 transition-colors shadow-sm text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search invoice number or client..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-gray-300" />
                        <p>No invoices found. Create your first one!</p>
                      </div>
                   </td>
                </tr>
              ) : invoices.map((invoice) => (
                <tr 
                  key={invoice.id} 
                  className="hover:bg-brand-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 group-hover:text-brand-700">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getClientName(invoice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right tabular-nums">
                    {CURRENCY_SYMBOLS[invoice.currency]}
                    {calculateTotal(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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