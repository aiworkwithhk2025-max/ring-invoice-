import { BusinessProfile, Client, Currency, Invoice, InvoiceStatus } from './types';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Acme Design Studio',
  email: 'billing@acmedesign.com',
  address: '123 Creative Blvd, San Francisco, CA 94103',
  baseCurrency: Currency.INR,
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'TechFlow Inc.',
    email: 'accounts@techflow.io',
    address: '456 Innovation Way, Austin, TX',
    currency: Currency.INR,
    vatId: 'US-987654321',
  },
  {
    id: 'c2',
    name: 'Nordic Furniture',
    email: 'finance@nordic.se',
    address: 'Stockholm, Sweden',
    currency: Currency.EUR,
  },
  {
    id: 'c3',
    name: 'London Consultants',
    email: 'pay@london-consult.co.uk',
    address: 'London, UK',
    currency: Currency.GBP,
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    number: 'INV-001',
    clientId: 'c1',
    date: '2023-10-01',
    dueDate: '2023-10-15',
    status: InvoiceStatus.PAID,
    currency: Currency.INR,
    items: [
      { id: 'li1', description: 'UI/UX Design Phase 1', quantity: 1, unitPrice: 250000, taxRate: 0 },
      { id: 'li2', description: 'Logo Design', quantity: 1, unitPrice: 40000, taxRate: 0 },
    ],
    createdAt: '2023-10-01T10:00:00Z',
  },
  {
    id: 'inv2',
    number: 'INV-002',
    clientId: 'c2',
    date: '2023-10-20',
    dueDate: '2023-11-03',
    status: InvoiceStatus.OVERDUE,
    currency: Currency.EUR,
    items: [
      { id: 'li3', description: 'Website Development', quantity: 40, unitPrice: 80, taxRate: 20 },
    ],
    createdAt: '2023-10-20T14:30:00Z',
  },
  {
    id: 'inv3',
    number: 'INV-003',
    clientId: 'c1',
    date: '2023-11-01',
    dueDate: '2023-11-15',
    status: InvoiceStatus.SENT,
    currency: Currency.INR,
    items: [
      { id: 'li4', description: 'Mobile App Wireframes', quantity: 1, unitPrice: 120000, taxRate: 0 },
    ],
    createdAt: '2023-11-01T09:15:00Z',
  },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.INR]: '₹',
};

// Simplified fixed exchange rates for demo purposes (Base: USD)
export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 0.92,
  [Currency.GBP]: 0.79,
  [Currency.INR]: 83.5,
};