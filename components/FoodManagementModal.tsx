import React, { useState, useRef, useEffect } from 'react';
import { Food, Drink } from '../types';
import { CloseIcon, TrashIcon, PencilIcon, PlusIcon, SaveIcon, FoodIcon, WaterIcon } from './IconComponents';

// A generic row component for editing items (food or drink)
interface Item { id: string; name: string; price: number; }
interface EditableItemRowProps {
  item: Item;
  onUpdate: (id: string, newName: string, newPrice: number) => void;
  onRemove: (id: string) => void;
  icon: React.ReactNode;
  placeholders: { name: string; price: string };
}
const EditableItemRow: React.FC<EditableItemRowProps> = ({ item, onUpdate, onRemove, icon, placeholders }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && price >= 0 && (name.trim() !== item.name || price !== item.price)) {
      onUpdate(item.id, name.trim(), price);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(item.name);
    setPrice(item.price);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-md gap-2 border border-gray-200">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon}
        {isEditing ? (
          <div className="flex-1 grid grid-cols-2 gap-2" onKeyDown={handleKeyDown}>
            <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholders.name} className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder={placeholders.price} className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <span className="text-gray-900 truncate" title={item.name}>{item.name}</span>
            <span className="text-emerald-600 font-semibold truncate" title={String(item.price)}>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</span>
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
            <button onClick={() => onRemove(item.id)} className="p-2 text-gray-500 hover:text-red-500" title="Xóa"><TrashIcon className="w-5 h-5" /></button>
          </>
        )}
      </div>
    </div>
  );
};


// A generic tab for managing a list of items
interface ItemManagementTabProps<T extends Item> {
  items: T[];
  onUpdateItems: (items: T[]) => void;
  itemType: string;
  itemIcon: React.ReactNode;
  placeholders: { name: string; price: string };
  headers: { name: string; price: string };
}
const ItemManagementTab = <T extends Item>({ items, onUpdateItems, itemType, itemIcon, placeholders, headers }: ItemManagementTabProps<T>) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(0);

  const handleAddClick = () => {
    if (newItemName.trim() && newItemPrice >= 0) {
      const newItem = { id: crypto.randomUUID(), name: newItemName.trim(), price: newItemPrice } as T;
      onUpdateItems([...items, newItem]);
      setNewItemName('');
      setNewItemPrice(0);
    }
  };
  const handleAddKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleAddClick(); };
  const handleUpdate = (id: string, newName: string, newPrice: number) => { onUpdateItems(items.map(i => i.id === id ? { ...i, name: newName, price: newPrice } : i)); };
  const handleRemove = (id: string) => { if (window.confirm(`Bạn có chắc chắn muốn xóa ${itemType.toLowerCase()} này không?`)) onUpdateItems(items.filter(i => i.id !== id)); };

  return (
    <div>
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between px-2 text-sm font-bold text-gray-500">
                <div className="flex-1 grid grid-cols-2 gap-2 ml-10">
                    <span>{headers.name}</span>
                    <span>{headers.price}</span>
                </div>
                <div className="w-20 text-center">Thao tác</div>
            </div>
            {items.length > 0 ? (
                items.map(item => <EditableItemRow key={item.id} item={item} onUpdate={handleUpdate} onRemove={handleRemove} icon={itemIcon} placeholders={placeholders} />)
            ) : (
                <p className="text-center text-gray-500 py-4">Chưa có {itemType.toLowerCase()} nào.</p>
            )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2" onKeyDown={handleAddKeyDown}>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder={placeholders.name + "..."} className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"/>
                <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} placeholder={placeholders.price + "..."} className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"/>
                <button onClick={handleAddClick} className="md:col-span-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Thêm {itemType}
                </button>
            </div>
        </div>
    </div>
  );
};


// The main unified modal component
interface ItemManagementModalProps {
  onClose: () => void;
  foods: Food[];
  drinks: Drink[];
  onUpdateFoods: (foods: Food[]) => void;
  onUpdateDrinks: (drinks: Drink[]) => void;
}
const ItemManagementModal: React.FC<ItemManagementModalProps> = ({ onClose, foods, drinks, onUpdateFoods, onUpdateDrinks }) => {
  const [activeTab, setActiveTab] = useState<'drinks' | 'foods'>('drinks');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center text-xl font-semibold text-emerald-600">
                    <FoodIcon className="w-6 h-6 mr-3" />
                    Quản lý Món ăn & Thức uống
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </header>
            
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px px-4" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('drinks')}
                        className={`group inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ${
                            activeTab === 'drinks'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <WaterIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'drinks' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Thức uống ({drinks.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('foods')}
                        className={`group inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm ml-4 ${
                            activeTab === 'foods'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FoodIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'foods' ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                        <span>Món ăn ({foods.length})</span>
                    </button>
                </nav>
            </div>

            <main className="flex-1 overflow-y-auto bg-gray-50">
                {activeTab === 'drinks' && (
                    <ItemManagementTab<Drink>
                        items={drinks}
                        onUpdateItems={onUpdateDrinks}
                        itemType="Thức uống"
                        itemIcon={<WaterIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                        placeholders={{ name: 'Tên thức uống mới', price: 'Đơn giá' }}
                        headers={{ name: 'Tên thức uống', price: 'Đơn giá' }}
                    />
                )}
                {activeTab === 'foods' && (
                    <ItemManagementTab<Food>
                        items={foods}
                        onUpdateItems={onUpdateFoods}
                        itemType="Món ăn"
                        itemIcon={<FoodIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                        placeholders={{ name: 'Tên món ăn mới', price: 'Đơn giá' }}
                        headers={{ name: 'Tên món ăn', price: 'Đơn giá' }}
                    />
                )}
            </main>
        </div>
    </div>
  );
};

export default ItemManagementModal;