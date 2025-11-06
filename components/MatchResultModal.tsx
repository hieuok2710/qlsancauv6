import React from 'react';
import { CloseIcon, UserIcon, CourtIcon } from './IconComponents';

interface MatchDetails {
  courtIndex: number;
  teamA: { id: string; name:string }[];
  teamB: { id: string; name:string }[];
  gameType: 'singles' | 'doubles';
}

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResult: (result: { winningTeam: 'A' | 'B' | 'DRAW' }) => void;
  matchDetails: MatchDetails;
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


const MatchResultModal: React.FC<MatchResultModalProps> = ({ isOpen, onClose, onConfirmResult, matchDetails }) => {
  if (!isOpen) return null;

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
        </main>
        
        <footer className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <h3 className="text-center font-semibold text-gray-700 mb-3">Đội nào đã chiến thắng?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                    onClick={() => onConfirmResult({ winningTeam: 'A' })} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Đội A Thắng
                </button>
                 <button 
                    onClick={() => onConfirmResult({ winningTeam: 'DRAW' })} 
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Hòa
                </button>
                 <button 
                    onClick={() => onConfirmResult({ winningTeam: 'B' })} 
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
