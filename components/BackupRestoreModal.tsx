import React, { useRef } from 'react';
import { CloseIcon, UploadIcon, DownloadIcon, RotateCwIcon } from './IconComponents';

interface BackupRestoreModalProps {
  onClose: () => void;
  onBackupData: () => void;
  onRestoreData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRestoreFromAutoBackup: () => void;
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  onClose,
  onBackupData,
  onRestoreData,
  onRestoreFromAutoBackup,
}) => {
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreAutoBackupClick = () => {
    const lastBackupTimestamp = localStorage.getItem('lastAutoBackupTimestamp');
    let confirmationMessage = 'Bạn có chắc chắn muốn phục hồi dữ liệu từ bản sao lưu tự động gần nhất không?\n\nHành động này sẽ ghi đè lên toàn bộ dữ liệu hiện tại (danh sách người chơi, lịch sử, màu sân) và không thể hoàn tác.';
    if (lastBackupTimestamp) {
        confirmationMessage += `\n\nBản sao lưu gần nhất được tạo vào lúc: ${new Date(parseInt(lastBackupTimestamp, 10)).toLocaleString('vi-VN')}.`;
    }
    
    if (window.confirm(confirmationMessage)) {
        onRestoreFromAutoBackup();
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center text-xl font-semibold text-emerald-600">
                <DownloadIcon className="w-6 h-6 mr-3" />
                Sao lưu & Phục hồi dữ liệu
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
            </header>

            <main className="flex-1 p-6 space-y-4">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                <h4 className="font-bold">Sao lưu & Chuyển đổi thiết bị</h4>
                <p className="text-sm mt-1">Lưu trữ toàn bộ dữ liệu của bạn, bao gồm: <strong>danh sách người chơi, lịch sử các buổi chơi, doanh thu, danh sách thức ăn & thức uống, và các cài đặt khác</strong>. <br/>Sử dụng tính năng này để tạo một file an toàn, sau đó dùng file này để phục hồi dữ liệu trên một thiết bị khác (ví dụ: chuyển từ máy tính sang điện thoại).</p>
                <button 
                  onClick={onBackupData} 
                  className="mt-3 flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm text-sm"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Bắt đầu sao lưu
                </button>
              </div>

              <div className="p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-800 rounded-r-lg">
                <h4 className="font-bold">Phục hồi từ sao lưu tự động</h4>
                <p className="text-sm mt-1">Hệ thống tự động sao lưu định kỳ. Sử dụng tùy chọn này nếu bạn gặp sự cố và muốn quay lại bản sao lưu gần nhất trên chính thiết bị này.</p>
                <button 
                  onClick={handleRestoreAutoBackupClick}
                  className="mt-3 flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm text-sm"
                >
                  <RotateCwIcon className="w-5 h-5 mr-2" />
                  Phục hồi bản gần nhất
                </button>
              </div>

              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-r-lg">
                <h4 className="font-bold">Phục hồi từ file</h4>
                <p className="text-sm mt-1"><strong>Cảnh báo:</strong> Hành động này sẽ <strong>ghi đè toàn bộ dữ liệu hiện tại trên thiết bị này</strong> với dữ liệu từ file bạn chọn. Không thể hoàn tác.</p>
                <input
                    type="file"
                    ref={restoreInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={onRestoreData}
                />
                <button 
                  onClick={() => restoreInputRef.current?.click()}
                  className="mt-3 flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-sm text-sm"
                >
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Chọn file và phục hồi
                </button>
              </div>

            </main>
        </div>
    </div>
  );
};

export default BackupRestoreModal;