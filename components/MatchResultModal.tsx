import React, { useState, useMemo } from 'react';
import { CloseIcon, UserIcon, CourtIcon, ShuttlecockIcon, PlusIcon, MinusIcon } from './IconComponents';
import { ShuttlecockItem } from '../types';

interface MatchDetails {
  courtIndex: number;
  teamA: { id: string; name:string }[];
  teamB: { id: string; name:string }[];
  gameType: 'singles' | 'doubles';
}

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResult: (result: { winningTeam: 'A' | 'B' | 'DRAW', consumption: Record<string, number> }) => void;
  matchDetails: MatchDetails;
  shuttlecockItems: ShuttlecockItem[];
}

const TeamDisplay: React.FC<{ teamName: string; players: {name: string}[]; teamColor: 'blue' | 'red' }> = ({ teamName, players, teamColor }) => (
    <div className={`p-4 rounded-lg border-2 ${teamColor === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'}`}>
        <h3 className={`font-bold text-lg text-center mb-3 ${teamColor === 'blue' ? 'text-blue-700' : 'text-red-700'}`}>{teamName}</h3>
        <div className="space-y-2">
            {players.map(player => (
                <div key={player.name} className="flex items-center justify-center gap-2 p-2 bg-white rounded-md border border-gray-200">
                    <UserIcon className={`w-5 h-5 ${teamColor === 'blue' ? 'text-blue-500' : 'text-red-500'}`} />
                    <span className="font-semibold text-gray-800">{player.name}</span>
                </div>
            ))}
             {players.length === 0 && <p className="text-center text-gray-500 p-2">Chưa có người chơi</p>}
        </div>
    </div>
);

const ConsumptionInput: React.FC<{ label: string, count: number, onUpdate: (newCount: number) => void }> = ({ label, count, onUpdate }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700">{label}</span>
        <div className="flex items-center bg-white rounded-full border border-gray-200">
            <button onClick={() => onUpdate(Math.max(0, count - 1))} className="p-2 text-gray-500 hover:text-gray-800 rounded-full transition-colors"><MinusIcon className="w-4 h-4" /></button>
            <span className="px-4 font-semibold text-center w-12">{count}</span>
            <button onClick={() => onUpdate(count + 1)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full transition-colors"><PlusIcon className="w-4 h-4" /></button>
        </div>
    </div>
);


const MatchResultModal: React.FC<MatchResultModalProps> = ({ isOpen, onClose, onConfirmResult, matchDetails, shuttlecockItems }) => {
  if (!isOpen) return null;
  
  const [consumption, setConsumption] = useState<Record<string, number>>(() => {
    const initialConsumption: Record<string, number> = {};
    shuttlecockItems.forEach((item, index) => {
        initialConsumption[item.id] = index === 0 ? 1 : 0;
    });
    return initialConsumption;
  });

  const handleUpdateConsumption = (itemId: string, value: number) => {
      setConsumption(prev => ({...prev, [itemId]: value}));
  };
  
  const totalShuttlecockCost = useMemo(() => {
    return Object.entries(consumption).reduce((total, [itemId, quantity]) => {
        const item = shuttlecockItems.find(i => i.id === itemId);
        // Fix: Explicitly cast quantity to a number to avoid potential type issues.
        return total + (item ? item.price * Number(quantity) : 0);
    }, 0);
  }, [consumption, shuttlecockItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <CourtIcon className="w-6 h-6 mr-3" />
            Xác nhận kết quả Sân {matchDetails.courtIndex + 1}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <TeamDisplay teamName="Đội A" players={matchDetails.teamA} teamColor="blue" />
           <TeamDisplay teamName="Đội B" players={matchDetails.teamB} teamColor="red" />
           <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg text-center mb-3 text-gray-700 flex items-center justify-center gap-2">
                    <ShuttlecockIcon className="w-6 h-6 text-amber-500" />
                    Sử dụng cầu
                </h3>
                <div className="space-y-3">
                    {shuttlecockItems.map(item => (
                       <ConsumptionInput 
                         key={item.id}
                         label={item.name}
                         count={consumption[item.id] || 0}
                         onUpdate={(val) => handleUpdateConsumption(item.id, val)}
                       />
                    ))}
                </div>
                <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Tổng phí cầu:</span>
                    <span className="font-bold text-xl text-amber-600">{formatCurrency(totalShuttlecockCost)}</span>
                </div>
           </div>
        </main>
        
        <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <h3 className="text-center font-semibold text-gray-700 mb-3">Đội nào đã chiến thắng?</h3>
            <p className="text-xs text-center text-gray-500 mb-3 -mt-2">Phí cầu sẽ được chia cho đội thua (nếu có).</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                    onClick={() => onConfirmResult({ winningTeam: 'A', consumption })} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Đội A Thắng
                </button>
                 <button 
                    onClick={() => onConfirmResult({ winningTeam: 'DRAW', consumption })} 
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Hòa
                </button>
                 <button 
                    onClick={() => onConfirmResult({ winningTeam: 'B', consumption })} 
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Đội B Thắng
                </button>
            </div>
             <div className="text-center mt-4">
                <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">Hủy bỏ</button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default MatchResultModal;