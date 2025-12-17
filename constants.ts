import { BusinessProfile, Client, Currency, Invoice, InvoiceStatus } from './types';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Landscape Svcs',
  email: 'billing@landscape.co',
  address: '123 Green Way, Bangalore, KA',
  baseCurrency: Currency.INR,
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'TechFlow Inc.',
    email: 'accounts@techflow.io',
    address: '456 Innovation Way, Austin, TX',
    currency: Currency.USD,
    vatId: 'US-987654321',
  },
  {
    id: 'c2',
    name: 'Urban Estates',
    email: 'finance@urbanestates.in',
    address: 'Indiranagar, Bangalore',
    currency: Currency.INR,
  },
  {
    id: 'c3',
    name: 'Greenify NGO',
    email: 'contact@greenify.org',
    address: 'London, UK',
    currency: Currency.GBP,
  },
  {
    id: 'c4',
    name: 'Apex Constructions',
    email: 'billing@apexconst.in',
    address: 'Mumbai, MH',
    currency: Currency.INR,
  }
];

// Data constructed to match the dashboard screenshot roughly:
// Unpaid: ~123,200
// Overdue: ~3,200
// Total Revenue (Paid): High enough to justify ~1.6M cash flow
export const INITIAL_INVOICES: Invoice[] = [
  // --- UNPAID & OVERDUE ---
  {
    id: 'inv101',
    number: 'INV-2024-001',
    clientId: 'c2',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    status: InvoiceStatus.OVERDUE,
    currency: Currency.INR,
    items: [
      { id: 'li1', description: 'Maintenance - Mar Q1', quantity: 1, unitPrice: 3200, taxRate: 18 },
    ],
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'inv102',
    number: 'INV-2024-005',
    clientId: 'c4',
    date: '2024-03-20',
    dueDate: '2024-04-10',
    status: InvoiceStatus.SENT, // Unpaid but not overdue
    currency: Currency.INR,
    items: [
      { id: 'li2', description: 'Landscape Design Phase 2', quantity: 1, unitPrice: 120000, taxRate: 18 },
    ],
    createdAt: '2024-03-20T14:30:00Z',
  },
  
  // --- PAID (Contributing to Cash Flow) ---
  {
    id: 'inv103',
    number: 'INV-2023-089',
    clientId: 'c1',
    date: '2023-12-01',
    dueDate: '2023-12-15',
    status: InvoiceStatus.PAID,
    currency: Currency.INR, // Converted for simplicity in logic, though client is USD
    items: [
      { id: 'li3', description: 'Q4 Global Retainer', quantity: 1, unitPrice: 450000, taxRate: 0 },
    ],
    createdAt: '2023-12-01T09:15:00Z',
  },
  {
    id: 'inv104',
    number: 'INV-2024-002',
    clientId: 'c4',
    date: '2024-01-15',
    dueDate: '2024-02-01',
    status: InvoiceStatus.PAID,
    currency: Currency.INR,
    items: [
      { id: 'li4', description: 'Corporate Campus Project', quantity: 1, unitPrice: 850000, taxRate: 18 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'inv105',
    number: 'INV-2024-003',
    clientId: 'c2',
    date: '2024-02-10',
    dueDate: '2024-02-25',
    status: InvoiceStatus.PAID,
    currency: Currency.INR,
    items: [
      { id: 'li5', description: 'Annual Garden Renovation', quantity: 1, unitPrice: 300000, taxRate: 18 },
    ],
    createdAt: '2024-02-10T11:00:00Z',
  },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.INR]: '₹',
};

export const EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.USD]: 1,
  [Currency.EUR]: 0.92,
  [Currency.GBP]: 0.79,
  [Currency.INR]: 83.5,
};