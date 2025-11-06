import React from 'react';
import { PlayerDetails } from '../types';
// Fix: Import the missing `UsersIcon` component.
import { CloseIcon, ClipboardCheckIcon, UserIcon, BillIcon, UsersIcon } from './IconComponents';

interface PaidPlayersModalProps {
  onClose: () => void;
  paidPlayers: PlayerDetails[];
  formatCurrency: (amount: number) => string;
}

const PaidPlayersModal: React.FC<PaidPlayersModalProps> = ({ onClose, paidPlayers, formatCurrency }) => {
  const totalPaidAmount = paidPlayers.reduce((sum, player) => sum + player.totalCost, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <ClipboardCheckIcon className="w-6 h-6 mr-3" />
            Danh sách đã thanh toán
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {paidPlayers.length > 0 ? (
            paidPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-800">{player.name}</span>
                </div>
                <span className="font-semibold text-emerald-600">{formatCurrency(player.totalCost)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>Chưa có người chơi nào hoàn thành thanh toán.</p>
            </div>
          )}
        </main>

        <footer className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center text-lg">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-gray-700">Tổng cộng:</span>
                </div>
                <span className="font-bold text-blue-600">{paidPlayers.length} người chơi</span>
            </div>
             <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-gray-300">
                <div className="flex items-center gap-2">
                    <BillIcon className="w-6 h-6 text-emerald-500"/>
                    <span className="font-semibold text-gray-700">Tổng tiền thu:</span>
                </div>
                <span className="font-bold text-emerald-600">{formatCurrency(totalPaidAmount)}</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default PaidPlayersModal;