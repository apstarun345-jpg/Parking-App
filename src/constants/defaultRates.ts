import { RatesConfig, ParkingSettings } from '../types';

export const DEFAULT_RATES: RatesConfig = {
  bike: {
    h12: 20,       // Uncle's exact rate: ₹20 for 12 hours / 1 day
    h24: 35,       // 24 hours rate
    monthly: 250,  // Uncle's exact rate: ₹250 monthly pass
    quarterly: 600,// Uncle's exact rate: ₹600 quarterly pass (3 months)
    hourly: 5,     // Custom hourly rate
    daily: 25,     // Custom daily rate
  },
  cycle: {
    h12: 10,
    h24: 15,
    monthly: 100,
    quarterly: 250,
    hourly: 2,
    daily: 10,
  },
  car: {
    h12: 50,
    h24: 80,
    monthly: 800,
    quarterly: 2000,
    hourly: 15,
    daily: 70,
  },
  other: {
    h12: 40,
    h24: 70,
    monthly: 700,
    quarterly: 1800,
    hourly: 10,
    daily: 50,
  },
};

export const DEFAULT_SETTINGS: ParkingSettings = {
  parkingName: 'चाचा जी पार्किंग (Uncle Ji Parking)',
  ownerName: 'Uncle Ji',
  ownerPhone: '9876543210',
  address: 'Main Market, Near Metro Station, Delhi',
  upiId: 'uncleparking@upi',
  totalCapacity: {
    bike: 40,
    cycle: 20,
    car: 15,
    other: 5,
  },
  alertHoursBefore: 2, // Notify 2 hours before pass expires
  language: 'hi',      // Default to Hindi as requested, can toggle to English anytime
};
