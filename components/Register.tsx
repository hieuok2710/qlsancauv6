import React, { useState } from 'react';
import { User } from '../types';
import { ShuttlecockIcon, UserIcon, LockClosedIcon, PhoneIcon, IdentificationIcon } from './IconComponents';

interface RegisterProps {
  onRegister: (newUser: Omit<User, 'id' | 'role' | 'expiryDate' | 'isLocked'>) => { success: boolean, message?: string };
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const result = onRegister({ fullName, username, phone, password });
    if (!result.success && result.message) {
      setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <ShuttlecockIcon className="h-12 w-12 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Đăng ký tài khoản</h1>
          <p className="text-gray-500">Nhận 7 ngày dùng thử miễn phí</p>
        </div>
        
        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullname-reg" className="text-sm font-bold text-gray-600 block mb-1">Họ và tên</label>
            <div className="relative">
                <IdentificationIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="fullname-reg" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500/50" required />
            </div>
          </div>

          <div>
            <label htmlFor="username-reg" className="text-sm font-bold text-gray-600 block mb-1">Tên đăng nhập</label>
             <div className="relative">
                <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="username-reg" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500/50" required />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone-reg" className="text-sm font-bold text-gray-600 block mb-1">SĐT / Zalo</label>
            <div className="relative">
                <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="phone-reg" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500/50" />
            </div>
          </div>

          <div>
            <label htmlFor="password-reg" className="text-sm font-bold text-gray-600 block mb-1">Mật khẩu</label>
             <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="password-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500/50" required />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password-reg" className="text-sm font-bold text-gray-600 block mb-1">Xác nhận mật khẩu</label>
             <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input id="confirm-password-reg" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-emerald-500/50" required />
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
              Đăng ký
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-emerald-600 hover:text-emerald-500">
                Đăng nhập
            </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
