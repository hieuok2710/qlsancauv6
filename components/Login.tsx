import React, { useState } from 'react';
import { ShuttlecockIcon } from './IconComponents';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onSwitchToRegister: () => void;
  error: string | null;
  notification: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister, error, notification }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
            <ShuttlecockIcon className="h-12 w-12 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Đăng nhập</h1>
            <p className="text-gray-500">Quản lý sân cầu lông</p>
        </div>
        
        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {notification && !error && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{notification}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username-login" className="text-sm font-bold text-gray-600 block">Tên đăng nhập</label>
            <input
              id="username-login"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring focus:ring-emerald-500 focus:ring-opacity-50"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password-login" className="text-sm font-bold text-gray-600 block">Mật khẩu</label>
            <input
              id="password-login"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:border-emerald-500 focus:ring focus:ring-emerald-500 focus:ring-opacity-50"
              required
              autoComplete="current-password"
            />
          </div>
          
          <div>
            <button type="submit" className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
              Đăng nhập
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-emerald-600 hover:text-emerald-500">
                Đăng ký ngay
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;