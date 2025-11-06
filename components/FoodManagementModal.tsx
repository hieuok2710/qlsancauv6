import React, { useState, useRef, useEffect } from 'react';
import { Food } from '../types';
import { CloseIcon, TrashIcon, PencilIcon, PlusIcon, SaveIcon, FoodIcon, BillIcon } from './IconComponents';

interface EditableFoodRowProps {
  food: Food;
  onUpdate: (id: string, newName: string, newPrice: number) => void;
  onRemove: (id: string) => void;
}

const EditableFoodRow: React.FC<EditableFoodRowProps> = ({ food, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(food.name);
  const [price, setPrice] = useState(food.price);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && price >= 0 && (name.trim() !== food.name || price !== food.price)) {
      onUpdate(food.id, name.trim(), price);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(food.name);
    setPrice(food.price);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FoodIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        {isEditing ? (
          <div className="flex-1 grid grid-cols-2 gap-2" onKeyDown={handleKeyDown}>
            <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên món" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Giá" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <span className="text-gray-900 truncate" title={food.name}>{food.name}</span>
            <span className="text-emerald-600 font-semibold truncate" title={String(food.price)}>{new Intl.NumberFormat('vi-VN').format(food.price)}đ</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-2 text-emerald-500 hover:text-emerald-400" title="Lưu"><SaveIcon className="w-5 h-5" /></button>
            <button onClick={handleCancel} className="p-2 text-gray-500 hover:text-gray-800" title="Hủy"><CloseIcon className="w-5 h-5" /></button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-gray-800" title="Sửa"><PencilIcon className="w-5 h-5" /></button>
            <button onClick={() => onRemove(food.id)} className="p-2 text-gray-500 hover:text-red-500" title="Xóa"><TrashIcon className="w-5 h-5" /></button>
          </>
        )}
      </div>
    </div>
  );
};


interface FoodManagementModalProps {
  onClose: () => void;
  foods: Food[];
  onUpdateFoods: (foods: Food[]) => void;
}

const FoodManagementModal: React.FC<FoodManagementModalProps> = ({
  onClose,
  foods,
  onUpdateFoods,
}) => {
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState(0);

  const handleAddClick = () => {
    if (newFoodName.trim() && newFoodPrice >= 0) {
      const newFood = { id: crypto.randomUUID(), name: newFoodName.trim(), price: newFoodPrice };
      onUpdateFoods([...foods, newFood]);
      setNewFoodName('');
      setNewFoodPrice(0);
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleUpdate = (id: string, newName: string, newPrice: number) => {
    onUpdateFoods(foods.map(f => f.id === id ? { ...f, name: newName, price: newPrice } : f));
  };

  const handleRemove = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món ăn này không?")) {
        onUpdateFoods(foods.filter(f => f.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center text-xl font-semibold text-emerald-600">
                    <FoodIcon className="w-6 h-6 mr-3" />
                    Quản lý danh sách món ăn
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between px-2 text-sm font-bold text-gray-500">
                <div className="flex-1 grid grid-cols-2 gap-2 ml-10">
                    <span>Tên món ăn</span>
                    <span>Đơn giá</span>
                </div>
                <div className="w-20 text-center">Thao tác</div>
            </div>
            {foods.length > 0 ? (
                foods.map(food => (
                <EditableFoodRow
                    key={food.id}
                    food={food}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                />
                ))
            ) : (
                <p className="text-center text-gray-500 py-4">Chưa có món ăn nào.</p>
            )}
            </main>

            <footer className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2" onKeyDown={handleAddKeyDown}>
                    <input
                        type="text"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        placeholder="Tên món ăn mới..."
                        className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <input
                        type="number"
                        value={newFoodPrice}
                        onChange={(e) => setNewFoodPrice(Number(e.target.value))}
                        placeholder="Đơn giá..."
                        className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <button
                        onClick={handleAddClick}
                        className="md:col-span-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Thêm món
                    </button>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default FoodManagementModal;
