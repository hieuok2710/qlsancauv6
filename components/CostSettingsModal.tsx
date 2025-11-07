import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SaveIcon, ShuttlecockIcon, TrashIcon, PencilIcon, PlusIcon } from './IconComponents';
import { ShuttlecockItem } from '../types';

interface EditableItemRowProps {
  item: ShuttlecockItem;
  onUpdate: (id: string, newName: string, newPrice: number) => void;
  onRemove: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const EditableItemRow: React.FC<EditableItemRowProps> = ({ item, onUpdate, onRemove, formatCurrency }) => {
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
    <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <ShuttlecockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
        {isEditing ? (
          <div className="flex-1 grid grid-cols-2 gap-2" onKeyDown={handleKeyDown}>
            <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên loại cầu" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
            <input type="number" step="1000" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Giá" className="w-full bg-white border border-emerald-500 rounded-md p-1 text-gray-900"/>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
            <span className="text-gray-900 truncate" title={item.name}>{item.name}</span>
            <span className="text-emerald-600 font-semibold truncate" title={String(item.price)}>{formatCurrency(item.price)}</span>
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

interface ShuttlecockManagementModalProps {
    onClose: () => void;
    onSave: (newItems: ShuttlecockItem[]) => void;
    currentItems: ShuttlecockItem[];
    formatCurrency: (amount: number) => string;
}

const ShuttlecockManagementModal: React.FC<ShuttlecockManagementModalProps> = ({ onClose, onSave, currentItems, formatCurrency }) => {
    const [items, setItems] = useState<ShuttlecockItem[]>(currentItems);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState(0);

    const handleSave = () => {
        onSave(items);
    };

    const handleAddClick = () => {
        if (newItemName.trim() && newItemPrice >= 0) {
          const newItem = { id: crypto.randomUUID(), name: newItemName.trim(), price: newItemPrice };
          setItems([...items, newItem]);
          setNewItemName('');
          setNewItemPrice(0);
        }
    };
    
    const handleAddKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleAddClick();
        }
    };
    
    const handleUpdate = (id: string, newName: string, newPrice: number) => {
        setItems(items.map(i => i.id === id ? { ...i, name: newName, price: newPrice } : i));
    };
    
    const handleRemove = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa loại chi phí cầu này không?")) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center text-xl font-semibold text-emerald-600">
                        <ShuttlecockIcon className="w-6 h-6 mr-3" />
                        Quản lý chi phí cầu
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between px-2 text-sm font-bold text-gray-500">
                        <div className="flex-1 grid grid-cols-2 gap-2 ml-10">
                            <span>Tên loại chi phí</span>
                            <span>Đơn giá</span>
                        </div>
                        <div className="w-20 text-center">Thao tác</div>
                    </div>
                    {items.length > 0 ? (
                        items.map(item => (
                            <EditableItemRow
                                key={item.id}
                                item={item}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                                formatCurrency={formatCurrency}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Chưa có chi phí cầu nào được định nghĩa.</p>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2" onKeyDown={handleAddKeyDown}>
                         <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Tên loại chi phí mới..."
                            className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                        <input
                            type="number"
                            step="1000"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(Number(e.target.value))}
                            placeholder="Đơn giá..."
                            className="md:col-span-1 bg-white border border-gray-300 rounded-md p-2 text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                         <button
                            onClick={handleAddClick}
                            className="md:col-span-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                            <PlusIcon className="w-5 h-5 mr-1" />
                            Thêm
                        </button>
                    </div>
                     <div className="mt-4 flex justify-end gap-3">
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
                            Hủy
                        </button>
                        <button onClick={handleSave} className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Lưu thay đổi
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ShuttlecockManagementModal;
