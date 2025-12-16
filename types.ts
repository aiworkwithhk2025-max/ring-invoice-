export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  INR = 'INR',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  vatId?: string;
  currency: Currency;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage, e.g., 20 for 20%
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName?: string; // Added for custom client names
  date: string; // ISO date string
  dueDate: string; // ISO date string
  status: InvoiceStatus;
  items: LineItem[];
  currency: Currency;
  notes?: string;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  email: string;
  address: string;
  logoUrl?: string;
  baseCurrency: Currency;
}

export interface KPIData {
  totalRevenue: number;
  outstanding: number;
  overdue: number;
  paidThisMonth: number;
}
