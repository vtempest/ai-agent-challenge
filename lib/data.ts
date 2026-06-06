// Synthetic customer data for demo purposes
export interface Customer {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalSpent: number;
}

export interface Order {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'shipped' | 'delivered';
}

export interface RefundRequest {
  id: string;
  customerId: string;
  orderId: string;
  reason: string;
  requestedAmount: number;
  status: 'pending' | 'approved' | 'denied';
  timestamp: string;
}

// Synthetic customers
export const customers: Customer[] = [
  { id: 'CUST001', name: 'Sarah Johnson', email: 'sarah.j@email.com', joinDate: '2023-01-15', totalSpent: 2450.00 },
  { id: 'CUST002', name: 'Michael Chen', email: 'mchen@email.com', joinDate: '2022-06-22', totalSpent: 5320.50 },
  { id: 'CUST003', name: 'Emily Rodriguez', email: 'emily.r@email.com', joinDate: '2023-03-10', totalSpent: 890.75 },
  { id: 'CUST004', name: 'James Wilson', email: 'jwilson@email.com', joinDate: '2021-11-05', totalSpent: 12450.00 },
  { id: 'CUST005', name: 'Lisa Anderson', email: 'l.anderson@email.com', joinDate: '2023-02-28', totalSpent: 1250.25 },
  { id: 'CUST006', name: 'David Kumar', email: 'dkumar@email.com', joinDate: '2022-09-12', totalSpent: 3890.00 },
  { id: 'CUST007', name: 'Jennifer Martinez', email: 'jmartinez@email.com', joinDate: '2023-04-07', totalSpent: 750.50 },
  { id: 'CUST008', name: 'Robert Taylor', email: 'rtaylor@email.com', joinDate: '2022-07-20', totalSpent: 4200.75 },
  { id: 'CUST009', name: 'Patricia Brown', email: 'pbrown@email.com', joinDate: '2023-01-30', totalSpent: 2100.00 },
  { id: 'CUST010', name: 'Christopher Lee', email: 'clee@email.com', joinDate: '2022-05-18', totalSpent: 6750.25 },
  { id: 'CUST011', name: 'Amanda White', email: 'awhite@email.com', joinDate: '2023-05-11', totalSpent: 550.00 },
  { id: 'CUST012', name: 'Daniel Garcia', email: 'dgarcia@email.com', joinDate: '2022-08-03', totalSpent: 3450.50 },
  { id: 'CUST013', name: 'Nicole Thompson', email: 'nthompson@email.com', joinDate: '2023-02-14', totalSpent: 1680.75 },
  { id: 'CUST014', name: 'Matthew Harris', email: 'mharris@email.com', joinDate: '2022-10-25', totalSpent: 5600.00 },
  { id: 'CUST015', name: 'Rachel Davis', email: 'rdavis@email.com', joinDate: '2023-03-22', totalSpent: 2340.25 },
];

// Synthetic orders (with recent dates for demo)
export const orders: Order[] = [
  { id: 'ORD001', customerId: 'CUST001', amount: 249.99, date: '2026-05-10', description: 'Wireless Headphones', status: 'delivered' },
  { id: 'ORD002', customerId: 'CUST001', amount: 599.99, date: '2026-05-15', description: 'Smart Watch', status: 'delivered' },
  { id: 'ORD003', customerId: 'CUST002', amount: 599.99, date: '2026-05-20', description: 'Tablet', status: 'delivered' },
  { id: 'ORD004', customerId: 'CUST002', amount: 1299.99, date: '2026-04-30', description: 'Laptop', status: 'delivered' },
  { id: 'ORD005', customerId: 'CUST003', amount: 89.99, date: '2026-05-25', description: 'Phone Case', status: 'delivered' },
  { id: 'ORD006', customerId: 'CUST004', amount: 2499.99, date: '2026-05-18', description: 'Premium Camera', status: 'delivered' },
  { id: 'ORD007', customerId: 'CUST004', amount: 799.99, date: '2026-05-12', description: 'Gaming Console', status: 'delivered' },
  { id: 'ORD008', customerId: 'CUST005', amount: 149.99, date: '2026-05-22', description: 'Bluetooth Speaker', status: 'delivered' },
  { id: 'ORD009', customerId: 'CUST006', amount: 349.99, date: '2026-05-08', description: 'Monitor', status: 'delivered' },
  { id: 'ORD010', customerId: 'CUST007', amount: 199.99, date: '2026-04-20', description: 'Webcam', status: 'delivered' },
];

// Refund Policy document
export const refundPolicy = {
  title: 'Refund Policy',
  effectiveDate: '2025-01-01',
  rules: [
    {
      id: 'RULE_TIMEFRAME',
      title: '30-Day Refund Window',
      description: 'Refunds are available within 30 days of purchase date',
      daysAllowed: 30,
    },
    {
      id: 'RULE_CONDITION',
      title: 'Product Condition',
      description: 'Items must be unused and in original packaging except for defects',
      validReasons: ['defective', 'damaged_in_shipping', 'wrong_item', 'not_as_described'],
    },
    {
      id: 'RULE_AMOUNT',
      title: 'Refund Amount',
      description: 'Full refund for orders under $1000, pro-rata for larger orders',
      thresholds: { small: 1000, refundPercent: 100 },
    },
    {
      id: 'RULE_LOYALTY',
      title: 'Loyal Customer Discount',
      description: 'Customers with >$5000 spent get extended 45-day window and 110% refund credit',
      loyaltyThreshold: 5000,
      extendedDays: 45,
      refundMultiplier: 1.1,
    },
    {
      id: 'RULE_EXCLUSIONS',
      title: 'Non-Refundable Items',
      description: 'Clearance, final sale, and heavily customized items cannot be refunded',
      nonRefundableCategories: ['clearance', 'final_sale', 'custom'],
    },
  ],
};

// Refund requests history (to prevent duplicates)
export let refundRequests: RefundRequest[] = [];

export function addRefundRequest(request: RefundRequest) {
  refundRequests.push(request);
}

export function getRefundRequests() {
  return refundRequests;
}
