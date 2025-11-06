import { Drink, Food } from './types';

// --- Cost Configuration ---
export const COURT_FEE = 50000; // per person per session
export const SHUTTLECOCK_FEE_PER_MATCH = 20000; // total fee per match, to be divided among losers

// --- Player Configuration ---
export const GUEST_PLAYER_ID = 'guest-player';
export const GUEST_PLAYER_NAME = 'Khách vãng lai';

// --- Default Data ---
export const DEFAULT_DRINKS: Drink[] = [
    { id: 'tra-duong', name: 'Trà đường', price: 12000 },
    { id: 'nuoc-chai', name: 'Nước chai', price: 15000 },
    { id: 'nuoc-suoi', name: 'Nước suối', price: 5000 },
];
export const DEFAULT_FOODS: Food[] = [];


// --- Subscription Configuration ---
export const SUBSCRIPTION_PACKAGES = [
  { id: '1m', name: '1 Tháng', durationDays: 30, price: 150000 },
  { id: '3m', name: '3 Tháng', durationDays: 90, price: 420000 },
  { id: '6m', name: '6 Tháng', durationDays: 180, price: 800000 },
  { id: '12m', name: '1 Năm', durationDays: 365, price: 1600000 },
];