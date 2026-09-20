import React, { useState, useRef } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  User,
  Sliders,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  HardDrive,
  Trash2,
  Download,
  FolderSync,
  RotateCcw,
} from 'lucide-react';
import { SourceLockSettings, SourceDocument } from '../../types';
import {
  saveSettings,
  StorageService,
  DEFAULT_SETTINGS,
} from '../../services/storageService';

interface SettingsViewProps {
  settings: SourceLockSettings;
  onUpdateSettings: (newSettings: SourceLockSettings) => void;
  onClearAllDocs?: () => void;
  onReloadDocs?: (docs: SourceDocument[]) => void;
  documentCount?: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearAllDocs,
  onReloadDocs,
  documentCount = 0,
}) => {
  const [formData, setFormData] = useState<SourceLockSettings>(settings);
  const [saved, setSaved] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const stats = StorageService.getCacheStats();

  const handleSave = () => {
    saveSettings(formData);
    onUpdateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCacheDocs = () => {
    const confirm = window.confirm(
      'Thầy/Cô có chắc chắn muốn XÓA TẤT CẢ tài liệu nguồn trong bộ nhớ máy tính? Kho dữ liệu nguồn sẽ về trạng thái trống.'
    );
    if (confirm) {
      if (onClearAllDocs) {
        onClearAllDocs();
      } else {
        StorageService.clearAllDocuments();
      }
      alert('Đã xóa sạch toàn bộ tài liệu nguồn khỏi bộ nhớ máy tính thành công!');
    }
  };

  const handleResetSettings = () => {
    const confirm = window.confirm('Khôi phục cấu hình hệ thống về mặc định ban đầu?');
    if (confirm) {
      setFormData(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
      onUpdateSettings(DEFAULT_SETTINGS);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SaoLuu_KHTN_TongHop_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = StorageService.importFullBackup(content);
        if (success) {
          alert('Khôi phục dữ liệu từ tệp sao lưu thành công! Ứng dụng sẽ tải lại.');
          window.location.reload();
        } else {
          alert('Tệp sao lưu không hợp lệ. Vui lòng kiểm tra lại!');
        }
      }
    };
    reader.readAsText(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-bold font-mono">
            HỆ THỐNG
          </span>
          <h2 className="text-xl font-bold text-slate-900">CẤU HÌNH TRỢ LÝ VÀ SOURCE LOCK</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Thiết lập thông tin mặc định cho giáo án, đề kiểm tra, quản lý bộ nhớ lưu trữ trên máy tính và tùy chỉnh độ nghiêm ngặt của AI.
        </p>
      </div>

      {/* Local Computer Cache Persistence Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">
                BỘ NHỚ CACHE MÁY TÍNH & DỮ LIỆU NGUỒN (PERSISTENCE)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Khi chạy trên máy tính, tất cả tài liệu nguồn đã nạp và các thiết lập sư phạm được <strong>tự động lưu vào bộ nhớ cache của trình duyệt (LocalStorage)</strong> để thầy/cô tái sử dụng nhiều lần mà không phải nạp lại mỗi khi mở máy.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Tự động lưu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Số tài liệu trong cache:</span>
            <span className="font-bold text-slate-800 text-sm">{documentCount} tài liệu</span>
          </div>
          <div>
            <span className="text-slate-500 block">Dung lượng bộ nhớ đã dùng:</span>
            <span className="font-bold text-slate-800 text-sm">{formatFileSize(stats.approximateSizeBytes)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Đồng bộ gần nhất:</span>
            <span className="font-semibold text-slate-700">{stats.lastSyncFormatted}</span>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs border border-teal-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-600" />
            Sao lưu cấu hình & tài liệu (.json)
          </button>

          <button
            onClick={() => backupInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 flex items-center gap-1.5 transition-colors"
          >
            <FolderSync className="w-4 h-4 text-blue-600" />
            Khôi phục từ tệp sao lưu (.json)
          </button>
          <input
            type="file"
            ref={backupInputRef}
            accept=".json"
            className="hidden"
            onChange={handleImportBackup}
          />

          <button
            onClick={handleClearCacheDocs}
            className="px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Xóa sạch tài liệu trong Cache
          </button>
        </div>
      </div>

      {/* Source Lock Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                CHẾ ĐỘ SOURCE LOCK (KHÓA NGUỒN DỮ LIỆU)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Khi bật tính năng này, AI <strong>bắt buộc 100%</strong> chỉ sử dụng kiến thức trong sách giáo khoa
              hoặc tài liệu nguồn đã được giáo viên nạp vào hệ thống. Tuyệt đối không sinh thông tin giả định
              hoặc vượt quá khung chương trình giáo dục phổ thông 2018.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sourceLock}
              onChange={(e) => setFormData({ ...formData, sourceLock: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Mức độ nghiêm ngặt (Strictness):</span>
          <select
            value={formData.strictness}
            disabled={!formData.sourceLock}
            onChange={(e) =>
              setFormData({ ...formData, strictness: e.target.value as 'strict' | 'moderate' })
            }
            className="p-1.5 border rounded bg-white font-semibold text-slate-800 disabled:opacity-50"
          >
            <option value="strict">Nghiêm ngặt (Strict - Chỉ dùng thông tin trong nguồn)</option>
            <option value="moderate">Vừa phải (Moderate - Cho phép diễn đạt sư phạm mở rộng)</option>
          </select>
        </div>
      </div>

      {/* Default Institution Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">THÔNG TIN ĐƠN VỊ & GIÁO VIÊN</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên trường THCS:</label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-slate-50 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Họ và tên giáo viên:</label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-slate-50 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Save & Reset actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleResetSettings}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Mặc định ban đầu
        </button>

        <div className="flex items-center gap-3">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Đã lưu cấu hình vào bộ nhớ máy tính!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Thay đổi sẽ tự động lưu và áp dụng cho toàn bộ các module</span>
          )}

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>LƯU CẤU HÌNH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
