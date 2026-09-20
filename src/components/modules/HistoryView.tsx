import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Trash2,
  FileText,
  Calendar,
  Eye,
  Download,
  AlertCircle,
} from 'lucide-react';
import { WorkspaceSummary, ModuleType } from '../../types';
import { getWorkspaceList, deleteWorkspace } from '../../services/storageService';

interface HistoryViewProps {
  onLoadWorkspace: (id: string, type: ModuleType) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onLoadWorkspace }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>(() => getWorkspaceList());
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ lưu trữ này?')) {
      deleteWorkspace(id);
      setWorkspaces(getWorkspaceList());
    }
  };

  const filtered = workspaces.filter((ws) => {
    const matchSearch = ws.title.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || ws.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 text-xs font-bold font-mono">
              LƯU TRỮ
            </span>
            <h2 className="text-xl font-bold text-slate-900">LỊCH SỬ HỒ SƠ VÀ BẢN DỰ THẢO</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các đề thi, giáo án, ma trận đã được thiết lập. Dễ dàng mở lại và chỉnh sửa bất cứ lúc nào.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Tổng cộng: {workspaces.length} hồ sơ
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm hồ sơ theo tên bài học, lớp, trường..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded-lg text-xs bg-slate-50 font-semibold text-slate-700"
        >
          <option value="all">Tất cả loại hồ sơ</option>
          <option value="exam-7991">Đề kiểm tra 7991</option>
          <option value="lesson-plan-5512">Giáo án 5512</option>
          <option value="ppct">Phân phối chương trình</option>
          <option value="worksheet">Phiếu học tập</option>
          <option value="review-outline">Đề cương ôn tập</option>
        </select>
      </div>

      {/* Workspace List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-2">
            <FolderArchive className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-xs text-slate-700">Chưa có hồ sơ lưu trữ nào phù hợp.</p>
            <p className="text-[11px]">Các đề thi và giáo án bạn soạn sẽ tự động lưu lại tại đây.</p>
          </div>
        ) : (
          filtered.map((ws) => (
            <div
              key={ws.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      KHTN {ws.grade}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {ws.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Cập nhật: {new Date(ws.updatedAt).toLocaleString('vi-VN')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onLoadWorkspace(ws.id, ws.type)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Mở xem</span>
                </button>
                <button
                  onClick={() => handleDelete(ws.id)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all"
                  title="Xóa hồ sơ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
