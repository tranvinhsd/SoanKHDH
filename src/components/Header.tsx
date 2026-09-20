import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Layers,
  FileText,
  FileCheck2,
} from 'lucide-react';
import { Grade, SourceLockSettings } from '../types';

interface HeaderProps {
  grade: Grade;
  onGradeChange: (grade: Grade) => void;
  settings: SourceLockSettings;
  onToggleSourceLock: () => void;
  currentWorkspaceName?: string;
  onOpenDocuments: () => void;
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  grade,
  onGradeChange,
  settings,
  onToggleSourceLock,
  currentWorkspaceName,
  onOpenDocuments,
  documentCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                TRỢ LÝ AI GIÁO VIÊN KHTN THCS
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3" /> 30 Năm Kinh Nghiệm
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              PPCT • Giáo án 5512 • Phiếu học tập • Ôn tập • Kiểm tra 7991
            </p>
          </div>
        </div>

        {/* Right Controls: Grade selector, Source Lock Toggle, Workspace badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Grade Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="px-2 py-1 text-slate-700">Khối:</span>
            {(['6', '7', '8', '9'] as Grade[]).map((g) => (
              <button
                key={g}
                id={`btn-grade-${g}`}
                onClick={() => onGradeChange(g)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  grade === g
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                KHTN {g}
              </button>
            ))}
          </div>

          {/* Source Documents Quick Badge */}
          <button
            id="btn-quick-docs"
            onClick={onOpenDocuments}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              documentCount > 0
                ? 'bg-teal-50 text-teal-800 border-teal-300 hover:bg-teal-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Quản lý tài liệu nguồn phục vụ RAG (Lưu trong cache máy tính)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nguồn: {documentCount} file</span>
            {documentCount > 0 && (
              <span className="text-[10px] px-1 py-0.2 bg-teal-200/60 rounded text-teal-900 font-normal">
                Cache
              </span>
            )}
          </button>

          {/* SOURCE LOCK TOGGLE */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
              settings.sourceLock && !settings.allowExternalKnowledge
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            onClick={onToggleSourceLock}
            title="Cơ chế Source Lock: Khi BẬT, AI tuyệt đối chỉ dùng dữ liệu từ tài liệu đã nạp, không suy diễn ngoài nguồn."
          >
            {settings.sourceLock && !settings.allowExternalKnowledge ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SOURCE LOCK = ON</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>SOURCE LOCK = OFF</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </>
            )}
          </div>

          {/* Current Workspace Tag */}
          {currentWorkspaceName && (
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-mono border border-slate-200">
              <Layers className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[130px]">{currentWorkspaceName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
