export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  accentColor: string;
  iconName: string;
  // Visual composition elements for each slide
  miniCards: {
    icon: string;
    label: string;
    value?: string;
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "center";
  }[];
}

export const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Send Money\nAcross Borders",
    description:
      "Transfer funds to 40+ African countries in seconds. Real-time exchange rates with zero hidden fees.",
    accentColor: "#3B82F6",
    iconName: "globe-outline",
    miniCards: [
      {
        icon: "arrow-up-outline",
        label: "You send",
        value: "$5,000.00",
        position: "topLeft",
      },
      {
        icon: "swap-horizontal-outline",
        label: "Rate",
        value: "1 USD = 1,580 NGN",
        position: "center",
      },
      {
        icon: "arrow-down-outline",
        label: "They receive",
        value: "N7,900,000",
        position: "bottomRight",
      },
    ],
  },
  {
    id: 2,
    title: "Bank-Level\nSecurity Built In",
    description:
      "AES-256 encryption, biometric authentication, and full regulatory compliance protect every transaction.",
    accentColor: "#22C55E",
    iconName: "shield-checkmark-outline",
    miniCards: [
      {
        icon: "finger-print-outline",
        label: "Biometric Auth",
        position: "topLeft",
      },
      {
        icon: "lock-closed-outline",
        label: "AES-256",
        position: "topRight",
      },
      {
        icon: "shield-checkmark-outline",
        label: "KYC Verified",
        position: "bottomLeft",
      },
      {
        icon: "checkmark-circle-outline",
        label: "Compliant",
        position: "bottomRight",
      },
    ],
  },
  {
    id: 3,
    title: "Settlement\nin Seconds",
    description:
      "No more 3-5 business day waits. Your recipient gets paid almost instantly, anywhere on the continent.",
    accentColor: "#8B5CF6",
    iconName: "flash-outline",
    miniCards: [
      {
        icon: "time-outline",
        label: "Initiated",
        value: "9:41 AM",
        position: "topLeft",
      },
      {
        icon: "flash-outline",
        label: "Processing",
        value: "< 30s",
        position: "center",
      },
      {
        icon: "checkmark-done-outline",
        label: "Delivered",
        value: "9:41 AM",
        position: "bottomRight",
      },
    ],
  },
];

// ─── Dashboard Data ───

export interface CurrencyBalance {
  code: string;
  symbol: string;
  name: string;
  balance: number;
  flag: string;
}

export const currencyBalances: CurrencyBalance[] = [
  { code: "USD", symbol: "$", name: "US Dollar", balance: 24850.0, flag: "🇺🇸" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", balance: 12500000, flag: "🇳🇬" },
  { code: "EUR", symbol: "€", name: "Euro", balance: 8320.5, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", balance: 6140.75, flag: "🇬🇧" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", balance: 1250000, flag: "🇰🇪" },
];

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
}

export const quickActions: QuickAction[] = [
  { id: "send", icon: "arrow-up-outline", label: "Send", color: "#3B82F6" },
  { id: "receive", icon: "arrow-down-outline", label: "Receive", color: "#22C55E" },
  { id: "convert", icon: "swap-horizontal-outline", label: "Convert", color: "#8B5CF6" },
  { id: "fund", icon: "add-circle-outline", label: "Fund", color: "#F59E0B" },
];

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  icon: string;
}

export const promoBanners: PromoBanner[] = [
  {
    id: "1",
    title: "Zero fees on first transfer",
    subtitle: "Send your first payment with no transfer fees. Limited time offer.",
    accentColor: "#3B82F6",
    icon: "gift-outline",
  },
  {
    id: "2",
    title: "Refer a business, earn $50",
    subtitle: "Invite a business to Nexa and both of you earn $50 in credits.",
    accentColor: "#22C55E",
    icon: "people-outline",
  },
  {
    id: "3",
    title: "Complete KYC for higher limits",
    subtitle: "Verify your identity to unlock up to $50,000 in daily transfers.",
    accentColor: "#8B5CF6",
    icon: "shield-checkmark-outline",
  },
];

export interface LiveRate {
  id: string;
  from: string;
  to: string;
  fromFlag: string;
  toFlag: string;
  rate: number;
  change: number;
  direction: "up" | "down";
}

export const liveRates: LiveRate[] = [
  { id: "1", from: "USD", to: "NGN", fromFlag: "🇺🇸", toFlag: "🇳🇬", rate: 1580.5, change: 0.82, direction: "up" },
  { id: "2", from: "EUR", to: "NGN", fromFlag: "🇪🇺", toFlag: "🇳🇬", rate: 1720.3, change: 1.15, direction: "up" },
  { id: "3", from: "GBP", to: "NGN", fromFlag: "🇬🇧", toFlag: "🇳🇬", rate: 2010.8, change: 0.45, direction: "down" },
  { id: "4", from: "USD", to: "KES", fromFlag: "🇺🇸", toFlag: "🇰🇪", rate: 129.4, change: 0.32, direction: "up" },
  { id: "5", from: "USD", to: "GHS", fromFlag: "🇺🇸", toFlag: "🇬🇭", rate: 15.8, change: 0.67, direction: "down" },
  { id: "6", from: "EUR", to: "USD", fromFlag: "🇪🇺", toFlag: "🇺🇸", rate: 1.088, change: 0.12, direction: "up" },
];

export type MockTransactionStatus = "completed" | "processing" | "pending" | "failed";
export type MockTransactionType = "send" | "receive";

export interface RecentTransaction {
  id: string;
  type: MockTransactionType;
  recipientName: string;
  amount: number;
  currency: string;
  symbol: string;
  status: MockTransactionStatus;
  date: string;
}

export const recentTransactions: RecentTransaction[] = [
  { id: "1", type: "send", recipientName: "Adebayo Ogunlesi", amount: 2500, currency: "USD", symbol: "$", status: "completed", date: "Today, 2:34 PM" },
  { id: "2", type: "receive", recipientName: "Sarah Mitchell", amount: 1200, currency: "EUR", symbol: "€", status: "completed", date: "Today, 11:20 AM" },
  { id: "3", type: "send", recipientName: "Kwame Asante", amount: 850000, currency: "NGN", symbol: "₦", status: "processing", date: "Yesterday, 4:15 PM" },
  { id: "4", type: "send", recipientName: "James Mwangi", amount: 500, currency: "USD", symbol: "$", status: "pending", date: "Yesterday, 9:00 AM" },
  { id: "5", type: "receive", recipientName: "Elena Rossi", amount: 3200, currency: "GBP", symbol: "£", status: "completed", date: "Mar 20, 3:45 PM" },
];

// Full transaction history grouped by date
export interface TransactionGroup {
  title: string;
  data: RecentTransaction[];
}

export const allTransactions: TransactionGroup[] = [
  {
    title: "Today",
    data: [
      { id: "1", type: "send", recipientName: "Adebayo Ogunlesi", amount: 2500, currency: "USD", symbol: "$", status: "completed", date: "2:34 PM" },
      { id: "2", type: "receive", recipientName: "Sarah Mitchell", amount: 1200, currency: "EUR", symbol: "€", status: "completed", date: "11:20 AM" },
      { id: "10", type: "send", recipientName: "Fatima Zahra", amount: 750, currency: "USD", symbol: "$", status: "completed", date: "9:15 AM" },
    ],
  },
  {
    title: "Yesterday",
    data: [
      { id: "3", type: "send", recipientName: "Kwame Asante", amount: 850000, currency: "NGN", symbol: "₦", status: "processing", date: "4:15 PM" },
      { id: "4", type: "send", recipientName: "James Mwangi", amount: 500, currency: "USD", symbol: "$", status: "pending", date: "9:00 AM" },
      { id: "11", type: "receive", recipientName: "Liam O'Brien", amount: 4800, currency: "GBP", symbol: "£", status: "completed", date: "8:30 AM" },
    ],
  },
  {
    title: "March 20",
    data: [
      { id: "5", type: "receive", recipientName: "Elena Rossi", amount: 3200, currency: "GBP", symbol: "£", status: "completed", date: "3:45 PM" },
      { id: "12", type: "send", recipientName: "Chen Wei", amount: 1000, currency: "USD", symbol: "$", status: "completed", date: "1:20 PM" },
    ],
  },
  {
    title: "March 18",
    data: [
      { id: "13", type: "send", recipientName: "Amara Diallo", amount: 2200000, currency: "NGN", symbol: "₦", status: "completed", date: "5:30 PM" },
      { id: "14", type: "receive", recipientName: "Marcus Johnson", amount: 8500, currency: "USD", symbol: "$", status: "completed", date: "2:10 PM" },
      { id: "15", type: "send", recipientName: "Priya Sharma", amount: 1500, currency: "EUR", symbol: "€", status: "failed", date: "10:45 AM" },
    ],
  },
  {
    title: "March 15",
    data: [
      { id: "16", type: "receive", recipientName: "David Kim", amount: 950, currency: "USD", symbol: "$", status: "completed", date: "4:00 PM" },
      { id: "17", type: "send", recipientName: "Oluwaseun Bakare", amount: 1750000, currency: "NGN", symbol: "₦", status: "completed", date: "11:30 AM" },
    ],
  },
];
