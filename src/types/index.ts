export type VehicleType = 'bike' | 'cycle' | 'car' | 'other';

export type PassDurationType = '12h' | '24h' | 'monthly' | 'quarterly' | 'custom';

export type PaymentMode = 'cash' | 'upi' | 'pending';

export type PaymentStatus = 'paid' | 'partial' | 'pending';

export type PassStatus = 'active' | 'expiring_soon' | 'expired' | 'completed';

export interface VehicleRate {
  h12: number;        // 12 Hours rate (e.g. Bike: ₹20)
  h24: number;        // 24 Hours rate / 1 Day (e.g. Bike: ₹40)
  monthly: number;    // Monthly 30 Days (e.g. Bike: ₹250)
  quarterly: number;  // Quarterly 90 Days (e.g. Bike: ₹600)
  hourly: number;     // Hourly rate for custom hours (e.g. Bike: ₹5/hr)
  daily: number;      // Daily rate for custom days (e.g. Bike: ₹30/day)
}

export interface RatesConfig {
  bike: VehicleRate;
  cycle: VehicleRate;
  car: VehicleRate;
  other: VehicleRate;
}

export interface ParkingPass {
  id: string;                    // e.g. "UPK-1001"
  tokenNumber: number;
  customerName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  vehicleNumber: string;         // e.g. "DL 01 AB 1234"
  durationType: PassDurationType;
  customDurationValue?: number;  // e.g. 5
  customDurationUnit?: 'hours' | 'days';
  entryTime: string;             // ISO string
  expiryTime: string;            // ISO string
  exitTime?: string;             // ISO string when vehicle checks out
  amountCharged: number;         // Total fee
  amountPaid: number;            // Amount paid by customer
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  slotNumber: string;            // e.g. "B-04"
  helmetCount: number;           // Helmet/items deposited
  notes?: string;
  status: PassStatus;
  overdueCharge?: number;
  alertSent?: boolean;
  createdAt: string;
}

export interface ParkingSettings {
  parkingName: string;
  ownerName: string;
  ownerPhone: string;
  address: string;
  upiId: string;
  totalCapacity: {
    bike: number;
    cycle: number;
    car: number;
    other: number;
  };
  alertHoursBefore: number;      // Alert when expiry is within X hours (default: 2)
  language: 'hi' | 'en';
}

export interface ExpiryForecastGroup {
  id: 'next_2h' | 'next_6h' | 'today' | 'next_3d' | 'monthly' | 'expired' | 'all';
  labelEn: string;
  labelHi: string;
  count: number;
  color: string;
  passes: ParkingPass[];
}

export interface NotificationAlert {
  id: string;
  passId: string;
  vehicleNumber: string;
  customerName: string;
  phoneNumber: string;
  type: 'expiring_soon' | 'expired' | 'payment_due';
  messageEn: string;
  messageHi: string;
  timestamp: string;
  isRead: boolean;
  minutesRemaining?: number;
}
