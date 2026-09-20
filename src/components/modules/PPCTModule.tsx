import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Globe,
  Bot,
  Laptop,
  Binary,
  Filter,
  Eye,
  X,
  Code,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Grade, PPCTData, PPCTItem, SourceDocument, SourceLockSettings, TeachingMethod } from '../../types';
import { generatePPCTWithAI } from '../../services/aiService';
import { exportPPCTToExcel, exportPPCTToDocx, exportMarkdown } from '../../services/exportService';

interface PPCTModuleProps {
  currentGrade: Grade;
  sourceDocs: SourceDocument[];
  settings: SourceLockSettings;
}

export const PPCTModule: React.FC<PPCTModuleProps> = ({
  currentGrade,
  sourceDocs,
  settings,
}) => {
  const [grade, setGrade] = useState<Grade>(currentGrade);
  const [schoolYear, setSchoolYear] = useState('2026 - 2027');
  const [totalPeriodsRequired, setTotalPeriodsRequired] = useState<number>(140);
  const [guidancePreset, setGuidancePreset] = useState('so-gd-5512');
  const [textbookSeries, setTextbookSeries] = useState('kntt');
  const [additionalRequirements, setAdditionalRequirements] = useState(
    'Căn cứ hướng dẫn của Sở GD&ĐT, chuẩn Công văn 5512/BGDĐT, phân bổ chi tiết 140 tiết theo SGK và tích hợp thiết bị dạy học thí nghiệm thực hành, năng lực số NLS, dạy học AI.'
  );
  const [selectedDocId, setSelectedDocId] = useState<string>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [ppctData, setPpctData] = useState<PPCTData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bộ lọc nhanh hiển thị
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'nls' | 'ai'>('all');

  // Modal xem chi tiết / sửa chi tiết một bài học
  const [inspectingItem, setInspectingItem] = useState<PPCTItem | null>(null);

  // Generate PPCT
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const activeDocs =
        selectedDocId === 'all'
          ? sourceDocs
          : sourceDocs.filter((d) => d.id === selectedDocId);

      const res = await generatePPCTWithAI(
        grade,
        schoolYear,
        totalPeriodsRequired,
        additionalRequirements,
        activeDocs,
        settings,
        guidancePreset,
        textbookSeries
      );
      setPpctData(res);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-calculate allocated periods when editing rows
  const handlePeriodChange = (index: number, val: number) => {
    if (!ppctData) return;
    const newItems = [...ppctData.items];
    newItems[index].periods = Math.max(1, val);
    const sum = newItems.reduce((acc, it) => acc + it.periods, 0);
    const onlineSum = newItems
      .filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended')
      .reduce((acc, it) => acc + it.periods, 0);
    const onlineRatio = sum > 0 ? Number(((onlineSum / sum) * 100).toFixed(1)) : 0;

    setPpctData({
      ...ppctData,
      items: newItems,
      totalPeriodsAllocated: sum,
      totalOnlinePeriods: onlineSum,
      onlineRatioPercent: onlineRatio,
      isOnlineRatioValid: onlineRatio <= (ppctData.maxOnlineRatioPercent || 35),
      isBalanced: sum === ppctData.totalPeriodsRequired,
    });
  };

  const handleRowFieldChange = (
    index: number,
    field: keyof PPCTItem,
    value: any
  ) => {
    if (!ppctData) return;
    const newItems = [...ppctData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Re-calculate if teachingMethod changed
    if (field === 'teachingMethod') {
      const onlineSum = newItems
        .filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended')
        .reduce((acc, it) => acc + it.periods, 0);
      const sum = ppctData.totalPeriodsAllocated;
      const onlineRatio = sum > 0 ? Number(((onlineSum / sum) * 100).toFixed(1)) : 0;
      setPpctData({
        ...ppctData,
        items: newItems,
        totalOnlinePeriods: onlineSum,
        onlineRatioPercent: onlineRatio,
        isOnlineRatioValid: onlineRatio <= (ppctData.maxOnlineRatioPercent || 35),
      });
      return;
    }

    setPpctData({ ...ppctData, items: newItems });
  };

  const handleDeleteRow = (index: number) => {
    if (!ppctData) return;
    const newItems = ppctData.items.filter((_, i) => i !== index);
    newItems.forEach((it, idx) => (it.stt = idx + 1));
    const sum = newItems.reduce((acc, it) => acc + it.periods, 0);
    const onlineSum = newItems
      .filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended')
      .reduce((acc, it) => acc + it.periods, 0);
    const onlineRatio = sum > 0 ? Number(((onlineSum / sum) * 100).toFixed(1)) : 0;

    setPpctData({
      ...ppctData,
      items: newItems,
      totalPeriodsAllocated: sum,
      totalOnlinePeriods: onlineSum,
      onlineRatioPercent: onlineRatio,
      isOnlineRatioValid: onlineRatio <= (ppctData.maxOnlineRatioPercent || 35),
      isBalanced: sum === ppctData.totalPeriodsRequired,
    });
  };

  const handleAddRow = () => {
    if (!ppctData) return;
    const nextStt = ppctData.items.length + 1;
    const newItem: PPCTItem = {
      stt: nextStt,
      lessonCode: `[PPCT-KHTN${ppctData.grade}-DOC-B${String(nextStt).padStart(2, '0')}]`,
      topicOrLesson: 'Bài học bổ sung theo kế hoạch bộ môn',
      content: 'Nội dung kiến thức chuẩn CT GDPT 2018 KHTN',
      periods: 2,
      timeline: `Tuần ${Math.ceil(nextStt / 4)}`,
      digitalCompetenceCodes: ['[NLS.2]', '[NLS.3]'],
      digitalCompetenceDetail: 'Thực hành thí nghiệm ảo PhET và xử lý số liệu bằng bảng tính điện tử',
      aiEducationCodes: ['[AI.2]'],
      aiEducationDetail: 'Kỹ năng đặt câu hỏi tra cứu khoa học cho trợ lý AI và kiểm chứng dữ liệu',
      teachingMethod: 'blended',
      onlineContentDetail: 'Học sinh nghiên cứu trước tài liệu mô phỏng trên LMS K12Online trước giờ học trực tiếp',
      onlinePlatform: 'LMS K12Online / PhET Simulations',
      notes: 'Bổ sung bởi tổ chuyên môn',
    };
    const newItems = [...ppctData.items, newItem];
    const sum = newItems.reduce((acc, it) => acc + it.periods, 0);
    const onlineSum = newItems
      .filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended')
      .reduce((acc, it) => acc + it.periods, 0);
    const onlineRatio = sum > 0 ? Number(((onlineSum / sum) * 100).toFixed(1)) : 0;

    setPpctData({
      ...ppctData,
      items: newItems,
      totalPeriodsAllocated: sum,
      totalOnlinePeriods: onlineSum,
      onlineRatioPercent: onlineRatio,
      isOnlineRatioValid: onlineRatio <= (ppctData.maxOnlineRatioPercent || 35),
      isBalanced: sum === ppctData.totalPeriodsRequired,
    });
  };

  const handleCopy = () => {
    if (!ppctData) return;
    const text =
      `KẾ HOẠCH DẠY HỌC MÔN KHOA HỌC TỰ NHIÊN ${ppctData.grade} (NĂM HỌC ${ppctData.schoolYear})\n` +
      `Tổng số tiết: ${ppctData.totalPeriodsAllocated}/${ppctData.totalPeriodsRequired} | Tỷ lệ online: ${ppctData.onlineRatioPercent || 0}%\n\n` +
      ppctData.items
        .map(
          (it) =>
            `${it.stt}. [${it.lessonCode || 'PPCT'}] ${it.topicOrLesson} | ${it.periods} tiết | ${it.timeline} | Hình thức: ${it.teachingMethod} | Online: ${it.onlineContentDetail || 'Không'} | NLS: ${(it.digitalCompetenceCodes || []).join(', ')} | AI: ${(it.aiEducationCodes || []).join(', ')}`
        )
        .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportExcel = () => {
    if (!ppctData) return;
    exportPPCTToExcel(
      ppctData,
      `PPCT_KHTN${ppctData.grade}_${ppctData.schoolYear.replace(/\s+/g, '')}`
    );
  };

  const handleExportDocx = () => {
    if (!ppctData) return;
    exportPPCTToDocx(
      ppctData,
      `PPCT_KHTN${ppctData.grade}_${ppctData.schoolYear.replace(/\s+/g, '')}`
    );
  };

  const handleExportMarkdown = () => {
    if (!ppctData) return;
    const md =
      `# PHÂN PHỐI CHƯƠNG TRÌNH MÔN KHOA HỌC TỰ NHIÊN ${ppctData.grade}\n\n` +
      `- **Năm học**: ${ppctData.schoolYear}\n` +
      `- **Tổng số tiết**: ${ppctData.totalPeriodsAllocated} / ${ppctData.totalPeriodsRequired} tiết\n` +
      `- **Dạy học trực tuyến**: ${ppctData.totalOnlinePeriods || 0} tiết (${ppctData.onlineRatioPercent || 0}%, chuẩn TT 09 <= 35%)\n\n` +
      `| STT | Mã chỉ định | Chủ đề / Bài học | Nội dung kiến thức | Số tiết | Thời gian | Hình thức | Nội dung dạy học Online đã xác định | Năng lực số | Dạy học AI | Ghi chú |\n` +
      `|:---:|:---|:---|:---|:---:|:---|:---:|:---|:---|:---|:---|\n` +
      ppctData.items
        .map(
          (it) =>
            `| ${it.stt} | ${it.lessonCode || ''} | ${it.topicOrLesson} | ${it.content} | ${it.periods} | ${it.timeline} | ${it.teachingMethod} | ${it.onlineContentDetail || '-'} | ${(it.digitalCompetenceCodes || []).join(', ')} | ${(it.aiEducationCodes || []).join(', ')} | ${it.notes || ''} |`
        )
        .join('\n');
    exportMarkdown(md, `PPCT_KHTN${ppctData.grade}`);
  };

  // Filtered items
  const filteredItems = ppctData
    ? ppctData.items.filter((it) => {
        if (filterMode === 'online') {
          return it.teachingMethod === 'online' || it.teachingMethod === 'blended';
        }
        if (filterMode === 'nls') {
          return it.digitalCompetenceCodes && it.digitalCompetenceCodes.length > 0;
        }
        if (filterMode === 'ai') {
          return it.aiEducationCodes && it.aiEducationCodes.length > 0;
        }
        return true;
      })
    : [];

  const onlineItemsCount = ppctData
    ? ppctData.items.filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended').length
    : 0;

  const nlsItemsCount = ppctData
    ? ppctData.items.filter((it) => it.digitalCompetenceCodes && it.digitalCompetenceCodes.length > 0).length
    : 0;

  const aiItemsCount = ppctData
    ? ppctData.items.filter((it) => it.aiEducationCodes && it.aiEducationCodes.length > 0).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              MODULE 1
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              XÂY DỰNG PHÂN PHỐI CHƯƠNG TRÌNH (PPCT)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Tích hợp toàn diện: <strong>Mã hóa chỉ định nguồn</strong>, <strong>Năng lực số (NLS)</strong>, <strong>Dạy học AI</strong>, và <strong>Chỉ rõ nội dung dạy học trực tuyến</strong> (chuẩn Thông tư 09/2021/TT-BGDĐT).
          </p>
        </div>

        {ppctData && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handleExportDocx}
              className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Xuất văn bản Word chuẩn format Thông tư 09 & CV 5512"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải Word (.docx)</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Xuất bảng tính Excel gồm 2 Sheet chi tiết & thống kê"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Markdown</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Parameters Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Khối lớp */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Khối lớp THCS:
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Chuẩn GDPT 2018
              </span>
            </div>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as Grade)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="6">Khoa học tự nhiên 6 (55 bài học SGK)</option>
              <option value="7">Khoa học tự nhiên 7 (42 bài học SGK)</option>
              <option value="8">Khoa học tự nhiên 8 (47 bài học SGK)</option>
              <option value="9">Khoa học tự nhiên 9 (51 bài học SGK)</option>
            </select>
          </div>

          {/* Bộ sách giáo khoa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bộ sách giáo khoa:
            </label>
            <select
              value={textbookSeries}
              onChange={(e) => setTextbookSeries(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="kntt">Kết nối tri thức với cuộc sống (NXB GDVN)</option>
              <option value="canh-dieu">Cánh diều (NXB ĐH Sư phạm)</option>
              <option value="chan-troi">Chân trời sáng tạo (NXB GDVN)</option>
            </select>
          </div>

          {/* Căn cứ hướng dẫn của Sở GD&ĐT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Căn cứ hướng dẫn Sở GD&ĐT:
            </label>
            <select
              value={guidancePreset}
              onChange={(e) => setGuidancePreset(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="so-gd-5512">HD Sở: Tiến trình tuần tự logic SGK (Công văn 5512/BGDĐT)</option>
              <option value="so-gd-140">HD Sở: Chuẩn 140 tiết (HK I: 72 tiết/18 tuần - HK II: 68 tiết/17 tuần)</option>
              <option value="so-gd-parallel">HD Sở: Dạy học song hành các phân môn (Lí - Hóa - Sinh)</option>
              <option value="so-gd-source">HD Sở: Bám sát tài liệu nguồn trích xuất (Source Lock)</option>
            </select>
          </div>

          {/* Năm học */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Năm học áp dụng:
            </label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              placeholder="vd: 2026 - 2027"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tổng số tiết */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tổng số tiết kế hoạch:
            </label>
            <input
              type="number"
              value={totalPeriodsRequired}
              onChange={(e) => setTotalPeriodsRequired(Number(e.target.value))}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tài liệu nguồn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tài liệu nguồn trích xuất:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Tất cả tài liệu trong nguồn ({sourceDocs.length})</option>
              {sourceDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Yêu cầu bổ sung */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Yêu cầu bổ sung chuyên môn (Mã hóa nguồn, Năng lực số, Dạy học AI, Dạy học Online):
          </label>
          <textarea
            rows={2}
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Ví dụ: Chỉ rõ các tiết sử dụng thí nghiệm ảo PhET [NLS.2], ứng dụng trợ lý AI [AI.2] và nhiệm vụ chuẩn bị trên LMS trước giờ học trực tiếp..."
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-600 flex items-center gap-1.5">
            {settings.sourceLock ? (
              <>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                  🔒 SOURCE LOCK = ON
                </span>
                <span>Bám sát 100% mã hóa & nội dung trong tài liệu nguồn</span>
              </>
            ) : (
              <>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold font-mono text-[10px]">
                  🔓 CHUẨN GDPT 2018
                </span>
                <span>Áp dụng khung chương trình KHTN chuẩn Bộ GD&ĐT</span>
              </>
            )}
          </span>
          <button
            id="btn-generate-ppct"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang phân bổ chương trình & tích hợp mã số, AI, Online...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 TẠO PHÂN PHỐI CHƯƠNG TRÌNH</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Thẻ Chỉ số & Kiểm định Chuẩn Quy Định (Thông tư 09/2021 + NLS + AI) */}
      {ppctData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Dạy học trực tuyến theo Thông tư 09/2021/TT-BGDĐT */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dạy học Trực tuyến</h4>
                  <p className="text-[10px] text-slate-500">Thông tư 09/2021/TT-BGDĐT</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                  ppctData.isOnlineRatioValid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                }`}
              >
                {ppctData.onlineRatioPercent || 0}% / Tối đa 35%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  ppctData.isOnlineRatioValid ? 'bg-sky-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, ((ppctData.onlineRatioPercent || 0) / 35) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>
                Tổng: <strong>{ppctData.totalOnlinePeriods || 0} tiết</strong> trực tuyến & kết hợp
              </span>
              <span className={ppctData.isOnlineRatioValid ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'}>
                {ppctData.isOnlineRatioValid ? '✅ Đạt chuẩn THCS' : '⚠️ Vượt trần 35%'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Đã xác định rõ nhiệm vụ chuẩn bị trên LMS, bài học số và kiểm tra trực tuyến trong từng tiết.
            </p>
          </div>

          {/* Card 2: Năng lực số (NLS) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Khung Năng Lực Số</h4>
                  <p className="text-[10px] text-slate-500">Mã hóa chỉ định [NLS.1] - [NLS.5]</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-teal-100 text-teal-800 border border-teal-300">
                {nlsItemsCount} bài học
              </span>
            </div>

            <div className="flex flex-wrap gap-1 pt-0.5">
              {ppctData.digitalCompetenceSummary &&
                ppctData.digitalCompetenceSummary.map((std, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-semibold"
                    title={std.label}
                  >
                    <strong>{std.code}</strong>: {std.count}t
                  </span>
                ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Tích hợp thí nghiệm ảo PhET, xử lý bảng tính Excel, mô hình 3D nguyên tử và hợp tác số.
            </p>
          </div>

          {/* Card 3: Dạy học AI (AI-Edu) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dạy học Trí tuệ nhân tạo</h4>
                  <p className="text-[10px] text-slate-500">Mã hóa chỉ định [AI.1] - [AI.4]</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-100 text-purple-800 border border-purple-300">
                {aiItemsCount} bài học
              </span>
            </div>

            <div className="flex flex-wrap gap-1 pt-0.5">
              {ppctData.aiEducationSummary &&
                ppctData.aiEducationSummary.map((ai, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-semibold"
                    title={ai.label}
                  >
                    <strong>{ai.code}</strong>: {ai.count}t
                  </span>
                ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Thị giác AI nhận diện sinh vật, trợ lý AI tra cứu & Prompting, phân tích dữ liệu và đạo đức AI.
            </p>
          </div>
        </div>
      )}

      {/* Balance Notification Banner */}
      {ppctData && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            ppctData.isBalanced
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {ppctData.isBalanced ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  ✅ <strong>PPCT ĐÃ CÂN ĐỐI HOÀN TOÀN:</strong> Tổng số tiết hiện tại{' '}
                  <strong className="underline">{ppctData.totalPeriodsAllocated} tiết</strong> / Yêu cầu{' '}
                  <strong>{ppctData.totalPeriodsRequired} tiết</strong>. Đã mã hóa chỉ định đầy đủ cho từng bài học.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  ⚠️ <strong>PPCT CHƯA CÂN ĐỐI:</strong> Tổng số tiết hiện tại là{' '}
                  <strong className="text-rose-700">{ppctData.totalPeriodsAllocated} tiết</strong> / Yêu cầu là{' '}
                  <strong>{ppctData.totalPeriodsRequired} tiết</strong>. Vui lòng điều chỉnh số tiết!
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-white border border-slate-300 shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1 shrink-0"
            >
              {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isEditing ? 'Lưu chỉnh sửa' : 'Bật chế độ sửa nhanh'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      {ppctData && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-xs font-bold text-slate-700 mr-1">Bộ lọc xem:</span>

            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({ppctData.items.length})
            </button>

            <button
              onClick={() => setFilterMode('online')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                filterMode === 'online'
                  ? 'bg-sky-700 text-white'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              Tiết Online / Kết hợp ({onlineItemsCount})
            </button>

            <button
              onClick={() => setFilterMode('nls')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                filterMode === 'nls'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              <Binary className="w-3 h-3" />
              Năng lực số ({nlsItemsCount})
            </button>

            <button
              onClick={() => setFilterMode('ai')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                filterMode === 'ai'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Bot className="w-3 h-3" />
              Dạy học AI ({aiItemsCount})
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Hiển thị <strong>{filteredItems.length}</strong> / {ppctData.items.length} bài học
          </div>
        </div>
      )}

      {/* Main PPCT Table */}
      {ppctData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                KHUNG PHÂN PHỐI CHƯƠNG TRÌNH KHTN {ppctData.grade} - NĂM HỌC {ppctData.schoolYear}
              </h3>
              <p className="text-[11px] text-slate-500">
                Cột nội dung dạy học trực tuyến đã xác định, mã năng lực số và dạy học AI theo chuẩn quy định.
              </p>
            </div>

            {isEditing && (
              <button
                onClick={handleAddRow}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold flex items-center gap-1 hover:bg-emerald-700 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng bài học
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-2.5 py-3 w-10 text-center">STT</th>
                  <th className="px-2.5 py-3 w-28">Mã chỉ định</th>
                  <th className="px-3 py-3 w-44">Chủ đề / Bài học SGK</th>
                  <th className="px-3 py-3 min-w-[160px]">Nội dung dạy học chủ yếu</th>
                  <th className="px-2 py-3 w-14 text-center">Số tiết</th>
                  <th className="px-2 py-3 w-20 text-center">Tiết thứ</th>
                  <th className="px-2.5 py-3 w-28">Thời điểm</th>
                  <th className="px-3 py-3 min-w-[160px]">Thiết bị & Địa điểm</th>
                  <th className="px-2.5 py-3 w-24 text-center">Hình thức</th>
                  <th className="px-3 py-3 min-w-[180px]">Nội dung dạy học Online đã xác định</th>
                  <th className="px-2.5 py-3 w-36">Năng lực số (NLS) & AI</th>
                  <th className="px-2.5 py-3 w-24">Căn cứ / Ghi chú</th>
                  <th className="px-2 py-3 w-16 text-center">Chi tiết</th>
                  {isEditing && <th className="px-2 py-3 w-10 text-center">Xóa</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => {
                  const originalIdx = ppctData.items.findIndex((it) => it.stt === item.stt);
                  const isOnline = item.teachingMethod === 'online';
                  const isBlended = item.teachingMethod === 'blended';

                  return (
                    <tr
                      key={item.stt}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* STT */}
                      <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-500">
                        {item.stt}
                      </td>

                      {/* Mã chỉ định PPCT */}
                      <td className="px-2.5 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.lessonCode || ''}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'lessonCode', e.target.value)}
                            className="w-full p-1 border rounded text-[11px] font-mono font-bold text-blue-900 bg-white"
                          />
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold tracking-tight inline-block">
                            {item.lessonCode || `[PPCT-${item.stt}]`}
                          </span>
                        )}
                      </td>

                      {/* Chủ đề / Bài học */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.topicOrLesson}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'topicOrLesson', e.target.value)}
                            className="w-full p-1 border rounded text-xs font-semibold bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-900 leading-snug block">
                            {item.topicOrLesson}
                          </span>
                        )}
                      </td>

                      {/* Nội dung dạy học chủ yếu */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.content}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'content', e.target.value)}
                            className="w-full p-1 border rounded text-xs bg-white"
                          />
                        ) : (
                          <span className="text-slate-600 line-clamp-2 leading-relaxed" title={item.content}>
                            {item.content}
                          </span>
                        )}
                      </td>

                      {/* Số tiết */}
                      <td className="px-2.5 py-2.5 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.periods}
                            onChange={(e) => handlePeriodChange(originalIdx, Number(e.target.value))}
                            className="w-12 p-1 border rounded text-center text-xs font-bold bg-white mx-auto"
                          />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800 font-mono text-xs">
                            {item.periods}
                          </span>
                        )}
                      </td>

                      {/* Tiết thứ */}
                      <td className="px-2 py-2.5 text-center font-mono text-[11px] font-bold text-slate-700 bg-slate-50/50">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.periodIndex || ''}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'periodIndex', e.target.value)}
                            className="w-16 p-1 border rounded text-center text-xs font-mono font-bold bg-white mx-auto"
                          />
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-800">
                            {item.periodIndex || `${item.stt}`}
                          </span>
                        )}
                      </td>

                      {/* Thời gian thực hiện */}
                      <td className="px-2.5 py-2.5 text-slate-600 text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.timeline}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'timeline', e.target.value)}
                            className="w-full p-1 border rounded text-xs bg-white"
                          />
                        ) : (
                          <span>{item.timeline}</span>
                        )}
                      </td>

                      {/* Thiết bị dạy học & Địa điểm */}
                      <td className="px-3 py-2.5 text-[11px] text-slate-600">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={item.equipmentAndMaterials || ''}
                              onChange={(e) => handleRowFieldChange(originalIdx, 'equipmentAndMaterials', e.target.value)}
                              placeholder="Thiết bị dạy học..."
                              className="w-full p-1 border rounded text-[11px] bg-white"
                            />
                            <input
                              type="text"
                              value={item.location || ''}
                              onChange={(e) => handleRowFieldChange(originalIdx, 'location', e.target.value)}
                              placeholder="Địa điểm dạy..."
                              className="w-full p-1 border rounded text-[11px] bg-white"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            {item.location && (
                              <div className="flex items-center gap-1 font-semibold text-slate-800">
                                <span className="text-[10px]">📍</span>
                                <span>{item.location}</span>
                              </div>
                            )}
                            <div className="text-slate-500 line-clamp-2" title={item.equipmentAndMaterials}>
                              <span className="text-[10px]">🔬</span> {item.equipmentAndMaterials || 'Theo danh mục thiết bị tối thiểu'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Hình thức dạy học */}
                      <td className="px-2.5 py-2.5 text-center">
                        {isEditing ? (
                          <select
                            value={item.teachingMethod || 'direct'}
                            onChange={(e) =>
                              handleRowFieldChange(originalIdx, 'teachingMethod', e.target.value as TeachingMethod)
                            }
                            className="w-full p-1 border rounded text-[11px] font-bold bg-white"
                          >
                            <option value="direct">Trực tiếp [TT]</option>
                            <option value="online">Trực tuyến [ONLINE]</option>
                            <option value="blended">Kết hợp [KẾT HỢP]</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                              isOnline
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isBlended
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {isOnline ? '🌐 [ONLINE]' : isBlended ? '⚡ [KẾT HỢP]' : '🏫 [TT]'}
                          </span>
                        )}
                      </td>

                      {/* Chỉ rõ nội dung dạy học Online đã xác định */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={item.onlineContentDetail || ''}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'onlineContentDetail', e.target.value)}
                            className="w-full p-1 border rounded text-xs bg-white text-slate-800"
                            placeholder="Chỉ rõ nhiệm vụ LMS, video bài giảng, phần mềm mô phỏng..."
                          />
                        ) : (
                          <div className="space-y-1">
                            {isOnline || isBlended ? (
                              <div className="p-1.5 rounded-md bg-sky-50 border border-sky-100 text-[11px] text-sky-900 leading-snug">
                                <strong>Nhiệm vụ trực tuyến:</strong> {item.onlineContentDetail}
                                {item.onlinePlatform && (
                                  <div className="mt-1 flex items-center gap-1 text-[10px] text-sky-700 font-mono">
                                    <span>Nền tảng: {item.onlinePlatform}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Trực tiếp tại phòng học bộ môn KHTN
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Năng lực số & AI */}
                      <td className="px-2.5 py-2.5">
                        <div className="space-y-1">
                          {/* NLS Badges */}
                          {item.digitalCompetenceCodes && item.digitalCompetenceCodes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.digitalCompetenceCodes.map((code, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-mono font-bold"
                                  title={item.digitalCompetenceDetail}
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* AI Badges */}
                          {item.aiEducationCodes && item.aiEducationCodes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.aiEducationCodes.map((code, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold"
                                  title={item.aiEducationDetail}
                                >
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Ghi chú / Nguồn */}
                      <td className="px-2.5 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleRowFieldChange(originalIdx, 'notes', e.target.value)}
                            className="w-full p-1 border rounded text-xs bg-white"
                          />
                        ) : (
                          <span className="text-slate-500 italic text-[11px] block truncate max-w-[120px]" title={item.notes || item.sourceRef}>
                            {item.notes || item.sourceRef}
                          </span>
                        )}
                      </td>

                      {/* Xem chi tiết */}
                      <td className="px-2 py-2.5 text-center">
                        <button
                          onClick={() => setInspectingItem(item)}
                          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Xem phân tích chi tiết bài học này"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Xóa dòng khi sửa */}
                      {isEditing && (
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(originalIdx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-right text-xs uppercase tracking-wider">
                    TỔNG SỐ TIẾT ĐÃ PHÂN BỔ:
                  </td>
                  <td className="px-2.5 py-3 text-center text-sm font-mono text-emerald-700 font-bold">
                    {ppctData.totalPeriodsAllocated}
                  </td>
                  <td colSpan={3} className="px-3 py-3 text-slate-600 text-xs">
                    (Yêu cầu: {ppctData.totalPeriodsRequired} tiết -{' '}
                    {ppctData.isBalanced ? 'Khớp 100%' : 'Chưa khớp'})
                  </td>
                  <td colSpan={isEditing ? 6 : 5} className="px-3 py-3 text-slate-700 text-xs">
                    <span>
                      Dạy học trực tuyến: <strong>{ppctData.totalOnlinePeriods || 0} tiết</strong> (
                      <strong className={ppctData.isOnlineRatioValid ? 'text-emerald-700' : 'text-rose-700'}>
                        {ppctData.onlineRatioPercent || 0}%
                      </strong>{' '}
                      - Chuẩn TT 09: ≤ 35%)
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Inspector: Chi tiết Bài học, Năng lực số, Dạy học AI & Dạy học Online */}
      {inspectingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                  {inspectingItem.lessonCode || `PPCT-${inspectingItem.stt}`}
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  {inspectingItem.topicOrLesson}
                </h3>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Thẻ tóm tắt thông số */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Số tiết:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {inspectingItem.periods} tiết
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Tiết thứ:</span>
                  <span className="text-sm font-bold text-blue-700 font-mono">
                    Tiết {inspectingItem.periodIndex || inspectingItem.stt}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Thời điểm thực hiện:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {inspectingItem.timeline}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Địa điểm dạy học:</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>📍</span> {inspectingItem.location || 'Phòng học bộ môn KHTN / Lớp học'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Hình thức tổ chức:</span>
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    {inspectingItem.teachingMethod === 'online'
                      ? 'Trực tuyến [ONLINE]'
                      : inspectingItem.teachingMethod === 'blended'
                      ? 'Kết hợp [KẾT HỢP]'
                      : 'Trực tiếp [TT]'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Căn cứ chuyên môn:</span>
                  <span className="text-xs text-slate-700 truncate block font-medium" title={inspectingItem.departmentGuidanceRef || inspectingItem.notes || ''}>
                    {inspectingItem.departmentGuidanceRef || inspectingItem.notes || 'Công văn 5512/BGDĐT'}
                  </span>
                </div>
              </div>

              {/* Thiết bị dạy học và học liệu số */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <span className="text-sm">🔬</span>
                  Thiết bị dạy học và học liệu số (Danh mục thiết bị tối thiểu):
                </h4>
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-amber-950 text-xs leading-relaxed">
                  <p><strong>Thiết bị / Dụng cụ / Mẫu vật:</strong> {inspectingItem.equipmentAndMaterials || 'Theo danh mục thiết bị dạy học tối thiểu môn Khoa học tự nhiên của Bộ GD&ĐT'}</p>
                  <p className="mt-1 text-[11px] text-amber-800">Địa điểm tổ chức: <strong>{inspectingItem.location || 'Phòng học bộ môn KHTN / Lớp học'}</strong></p>
                </div>
              </div>

              {/* 1. Nội dung dạy học chủ yếu */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  1. Nội dung dạy học chủ yếu theo PPCT:
                </h4>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {inspectingItem.content}
                </p>
              </div>

              {/* 2. Chỉ rõ nội dung dạy học Online */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  2. Nội dung dạy học trực tuyến đã xác định trong PPCT:
                </h4>
                <div className="bg-sky-50 p-3.5 rounded-lg border border-sky-200 text-sky-950 space-y-2">
                  <p className="leading-relaxed">
                    <strong>Nhiệm vụ trực tuyến:</strong> {inspectingItem.onlineContentDetail || 'Không tổ chức trực tuyến (Dạy học trực tiếp tại phòng học bộ môn)'}
                  </p>
                  {inspectingItem.onlinePlatform && (
                    <div className="flex items-center gap-2 text-[11px] text-sky-800 font-medium">
                      <span>• Nền tảng thực hiện:</span>
                      <span className="font-mono font-bold">{inspectingItem.onlinePlatform}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-sky-700 italic border-t border-sky-200 pt-1.5">
                    Căn cứ Thông tư 09/2021/TT-BGDĐT: Đảm bảo thời lượng, học liệu số và hình thức kiểm tra đánh giá quá trình.
                  </p>
                </div>
              </div>

              {/* 3. Tích hợp Năng lực số (NLS) */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Binary className="w-3.5 h-3.5 text-teal-600" />
                  3. Năng lực số tích hợp & Tiêu chí thực hiện:
                </h4>
                <div className="bg-teal-50 p-3.5 rounded-lg border border-teal-200 text-teal-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Mã chỉ định NLS:</span>
                    {inspectingItem.digitalCompetenceCodes && inspectingItem.digitalCompetenceCodes.length > 0 ? (
                      inspectingItem.digitalCompetenceCodes.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-mono font-bold">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-teal-700">Chưa chỉ định</span>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    <strong>Mô tả hoạt động số của học sinh:</strong>{' '}
                    {inspectingItem.digitalCompetenceDetail || 'Khai thác học liệu số, mô phỏng hiện tượng và xử lý số liệu.'}
                  </p>
                </div>
              </div>

              {/* 4. Tích hợp Dạy học AI */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  4. Nội dung giáo dục Trí tuệ nhân tạo (AI):
                </h4>
                <div className="bg-purple-50 p-3.5 rounded-lg border border-purple-200 text-purple-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Mã chỉ định AI:</span>
                    {inspectingItem.aiEducationCodes && inspectingItem.aiEducationCodes.length > 0 ? (
                      inspectingItem.aiEducationCodes.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-mono font-bold">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-purple-700">Chưa chỉ định</span>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    <strong>Nội dung tiếp cận AI:</strong>{' '}
                    {inspectingItem.aiEducationDetail || 'Ứng dụng AI mô hình hóa hiện tượng và giáo dục văn hóa sử dụng công nghệ liêm chính.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/80">
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
