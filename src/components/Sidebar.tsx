import React from 'react';
import {
  Home,
  Calendar,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  ClipboardList,
  FolderSync,
  History,
  Settings,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { ModuleType, Grade } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (mod: ModuleType) => void;
  grade: Grade;
  documentCount: number;
  sourceLockActive: boolean;
}

interface MenuItem {
  id: ModuleType;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  grade,
  documentCount,
  sourceLockActive,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'TRANG CHỦ',
      icon: Home,
      description: 'Tổng quan & Sổ tay KHTN',
    },
    {
      id: 'ppct',
      label: 'PPCT (Module 1)',
      badge: 'Cân đối',
      icon: Calendar,
      description: 'Phân phối chương trình 140 tiết',
    },
    {
      id: 'lesson-plan-5512',
      label: 'GIÁO ÁN 5512 (Module 2)',
      badge: 'Chuẩn',
      icon: FileSpreadsheet,
      description: 'Kế hoạch bài dạy 4 hoạt động 4 bước',
    },
    {
      id: 'worksheet',
      label: 'PHIẾU HỌC TẬP (Module 3)',
      icon: FileCheck,
      description: 'Phiếu học tập đa dạng dạng bài',
    },
    {
      id: 'review-outline',
      label: 'ĐỀ CƯƠNG ÔN TẬP (Module 4)',
      icon: BookOpen,
      description: 'Hệ thống hóa kiến thức trọng tâm',
    },
    {
      id: 'exam-7991',
      label: 'KIỂM TRA 7991 (Module 5)',
      badge: '8 Bước',
      icon: ClipboardList,
      description: 'Ma trận • Đặc tả • Đề • Đáp án • Validator',
    },
    {
      id: 'documents',
      label: 'TÀI LIỆU NGUỒN',
      badge: documentCount > 0 ? `${documentCount}` : 'Chưa có',
      icon: FolderSync,
      description: 'Kho SGK & Tài liệu RAG giáo viên',
    },
    {
      id: 'history',
      label: 'LỊCH SỬ NHIỆM VỤ',
      icon: History,
      description: 'Không gian làm việc đã lưu',
    },
    {
      id: 'settings',
      label: 'CÀI ĐẶT HỆ THỐNG',
      icon: Settings,
      description: 'Thiết lập giáo viên & Source Lock',
    },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-slate-900 text-slate-200 shrink-0 flex flex-col justify-between border-r border-slate-800">
      {/* Top Menu Section */}
      <div className="p-3">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          CHỨC NĂNG HỆ THỐNG
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Chưa có'
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Box: Teacher Principles */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 space-y-2.5">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Source Lock
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                sourceLockActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                  : 'bg-amber-950 text-amber-300 border border-amber-600/40'
              }`}
            >
              {sourceLockActive ? 'BẬT (Khóa nguồn)' : 'TẮT'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {sourceLockActive
              ? 'AI chỉ trích xuất từ tài liệu đã nạp, không bịa đặt kiến thức.'
              : 'AI được phép bổ sung kiến thức ngoài chuẩn.'}
          </p>
        </div>

        <div className="px-2 text-[11px] text-slate-400 leading-tight">
          <span className="font-semibold text-slate-300">Khối đang chọn:</span> KHTN Lớp {grade}
          <div className="mt-1">
            <span className="text-emerald-400 font-medium">Nguyên tắc vàng:</span> Giáo viên luôn là người kiểm soát và quyết định cuối cùng.
          </div>
        </div>
      </div>
    </aside>
  );
};
