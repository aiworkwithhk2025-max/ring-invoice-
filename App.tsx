import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import Clients from './components/Clients';
import { INITIAL_INVOICES, INITIAL_CLIENTS, INITIAL_BUSINESS_PROFILE } from './constants';
import { Invoice, Client, BusinessProfile } from './types';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(INITIAL_BUSINESS_PROFILE);

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices((prev) => {
      const exists = prev.find((inv) => inv.id === invoice.id);
      if (exists) {
        return prev.map((inv) => (inv.id === invoice.id ? invoice : inv));
      }
      return [invoice, ...prev];
    });
  };

  const SettingsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
       <div className="bg-gray-100 p-4 rounded-full mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      <p className="text-gray-500 mt-2">
        Configure your business profile, tax rates, and branding here. (Coming Soon)
      </p>
    </div>
  );

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard invoices={invoices} baseCurrency={businessProfile.baseCurrency} />} />
          <Route path="/invoices" element={<InvoiceList invoices={invoices} clients={clients} />} />
          <Route 
            path="/invoices/new" 
            element={<InvoiceForm invoices={invoices} clients={clients} onSave={handleSaveInvoice} />} 
          />
          <Route 
            path="/invoices/edit/:id" 
            element={<InvoiceForm invoices={invoices} clients={clients} onSave={handleSaveInvoice} />} 
          />
          <Route path="/clients" element={<Clients clients={clients} invoices={invoices} />} />
          <Route path="/settings" element={<SettingsPlaceholder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;