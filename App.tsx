import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Player, Session, PlayerDetails, Match, Drink, Food, User } from './types';
import { COURT_FEE, SHUTTLECOCK_FEE_PER_MATCH, GUEST_PLAYER_ID, GUEST_PLAYER_NAME, DEFAULT_DRINKS, DEFAULT_FOODS } from './constants';
import Header from './components/Header';
import PlayerCard from './components/PlayerCard';
import Summary from './components/Summary';
import HistoryModal from './components/HistoryModal';
import DailyStatsModal from './components/DailyStatsModal';
import { UsersIcon, SaveIcon, ClipboardListIcon, BillIcon, CloseIcon, CourtIcon, FoodIcon, SparklesIcon, ChevronDownIcon, CheckCircleIcon, UserCogIcon, DownloadIcon, ClipboardCheckIcon, WaterIcon } from './components/IconComponents';
import CourtAssignment from './components/CourtAssignment';
import PlayerTotalsModal from './components/PlayerTotalsModal';
import PastRevenueModal from './components/PastRevenueModal';
import PlayerManagementModal from './components/PlayerManagementModal';
import CostAdjustmentModal from './components/CostAdjustmentModal';
import FoodManagementModal from './components/FoodManagementModal';
import DrinkManagementModal from './components/DrinkManagementModal';
import UserManagementModal from './components/UserManagementModal';
import BackupRestoreModal from './components/BackupRestoreModal';
import PaidPlayersModal from './components/PaidPlayersModal';
import MatchResultModal from './components/MatchResultModal';

interface AppProps {
  onLogout: () => void;
  currentUser: User;
  users: User[];
  onUpdateUsers: (updatedUsers: User[]) => void;
  onAddUser: (userData: Omit<User, 'id' | 'role' | 'isLocked'>) => { success: boolean, message?: string };
}

interface SaveConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
  savedRevenueToday: number;
  formatCurrency: (amount: number) => string;
}

const SaveConfirmModal: React.FC<SaveConfirmModalProps> = ({ onClose, onConfirm, savedRevenueToday, formatCurrency }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <SaveIcon className="w-6 h-6 mr-3" />
            Xác nhận lưu buổi chơi
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4">
            <p className="text-gray-600 text-center">
                Bạn có chắc chắn muốn kết thúc buổi chơi hiện tại, lưu kết quả và bắt đầu một buổi mới không?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                <div className="flex items-center">
                    <BillIcon className="w-8 h-8 text-blue-500 mr-4"/>
                    <div>
                        <p className="text-sm text-gray-500">Doanh thu đã lưu hôm nay</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(savedRevenueToday)}</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-gray-400">
                *Doanh thu của buổi chơi hiện tại sẽ được cộng vào sau khi lưu.
            </p>
        </main>

        <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex gap-3">
            <button 
                onClick={onClose} 
                className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                Hủy
            </button>
            <button 
                onClick={onConfirm} 
                className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <SaveIcon className="w-5 h-5 mr-2" />
                Xác nhận và Lưu
            </button>
        </footer>
      </div>
    </div>
  );
};

const createInitialPlayers = (storageKey: string): Player[] => {
    const guestPlayer: Player = {
        id: GUEST_PLAYER_ID,
        name: GUEST_PLAYER_NAME,
        consumedDrinks: {},
        consumedFoods: {},
        isGuest: true,
        quantity: 1,
        adjustment: { amount: 0, reason: '' },
        isPaid: false,
    };

    try {
        const storedPlayers = localStorage.getItem(storageKey);
        if (storedPlayers) {
            const parsed = JSON.parse(storedPlayers) as { id: string, name: string, phone?: string }[];
            const regularPlayers = parsed.filter(p => p.id !== GUEST_PLAYER_ID).map(p => ({ ...p, consumedDrinks: {}, consumedFoods: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false }));
            return [guestPlayer, ...regularPlayers];
        }
    } catch (e) {
        console.error("Failed to load players from localStorage", e);
    }
    
    const defaultPlayers = [
        { id: crypto.randomUUID(), name: 'Người chơi 1', phone: '', consumedDrinks: {}, consumedFoods: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false },
        { id: crypto.randomUUID(), name: 'Người chơi 2', phone: '', consumedDrinks: {}, consumedFoods: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false },
    ];
    
    return [guestPlayer, ...defaultPlayers];
};

const savePlayersToStorage = (storageKey: string, playersToSave: Player[]) => {
    try {
        const storablePlayers = playersToSave
            .filter(p => !p.isGuest)
            .map(({ id, name, phone }) => ({ id, name, phone }));
        localStorage.setItem(storageKey, JSON.stringify(storablePlayers));
    } catch (e) {
        console.error("Failed to save players to localStorage", e);
    }
};

const createInitialCourtGameTypes = (): Record<number, 'singles' | 'doubles'> => {
  const initialTypes: Record<number, 'singles' | 'doubles'> = {};
  for (let i = 0; i < 7; i++) {
    initialTypes[i] = 'doubles';
  }
  return initialTypes;
};


const App: React.FC<AppProps> = ({ onLogout, currentUser, users, onUpdateUsers, onAddUser }) => {
  const storageKeys = useMemo(() => {
    if (!currentUser) return null;
    return {
        players: `badmintonPlayers_${currentUser.id}`,
        history: `badmintonHistory_${currentUser.id}`,
        courtColors: `badmintonCourtColors_${currentUser.id}`,
        drinks: `badmintonDrinks_${currentUser.id}`,
        foods: `badmintonFoods_${currentUser.id}`,
        autoBackup: `badmintonAutoBackup_${currentUser.id}`,
        lastAutoBackupTimestamp: `lastAutoBackupTimestamp_${currentUser.id}`,
    };
  }, [currentUser]);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPlayerTotalsModalOpen, setIsPlayerTotalsModalOpen] = useState(false);
  const [isPaidPlayersModalOpen, setIsPaidPlayersModalOpen] = useState(false);
  const [isPlayerManagementModalOpen, setIsPlayerManagementModalOpen] = useState(false);
  const [isFoodManagementModalOpen, setIsFoodManagementModalOpen] = useState(false);
  const [isDrinkManagementModalOpen, setIsDrinkManagementModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [isPastRevenueModalOpen, setIsPastRevenueModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);
  const [playerToAdjustId, setPlayerToAdjustId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [playerLosses, setPlayerLosses] = useState<Record<string, number>>({});
  const [playerWins, setPlayerWins] = useState<Record<string, number>>({});
  const [playerShuttlecockFees, setPlayerShuttlecockFees] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [courtGameTypes, setCourtGameTypes] = useState<Record<number, 'singles' | 'doubles'>>(createInitialCourtGameTypes());
  const [courtColors, setCourtColors] = useState<Record<number, string>>({});
  const [isPlayerListVisible, setIsPlayerListVisible] = useState(true);
  const [isMatchResultModalOpen, setIsMatchResultModalOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<{
      courtIndex: number;
      teamA: { id: string, name: string }[];
      teamB: { id: string, name: string }[];
      gameType: 'singles' | 'doubles';
  } | null>(null);
  
  useEffect(() => {
    if (!storageKeys) return;
    setPlayers(createInitialPlayers(storageKeys.players));
    try {
      const storedSessions = localStorage.getItem(storageKeys.history);
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions) as Session[]);
      }
      const storedColors = localStorage.getItem(storageKeys.courtColors);
      if (storedColors) {
        setCourtColors(JSON.parse(storedColors));
      }
      const storedDrinks = localStorage.getItem(storageKeys.drinks);
        if (storedDrinks) {
            setDrinks(JSON.parse(storedDrinks));
        } else {
            setDrinks(DEFAULT_DRINKS);
        }
        const storedFoods = localStorage.getItem(storageKeys.foods);
        if (storedFoods) {
            setFoods(JSON.parse(storedFoods));
        } else {
            setFoods(DEFAULT_FOODS);
        }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setSessions([]); 
    }
  }, [storageKeys]);

  useEffect(() => {
    if (!storageKeys) return;
    const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
    const lastBackupTimestamp = localStorage.getItem(storageKeys.lastAutoBackupTimestamp);
    const now = new Date().getTime();

    if (!lastBackupTimestamp || (now - parseInt(lastBackupTimestamp, 10)) > AUTO_BACKUP_INTERVAL) {
        try {
            const playersData = localStorage.getItem(storageKeys.players);
            const historyData = localStorage.getItem(storageKeys.history);
            const colorsData = localStorage.getItem(storageKeys.courtColors);
            const drinksData = localStorage.getItem(storageKeys.drinks);
            const foodsData = localStorage.getItem(storageKeys.foods);

            if (playersData || historyData || colorsData || drinksData || foodsData) {
                const backupData = {
                    players: playersData ? JSON.parse(playersData) : [],
                    history: historyData ? JSON.parse(historyData) : [],
                    colors: colorsData ? JSON.parse(colorsData) : {},
                    drinks: drinksData ? JSON.parse(drinksData) : [],
                    foods: foodsData ? JSON.parse(foodsData) : [],
                    timestamp: new Date().toISOString(),
                };

                localStorage.setItem(storageKeys.autoBackup, JSON.stringify(backupData));
                localStorage.setItem(storageKeys.lastAutoBackupTimestamp, now.toString());
                console.log('Auto backup successful for user:', currentUser.id);
                setNotification('Hệ thống đã được tự động sao lưu.');
            }
        } catch (error) {
            console.error('Auto backup failed:', error);
            setNotification('Sao lưu tự động thất bại.');
        }
    }
  }, [storageKeys, currentUser.id]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }, []);

  const playerDetails = useMemo((): PlayerDetails[] => {
    return players.map(player => {
        const drinksCost = Object.entries(player.consumedDrinks).reduce((total, [drinkId, quantity]) => {
            const drink = drinks.find(d => d.id === drinkId);
            return total + (drink ? drink.price * Number(quantity) : 0);
        }, 0);
        
        const foodCost = Object.entries(player.consumedFoods).reduce((total, [foodId, quantity]) => {
            const food = foods.find(f => f.id === foodId);
            return total + (food ? food.price * Number(quantity) : 0);
        }, 0);

        const shuttlecockCost = playerShuttlecockFees[player.id] || 0;
        const courtFee = player.isGuest ? COURT_FEE * (player.quantity || 1) : COURT_FEE;
        const adjustmentAmount = player.adjustment?.amount || 0;
        const totalCost = courtFee + drinksCost + foodCost + shuttlecockCost + adjustmentAmount;

        return {
            ...player,
            totalCost,
            wins: playerWins[player.id] || 0,
            losses: playerLosses[player.id] || 0,
            drinksCost,
            foodCost,
            shuttlecockCost,
        };
    });
  }, [players, playerLosses, playerWins, playerShuttlecockFees, drinks, foods]);

  const playerCountForFee = useMemo(() => {
    return players.reduce((count, player) => {
        if (player.isGuest) {
            return count + (player.quantity || 1);
        }
        return count + 1;
    }, 0);
  }, [players]);

  const summary = useMemo(() => {
    const { totalDrinksCost, totalFoodCost, totalShuttlecockCost, grandTotal, totalPaid } = playerDetails.reduce((acc, p) => {
        acc.totalDrinksCost += p.drinksCost;
        acc.totalFoodCost += p.foodCost;
        acc.totalShuttlecockCost += p.shuttlecockCost;
        acc.grandTotal += p.totalCost;
        if(p.isPaid) {
            acc.totalPaid += p.totalCost;
        }
        return acc;
    }, { totalDrinksCost: 0, totalFoodCost: 0, totalShuttlecockCost: 0, grandTotal: 0, totalPaid: 0 });
    
    const totalCourtFee = playerCountForFee * COURT_FEE;
    
    return {
        totalCourtFee,
        totalDrinksCost,
        totalFoodCost,
        totalShuttlecockCost,
        grandTotal,
        totalPaid
    };
  }, [playerDetails, playerCountForFee]);
  
  const dailyStats = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    let totalRevenue = 0;
    const playerIds = new Set<string>();

    sessions.forEach(session => {
        try {
            const sessionDate = new Date(session.date);
            if (isNaN(sessionDate.getTime())) return;
            const sessionDateStr = `${sessionDate.getFullYear()}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}-${sessionDate.getDate().toString().padStart(2, '0')}`;
            
            if (sessionDateStr === todayStr) {
                totalRevenue += session.summary.grandTotal;
                session.players.forEach(p => playerIds.add(p.id));
            }
        } catch(e) { console.error("Error processing session for daily stats", e); }
    });

    return {
        totalRevenue,
        uniquePlayers: playerIds.size
    };
  }, [sessions]);

  const assignedPlayerIds = useMemo(() => {
    return new Set(Object.values(assignments).filter((id): id is string => id !== null));
  }, [assignments]);

  const unassignedPlayers = useMemo(() => {
    return players.filter(p => !assignedPlayerIds.has(p.id) && !p.isGuest);
  }, [players, assignedPlayerIds]);

  const paidPlayers = useMemo(() => {
    return playerDetails.filter(p => p.isPaid);
  }, [playerDetails]);

  const handleAssignPlayer = useCallback((playerId: string, slotId: string) => {
    setAssignments(prev => {
        const newAssignments = { ...prev };
        const oldSlot = Object.keys(prev).find(key => prev[key] === playerId);
        if (oldSlot) {
            newAssignments[oldSlot] = null;
        }
        newAssignments[slotId] = playerId;
        return newAssignments;
    });
  }, []);

  const handleUnassign = useCallback((slotId: string) => {
    setAssignments(prev => {
        const newAssignments = { ...prev };
        newAssignments[slotId] = null;
        return newAssignments;
    });
  }, []);
  
  const handleAutoAssign = useCallback(() => {
    const availablePlayers = [...unassignedPlayers];
    const newAssignments = { ...assignments };

    if (availablePlayers.length === 0) {
      setNotification("Không có người chơi nào để xếp sân.");
      return;
    }

    for (let i = 0; i < 7; i++) { // Loop through courts
      if (availablePlayers.length === 0) break;

      const gameType = courtGameTypes[i] || 'doubles';
      const slotsToCheck = gameType === 'singles'
        ? [`court-${i}-A-0`, `court-${i}-B-0`]
        : [`court-${i}-A-0`, `court-${i}-A-1`, `court-${i}-B-0`, `court-${i}-B-1`];

      for (const slotId of slotsToCheck) {
        if (availablePlayers.length === 0) break;

        if (newAssignments[slotId] === null || newAssignments[slotId] === undefined) {
          const playerToAssign = availablePlayers.shift();
          if (playerToAssign) {
            newAssignments[slotId] = playerToAssign.id;
          }
        }
      }
    }
    
    setAssignments(newAssignments);
    setNotification("Đã tự động xếp người chơi vào sân.");
  }, [unassignedPlayers, assignments, courtGameTypes]);

  const handleAddPlayer = useCallback((name: string) => {
    if (!name.trim() || !storageKeys) return;
    const newPlayer = { id: crypto.randomUUID(), name: name.trim(), phone: '', consumedDrinks: {}, consumedFoods: {}, quantity: 1, adjustment: { amount: 0, reason: '' }, isPaid: false };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayersToStorage(storageKeys.players, updatedPlayers);
  }, [players, storageKeys]);

  const handleRemovePlayer = useCallback((id: string) => {
    if (!storageKeys) return;
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    savePlayersToStorage(storageKeys.players, updatedPlayers);
    setPlayerLosses(prev => {
        const newLosses = {...prev};
        delete newLosses[id];
        return newLosses;
    });
     setPlayerWins(prev => {
        const newWins = {...prev};
        delete newWins[id];
        return newWins;
    });
    setPlayerShuttlecockFees(prev => {
        const newFees = {...prev};
        delete newFees[id];
        return newFees;
    });
    setAssignments(prev => {
        const newAssignments = { ...prev };
        Object.keys(newAssignments).forEach(key => {
            if (newAssignments[key] === id) {
                newAssignments[key] = null;
            }
        });
        return newAssignments;
    });
  }, [players, storageKeys]);
  
  const handleUpdatePlayerInfo = useCallback((id: string, newName: string, newPhone: string) => {
    if (!storageKeys) return;
    const updatedPlayers = players.map(p => p.id === id ? { ...p, name: newName, phone: newPhone } : p);
    setPlayers(updatedPlayers);
    savePlayersToStorage(storageKeys.players, updatedPlayers);
  }, [players, storageKeys]);

  const handleImportPlayers = useCallback((importedPlayers: { name: string; phone?: string }[], mode: 'replace' | 'merge') => {
      if (!storageKeys) return;
      const guestPlayer = players.find(p => p.isGuest);

      if (mode === 'replace') {
          const newPlayerList: Player[] = importedPlayers.map(p => ({
              id: crypto.randomUUID(),
              name: p.name,
              phone: p.phone || '',
              consumedDrinks: {},
              consumedFoods: {},
              quantity: 1,
              adjustment: { amount: 0, reason: '' },
              isPaid: false,
          }));
          
          const finalPlayers = guestPlayer ? [guestPlayer, ...newPlayerList] : newPlayerList;
          
          setAssignments({});
          setPlayerLosses({});
          setPlayerWins({});
          setPlayerShuttlecockFees({});
          
          setPlayers(finalPlayers);
          savePlayersToStorage(storageKeys.players, finalPlayers);
          setNotification(`${newPlayerList.length} người chơi đã được nhập thành công, thay thế danh sách cũ.`);
      } else { // mode === 'merge'
          const currentRegularPlayers = players.filter(p => !p.isGuest);
          const existingPlayerNames = new Set(currentRegularPlayers.map(p => p.name.trim().toLowerCase()));

          const newUniquePlayers = importedPlayers.filter(p => 
              p.name.trim() && !existingPlayerNames.has(p.name.trim().toLowerCase())
          );

          if (newUniquePlayers.length === 0) {
              setNotification("Không có người chơi mới nào trong file để thêm vào.");
              return;
          }

          const newPlayerObjects: Player[] = newUniquePlayers.map(p => ({
              id: crypto.randomUUID(),
              name: p.name.trim(),
              phone: p.phone?.trim() || '',
              consumedDrinks: {},
              consumedFoods: {},
              quantity: 1,
              adjustment: { amount: 0, reason: '' },
              isPaid: false,
          }));

          const finalPlayers = [...(guestPlayer ? [guestPlayer] : []), ...currentRegularPlayers, ...newPlayerObjects];

          setPlayers(finalPlayers);
          savePlayersToStorage(storageKeys.players, finalPlayers);
          setNotification(`${newPlayerObjects.length} người chơi mới đã được thêm vào danh sách.`);
      }
  }, [players, storageKeys, setNotification]);


  const handleUpdateDrink = useCallback((id: string, drinkId: string, amount: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const newDrinks = { ...p.consumedDrinks };
        const currentQuantity = newDrinks[drinkId] || 0;
        const newQuantity = Math.max(0, currentQuantity + amount);

        if (newQuantity === 0) {
          delete newDrinks[drinkId];
        } else {
          newDrinks[drinkId] = newQuantity;
        }
        
        return { ...p, consumedDrinks: newDrinks };
      }
      return p;
    }));
  }, []);
  
  const handleUpdateFood = useCallback((id: string, foodId: string, amount: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const newFoods = { ...p.consumedFoods };
        const currentQuantity = newFoods[foodId] || 0;
        const newQuantity = Math.max(0, currentQuantity + amount);

        if (newQuantity === 0) {
          delete newFoods[foodId];
        } else {
          newFoods[foodId] = newQuantity;
        }
        
        return { ...p, consumedFoods: newFoods };
      }
      return p;
    }));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, amount: number) => {
    setPlayers(prev => prev.map(p =>
        p.id === id && p.isGuest ? { ...p, quantity: Math.max(1, (p.quantity || 1) + amount) } : p
    ));
  }, []);

  const handleOpenAdjustmentModal = useCallback((playerId: string) => {
    setPlayerToAdjustId(playerId);
    setIsAdjustmentModalOpen(true);
  }, []);

  const handleCloseAdjustmentModal = useCallback(() => {
    setPlayerToAdjustId(null);
    setIsAdjustmentModalOpen(false);
  }, []);

  const handleUpdatePlayerAdjustment = useCallback((playerId: string, amount: number, reason: string) => {
    setPlayers(prev => prev.map(p => 
        p.id === playerId 
        ? { ...p, adjustment: { amount, reason } }
        : p
    ));
  }, []);

  const handleTogglePaid = useCallback((id: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, isPaid: !p.isPaid } : p));
  }, []);

  const handleMarkAllPaid = useCallback(() => {
    setPlayers(prev => prev.map(p => ({ ...p, isPaid: true })));
  }, []);
  
  const handleUpdateDrinks = (updatedDrinks: Drink[]) => {
    if (!storageKeys) return;
    setDrinks(updatedDrinks);
    localStorage.setItem(storageKeys.drinks, JSON.stringify(updatedDrinks));
    setNotification('Danh sách thức uống đã được cập nhật.');
  };

  const handleUpdateFoods = (updatedFoods: Food[]) => {
    if (!storageKeys) return;
    setFoods(updatedFoods);
    localStorage.setItem(storageKeys.foods, JSON.stringify(updatedFoods));
    setNotification('Danh sách món ăn đã được cập nhật.');
  };

  const handleSetCourtGameType = useCallback((courtIndex: number, gameType: 'singles' | 'doubles') => {
    setCourtGameTypes(prev => ({ ...prev, [courtIndex]: gameType }));

    if (gameType === 'singles') {
        setAssignments(prev => {
            const newAssignments = { ...prev };
            const slotA1 = `court-${courtIndex}-A-1`;
            const slotB1 = `court-${courtIndex}-B-1`;
            if (newAssignments[slotA1]) newAssignments[slotA1] = null;
            if (newAssignments[slotB1]) newAssignments[slotB1] = null;
            return newAssignments;
        });
    }
  }, []);
  
  const handleSetCourtColor = useCallback((courtIndex: number, color: string) => {
    if (!storageKeys) return;
    setCourtColors(prev => {
        const newColors = { ...prev, [courtIndex]: color };
        try {
            localStorage.setItem(storageKeys.courtColors, JSON.stringify(newColors));
        } catch (e) {
            console.error("Failed to save court colors to localStorage", e);
        }
        return newColors;
    });
  }, [storageKeys]);

  const handleEndMatch = useCallback((courtIndex: number) => {
    const gameType = courtGameTypes[courtIndex] || 'doubles';
    
    const getTeamPlayers = (team: 'A' | 'B') => {
        const slots = gameType === 'singles' 
          ? [`court-${courtIndex}-${team}-0`]
          : [`court-${courtIndex}-${team}-0`, `court-${courtIndex}-${team}-1`];
        
        return slots
            .map(slotId => assignments[slotId])
            .filter((id): id is string => !!id)
            .map(id => {
                const player = players.find(p => p.id === id);
                return { id, name: player?.name || 'Unknown' };
            });
    };

    const teamA = getTeamPlayers('A');
    const teamB = getTeamPlayers('B');

    const requiredPlayers = gameType === 'singles' ? 1 : 1; // Require at least 1 player per team to start.
    if (teamA.length < requiredPlayers || teamB.length < requiredPlayers) {
        setNotification(`Không đủ người chơi ở Sân ${courtIndex + 1} để kết thúc trận đấu.`);
        return;
    }

    setActiveMatch({ courtIndex, teamA, teamB, gameType });
    setIsMatchResultModalOpen(true);
  }, [assignments, courtGameTypes, players]);

  const handleConfirmMatchResult = useCallback(({ winningTeam }: { winningTeam: 'A' | 'B' | 'DRAW' }) => {
    if (!activeMatch) return;

    const { courtIndex, teamA, teamB, gameType } = activeMatch;

    const slotsToClear = gameType === 'singles' 
        ? [`court-${courtIndex}-A-0`, `court-${courtIndex}-B-0`]
        : [`court-${courtIndex}-A-0`, `court-${courtIndex}-A-1`, `court-${courtIndex}-B-0`, `court-${courtIndex}-B-1`];
    
    setAssignments(prev => {
        const newAssignments = { ...prev };
        slotsToClear.forEach(slotId => {
            if (newAssignments[slotId]) newAssignments[slotId] = null;
        });
        return newAssignments;
    });

    if (winningTeam === 'DRAW') {
        setNotification(`Trận đấu tại Sân ${courtIndex + 1} kết thúc với tỉ số hòa.`);
        setIsMatchResultModalOpen(false);
        setActiveMatch(null);
        return;
    }

    const winners = winningTeam === 'A' ? teamA : teamB;
    const losers = winningTeam === 'A' ? teamB : teamA;
    const winnerIds = winners.map(p => p.id);
    const loserIds = losers.map(p => p.id);

    setMatchesPlayed(prev => prev + 1);

    setPlayerWins(prev => {
        const newWins = { ...prev };
        winnerIds.forEach(id => {
            newWins[id] = (newWins[id] || 0) + 1;
        });
        return newWins;
    });

    setPlayerLosses(prev => {
        const newLosses = { ...prev };
        loserIds.forEach(id => {
            newLosses[id] = (newLosses[id] || 0) + 1;
        });
        return newLosses;
    });

    if (loserIds.length > 0) {
        const feePerLoser = SHUTTLECOCK_FEE_PER_MATCH / loserIds.length;
        setPlayerShuttlecockFees(prev => {
            const newFees = { ...prev };
            loserIds.forEach(id => {
                newFees[id] = (newFees[id] || 0) + feePerLoser;
            });
            return newFees;
        });
    }

    const newMatch: Match = {
        courtIndex,
        gameType,
        teamA,
        teamB,
        losingTeam: winningTeam === 'A' ? 'B' : 'A',
    };
    setCurrentMatches(prev => [...prev, newMatch]);

    const winnerNames = winners.map(p => p.name).join(', ');
    setNotification(`Sân ${courtIndex + 1}: ${winnerNames} chiến thắng!`);

    setIsMatchResultModalOpen(false);
    setActiveMatch(null);
  }, [activeMatch]);

  
  const handleSaveSession = useCallback(() => {
    if (playerDetails.length === 0 || !storageKeys) {
      setNotification('Không có người chơi nào để lưu.');
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      players: playerDetails,
      gameType: 'doubles', // This is a placeholder; could be enhanced later
      summary: {
        totalCourtFee: summary.totalCourtFee,
        totalDrinksCost: summary.totalDrinksCost,
        totalFoodCost: summary.totalFoodCost,
        totalShuttlecockCost: summary.totalShuttlecockCost,
        grandTotal: summary.grandTotal,
      },
      matches: currentMatches,
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    try {
        localStorage.setItem(storageKeys.history, JSON.stringify(updatedSessions));
    } catch (e) {
        console.error("Failed to save session to localStorage", e);
    }

    // Reset state for a new session
    setPlayers(createInitialPlayers(storageKeys.players));
    setAssignments({});
    setMatchesPlayed(0);
    setPlayerLosses({});
    setPlayerWins({});
    setPlayerShuttlecockFees({});
    setCurrentMatches([]);
    setNotification('Đã lưu buổi chơi và bắt đầu buổi mới!');
    setIsSaveConfirmModalOpen(false);
  }, [playerDetails, sessions, summary, currentMatches, storageKeys]);

  const handleBackupData = useCallback(() => {
    if (!storageKeys || !currentUser) return;
    try {
        const dataToBackup = {
            players: JSON.parse(localStorage.getItem(storageKeys.players) || '[]'),
            history: JSON.parse(localStorage.getItem(storageKeys.history) || '[]'),
            courtColors: JSON.parse(localStorage.getItem(storageKeys.courtColors) || '{}'),
            drinks: JSON.parse(localStorage.getItem(storageKeys.drinks) || '[]'),
            foods: JSON.parse(localStorage.getItem(storageKeys.foods) || '[]'),
            timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        link.download = `badminton_backup_${currentUser.username}_${timestamp}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setNotification('Sao lưu dữ liệu thành công.');
    } catch (error) {
        console.error('Failed to backup data:', error);
        setNotification('Sao lưu dữ liệu thất bại.');
    }
  }, [storageKeys, currentUser]);

  const handleRestoreData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!storageKeys) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Bạn có chắc chắn muốn phục hồi dữ liệu từ file này không? Hành động này sẽ ghi đè toàn bộ dữ liệu của BẠN và không thể hoàn tác.')) {
        if (event.target) event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const data = JSON.parse(text);
            if (data.players) localStorage.setItem(storageKeys.players, JSON.stringify(data.players));
            if (data.history) localStorage.setItem(storageKeys.history, JSON.stringify(data.history));
            if (data.courtColors) localStorage.setItem(storageKeys.courtColors, JSON.stringify(data.courtColors));
            if (data.drinks) localStorage.setItem(storageKeys.drinks, JSON.stringify(data.drinks));
            if (data.foods) localStorage.setItem(storageKeys.foods, JSON.stringify(data.foods));
            setNotification('Phục hồi dữ liệu thành công! Trang sẽ được tải lại.');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Failed to restore data:', error);
            setNotification('Phục hồi thất bại. File có thể bị lỗi hoặc không đúng định dạng.');
        } finally {
            if (event.target) event.target.value = '';
        }
    };
    reader.readAsText(file);
  }, [storageKeys]);

  const handleRestoreFromAutoBackup = useCallback(() => {
    if (!storageKeys) return;
    try {
        const backupDataString = localStorage.getItem(storageKeys.autoBackup);
        if (!backupDataString) {
            setNotification('Không tìm thấy dữ liệu sao lưu tự động.');
            return;
        }

        const backupData = JSON.parse(backupDataString);
        
        if (backupData.players) localStorage.setItem(storageKeys.players, JSON.stringify(backupData.players));
        if (backupData.history) localStorage.setItem(storageKeys.history, JSON.stringify(backupData.history));
        if (backupData.colors) localStorage.setItem(storageKeys.courtColors, JSON.stringify(backupData.colors));
        if (backupData.drinks) localStorage.setItem(storageKeys.drinks, JSON.stringify(backupData.drinks));
        if (backupData.foods) localStorage.setItem(storageKeys.foods, JSON.stringify(backupData.foods));
        
        setNotification(`Đã phục hồi dữ liệu từ bản sao lưu lúc ${new Date(backupData.timestamp).toLocaleString('vi-VN')}. Đang tải lại...`);
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('Failed to restore from auto backup:', error);
        setNotification('Phục hồi từ sao lưu tự động thất bại.');
    }
  }, [storageKeys]);
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header 
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenPastRevenue={() => setIsPastRevenueModalOpen(true)}
        onLogout={onLogout}
        currentUser={currentUser}
      />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <UsersIcon className="w-6 h-6 mr-3 text-emerald-500"/>
                        Danh sách người chơi
                    </h2>
                    <div className="flex items-center gap-2">
                        {currentUser.role === 'admin' && (
                            <button 
                                onClick={() => setIsUserManagementModalOpen(true)}
                                className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                            >
                                <UserCogIcon className="w-5 h-5 mr-2" />
                                Quản lý Người dùng
                            </button>
                        )}
                        <button 
                            onClick={() => setIsDrinkManagementModalOpen(true)}
                            className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                        >
                            <WaterIcon className="w-5 h-5 mr-2" />
                            Quản lý Thức uống
                        </button>
                        <button 
                            onClick={() => setIsFoodManagementModalOpen(true)}
                            className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                        >
                            <FoodIcon className="w-5 h-5 mr-2" />
                            Quản lý Món ăn
                        </button>
                        <button 
                            onClick={() => setIsPlayerManagementModalOpen(true)}
                            className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                        >
                            <UsersIcon className="w-5 h-5 mr-2" />
                            Quản lý người chơi
                        </button>
                         <button 
                            onClick={() => setIsBackupRestoreModalOpen(true)}
                            className="flex items-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Sao lưu
                        </button>
                        <button 
                            onClick={handleAutoAssign}
                            className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Xếp sân tự động
                        </button>
                        <button onClick={() => setIsPlayerListVisible(!isPlayerListVisible)} className="p-2 rounded-md hover:bg-gray-100">
                            <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform ${isPlayerListVisible ? '' : '-rotate-90'}`} />
                        </button>
                    </div>
                </div>

                {isPlayerListVisible && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {playerDetails.map(details => (
                            <PlayerCard
                                key={details.id}
                                playerDetails={details}
                                drinks={drinks}
                                foods={foods}
                                onUpdateDrink={handleUpdateDrink}
                                onUpdateFood={handleUpdateFood}
                                onUpdateQuantity={handleUpdateQuantity}
                                formatCurrency={formatCurrency}
                                isAssigned={assignedPlayerIds.has(details.id)}
                                onOpenAdjustmentModal={handleOpenAdjustmentModal}
                                onTogglePaid={handleTogglePaid}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                  <CourtIcon className="w-6 h-6 mr-3 text-emerald-500"/>
                  Xếp sân thi đấu
              </h2>
              <CourtAssignment
                players={players}
                assignments={assignments}
                unassignedPlayers={unassignedPlayers}
                onAssign={handleAssignPlayer}
                onUnassign={handleUnassign}
                onEndMatch={handleEndMatch}
                courtGameTypes={courtGameTypes}
                onSetGameType={handleSetCourtGameType}
                courtColors={courtColors}
                onSetCourtColor={handleSetCourtColor}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <Summary
                totalCourtFee={summary.totalCourtFee}
                totalDrinksCost={summary.totalDrinksCost}
                totalFoodCost={summary.totalFoodCost}
                totalShuttlecockCost={summary.totalShuttlecockCost}
                grandTotal={summary.grandTotal}
                totalPaid={summary.totalPaid}
                formatCurrency={formatCurrency}
                playerCount={playerCountForFee}
              />
              <div className="mt-4 flex flex-col gap-3">
                  <button 
                      onClick={() => setIsPlayerTotalsModalOpen(true)}
                      className="w-full flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
                  >
                      <ClipboardListIcon className="w-5 h-5 mr-2" />
                      Xem chi tiết
                  </button>
                  <button 
                      onClick={() => setIsPaidPlayersModalOpen(true)}
                      className="w-full flex items-center justify-center bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
                  >
                      <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                      DS Đã thanh toán
                  </button>
                  <button 
                      onClick={handleMarkAllPaid}
                      className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-sm"
                  >
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Thanh toán tất cả
                  </button>
                   <button 
                      onClick={() => setIsSaveConfirmModalOpen(true)}
                      className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md"
                  >
                      <SaveIcon className="w-5 h-5 mr-2" />
                      Lưu và bắt đầu buổi mới
                  </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isHistoryModalOpen && (
        <HistoryModal 
          onClose={() => setIsHistoryModalOpen(false)} 
          sessions={sessions}
          formatCurrency={formatCurrency}
          drinks={drinks}
          foods={foods}
        />
      )}
      {isStatsModalOpen && (
        <DailyStatsModal
          onClose={() => setIsStatsModalOpen(false)}
          stats={dailyStats}
          formatCurrency={formatCurrency}
        />
      )}
      {isPlayerTotalsModalOpen && (
        <PlayerTotalsModal
          onClose={() => setIsPlayerTotalsModalOpen(false)}
          playerDetailsList={playerDetails}
          formatCurrency={formatCurrency}
          drinks={drinks}
          foods={foods}
        />
      )}
      {isPaidPlayersModalOpen && (
        <PaidPlayersModal
          onClose={() => setIsPaidPlayersModalOpen(false)}
          paidPlayers={paidPlayers}
          formatCurrency={formatCurrency}
        />
      )}
      {isPlayerManagementModalOpen && (
        <PlayerManagementModal
          onClose={() => setIsPlayerManagementModalOpen(false)}
          players={players.filter(p => !p.isGuest)}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onUpdatePlayerInfo={handleUpdatePlayerInfo}
          onImportPlayers={(importedPlayers) => handleImportPlayers(importedPlayers, 'replace')}
        />
      )}
       {isFoodManagementModalOpen && (
        <FoodManagementModal
          onClose={() => setIsFoodManagementModalOpen(false)}
          foods={foods}
          onUpdateFoods={handleUpdateFoods}
        />
      )}
       {isDrinkManagementModalOpen && (
        <DrinkManagementModal
          onClose={() => setIsDrinkManagementModalOpen(false)}
          drinks={drinks}
          onUpdateDrinks={handleUpdateDrinks}
        />
      )}
      {isUserManagementModalOpen && (
        <UserManagementModal
          onClose={() => setIsUserManagementModalOpen(false)}
          users={users}
          currentUser={currentUser}
          onUpdateUsers={onUpdateUsers}
          onAddUser={onAddUser}
        />
      )}
      {isSaveConfirmModalOpen && (
        <SaveConfirmModal
          onClose={() => setIsSaveConfirmModalOpen(false)}
          onConfirm={handleSaveSession}
          savedRevenueToday={dailyStats.totalRevenue}
          formatCurrency={formatCurrency}
        />
      )}
      {isPastRevenueModalOpen && (
        <PastRevenueModal
          onClose={() => setIsPastRevenueModalOpen(false)}
          sessions={sessions}
          formatCurrency={formatCurrency}
        />
      )}
      {isAdjustmentModalOpen && (
        <CostAdjustmentModal
            onClose={handleCloseAdjustmentModal}
            player={playerDetails.find(p => p.id === playerToAdjustId) || null}
            onConfirm={(amount, reason) => {
                if(playerToAdjustId) handleUpdatePlayerAdjustment(playerToAdjustId, amount, reason);
            }}
            formatCurrency={formatCurrency}
        />
      )}
       {isBackupRestoreModalOpen && (
        <BackupRestoreModal
          onClose={() => setIsBackupRestoreModalOpen(false)}
          onBackupData={handleBackupData}
          onRestoreData={handleRestoreData}
          onRestoreFromAutoBackup={handleRestoreFromAutoBackup}
        />
      )}
      {isMatchResultModalOpen && activeMatch && (
        <MatchResultModal
          isOpen={isMatchResultModalOpen}
          onClose={() => setIsMatchResultModalOpen(false)}
          onConfirmResult={handleConfirmMatchResult}
          matchDetails={activeMatch}
        />
      )}


      {notification && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white py-2 px-5 rounded-lg shadow-lg flex items-center animate-in slide-in-from-right duration-300 z-50">
            <CheckCircleIcon className="w-5 h-5 mr-3 text-emerald-400"/>
            {notification}
        </div>
      )}
    </div>
  );
};

// Fix: Add default export for App component to resolve import error.
export default App;