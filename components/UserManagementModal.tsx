import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon, TrashIcon, UserIcon, UserCogIcon, LockClosedIcon, LockOpenIcon, CalendarIcon, PlusIcon, SaveIcon } from './IconComponents';
import SubscriptionModal from './SubscriptionModal';
import { SUBSCRIPTION_PACKAGES } from '../constants';

interface EditableUserRowProps {
  user: User;
  onRemove: (id: string) => void;
  onToggleLock: (id: string) => void;
  onOpenSubscription: (user: User) => void;
  isCurrentUser: boolean;
}

const EditableUserRow: React.FC<EditableUserRowProps> = ({ user, onRemove, onToggleLock, onOpenSubscription, isCurrentUser }) => {
  
  const expiryDate = new Date(user.expiryDate);
  const isExpired = expiryDate.getTime() < new Date().getTime();
  const isAdmin = user.role === 'admin';
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-md gap-2 ${isCurrentUser ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-100'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-4 min-w-0">
            <div className="truncate">
                <p className="font-semibold text-gray-900" title={user.fullName}>{user.fullName} {isCurrentUser && '(Bạn)'}</p>
                <p className="text-sm text-gray-500 md:hidden">{user.username}</p>
            </div>
            <span className="text-gray-600 truncate hidden md:block" title={user.username}>{user.username}</span>
            <span className={`font-semibold truncate ${isExpired && !isAdmin ? 'text-red-600' : 'text-gray-800'}`} title={user.expiryDate}>
                {isAdmin ? 'Vĩnh viễn' : formatDate(expiryDate)}
            </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!isAdmin && (
           <button onClick={() => onOpenSubscription(user)} className="p-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-md" title="Đăng ký gói / Gia hạn">
                <CalendarIcon className="w-5 h-5" />
            </button>
        )}
        {!isCurrentUser && !isAdmin && (
            <>
            <button onClick={() => onToggleLock(user.id)} className={`p-2 rounded-md ${user.isLocked ? 'text-white bg-yellow-500 hover:bg-yellow-600' : 'text-white bg-gray-400 hover:bg-gray-500'}`} title={user.isLocked ? 'Mở khóa' : 'Khóa'}>
                {user.isLocked ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
            </button>
            <button onClick={() => onRemove(user.id)} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md" title="Xóa">
                <TrashIcon className="w-5 h-5" />
            </button>
            </>
        )}
      </div>
    </div>
  );
};


interface UserManagementModalProps {
  onClose: () => void;
  users: User[];
  currentUser: User;
  onUpdateUsers: (users: User[]) => void;
  onAddUser: (userData: Omit<User, 'id' | 'role' | 'isLocked' | 'expiryDate'>, packageId: string) => { success: boolean, message?: string };
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose, users, currentUser, onUpdateUsers, onAddUser }) => {
  const [userToSubscribe, setUserToSubscribe] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    password: '',
    phone: '',
  });
  const [selectedPackageId, setSelectedPackageId] = useState(SUBSCRIPTION_PACKAGES[0]?.id || '');
  const [addError, setAddError] = useState<string | null>(null);

  const handleUpdate = (id: string, updatedUser: Partial<User>) => {
    onUpdateUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
  };
  
  const handleRemove = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
        onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleLock = (id: string) => {
    onUpdateUsers(users.map(u => u.id === id ? { ...u, isLocked: !u.isLocked } : u));
  };
  
  const handleOpenSubscription = (user: User) => {
    setUserToSubscribe(user);
  };
  
  const handleConfirmSubscription = (userId: string, newExpiryDate: string) => {
    handleUpdate(userId, { expiryDate: newExpiryDate });
    setUserToSubscribe(null);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return a.fullName.localeCompare(b.fullName);
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    if(addError) setAddError(null);
  };

  const handleAddUser = () => {
    setAddError(null);
    if (!newUser.fullName || !newUser.username || !newUser.password) {
      setAddError('Họ tên, tên đăng nhập và mật khẩu là bắt buộc.');
      return;
    }
    if (newUser.password.length < 6) {
        setAddError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
    }

    const result = onAddUser(newUser, selectedPackageId);

    if (result.success) {
      setNewUser({ fullName: '', username: '', password: '', phone: '' });
      setSelectedPackageId(SUBSCRIPTION_PACKAGES[0]?.id || '');
      setIsAdding(false);
    } else {
      setAddError(result.message || 'Có lỗi xảy ra khi tạo người dùng.');
    }
  };

  return (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center text-xl font-semibold text-emerald-600">
                        <UserCogIcon className="w-6 h-6 mr-3" />
                        Quản lý người dùng ({users.length})
                    </div>
                     <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`flex items-center font-semibold py-2 px-3 rounded-lg transition duration-300 shadow-sm text-sm ${isAdding ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                        >
                            {isAdding ? <CloseIcon className="w-5 h-5 mr-2" /> : <PlusIcon className="w-5 h-5 mr-2" />}
                            {isAdding ? 'Hủy' : 'Tạo người dùng mới'}
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    <div className="hidden md:flex items-center justify-between px-3 text-sm font-bold text-gray-500">
                        <div className="flex-1 grid grid-cols-3 gap-x-4 ml-10">
                            <span>Họ và tên</span>
                            <span>Tên đăng nhập</span>
                            <span>Hạn sử dụng</span>
                        </div>
                        <div className="w-40 text-center">Thao tác</div>
                    </div>
                    {sortedUsers.map(user => (
                        <EditableUserRow
                            key={user.id}
                            user={user}
                            onRemove={handleRemove}
                            onToggleLock={handleToggleLock}
                            onOpenSubscription={handleOpenSubscription}
                            isCurrentUser={currentUser.id === user.id}
                        />
                    ))}
                </main>

                {isAdding && (
                  <footer className="p-4 border-t border-gray-200 bg-white animate-in fade-in duration-300">
                      <h3 className="font-semibold text-lg text-gray-800 mb-3">Thông tin người dùng mới</h3>
                      {addError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-3">{addError}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" name="fullName" value={newUser.fullName} onChange={handleInputChange} placeholder="Họ và tên*" className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"/>
                          <input type="text" name="username" value={newUser.username} onChange={handleInputChange} placeholder="Tên đăng nhập*" className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"/>
                          <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="Mật khẩu (ít nhất 6 ký tự)*" className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"/>
                          <input type="text" name="phone" value={newUser.phone} onChange={handleInputChange} placeholder="SĐT/Zalo" className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"/>
                          <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Gói đăng ký ban đầu</label>
                              <select 
                                value={selectedPackageId} 
                                onChange={(e) => setSelectedPackageId(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                {SUBSCRIPTION_PACKAGES.map(pkg => (
                                  <option key={pkg.id} value={pkg.id}>{pkg.name} - {new Intl.NumberFormat('vi-VN').format(pkg.price)}đ</option>
                                ))}
                              </select>
                          </div>
                      </div>
                      <div className="mt-4">
                          <button onClick={handleAddUser} className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300">
                              <SaveIcon className="w-5 h-5 mr-2" />
                              Lưu người dùng
                          </button>
                      </div>
                  </footer>
                )}
            </div>
        </div>
        {userToSubscribe && (
            <SubscriptionModal 
                user={userToSubscribe}
                onClose={() => setUserToSubscribe(null)}
                onConfirm={handleConfirmSubscription}
            />
        )}
    </>
  );
};

export default UserManagementModal;