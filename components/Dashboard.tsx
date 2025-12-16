import React, { useEffect, useState } from 'react';
import { Invoice, InvoiceStatus, Currency } from '../types';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';
import { generateBusinessInsights } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { DollarSign, AlertCircle, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  baseCurrency: Currency;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, baseCurrency }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Helper to convert any amount to base currency
  const convertToBase = (amount: number, currency: Currency) => {
    if (currency === baseCurrency) return amount;
    // Convert to USD first (base of exchange rates), then to target
    const amountInUSD = amount / EXCHANGE_RATES[currency];
    return amountInUSD * EXCHANGE_RATES[baseCurrency];
  };

  const calculateTotal = (status?: InvoiceStatus) => {
    return invoices
      .filter((inv) => !status || inv.status === status)
      .reduce((acc, inv) => {
        const invTotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        return acc + convertToBase(invTotal, inv.currency);
      }, 0);
  };

  const totalRevenue = calculateTotal(InvoiceStatus.PAID);
  const totalOverdue = calculateTotal(InvoiceStatus.OVERDUE);
  const totalOutstanding = calculateTotal(InvoiceStatus.SENT);
  const totalDraft = calculateTotal(InvoiceStatus.DRAFT);

  // Prepare chart data (Monthly Revenue)
  const chartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    invoices.forEach(inv => {
      if (inv.status === InvoiceStatus.PAID) {
        const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
        const amount = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const converted = convertToBase(amount, inv.currency);
        data[month] = (data[month] || 0) + converted;
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [invoices, baseCurrency]);

  const handleGetInsights = async () => {
    setLoadingInsight(true);
    const result = await generateBusinessInsights(invoices);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your business performance</p>
        </div>
        
        <button
          onClick={handleGetInsights}
          disabled={loadingInsight}
          className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-400 hover:shadow-md transition-all disabled:opacity-70 text-sm font-bold"
        >
          {loadingInsight ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {insight ? 'Refresh AI Insights' : 'Get AI Insights'}
        </button>
      </div>

      {insight && (
        <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-gray-900 text-sm leading-relaxed">{insight}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          amount={totalRevenue}
          currency={baseCurrency}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <KPICard
          title="Outstanding"
          amount={totalOutstanding}
          currency={baseCurrency}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          title="Overdue"
          amount={totalOverdue}
          currency={baseCurrency}
          icon={AlertCircle}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
        <KPICard
          title="Drafts"
          amount={totalDraft}
          currency={baseCurrency}
          icon={FileTextIcon}
          color="text-gray-600"
          bgColor="bg-gray-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${CURRENCY_SYMBOLS[baseCurrency]}${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      // Alternating brand colors
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#531FDE' : '#7F4DFF'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
           <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {invoices.slice(0, 5).map(inv => (
               <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-brand-200 group">
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${
                        inv.status === InvoiceStatus.PAID ? 'bg-emerald-500' :
                        inv.status === InvoiceStatus.OVERDUE ? 'bg-rose-500' :
                        'bg-gray-300'
                     }`} />
                     <div>
                       <p className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">{inv.number}</p>
                       <p className="text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {CURRENCY_SYMBOLS[inv.currency]}
                    {inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0).toLocaleString()}
                  </span>
               </div>
             ))}
             {invoices.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">No activity yet.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponents
const KPICard = ({ title, amount, currency, icon: Icon, color, bgColor }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-brand-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">
          {CURRENCY_SYMBOLS[currency]}
          {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h3>
      </div>
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const FileTextIcon = (props: any) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
);

export default Dashboard;