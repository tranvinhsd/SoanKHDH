import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Wrench,
  Eye,
  EyeOff,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  Grade,
  Exam7991Workspace,
  ExamStep,
  SourceDocument,
  SourceLockSettings,
  MatrixRow,
  QuestionBankItem,
} from '../../types';
import { buildDefaultExam7991Workspace } from '../../services/aiService';
import { runValidationPipeline, autoFixExamWorkspace } from '../../services/validator7991';
import {
  exportExamToDocx,
  exportExamToExcel,
  exportMarkdown,
  printElementToPDF,
} from '../../services/exportService';

interface Exam7991WizardProps {
  currentGrade: Grade;
  sourceDocs: SourceDocument[];
  settings: SourceLockSettings;
  onSaveToHistory?: (ws: Exam7991Workspace) => void;
}

export const Exam7991Wizard: React.FC<Exam7991WizardProps> = ({
  currentGrade,
  sourceDocs,
  settings,
  onSaveToHistory,
}) => {
  const [workspace, setWorkspace] = useState<Exam7991Workspace>(() =>
    buildDefaultExam7991Workspace(currentGrade)
  );
  const [showMetadata, setShowMetadata] = useState(false);
  const [activeTabExport, setActiveTabExport] = useState<'exam' | 'answers' | 'guide' | 'matrix'>('exam');
  const [matrixEditingRow, setMatrixEditingRow] = useState<string | null>(null);

  const stepsList: { num: ExamStep; label: string; icon: string }[] = [
    { num: 1, label: '1. Tài liệu', icon: '📁' },
    { num: 2, label: '2. Thiết lập', icon: '⚙️' },
    { num: 3, label: '3. Ma trận', icon: '📊' },
    { num: 4, label: '4. Bản đặc tả', icon: '📋' },
    { num: 5, label: '5. Ngân hàng', icon: '❓' },
    { num: 6, label: '6. Đề thi', icon: '📝' },
    { num: 7, label: '7. Kiểm tra', icon: '✅' },
    { num: 8, label: '8. Xuất file', icon: '⬇️' },
  ];

  // Run validation whenever navigating to step 7 or modifying workspace
  const handleGoToStep = (newStep: ExamStep) => {
    // Check if moving past step 3 without 10.0 score
    if (workspace.step === 3 && newStep > 3) {
      const totalScore = workspace.matrix.rows.reduce((s, r) => s + r.totalScore, 0);
      if (Math.abs(totalScore - 10.0) > 0.05) {
        alert(
          `⚠️ KHÔNG THỂ CHUYỂN BƯỚC:\nTổng điểm ma trận hiện tại là ${totalScore.toFixed(
            2
          )} điểm. Quy định bắt buộc tổng điểm phải đúng 10.0 điểm!`
        );
        return;
      }
    }

    const updated = { ...workspace, step: newStep };
    updated.validation = runValidationPipeline(updated);
    setWorkspace(updated);
  };

  // Auto-Fix implementation (Section XXII)
  const handleAutoFix = () => {
    const fixed = autoFixExamWorkspace(workspace);
    setWorkspace(fixed);
  };

  // Update Matrix Row
  const handleMatrixCellChange = (
    rowId: string,
    field: 'recognition' | 'understanding' | 'application' | 'highApplication',
    subField: 'mcCount' | 'essayCount' | 'score',
    value: number
  ) => {
    const newRows = workspace.matrix.rows.map((r) => {
      if (r.id !== rowId) return r;
      const copy = { ...r };
      copy[field][subField] = Number(value);

      copy.totalQuestions =
        copy.recognition.mcCount +
        copy.recognition.essayCount +
        copy.understanding.mcCount +
        copy.understanding.essayCount +
        copy.application.mcCount +
        copy.application.essayCount +
        copy.highApplication.mcCount +
        copy.highApplication.essayCount;

      copy.totalScore = Number(
        (
          copy.recognition.score +
          copy.understanding.score +
          copy.application.score +
          copy.highApplication.score
        ).toFixed(2)
      );
      return copy;
    });

    const totalSum = Number(newRows.reduce((acc, r) => acc + r.totalScore, 0).toFixed(2));
    const isBalanced = Math.abs(totalSum - 10.0) <= 0.05;

    const updated: Exam7991Workspace = {
      ...workspace,
      matrix: {
        ...workspace.matrix,
        rows: newRows,
        totalScore: totalSum,
        isBalanced,
      },
    };
    updated.validation = runValidationPipeline(updated);
    setWorkspace(updated);
  };

  // Exports
  const handleExportWord = async () => {
    await exportExamToDocx(
      workspace,
      `DeThi7991_KHTN${workspace.config.grade}_${workspace.config.schoolName.replace(/\s+/g, '')}`
    );
  };

  const handleExportExcel = () => {
    exportExamToExcel(
      workspace,
      `MaTran_DacTa_7991_KHTN${workspace.config.grade}`
    );
  };

  const handleExportPDF = () => {
    printElementToPDF('printable-exam-paper', `DeKiemTra_KHTN${workspace.config.grade}`);
  };

  const handleExportMarkdown = () => {
    const md = `# ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991/BGDĐT\n\n` +
      `**Đơn vị:** ${workspace.config.schoolName} | **Môn:** Khoa học tự nhiên ${workspace.config.grade} | **Thời gian:** ${workspace.config.durationMinutes} phút\n\n` +
      `## PHẦN I. TRẮC NGHIỆM KHÁCH QUAN\n\n` +
      workspace.examPaper.parts[0].questions
        .map((q) => `**Câu ${q.num}:** ${q.stem}\n${q.options ? q.options.join('\n') : ''}\n`)
        .join('\n') +
      `\n## PHẦN II. TỰ LUẬN\n\n` +
      (workspace.examPaper.parts[1]?.questions || [])
        .map((q) => `**Câu ${q.num} (${q.score}đ):** ${q.stem}\n`)
        .join('\n') +
      `\n## ĐÁP ÁN VÀ THANG ĐIỂM\n\n` +
      workspace.answers
        .map((a) => `- **Câu ${a.questionNum} (${a.score}đ):** ${a.answer} - *${a.explanation}*`)
        .join('\n');
    exportMarkdown(md, `DeThi7991_KHTN${workspace.config.grade}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              MODULE 5
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              QUY TRÌNH RA ĐỀ KIỂM TRA ĐỊNH KỲ THEO CÔNG VĂN 7991
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình khép kín 8 bước: Tài liệu ➔ Thiết lập ➔ Ma trận ➔ Bản đặc tả ➔ Ngân hàng câu hỏi ➔ Đề thi ➔ Validator 10 check ➔ Xuất file.
          </p>
        </div>

        {/* Step 7/8 quick badges */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              workspace.validation.overallStatus === 'green'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : workspace.validation.overallStatus === 'yellow'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse'
            }`}
          >
            {workspace.validation.overallStatus === 'green' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : workspace.validation.overallStatus === 'yellow' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>
              Validator:{' '}
              {workspace.validation.overallStatus === 'green'
                ? 'ĐẠT CHUẨN'
                : workspace.validation.overallStatus === 'yellow'
                ? 'CẢNH BÁO'
                : 'LỖI PHÁT HIỆN'}
            </span>
          </div>
        </div>
      </div>

      {/* 8-Step Navigation Bar (Section XIV) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-1">
          {stepsList.map((st) => {
            const isActive = workspace.step === st.num;
            const isCompleted = workspace.step > st.num;
            return (
              <button
                key={st.num}
                id={`exam-step-${st.num}`}
                onClick={() => handleGoToStep(st.num)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{st.icon}</span>
                <span className="truncate">{st.label}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: TÀI LIỆU (Section XV) */}
      {workspace.step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900">
              BƯỚC 1: XÁC ĐỊNH VÀ CHỌN TÀI LIỆU NGUỒN PHỤC VỤ RA ĐỀ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn các bài học trong sách giáo khoa KHTN hoặc tài liệu giảng dạy đã được phân tích.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sourceDocs.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <p className="font-semibold text-xs">Chưa có tài liệu nguồn nào.</p>
                <p className="text-[11px] mt-1">
                  Hãy qua mục &quot;Tài liệu nguồn&quot; để nạp SGK hoặc dùng tài liệu mặc định của hệ thống.
                </p>
              </div>
            ) : (
              sourceDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex items-start gap-2.5"
                >
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {doc.extractedAnalysis?.topics.join(', ') || 'Kho tài liệu giáo viên'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Đã phân tích RAG
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => handleGoToStep(2)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 2 - Thiết lập đề</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: THIẾT LẬP ĐỀ (Section XVI) */}
      {workspace.step === 2 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900">
              BƯỚC 2: THIẾT LẬP THÔNG SỐ ĐỀ KIỂM TRA ĐỊNH KỲ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xác định đợt thi, khối lớp, thời gian làm bài, cấu trúc trắc nghiệm/tự luận và tỉ lệ nhận thức.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên đơn vị / Trường THCS:</label>
              <input
                type="text"
                value={workspace.config.schoolName}
                onChange={(e) =>
                  setWorkspace({
                    ...workspace,
                    config: { ...workspace.config, schoolName: e.target.value },
                  })
                }
                className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Đợt kiểm tra đánh giá:</label>
              <input
                type="text"
                value={workspace.config.examType}
                onChange={(e) =>
                  setWorkspace({
                    ...workspace,
                    config: { ...workspace.config, examType: e.target.value },
                  })
                }
                className="w-full p-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời gian làm bài (Phút):</label>
              <select
                value={workspace.config.durationMinutes}
                onChange={(e) =>
                  setWorkspace({
                    ...workspace,
                    config: { ...workspace.config, durationMinutes: Number(e.target.value) },
                  })
                }
                className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
              >
                <option value={45}>45 phút (Đánh giá định kỳ 1 tiết)</option>
                <option value={60}>60 phút (Đánh giá giữa kì / cuối kì)</option>
                <option value={90}>90 phút (Khảo sát chất lượng học kì)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tỉ lệ hình thức: Trắc nghiệm / Tự luận (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={workspace.config.multipleChoiceRatio}
                  onChange={(e) => {
                    const mc = Number(e.target.value);
                    setWorkspace({
                      ...workspace,
                      config: {
                        ...workspace.config,
                        multipleChoiceRatio: mc,
                        essayRatio: 100 - mc,
                      },
                    });
                  }}
                  className="w-20 p-2 border rounded-lg bg-slate-50 font-bold text-center"
                />
                <span className="font-bold text-slate-500">% TN /</span>
                <span className="font-bold text-slate-700">
                  {workspace.config.essayRatio}% Tự luận
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Tỉ lệ 4 mức độ nhận thức (NB - TH - VD - VDC):
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 bg-slate-50 rounded border text-center">
                  <span className="text-[10px] text-slate-500 block">Nhận biết</span>
                  <span className="font-bold text-sm text-slate-800">
                    {workspace.config.targetCognitive.recognition}%
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded border text-center">
                  <span className="text-[10px] text-slate-500 block">Thông hiểu</span>
                  <span className="font-bold text-sm text-slate-800">
                    {workspace.config.targetCognitive.understanding}%
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded border text-center">
                  <span className="text-[10px] text-slate-500 block">Vận dụng</span>
                  <span className="font-bold text-sm text-slate-800">
                    {workspace.config.targetCognitive.application}%
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded border text-center">
                  <span className="text-[10px] text-slate-500 block">Vận dụng cao</span>
                  <span className="font-bold text-sm text-slate-800">
                    {workspace.config.targetCognitive.highApplication}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(1)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(3)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 3 - Ma trận đề</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MA TRẬN ĐỀ (Section XVII) */}
      {workspace.step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                BƯỚC 3: XÂY DỰNG MA TRẬN ĐỀ KIỂM TRA 2 CHIỀU
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bắt buộc tổng điểm phải đúng 10.0 điểm. Hệ thống tự động tính toán tổng số câu và điểm từng mạch nội dung.
              </p>
            </div>

            {/* Total Score Indicator Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                Math.abs(workspace.matrix.totalScore - 10.0) <= 0.05
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse'
              }`}
            >
              <span>Tổng điểm ma trận:</span>
              <span className="text-sm font-mono underline">
                {workspace.matrix.totalScore.toFixed(2)} / 10.0 điểm
              </span>
              {Math.abs(workspace.matrix.totalScore - 10.0) <= 0.05 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
            </div>
          </div>

          {/* Table Matrix 2 chiều (Section XVII) */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-center text-[11px]">
                <tr>
                  <th rowSpan={2} className="px-2 py-2 border-r w-10">STT</th>
                  <th rowSpan={2} className="px-3 py-2 border-r w-44 text-left">Chủ đề</th>
                  <th rowSpan={2} className="px-3 py-2 border-r w-48 text-left">Đơn vị kiến thức</th>
                  <th colSpan={3} className="px-2 py-1.5 border-r bg-blue-50/60 text-blue-900">Nhận biết</th>
                  <th colSpan={3} className="px-2 py-1.5 border-r bg-emerald-50/60 text-emerald-900">Thông hiểu</th>
                  <th colSpan={3} className="px-2 py-1.5 border-r bg-amber-50/60 text-amber-900">Vận dụng</th>
                  <th colSpan={2} className="px-2 py-1.5 border-r bg-purple-50/60 text-purple-900">Vận dụng cao</th>
                  <th rowSpan={2} className="px-2 py-2 border-r w-14">Tổng câu</th>
                  <th rowSpan={2} className="px-2 py-2 w-14">Tổng điểm</th>
                </tr>
                <tr className="border-t text-[10px] text-slate-600">
                  <th className="p-1 border-r">TN</th>
                  <th className="p-1 border-r">TL</th>
                  <th className="p-1 border-r font-bold">Điểm</th>
                  <th className="p-1 border-r">TN</th>
                  <th className="p-1 border-r">TL</th>
                  <th className="p-1 border-r font-bold">Điểm</th>
                  <th className="p-1 border-r">TN</th>
                  <th className="p-1 border-r">TL</th>
                  <th className="p-1 border-r font-bold">Điểm</th>
                  <th className="p-1 border-r">TL</th>
                  <th className="p-1 border-r font-bold">Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workspace.matrix.rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 text-center">
                    <td className="p-2 border-r font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2 border-r text-left font-semibold text-slate-900">{row.topic}</td>
                    <td className="p-2 border-r text-left text-slate-700">{row.content}</td>

                    {/* Recognition */}
                    <td className="p-1 border-r font-mono">{row.recognition.mcCount}</td>
                    <td className="p-1 border-r font-mono">{row.recognition.essayCount}</td>
                    <td className="p-1 border-r font-bold text-blue-800">{row.recognition.score}</td>

                    {/* Understanding */}
                    <td className="p-1 border-r font-mono">{row.understanding.mcCount}</td>
                    <td className="p-1 border-r font-mono">{row.understanding.essayCount}</td>
                    <td className="p-1 border-r font-bold text-emerald-800">{row.understanding.score}</td>

                    {/* Application */}
                    <td className="p-1 border-r font-mono">{row.application.mcCount}</td>
                    <td className="p-1 border-r font-mono">{row.application.essayCount}</td>
                    <td className="p-1 border-r font-bold text-amber-800">{row.application.score}</td>

                    {/* High Application */}
                    <td className="p-1 border-r font-mono">{row.highApplication.essayCount}</td>
                    <td className="p-1 border-r font-bold text-purple-800">{row.highApplication.score}</td>

                    {/* Total */}
                    <td className="p-1 border-r font-bold bg-slate-50">{row.totalQuestions}</td>
                    <td className="p-1 font-bold text-emerald-800 bg-emerald-50/50">{row.totalScore}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-center">
                <tr>
                  <td colSpan={3} className="p-2 text-right">TỔNG CỘNG:</td>
                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.recognition.mcCount, 0)}
                  </td>
                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.recognition.essayCount, 0)}
                  </td>
                  <td className="p-1 border-r text-blue-900">
                    {workspace.matrix.rows.reduce((s, r) => s + r.recognition.score, 0).toFixed(2)}
                  </td>

                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.understanding.mcCount, 0)}
                  </td>
                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.understanding.essayCount, 0)}
                  </td>
                  <td className="p-1 border-r text-emerald-900">
                    {workspace.matrix.rows.reduce((s, r) => s + r.understanding.score, 0).toFixed(2)}
                  </td>

                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.application.mcCount, 0)}
                  </td>
                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.application.essayCount, 0)}
                  </td>
                  <td className="p-1 border-r text-amber-900">
                    {workspace.matrix.rows.reduce((s, r) => s + r.application.score, 0).toFixed(2)}
                  </td>

                  <td className="p-1 border-r">
                    {workspace.matrix.rows.reduce((s, r) => s + r.highApplication.essayCount, 0)}
                  </td>
                  <td className="p-1 border-r text-purple-900">
                    {workspace.matrix.rows.reduce((s, r) => s + r.highApplication.score, 0).toFixed(2)}
                  </td>

                  <td className="p-1 border-r bg-slate-200">
                    {workspace.matrix.rows.reduce((s, r) => s + r.totalQuestions, 0)}
                  </td>
                  <td className="p-1 text-emerald-800 bg-emerald-100 font-mono text-sm">
                    {workspace.matrix.totalScore.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(2)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(4)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 4 - Bản đặc tả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BẢN ĐẶC TẢ (Section XVIII) */}
      {workspace.step === 4 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900">
              BƯỚC 4: BẢN ĐẶC TẢ ĐỀ KIỂM TRA (ÁNH XẠ 1-1 TỪ MA TRẬN)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi dòng đặc tả gắn với yêu cầu cần đạt (YCCĐ) cụ thể, xác định số lượng câu và dạng bài trắc nghiệm / tự luận.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase text-[11px]">
                <tr>
                  <th className="p-2.5 w-16 text-center">Mã</th>
                  <th className="p-2.5 w-44">Chủ đề</th>
                  <th className="p-2.5 w-48">Nội dung</th>
                  <th className="p-2.5">Yêu cầu cần đạt (YCCĐ)</th>
                  <th className="p-2.5 w-28 text-center">Mức độ</th>
                  <th className="p-2.5 w-36 text-center">Dạng câu</th>
                  <th className="p-2.5 w-16 text-center">Số câu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workspace.specification.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-mono font-bold text-slate-500">{sp.id}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{sp.topic}</td>
                    <td className="p-2.5 text-slate-700">{sp.content}</td>
                    <td className="p-2.5 text-slate-800">{sp.requirement}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sp.level === 'Nhận biết'
                            ? 'bg-blue-100 text-blue-800'
                            : sp.level === 'Thông hiểu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sp.level === 'Vận dụng'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {sp.level}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-slate-600">{sp.questionType}</td>
                    <td className="p-2.5 text-center font-bold font-mono">{sp.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(3)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(5)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 5 - Ngân hàng câu hỏi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: NGÂN HÀNG CÂU HỎI (Section XIX) */}
      {workspace.step === 5 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                BƯỚC 5: NGÂN HÀNG CÂU HỎI KÈM METADATA NỘI BỘ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi câu hỏi có đầy đủ ID, Chủ đề, YCCĐ, Mức độ, Điểm số, Đáp án và Nguồn gốc SGK.
              </p>
            </div>

            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-all text-slate-700"
            >
              {showMetadata ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showMetadata ? 'Ẩn Metadata câu hỏi' : 'Hiện Metadata câu hỏi'}</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {workspace.questionBank.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      Câu {idx + 1} ({q.id})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.level === 'Nhận biết'
                          ? 'bg-blue-100 text-blue-800'
                          : q.level === 'Thông hiểu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.level === 'Vận dụng'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {q.level}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Điểm: {q.score}đ | Dạng: {q.type === 'mc' ? 'Trắc nghiệm' : 'Tự luận'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ĐA: {q.correctAnswer}
                  </span>
                </div>

                <p className="font-semibold text-slate-900 text-xs sm:text-sm">{q.stem}</p>

                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded border text-xs ${
                          opt.startsWith(q.correctAnswer)
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Metadata card if toggled */}
                {showMetadata && (
                  <div className="mt-2 p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <p>
                      <strong>Chủ đề / Bài:</strong> {q.topic} - {q.content}
                    </p>
                    <p>
                      <strong>YCCĐ:</strong> {q.requirement}
                    </p>
                    <p>
                      <strong>Giải thích chi tiết:</strong> {q.explanation}
                    </p>
                    <p>
                      <strong>Nguồn gốc:</strong> {q.source}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(4)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(6)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 6 - Tạo đề kiểm tra</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ĐỀ KIỂM TRA (Section XX) */}
      {workspace.step === 6 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-slate-800">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                BƯỚC 6: BẢN THỂ THỨC ĐỀ KIỂM TRA CHUẨN CÔNG VĂN 7991
              </h3>
              <p className="text-xs text-slate-500">
                Phần I: Trắc nghiệm khách quan (7,0 điểm) • Phần II: Tự luận (3,0 điểm).
              </p>
            </div>
            <button
              onClick={() => handleGoToStep(7)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <span>Tiếp tục: Bước 7 - Thẩm định Validator</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Paper layout */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Exam */}
            <div className="grid grid-cols-2 text-center border-b pb-4 text-xs font-bold text-slate-800">
              <div>
                <p className="uppercase">{workspace.config.schoolName}</p>
                <p className="uppercase font-normal">TỔ KHOA HỌC TỰ NHIÊN</p>
                <p className="italic font-normal mt-1">Đề chính thức</p>
              </div>
              <div>
                <p className="uppercase">{workspace.config.examType}</p>
                <p>MÔN: KHOA HỌC TỰ NHIÊN {workspace.config.grade}</p>
                <p className="font-normal italic">
                  Thời gian làm bài: {workspace.config.durationMinutes} phút
                </p>
              </div>
            </div>

            {/* Questions by parts */}
            {workspace.examPaper.parts.map((part, pIdx) => (
              <div key={pIdx} className="space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 uppercase">{part.partTitle}</h4>
                  <p className="text-xs italic text-slate-600">{part.instructions}</p>
                </div>

                <div className="space-y-3 text-xs pl-2">
                  {part.questions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <p className="font-semibold text-slate-900">
                        <strong>Câu {q.num} ({q.score}đ):</strong> {q.stem}
                      </p>
                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4 text-slate-700">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="text-center text-xs font-bold text-slate-400 pt-6">
              -------------------------- HẾT ĐỀ THI --------------------------
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(5)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(7)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <span>Tiếp tục: Bước 7 - Kiểm tra Validator</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: KIỂM TRA VALIDATOR (Section XXI & XXII) */}
      {workspace.step === 7 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  VALIDATOR 10 BƯỚC
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  THẨM ĐỊNH ĐỀ KIỂM TRA TRƯỚC KHI XUẤT BẢN
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chống lỗi điểm, trùng câu, lệch ma trận và đáp án không khớp. Quy định: Chỉ cho phép xuất file khi đề HỢP LỆ!
              </p>
            </div>

            {/* Auto-Fix Button */}
            <button
              id="btn-auto-fix-exam"
              onClick={handleAutoFix}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>🔧 TỰ ĐỘNG SỬA & ĐỒNG BỘ 10.0đ</span>
            </button>
          </div>

          {/* Status Alert Banner (Section XXII) */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
              workspace.validation.overallStatus === 'green'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : workspace.validation.overallStatus === 'yellow'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            {workspace.validation.overallStatus === 'green' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : workspace.validation.overallStatus === 'yellow' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {workspace.validation.overallStatus === 'green'
                  ? '✅ ĐỀ KIỂM TRA ĐẠT CHUẨN 100% CÔNG VĂN 7991'
                  : workspace.validation.overallStatus === 'yellow'
                  ? '⚠️ PHÁT HIỆN CẢNH BÁO NHẸ TRONG ĐỀ'
                  : '⛔ PHÁT HIỆN LỖI TRONG ĐỀ - CHẶN XUẤT FILE!'}
              </h4>
              <p>
                {workspace.validation.overallStatus === 'green'
                  ? 'Tất cả 10 tiêu chí kiểm tra đều vượt qua xuất sắc. Đề sẵn sàng để in và xuất Word, PDF, Excel!'
                  : 'Vui lòng kiểm tra các tiêu chí báo đỏ bên dưới hoặc bấm nút "🔧 TỰ ĐỘNG SỬA" phía trên để AI tự cân đối.'}
              </p>
            </div>
          </div>

          {/* 10 Checks Grid (Section XXI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workspace.validation.checks.map((c) => (
              <div
                key={c.code}
                className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                  c.status === 'passed'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : c.status === 'warning'
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-rose-50/80 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700">
                    {c.code}: {c.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-slate-800">{c.message}</p>
                {c.details && <p className="text-slate-500 italic">{c.details}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-3 border-t">
            <button
              onClick={() => handleGoToStep(6)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => handleGoToStep(8)}
              disabled={!workspace.validation.canExport}
              className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                workspace.validation.canExport
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Tiếp tục: Bước 8 - Xuất file tải về</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: XUẤT FILE TẢI VỀ (Section XXIII) */}
      {workspace.step === 8 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                BƯỚC 8: XEM TRƯỚC VÀ XUẤT FILE TẢI VỀ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem trước đề thi, đáp án, barem hướng dẫn chấm hoặc ma trận 7991 trước khi tải file.
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-export-word"
                disabled={!workspace.validation.canExport}
                onClick={handleExportWord}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>TẢI WORD (.docx)</span>
              </button>
              <button
                id="btn-export-pdf"
                disabled={!workspace.validation.canExport}
                onClick={handleExportPDF}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <Printer className="w-4 h-4" />
                <span>TẢI PDF</span>
              </button>
              <button
                id="btn-export-excel"
                disabled={!workspace.validation.canExport}
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>TẢI EXCEL MA TRẬN</span>
              </button>
              <button
                id="btn-export-md"
                disabled={!workspace.validation.canExport}
                onClick={handleExportMarkdown}
                className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <FileText className="w-4 h-4" />
                <span>Markdown</span>
              </button>
            </div>
          </div>

          {/* Tab preview selector */}
          <div className="flex items-center gap-2 border-b text-xs font-bold">
            <button
              onClick={() => setActiveTabExport('exam')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTabExport === 'exam'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. Đề thi chính thức
            </button>
            <button
              onClick={() => setActiveTabExport('answers')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTabExport === 'answers'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. Bảng đáp án ({workspace.answers.length} câu)
            </button>
            <button
              onClick={() => setActiveTabExport('guide')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTabExport === 'guide'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              3. Hướng dẫn chấm tự luận ({workspace.gradingGuide.length} câu)
            </button>
            <button
              onClick={() => setActiveTabExport('matrix')}
              className={`pb-2.5 px-3 border-b-2 transition-all ${
                activeTabExport === 'matrix'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              4. Ma trận & Bản đặc tả
            </button>
          </div>

          {/* Preview Canvas Container */}
          <div
            id="printable-exam-paper"
            className="p-6 sm:p-10 border rounded-xl bg-white shadow-2xs space-y-6 text-xs text-slate-800"
          >
            {activeTabExport === 'exam' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 text-center border-b pb-4 font-bold text-slate-900">
                  <div>
                    <p>{workspace.config.schoolName}</p>
                    <p className="font-normal uppercase text-slate-600">TỔ KHOA HỌC TỰ NHIÊN</p>
                  </div>
                  <div>
                    <p>{workspace.config.examType}</p>
                    <p>MÔN KHOA HỌC TỰ NHIÊN {workspace.config.grade}</p>
                    <p className="font-normal italic text-slate-600">
                      Thời gian làm bài: {workspace.config.durationMinutes} phút
                    </p>
                  </div>
                </div>

                {workspace.examPaper.parts.map((p, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-900">{p.partTitle}</h4>
                    <p className="italic text-slate-500">{p.instructions}</p>
                    <div className="space-y-3 pl-2">
                      {p.questions.map((q) => (
                        <div key={q.id} className="space-y-1">
                          <p className="font-semibold text-slate-900">
                            Câu {q.num} ({q.score}đ): {q.stem}
                          </p>
                          {q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4">
                              {q.options.map((opt, o) => (
                                <div key={o}>{opt}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTabExport === 'answers' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  ĐÁP ÁN VÀ THANG ĐIỂM CHI TIẾT
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {workspace.answers.map((ans) => (
                    <div key={ans.questionNum} className="p-2 rounded border bg-slate-50 space-y-0.5">
                      <div className="flex items-center justify-between font-bold">
                        <span>Câu {ans.questionNum} ({ans.score}đ):</span>
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          {ans.answer}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">{ans.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTabExport === 'guide' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  HƯỚNG DẪN CHẤM BÀI THI TỰ LUẬN
                </h4>
                {workspace.gradingGuide.map((g) => (
                  <div key={g.questionId} className="p-4 rounded-lg border bg-slate-50 space-y-2">
                    <h5 className="font-bold text-slate-900">
                      Câu {g.questionNum}: {g.stem} (Tổng điểm: {g.totalScore}đ)
                    </h5>
                    <div className="space-y-1.5 pl-3 border-l-2 border-emerald-400">
                      {g.criteria.map((c, i) => (
                        <div key={i} className="flex items-start justify-between gap-4">
                          <span>
                            <strong>{c.idea}:</strong> {c.requirement}
                          </span>
                          <span className="font-bold font-mono text-emerald-800 shrink-0">
                            {c.score}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTabExport === 'matrix' && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                  BẢNG MA TRẬN VÀ BẢN ĐẶC TẢ TỔNG HỢP
                </h4>
                <p className="text-slate-600 text-xs">
                  Tổng điểm: {workspace.matrix.totalScore}đ | Tổng số câu: {workspace.questionBank.length} câu.
                  Bấm nút &quot;TẢI EXCEL MA TRẬN&quot; ở trên để tải file bảng tính hoàn chỉnh.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
