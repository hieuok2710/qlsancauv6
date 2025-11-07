import React, { useState, useMemo } from 'react';
import { Session, Match, Drink, Food, ShuttlecockItem } from '../types';
import { HistoryIcon, CloseIcon, ChevronDownIcon, CheckCircleIcon, CourtIcon, UserIcon } from './IconComponents';

interface HistoryModalProps {
  onClose: () => void;
  sessions: Session[];
  formatCurrency: (amount: number) => string;
  drinks: Drink[];
  foods: Food[];
  shuttlecockItems: ShuttlecockItem[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, sessions, formatCurrency, drinks, foods, shuttlecockItems }) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleSession = (id: string) => {
    setExpandedSessionId(prevId => (prevId === id ? null : id));
  };

  const getGameTypeLabel = (type: 'practice' | 'singles' | 'doubles') => {
    switch (type) {
        case 'practice': return 'Giao hữu';
        case 'singles': return 'Đơn';
        case 'doubles': return 'Đôi';
    }
  };

  const groupedByDate = useMemo(() => {
    const groups: Record<string, { dateObj: Date, sessions: Session[], totalRevenue: number }> = {};
    
    sessions.forEach(session => {
        try {
            const sessionDate = new Date(session.date);
            if (isNaN(sessionDate.getTime())) {
                console.warn(`Invalid date found for session ${session.id}: ${session.date}`);
                return; // Skip this session
            }

            const dateKey = `${sessionDate.getFullYear()}-${(sessionDate.getMonth() + 1).toString().padStart(2, '0')}-${sessionDate.getDate().toString().padStart(2, '0')}`;
            
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    dateObj: sessionDate,
                    sessions: [],
                    totalRevenue: 0
                };
            }
            
            groups[dateKey].sessions.push(session);
            groups[dateKey].totalRevenue += session.summary.grandTotal;
        } catch (e) {
            console.error(`Failed to process session ${session.id}`, e);
        }
    });
    
    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [sessions]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <HistoryIcon className="w-6 h-6 mr-3" />
            Lịch sử các buổi chơi
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {groupedByDate.length > 0 ? (
            groupedByDate.map(group => (
              <div key={group.dateObj.toISOString()} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-emerald-700">
                        {group.dateObj.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="font-bold text-emerald-600">{formatCurrency(group.totalRevenue)}</p>
                    </div>
                </div>
                <div className="space-y-3">
                  {group.sessions.map(session => (
                    <div key={session.id} className="bg-white rounded-lg transition-shadow hover:shadow-md border border-gray-200">
                      <button onClick={() => toggleSession(session.id)} className="w-full flex items-center justify-between p-4 text-left">
                        <div>
                          <p className="font-semibold text-gray-800">{new Date(session.date).toLocaleTimeString('vi-VN')}</p>
                          <p className="text-sm text-gray-500">{session.players.length} người chơi - {getGameTypeLabel(session.gameType)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="font-bold text-lg text-emerald-600">{formatCurrency(session.summary.grandTotal)}</span>
                           <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedSessionId === session.id ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {expandedSessionId === session.id && (
                        <div className="px-4 pb-4 border-t border-gray-200 animate-in fade-in duration-300">
                          <h4 className="text-md font-semibold mt-3 mb-2 text-emerald-700">Chi tiết người chơi:</h4>
                          <div className="space-y-2">
                              {session.players.map(player => {
                                const consumedDrinks = Object.entries(player.consumedDrinks).map(([itemId, quantity]) => {
                                    const item = drinks.find(d => d.id === itemId);
                                    return item ? `${item.name} (x${quantity})` : null;
                                });
                                const consumedFoods = Object.entries(player.consumedFoods).map(([itemId, quantity]) => {
                                    const item = foods.find(f => f.id === itemId);
                                    return item ? `${item.name} (x${quantity})` : null;
                                });

                                const consumedShuttlecocks = Object.entries(player.shuttlecockConsumption || {}).map(([itemId, quantity]) => {
                                    const item = shuttlecockItems.find(i => i.id === itemId);
                                    return item ? `${item.name} (x${quantity})` : null;
                                }).filter(Boolean);

                                const consumedItems = [...consumedDrinks, ...consumedFoods, ...consumedShuttlecocks].filter(Boolean);


                                return (
                                  <div key={player.id} className="flex justify-between items-center p-2 rounded bg-gray-100">
                                      <div className="flex items-center gap-2">
                                        {player.isPaid && <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" title="Đã thanh toán" />}
                                        <div>
                                            <p className="font-medium text-gray-800">{player.name}
                                                <span className="ml-2 text-xs font-normal text-gray-500">
                                                  (Thắng {player.wins || 0} / Thua {player.losses || 0})
                                                </span>
                                            </p>
                                             <div className="text-xs text-gray-500">
                                                {consumedItems.join(', ')}
                                                {player.adjustment?.amount !== 0 && player.adjustment?.amount && (
                                                  <span className={`font-semibold ml-2 ${player.adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    Đ/c: {formatCurrency(player.adjustment.amount)}
                                                    {player.adjustment.reason && ` (${player.adjustment.reason})`}
                                                  </span>
                                                )}
                                            </div>
                                        </div>
                                      </div>
                                      <span className="font-semibold text-gray-700">{formatCurrency(player.totalCost)}</span>
                                  </div>
                                )
                              })}
                          </div>
                          
                          {session.matches && session.matches.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <h4 className="text-md font-semibold mb-3 text-emerald-700 flex items-center">
                                    <CourtIcon className="w-5 h-5 mr-2" />
                                    Lịch sử trận đấu
                                </h4>
                                <div className="space-y-3">
                                    {session.matches.map((match, index) => {
                                        const winningTeam = match.losingTeam === 'A' ? 'B' : 'A';
                                        return (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <p className="font-bold text-gray-700 text-center mb-2 border-b border-gray-200 pb-2">
                                                    Sân {match.courtIndex + 1}
                                                    <span className="ml-2 font-normal text-sm text-gray-500">({match.gameType === 'singles' ? 'Đơn' : 'Đôi'})</span>
                                                </p>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    {/* Team A */}
                                                    <div className={`p-2 rounded-md ${match.losingTeam === 'A' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                                        <div className="font-semibold text-center mb-1 flex items-center justify-center gap-2">
                                                            Đội A
                                                            {winningTeam === 'A' && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">THẮNG</span>}
                                                            {match.losingTeam === 'A' && <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded-full">THUA</span>}
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {match.teamA.map(p => (
                                                                <li key={p.id} className={`flex items-center gap-2 ${match.losingTeam === 'A' ? 'text-gray-500' : 'text-gray-800'}`}>
                                                                    <UserIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span>{p.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    {/* Team B */}
                                                    <div className={`p-2 rounded-md ${match.losingTeam === 'B' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                                        <div className="font-semibold text-center mb-1 flex items-center justify-center gap-2">
                                                            Đội B
                                                            {winningTeam === 'B' && <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">THẮNG</span>}
                                                            {match.losingTeam === 'B' && <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded-full">THUA</span>}
                                                        </div>
                                                        <ul className="space-y-1">
                                                            {match.teamB.map(p => (
                                                                <li key={p.id} className={`flex items-center gap-2 ${match.losingTeam === 'B' ? 'text-gray-500' : 'text-gray-800'}`}>
                                                                    <UserIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span>{p.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-200 text-sm space-y-1 text-gray-600">
                              <p className="flex justify-between"><span>Tiền sân:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalCourtFee)}</span></p>
                              <p className="flex justify-between"><span>Món ăn/Thức uống:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalDrinksCost + session.summary.totalFoodCost)}</span></p>
                              <p className="flex justify-between"><span>Phí cầu:</span> <span className="font-medium text-gray-800">{formatCurrency(session.summary.totalShuttlecockCost)}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Không có lịch sử nào được lưu.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryModal;