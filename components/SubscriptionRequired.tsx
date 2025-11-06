import React from 'react';
import { User } from '../types';
import { SUBSCRIPTION_PACKAGES } from '../constants';
import { ShieldCheckIcon, StarIcon, PhoneIcon, LogoutIcon } from './IconComponents';

interface SubscriptionRequiredProps {
  user: User;
  onLogout: () => void;
  adminContact?: string;
}

const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({ user, onLogout, adminContact }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-2xl shadow-lg text-center">
        <div className="mx-auto bg-red-100 rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-md -mt-16">
            <ShieldCheckIcon className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">Tài khoản của bạn đã hết hạn</h1>
        <p className="text-gray-600 text-lg">
            Chào {user.fullName}, gói dùng thử hoặc gói đăng ký của bạn đã kết thúc.
            <br />
            Vui lòng chọn một gói cước và liên hệ quản trị viên để gia hạn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {SUBSCRIPTION_PACKAGES.map(pkg => (
                <div key={pkg.id} className="p-5 bg-gray-50 border border-gray-200 rounded-lg text-left relative overflow-hidden">
                    <StarIcon className="w-16 h-16 text-yellow-200 absolute -top-4 -right-4 opacity-50"/>
                    <h3 className="text-xl font-bold text-emerald-600">{pkg.name}</h3>
                    <p className="text-gray-500">{pkg.durationDays} ngày sử dụng</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                    </p>
                </div>
            ))}
        </div>

        {adminContact && (
            <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-400 text-emerald-800 rounded-r-lg">
                <h3 className="font-bold">Thông tin liên hệ quản trị viên:</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <PhoneIcon className="w-5 h-5"/>
                    <p className="text-lg font-semibold">{adminContact}</p>
                </div>
                 <p className="text-sm mt-1">Vui lòng chuyển khoản và gửi ảnh chụp màn hình qua Zalo.</p>
            </div>
        )}
        
        <div className="pt-4">
            <button 
                onClick={onLogout} 
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
                <LogoutIcon className="w-5 h-5"/>
                Đăng xuất
            </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
