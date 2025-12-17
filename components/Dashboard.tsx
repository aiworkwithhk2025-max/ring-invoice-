import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';
import { generateFinancialAnalysis } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line 
} from 'recharts';
import { MoreHorizontal, ChevronDown, ArrowUpRight, Sparkles, Loader2, TrendingUp } from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  baseCurrency: Currency;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, baseCurrency }) => {
  const currencySymbol = CURRENCY_SYMBOLS[baseCurrency];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // --- Data Calculations ---
  const calculateTotal = (status?: InvoiceStatus) => {
    return invoices
      .filter((inv) => !status || inv.status === status)
      .reduce((acc, inv) => acc + inv.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0), 0);
  };

  // Values from invoices (calculated)
  const totalUnpaid = calculateTotal(InvoiceStatus.SENT) + calculateTotal(InvoiceStatus.OVERDUE);
  const totalOverdue = calculateTotal(InvoiceStatus.OVERDUE);
  
  // MOCK values to visually match screenshot while using dynamic currency
  const totalCashFlow = "1.6M";
  const totalExpenses = "1.4M";
  const netProfit = "800k";

  // Mock data for Charts
  const cashFlowData = [
    { name: '', in: 30, out: 0 },
    { name: '', in: 45, out: 0 },
    { name: '', in: 25, out: 0 },
    { name: '', in: 60, out: 0 },
    { name: '', in: 35, out: 0 },
    { name: '', in: 50, out: 0 },
    { name: '', in: 40, out: 0 },
  ];

  const expenseData = [
    { name: 'Rent', value: 40, color: '#9ca3af' }, // gray-400
    { name: 'Auto', value: 30, color: '#d1d5db' }, // gray-300
    { name: 'Meals', value: 20, color: '#e5e7eb' }, // gray-200
    { name: 'Other', value: 10, color: '#f3f4f6' }, // gray-100
  ];

  const handleDeepAnalysis = async () => {
    setIsThinking(true);
    setAnalysis(null);
    try {
      const dashboardSnapshot = {
        totalOverdue,
        totalUnpaid,
        cashFlow: totalCashFlow,
        expenses: totalExpenses,
        currency: baseCurrency
      };
      const result = await generateFinancialAnalysis(dashboardSnapshot);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis("Could not generate analysis. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-[1400px] animate-fade-in pb-12">
      
      {/* AI Analysis Result Card Overlay */}
      {analysis && (
        <div className="mb-8 bg-black text-white p-8 rounded-3xl shadow-xl animate-slide-up relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
           <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg tracking-wide">Strategic Insight</h3>
                  </div>
                  <button onClick={() => setAnalysis(null)} className="text-zinc-400 hover:text-white transition-colors">
                     Close
                  </button>
               </div>
               <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-light leading-loose text-zinc-300">{analysis}</div>
               </div>
           </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[450px]">
        
        {/* COL 1: Total Cash Flow (Tall) */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-gray-500 font-medium text-sm">Total Cash Flow</h3>
               <button className="text-gray-300 hover:text-black"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            
            <div className="flex items-center gap-3 mb-8">
               <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{currencySymbol}{totalCashFlow}</h2>
               <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
               </span>
            </div>

            <div className="flex-1 w-full min-h-[150px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData} barGap={0} barCategoryGap="20%">
                     <Bar dataKey="in" fill="#f3f4f6" radius={[4, 4, 4, 4]} />
                     {/* Highlighted bar */}
                     <Bar dataKey="in" fill="#e5e7eb" radius={[4, 4, 4, 4]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="flex gap-4 mt-4 text-xs text-gray-400 font-medium">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> In
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-100"></div> Out
               </div>
            </div>
        </div>

        {/* COL 2: Expenses Breakdown (Tall) */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
           <div className="flex justify-between items-start mb-8">
              <h3 className="text-gray-500 font-medium text-sm w-20 leading-tight">Expenses Breakdown</h3>
              <div className="text-xs text-gray-400 font-medium text-right">
                 Last <br /> Month
              </div>
           </div>

           <div className="flex-1 relative flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={expenseData}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                        startAngle={90}
                        endAngle={-270}
                     >
                        {expenseData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                   <span className="text-2xl font-bold text-gray-900">{currencySymbol}{totalExpenses}</span>
                   <span className="text-xs text-gray-400 mt-1">Total</span>
               </div>
           </div>
        </div>

        {/* COL 3: Stacked (Net Profit + Unpaid) */}
        <div className="flex-1 flex flex-col gap-6">
            
            {/* Net Profit Card (Dark) */}
            <div className="flex-[3] bg-[#888888] p-8 rounded-3xl shadow-xl relative overflow-hidden text-white flex flex-col justify-between">
                <div>
                   <h3 className="text-white/60 font-medium text-sm mb-2">Net Profit</h3>
                   <h2 className="text-4xl font-bold tracking-tight opacity-90">{currencySymbol}{netProfit}</h2>
                </div>
                
                <div className="mt-auto">
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mb-2">
                       <div className="h-full bg-black/40 w-[75%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-white/40 font-medium uppercase tracking-wider">
                       <span>Goal: {currencySymbol}1M</span>
                       <span>75%</span>
                    </div>
                </div>
            </div>

            {/* Unpaid Invoices Card */}
            <div className="flex-[2] bg-white p-6 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-center">
                <h3 className="text-gray-500 font-medium text-sm mb-2">Unpaid Invoices</h3>
                <div className="flex items-baseline justify-between">
                   <h2 className="text-3xl font-bold text-gray-900">{currencySymbol}{totalUnpaid.toLocaleString()}</h2>
                   <div className="text-right leading-tight">
                       <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md block mb-1">
                          {currencySymbol}{totalOverdue.toLocaleString()}
                       </span>
                       <span className="text-[10px] text-rose-400 font-medium">Overdue</span>
                   </div>
                </div>
            </div>

        </div>
      </div>
      
      {/* Sales Trend (Below) - Optional/Hidden in screenshot but keeping for functionality */}
      <div className="mt-8">
          <h3 className="text-gray-400 font-bold text-lg mb-4">Sales Trend</h3>
          <div className="h-32 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
             <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={cashFlowData}>
                    <Line 
                        type="monotone" 
                        dataKey="in" 
                        stroke="#e5e7eb" 
                        strokeWidth={4} 
                        dot={false}
                    />
                 </LineChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;