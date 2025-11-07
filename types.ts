// Fix: Replaced incorrect component implementation with proper type definitions.
export interface Drink {
  id: string;
  name: string;
  price: number;
}

export interface Food {
  id: string;
  name: string;
  price: number;
}

export interface ShuttlecockItem {
  id: string;
  name: string;
  price: number;
}

export interface Player {
  id: string;
  name: string;
  phone?: string;
  consumedDrinks: Record<string, number>;
  consumedFoods: Record<string, number>;
  shuttlecockConsumption: Record<string, number>; // Maps ShuttlecockItem.id to quantity
  isGuest?: boolean;
  quantity?: number;
  adjustment: {
    amount: number;
    reason: string;
  };
  isPaid: boolean;
}

export interface PlayerDetails extends Player {
  totalCost: number;
  wins: number;
  losses: number;
  drinksCost: number;
  foodCost: number;
  shuttlecockCost: number;
  manualShuttlecockCost: number;
  matchShuttlecockCost: number;
}

export interface Match {
  courtIndex: number;
  gameType: 'singles' | 'doubles';
  teamA: { id: string; name: string }[];
  teamB: { id: string; name: string }[];
  losingTeam: 'A' | 'B';
}

export interface Session {
  id: string;
  date: string;
  players: PlayerDetails[];
  gameType: 'practice' | 'singles' | 'doubles';
  summary: {
    totalCourtFee: number;
    totalDrinksCost: number;
    totalFoodCost: number;
    totalShuttlecockCost: number;
    grandTotal: number;
  };
  matches: Match[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  expiryDate: string;
  isLocked: boolean;
}
