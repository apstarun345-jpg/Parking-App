import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ParkingPass,
  RatesConfig,
  ParkingSettings,
  VehicleType,
  PassDurationType,
  PassStatus,
  ExpiryForecastGroup,
} from '../types';
import { DEFAULT_RATES, DEFAULT_SETTINGS } from '../constants/defaultRates';

const PASSES_STORAGE_KEY = '@uncle_parking_passes_v2';
const RATES_STORAGE_KEY = '@uncle_parking_rates_v2';
const SETTINGS_STORAGE_KEY = '@uncle_parking_settings_v2';

// Helper to add hours/days to date
export function calculateExpiryDate(
  startDate: Date,
  durationType: PassDurationType,
  customValue: number = 1,
  customUnit: 'hours' | 'days' = 'hours'
): Date {
  const result = new Date(startDate.getTime());
  switch (durationType) {
    case '12h':
      result.setHours(result.getHours() + 12);
      break;
    case '24h':
      result.setHours(result.getHours() + 24);
      break;
    case 'monthly':
      result.setDate(result.getDate() + 30);
      break;
    case 'quarterly':
      result.setDate(result.getDate() + 90);
      break;
    case 'custom':
      if (customUnit === 'hours') {
        result.setHours(result.getHours() + customValue);
      } else {
        result.setDate(result.getDate() + customValue);
      }
      break;
  }
  return result;
}

// Calculate price based on rates
export function calculatePrice(
  vehicleType: VehicleType,
  durationType: PassDurationType,
  rates: RatesConfig,
  customValue: number = 1,
  customUnit: 'hours' | 'days' = 'hours'
): number {
  const rate = rates[vehicleType] || rates.bike;
  switch (durationType) {
    case '12h':
      return rate.h12;
    case '24h':
      return rate.h24;
    case 'monthly':
      return rate.monthly;
    case 'quarterly':
      return rate.quarterly;
    case 'custom':
      if (customUnit === 'hours') {
        return Math.max(rate.h12, customValue * rate.hourly);
      } else {
        return customValue * rate.daily;
      }
  }
}

// Check pass live status
export function getLiveStatus(pass: ParkingPass, alertHoursBefore: number = 2): PassStatus {
  if (pass.status === 'completed') return 'completed';
  const now = Date.now();
  const expiry = new Date(pass.expiryTime).getTime();
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return 'expired';
  }
  if (diffMs <= alertHoursBefore * 3600 * 1000) {
    return 'expiring_soon';
  }
  return 'active';
}

// Format time remaining or overdue
export function getTimeDifferenceText(expiryTime: string, language: 'hi' | 'en' = 'hi'): {
  text: string;
  isExpired: boolean;
  isUrgent: boolean;
  minutesRemaining: number;
} {
  const now = Date.now();
  const expiry = new Date(expiryTime).getTime();
  const diffMs = expiry - now;
  const isExpired = diffMs <= 0;
  const absDiff = Math.abs(diffMs);

  const totalMinutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  const isUrgent = !isExpired && diffMs <= 2 * 3600 * 1000; // < 2 hours

  let text = '';
  if (language === 'hi') {
    if (isExpired) {
      if (days > 0) {
        text = `${days} दिन ${remainingHours} घंटे ओवरड्यू`;
      } else if (hours > 0) {
        text = `${hours} घंटे ${minutes} मिनट ओवरड्यू`;
      } else {
        text = `${minutes} मिनट ओवरड्यू`;
      }
    } else {
      if (days > 0) {
        text = `${days} दिन ${remainingHours} घंटे बाकी`;
      } else if (hours > 0) {
        text = `${hours} घंटे ${minutes} मिनट बाकी`;
      } else {
        text = `${minutes} मिनट बाकी (जल्द समाप्त!)`;
      }
    }
  } else {
    if (isExpired) {
      if (days > 0) {
        text = `Overdue by ${days}d ${remainingHours}h`;
      } else if (hours > 0) {
        text = `Overdue by ${hours}h ${minutes}m`;
      } else {
        text = `Overdue by ${minutes}m`;
      }
    } else {
      if (days > 0) {
        text = `${days}d ${remainingHours}h left`;
      } else if (hours > 0) {
        text = `${hours}h ${minutes}m left`;
      } else {
        text = `${minutes}m left (Expiring soon!)`;
      }
    }
  }

  return {
    text,
    isExpired,
    isUrgent,
    minutesRemaining: Math.floor(diffMs / (1000 * 60)),
  };
}

// Calculate overdue extra charge
export function calculateOverdueFee(pass: ParkingPass, rates: RatesConfig): number {
  const now = Date.now();
  const expiry = new Date(pass.expiryTime).getTime();
  if (now <= expiry) return 0;

  const overdueMs = now - expiry;
  const overdueHours = Math.ceil(overdueMs / (1000 * 3600));
  const rate = rates[pass.vehicleType] || rates.bike;

  // Grace period 15 mins
  if (overdueMs < 15 * 60 * 1000) return 0;

  if (overdueHours <= 12) {
    return rate.h12;
  } else {
    const extraDays = Math.ceil(overdueHours / 24);
    return extraDays * (rate.h24 || 35);
  }
}

// Generate realistic seed passes for Uncle
export function generateSeedPasses(): ParkingPass[] {
  const now = new Date();

  // 1. Bike expiring in 45 mins (Uncle's 12-hour pass: ₹20)
  const bikeExpiringSoon: ParkingPass = {
    id: 'UPK-1001',
    tokenNumber: 101,
    customerName: 'रमेश कुमार (Ramesh Kumar)',
    phoneNumber: '9811223344',
    vehicleType: 'bike',
    vehicleNumber: 'DL 05 S 4421',
    durationType: '12h',
    entryTime: new Date(now.getTime() - 11.25 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 45 * 60 * 1000).toISOString(),
    amountCharged: 20,
    amountPaid: 20,
    paymentMode: 'cash',
    paymentStatus: 'paid',
    slotNumber: 'B-04',
    helmetCount: 1,
    notes: 'ब्लैक हेलमेट जमा है',
    status: 'expiring_soon',
    createdAt: new Date(now.getTime() - 11.25 * 3600 * 1000).toISOString(),
  };

  // 2. Bike with Monthly Pass (Uncle's monthly rate: ₹250) - 18 days left
  const bikeMonthly: ParkingPass = {
    id: 'UPK-1002',
    tokenNumber: 102,
    customerName: 'अमित शर्मा (Amit Sharma)',
    phoneNumber: '9899112233',
    vehicleType: 'bike',
    vehicleNumber: 'UP 14 BT 9021',
    durationType: 'monthly',
    entryTime: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 18 * 24 * 3600 * 1000).toISOString(),
    amountCharged: 250,
    amountPaid: 250,
    paymentMode: 'upi',
    paymentStatus: 'paid',
    slotNumber: 'B-12',
    helmetCount: 0,
    notes: 'दुकानदार पास (Shopkeeper pass)',
    status: 'active',
    createdAt: new Date(now.getTime() - 12 * 24 * 3600 * 1000).toISOString(),
  };

  // 3. Bike with Quarterly Pass (Uncle's quarterly rate: ₹600) - 62 days left
  const bikeQuarterly: ParkingPass = {
    id: 'UPK-1003',
    tokenNumber: 103,
    customerName: 'राजेश सिंह (Rajesh Singh)',
    phoneNumber: '9711883300',
    vehicleType: 'bike',
    vehicleNumber: 'HR 26 BQ 7711',
    durationType: 'quarterly',
    entryTime: new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 62 * 24 * 3600 * 1000).toISOString(),
    amountCharged: 600,
    amountPaid: 600,
    paymentMode: 'upi',
    paymentStatus: 'paid',
    slotNumber: 'B-15',
    helmetCount: 0,
    notes: 'बैंक कर्मचारी (Bank Staff)',
    status: 'active',
    createdAt: new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString(),
  };

  // 4. Bike expiring in 2.5 hours (₹20 for 12h)
  const bikeNextFewHours: ParkingPass = {
    id: 'UPK-1004',
    tokenNumber: 104,
    customerName: 'संजय वर्मा (Sanjay Verma)',
    phoneNumber: '9871029384',
    vehicleType: 'bike',
    vehicleNumber: 'DL 08 CK 3390',
    durationType: '12h',
    entryTime: new Date(now.getTime() - 9.5 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 2.5 * 3600 * 1000).toISOString(),
    amountCharged: 20,
    amountPaid: 20,
    paymentMode: 'cash',
    paymentStatus: 'paid',
    slotNumber: 'B-08',
    helmetCount: 1,
    status: 'active',
    createdAt: new Date(now.getTime() - 9.5 * 3600 * 1000).toISOString(),
  };

  // 5. Bicycle / Cycle on 12-hour pass (₹10)
  const cyclePass: ParkingPass = {
    id: 'UPK-1005',
    tokenNumber: 105,
    customerName: 'सुरेश पाल (Suresh Pal)',
    phoneNumber: '9910023456',
    vehicleType: 'cycle',
    vehicleNumber: 'CYCLE-TOKEN-14',
    durationType: '12h',
    entryTime: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 8 * 3600 * 1000).toISOString(),
    amountCharged: 10,
    amountPaid: 10,
    paymentMode: 'cash',
    paymentStatus: 'paid',
    slotNumber: 'C-02',
    helmetCount: 0,
    status: 'active',
    createdAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
  };

  // 6. Car / 4-Wheeler expired 1 hr 15 mins ago (Overdue / Overstay)
  const carExpired: ParkingPass = {
    id: 'UPK-1006',
    tokenNumber: 106,
    customerName: 'विकास गुप्ता (Vikas Gupta)',
    phoneNumber: '9810998877',
    vehicleType: 'car',
    vehicleNumber: 'DL 03 CA 5566',
    durationType: '12h',
    entryTime: new Date(now.getTime() - 13.25 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() - 1.25 * 3600 * 1000).toISOString(),
    amountCharged: 50,
    amountPaid: 50,
    paymentMode: 'upi',
    paymentStatus: 'paid',
    slotNumber: 'CAR-03',
    helmetCount: 0,
    notes: 'कॉल करके याद दिलाया गया',
    status: 'expired',
    overdueCharge: 50,
    createdAt: new Date(now.getTime() - 13.25 * 3600 * 1000).toISOString(),
  };

  // 7. Car active on 24-hour pass
  const carActive: ParkingPass = {
    id: 'UPK-1007',
    tokenNumber: 107,
    customerName: 'नेहा कुमारी (Neha Kumari)',
    phoneNumber: '9717224455',
    vehicleType: 'car',
    vehicleNumber: 'UP 16 Z 8812',
    durationType: '24h',
    entryTime: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 16 * 3600 * 1000).toISOString(),
    amountCharged: 80,
    amountPaid: 80,
    paymentMode: 'upi',
    paymentStatus: 'paid',
    slotNumber: 'CAR-06',
    helmetCount: 0,
    status: 'active',
    createdAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
  };

  // 8. Completed Bike Pass checked out today morning (Cash collection)
  const bikeExited: ParkingPass = {
    id: 'UPK-1008',
    tokenNumber: 108,
    customerName: 'दिलीप सिंह (Dilip Singh)',
    phoneNumber: '9818833441',
    vehicleType: 'bike',
    vehicleNumber: 'DL 09 EA 1982',
    durationType: '12h',
    entryTime: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
    expiryTime: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
    exitTime: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    amountCharged: 20,
    amountPaid: 20,
    paymentMode: 'cash',
    paymentStatus: 'paid',
    slotNumber: 'B-02',
    helmetCount: 1,
    status: 'completed',
    createdAt: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
  };

  return [
    bikeExpiringSoon,
    carExpired,
    bikeNextFewHours,
    bikeMonthly,
    bikeQuarterly,
    cyclePass,
    carActive,
    bikeExited,
  ];
}

// Storage API
export async function getPasses(): Promise<ParkingPass[]> {
  try {
    const json = await AsyncStorage.getItem(PASSES_STORAGE_KEY);
    if (json) {
      const passes: ParkingPass[] = JSON.parse(json);
      // Refresh live status for non-completed passes
      return passes.map((p) => {
        if (p.status !== 'completed') {
          return { ...p, status: getLiveStatus(p) };
        }
        return p;
      });
    }
  } catch (err) {
    console.error('Error reading passes:', err);
  }
  // Initialize seed passes
  const seed = generateSeedPasses();
  await savePasses(seed);
  return seed;
}

export async function savePasses(passes: ParkingPass[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(passes));
  } catch (err) {
    console.error('Error saving passes:', err);
  }
}

export async function getRates(): Promise<RatesConfig> {
  try {
    const json = await AsyncStorage.getItem(RATES_STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (err) {
    console.error('Error reading rates:', err);
  }
  await saveRates(DEFAULT_RATES);
  return DEFAULT_RATES;
}

export async function saveRates(rates: RatesConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
  } catch (err) {
    console.error('Error saving rates:', err);
  }
}

export async function getSettings(): Promise<ParkingSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: ParkingSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

// Expiry forecast categorization
export function calculateExpiryForecast(passes: ParkingPass[], language: 'hi' | 'en' = 'hi'): ExpiryForecastGroup[] {
  const activePasses = passes.filter((p) => p.status !== 'completed');
  const now = Date.now();

  const next2h: ParkingPass[] = [];
  const next6h: ParkingPass[] = [];
  const today: ParkingPass[] = [];
  const next3d: ParkingPass[] = [];
  const monthly: ParkingPass[] = [];
  const expired: ParkingPass[] = [];

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endOfTodayMs = endOfToday.getTime();

  for (const pass of activePasses) {
    const expiryMs = new Date(pass.expiryTime).getTime();
    const diffMs = expiryMs - now;

    if (diffMs <= 0) {
      expired.push(pass);
    } else if (diffMs <= 2 * 3600 * 1000) {
      next2h.push(pass);
    } else if (diffMs <= 6 * 3600 * 1000) {
      next6h.push(pass);
    } else if (expiryMs <= endOfTodayMs) {
      today.push(pass);
    } else if (diffMs <= 3 * 24 * 3600 * 1000) {
      next3d.push(pass);
    } else {
      monthly.push(pass);
    }
  }

  return [
    {
      id: 'all',
      labelEn: 'All Parked',
      labelHi: 'सभी गाड़ियां',
      count: activePasses.length,
      color: '#3B82F6',
      passes: activePasses,
    },
    {
      id: 'expired',
      labelEn: 'Expired / Overdue',
      labelHi: 'समय समाप्त',
      count: expired.length,
      color: '#EF4444',
      passes: expired,
    },
    {
      id: 'next_2h',
      labelEn: 'Next 2 Hours',
      labelHi: 'अगले 2 घंटे में',
      count: next2h.length,
      color: '#F59E0B',
      passes: next2h,
    },
    {
      id: 'next_6h',
      labelEn: 'Next 6 Hours',
      labelHi: 'अगले 6 घंटे में',
      count: next6h.length,
      color: '#10B981',
      passes: next6h,
    },
    {
      id: 'today',
      labelEn: 'Rest of Today',
      labelHi: 'आज रात तक',
      count: today.length,
      color: '#6366F1',
      passes: today,
    },
    {
      id: 'next_3d',
      labelEn: 'Next 3 Days',
      labelHi: 'अगले 3 दिन में',
      count: next3d.length,
      color: '#8B5CF6',
      passes: next3d,
    },
    {
      id: 'monthly',
      labelEn: 'Monthly Passes',
      labelHi: 'मासिक / लंबी अवधि',
      count: monthly.length,
      color: '#06B6D4',
      passes: monthly,
    },
  ];
}
