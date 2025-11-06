import React, { useState, useEffect } from 'react';
import App from './App';
import Login from './components/Login';
import Register from './components/Register';
import SubscriptionRequired from './components/SubscriptionRequired';
import { User } from './types';
import { SUBSCRIPTION_PACKAGES } from './constants';

const getFarFutureDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 100);
  return date.toISOString();
};

const Main: React.FC = () => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSubscriptionRequired, setIsSubscriptionRequired] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('badmintonUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const adminUser: User = { 
          id: 'admin-user', 
          username: 'admin', 
          password: 'admin@##', 
          fullName: 'Quản trị viên', 
          phone: '09xxxxxxx',
          role: 'admin', 
          expiryDate: getFarFutureDate(),
          isLocked: false 
        };
        localStorage.setItem('badmintonUsers', JSON.stringify([adminUser]));
        setUsers([adminUser]);
      }

      const sessionUserStr = sessionStorage.getItem('badmintonCurrentUser');
      if (sessionUserStr) {
        const sessionUser: User = JSON.parse(sessionUserStr);
        // Re-validate user from full list on load
        const fullUser = JSON.parse(localStorage.getItem('badmintonUsers') || '[]').find((u: User) => u.id === sessionUser.id);
        if (fullUser) {
           const expiry = new Date(fullUser.expiryDate);
            if (expiry.getTime() < new Date().getTime() && fullUser.role !== 'admin') {
                setIsSubscriptionRequired(true);
            } else {
                setCurrentUser(fullUser);
            }
        }
      }
    } catch (error) {
      console.error("Failed to load user data from storage", error);
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);


  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username === username);

    if (user && user.password === password) {
      if (user.isLocked) {
        setAuthError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        return;
      }
      
      const expiry = new Date(user.expiryDate);
      if (expiry.getTime() < new Date().getTime() && user.role !== 'admin') {
          setCurrentUser(user); // Set current user to show subscription screen
          setIsSubscriptionRequired(true);
          return;
      }

      const userToStore = { ...user };
      delete userToStore.password;
      
      setCurrentUser(userToStore);
      sessionStorage.setItem('badmintonCurrentUser', JSON.stringify(userToStore));
      setAuthError(null);
      setIsSubscriptionRequired(false);
    } else {
      setAuthError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'role' | 'expiryDate' | 'isLocked'>) => {
    if (users.some(u => u.username === newUser.username)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
    }

    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 7);

    const userToCreate: User = {
      ...newUser,
      id: crypto.randomUUID(),
      role: 'user',
      expiryDate: trialExpiry.toISOString(),
      isLocked: false,
    };
    
    const updatedUsers = [...users, userToCreate];
    setUsers(updatedUsers);
    localStorage.setItem('badmintonUsers', JSON.stringify(updatedUsers));
    
    setNotification('Đăng ký thành công! Vui lòng đăng nhập.');
    setView('login');
    return { success: true };
  };

  const handleAdminAddUser = (newUserData: Omit<User, 'id' | 'role' | 'isLocked'>): { success: boolean, message?: string } => {
    if (users.some(u => u.username === newUserData.username)) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
    }

    const userToCreate: User = {
        ...newUserData,
        id: crypto.randomUUID(),
        role: 'user',
        isLocked: false,
    };

    const updatedUsers = [...users, userToCreate];
    setUsers(updatedUsers);
    localStorage.setItem('badmintonUsers', JSON.stringify(updatedUsers));

    return { success: true };
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setIsSubscriptionRequired(false);
    sessionStorage.removeItem('badmintonCurrentUser');
    setView('login');
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('badmintonUsers', JSON.stringify(updatedUsers));
     // If the current user was updated, update their session state as well
    if (currentUser) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        const userToStore = { ...updatedCurrentUser };
        delete userToStore.password;
        setCurrentUser(userToStore);
        sessionStorage.setItem('badmintonCurrentUser', JSON.stringify(userToStore));
      } else {
        // Current user was deleted, log them out
        handleLogout();
      }
    }
  };
  
  const adminUser = users.find(u => u.role === 'admin');

  if (isSubscriptionRequired && currentUser) {
      return <SubscriptionRequired user={currentUser} onLogout={handleLogout} adminContact={adminUser?.phone}/>
  }

  if (!currentUser) {
    if (view === 'register') {
      return <Register onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} error={authError} notification={notification} />;
  }

  return (
    <App 
        onLogout={handleLogout} 
        currentUser={currentUser}
        users={users}
        onUpdateUsers={handleUpdateUsers}
        onAddUser={handleAdminAddUser}
    />
  );
};

export default Main;