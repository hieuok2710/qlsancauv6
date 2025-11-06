import React from 'react';
import { User } from '../types';
import { SUBSCRIPTION_PACKAGES } from '../constants';
import { CloseIcon, SaveIcon, CalendarIcon, StarIcon } from './IconComponents';

interface SubscriptionModalProps {
  user: User;
  onClose: () => void;
  onConfirm: (userId: string, newExpiryDate: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ user, onClose, onConfirm }) => {

  const handleSelectPackage = (durationDays: number) => {
    const currentExpiry = new Date(user.expiryDate);
    const now = new Date();
    
    // If expiry is in the past, extend from today. Otherwise, extend from the current expiry date.
    const startDate = currentExpiry.getTime() < now.getTime() ? now : currentExpiry;
    
    const newExpiryDate = new Date(startDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);

    onConfirm(user.id, newExpiryDate.toISOString());
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-xl font-semibold text-emerald-600">
            <CalendarIcon className="w-6 h-6 mr-3" />
            Đăng ký / Gia hạn gói
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="p-6 space-y-4">
            <div className="text-center">
                <p className="text-gray-500">Người dùng</p>
                <p className="font-bold text-2xl text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500 mt-1">Hạn sử dụng hiện tại: <strong>{formatDate(user.expiryDate)}</strong></p>
            </div>
            
            <div className="space-y-3">
                <h4 className="text-center font-semibold text-gray-700">Chọn gói để gia hạn</h4>
                {SUBSCRIPTION_PACKAGES.map(pkg => (
                    <button 
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg.durationDays)}
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group"
                    >
                       <div className="flex items-center">
                           <StarIcon className="w-6 h-6 text-yellow-400 mr-4 group-hover:animate-pulse"/>
                           <div>
                                <p className="font-bold text-lg text-gray-800 text-left">{pkg.name}</p>
                                <p className="text-sm text-gray-500 text-left">{pkg.durationDays} ngày sử dụng</p>
                           </div>
                       </div>
                       <div className="text-right">
                           <p className="font-bold text-xl text-emerald-600">
                               {new Intl.NumberFormat('vi-VN').format(pkg.price)}đ
                           </p>
                       </div>
                    </button>
                ))}
            </div>
        </main>
      </div>
    </div>
  );
};

export default SubscriptionModal;
