import React from 'react';
import {
  Calendar,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  ClipboardList,
  FolderSync,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  BookMarked,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ModuleType, Grade } from '../types';

interface HomeDashboardProps {
  onSelectModule: (mod: ModuleType) => void;
  grade: Grade;
  documentCount: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectModule,
  grade,
  documentCount,
}) => {
  const modules = [
    {
      id: 'ppct' as ModuleType,
      number: 'MODULE 1',
      title: 'Phân phối chương trình (PPCT)',
      desc: 'Xây dựng kế hoạch dạy học 140 tiết/năm, tự động cân đối số tiết các bài học, tuần học và kiểm tra định kỳ.',
      icon: Calendar,
      badge: 'Cân đối 140 tiết',
      color: 'emerald',
    },
    {
      id: 'lesson-plan-5512' as ModuleType,
      number: 'MODULE 2',
      title: 'Giáo án Công văn 5512',
      desc: 'Soạn Kế hoạch bài dạy chuẩn 4 hoạt động và 4 bước sư phạm: Chuyển giao -> Thực hiện -> Báo cáo -> Kết luận.',
      icon: FileSpreadsheet,
      badge: 'Chuẩn 5512',
      color: 'blue',
    },
    {
      id: 'worksheet' as ModuleType,
      number: 'MODULE 3',
      title: 'Phiếu học tập đa dạng',
      desc: 'Thiết kế phiếu cá nhân hóa: Trắc nghiệm, Đúng/Sai, Điền khuyết, Nối cột, Bảng biểu và Tự luận kèm thang điểm.',
      icon: FileCheck,
      badge: 'Phân hóa HS',
      color: 'purple',
    },
    {
      id: 'review-outline' as ModuleType,
      number: 'MODULE 4',
      title: 'Đề cương ôn tập học kỳ',
      desc: 'Hệ thống hóa kiến thức trọng tâm theo 4 phân mục: A. Ghi nhớ • B. Nhận biết • C. Thông hiểu • D. Vận dụng.',
      icon: BookOpen,
      badge: 'Ôn tập KHTN',
      color: 'amber',
    },
    {
      id: 'exam-7991' as ModuleType,
      number: 'MODULE 5',
      title: 'Quy trình kiểm tra Công văn 7991',
      desc: 'Pipeline 8 bước: Ma trận 2 chiều -> Bản đặc tả -> Ngân hàng câu hỏi -> Đề thi -> Thẩm định Validator 10 check.',
      icon: ClipboardList,
      badge: 'Quy trình 8 bước',
      color: 'teal',
    },
    {
      id: 'documents' as ModuleType,
      number: 'KHO NGUỒN',
      title: 'Quản lý tài liệu RAG & SGK',
      desc: 'Nạp sách giáo khoa (KNTT, Cánh Diều, CTST), đề thi mẫu, giáo trình để AI bám sát khi Source Lock = ON.',
      icon: FolderSync,
      badge: `${documentCount} tài liệu`,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-10 text-white shadow-md border border-emerald-900/30">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Kinh nghiệm 30 năm giảng dạy Khoa học tự nhiên THCS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            TRỢ LÝ AI GIÁO VIÊN KHTN THCS
          </h2>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal">
            Hệ thống chuyên sâu phục vụ giáo viên Khoa học tự nhiên (Lớp 6, 7, 8, 9). Vận hành chuẩn mực theo{' '}
            <strong className="text-white underline">Công văn 5512/BGDĐT</strong> và{' '}
            <strong className="text-white underline">Công văn 7991/BGDĐT</strong>, tích hợp cơ chế{' '}
            <strong className="text-white underline">Source Lock</strong> chống sai lệch kiến thức và Validator 10 bước tự động.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectModule('exam-7991')}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <span>Soạn đề kiểm tra 7991</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectModule('lesson-plan-5512')}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              Soạn giáo án 5512
            </button>
            <button
              onClick={() => onSelectModule('documents')}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <FolderSync className="w-3.5 h-3.5 text-teal-300" />
              <span>Nạp SGK ({documentCount} file)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 6 Core Functional Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            CÁC MODULE CHỨC NĂNG CHUYÊN MÔN
          </h3>
          <span className="text-xs text-slate-500">Đang chọn: Khoa học tự nhiên {grade}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className="group bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {mod.number}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {mod.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-600 transition-colors shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                  <span>Mở chức năng</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SỔ TAY 30 NĂM KINH NGHIỆM GIÁO VIÊN KHTN */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              SỔ TAY 30 NĂM KINH NGHIỆM GIÁO VIÊN KHTN THCS
            </h3>
            <p className="text-xs text-slate-700">
              Những nguyên tắc bất biến để có kế hoạch bài dạy chuẩn mực và đề kiểm tra không tì vết.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Quy tắc Công văn 5512
            </span>
            <p className="text-slate-700 leading-relaxed">
              Mỗi hoạt động bắt buộc có đủ 4 bước: <strong>Chuyển giao ➔ Thực hiện ➔ Báo cáo ➔ Kết luận</strong>.
              Sản phẩm học sinh phải tương thích tuyệt đối với mục tiêu cần đạt, không ghi chung chung.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Quy tắc Công văn 7991
            </span>
            <p className="text-slate-700 leading-relaxed">
              Tổng điểm ma trận và đề thi <strong>bắt buộc tròn 10.0 điểm</strong>. Tỉ lệ trắc nghiệm 70% (28 câu x 0.25đ),
              tự luận 30% (3 câu = 3.0đ). Mọi câu hỏi đều phải truy xuất ngược về một dòng trong bản đặc tả.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Kỷ luật Source Lock
            </span>
            <p className="text-slate-700 leading-relaxed">
              AI là trợ lý, <strong>giáo viên luôn là người kiểm soát tối cao</strong>. Khi bật Source Lock, AI
              chỉ sử dụng dữ liệu từ SGK đã nạp, triệt tiêu nguy cơ sinh thông tin sai lệch ngoài chương trình THCS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
