import React, { useState } from 'react';
import {
  FileCheck,
  Sparkles,
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  Users,
  Clock,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Grade, WorksheetData, SourceDocument, SourceLockSettings } from '../../types';
import { generateWorksheetWithAI } from '../../services/aiService';
import { exportMarkdown, printElementToPDF } from '../../services/exportService';
import { getAvailableLessonsFromSourcesAndCurriculum } from '../../data/curriculumKHTN';

interface WorksheetModuleProps {
  currentGrade: Grade;
  sourceDocs: SourceDocument[];
  settings: SourceLockSettings;
}

export const WorksheetModule: React.FC<WorksheetModuleProps> = ({
  currentGrade,
  sourceDocs,
  settings,
}) => {
  const [grade, setGrade] = useState<Grade>(currentGrade);
  const [lessonName, setLessonName] = useState('Bài 8: Tốc độ chuyển động');
  const [durationPeriods, setDurationPeriods] = useState<number>(2);
  const [appliedPeriod, setAppliedPeriod] = useState<string>('Toàn bộ bài học');
  const [targetStudents, setTargetStudents] = useState<'all' | 'advanced' | 'support'>('all');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');

  const lessonData = React.useMemo(() => {
    return getAvailableLessonsFromSourcesAndCurriculum(grade, sourceDocs, selectedDocId);
  }, [grade, sourceDocs, selectedDocId]);

  const [isLoading, setIsLoading] = useState(false);
  const [worksheet, setWorksheet] = useState<WorksheetData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGradeChange = (newGrade: Grade) => {
    setGrade(newGrade);
    const available = getAvailableLessonsFromSourcesAndCurriculum(newGrade, sourceDocs, selectedDocId);
    if (available.hasSourceLessons && available.sourceLessons.length > 0) {
      setLessonName(available.sourceLessons[0].lesson);
      if (available.sourceLessons[0].periods) {
        setDurationPeriods(available.sourceLessons[0].periods);
      }
    } else if (available.curriculumLessons.length > 0) {
      setLessonName(available.curriculumLessons[0].lesson);
      if (available.curriculumLessons[0].periods) {
        setDurationPeriods(available.curriculumLessons[0].periods);
      }
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const activeDocs =
        selectedDocId === 'all'
          ? sourceDocs
          : sourceDocs.filter((d) => d.id === selectedDocId);

      const res = await generateWorksheetWithAI(
        grade,
        lessonName,
        targetStudents,
        durationMinutes,
        activeDocs,
        settings,
        durationPeriods,
        appliedPeriod
      );
      setWorksheet(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!worksheet) return;
    const text = `${worksheet.title}\nThời lượng bài học: ${worksheet.durationPeriods || durationPeriods} tiết | Phạm vi: ${worksheet.appliedPeriod || appliedPeriod} | Thời gian: ${worksheet.durationMinutes} phút | Đối tượng: ${worksheet.targetStudents}\n\n` +
      `MỤC TIÊU CỐT LÕI:\n${worksheet.coreObjectives.map((o) => '- ' + o).join('\n')}\n\n` +
      `CÁC NHIỆM VỤ HỌC TẬP:\n` +
      worksheet.tasks
        .map(
          (t, i) =>
            `Câu ${i + 1} (${t.score} điểm) [Dạng: ${t.type}]: ${t.stem}\n${t.options ? t.options.join('\n') : ''}\nKhu vực trả lời: ${t.answerArea}\n-> Gợi ý đáp án: ${t.suggestedAnswer}`
        )
        .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    if (!worksheet) return;
    printElementToPDF('printable-worksheet', worksheet.title);
  };

  const handleDownloadMarkdown = () => {
    if (!worksheet) return;
    const md = `# ${worksheet.title}\n\n` +
      `**Khối lớp:** KHTN ${worksheet.grade} | **Thời lượng bài học:** ${worksheet.durationPeriods || durationPeriods} tiết | **Phạm vi:** ${worksheet.appliedPeriod || appliedPeriod} | **Thời gian làm bài:** ${worksheet.durationMinutes} phút\n\n` +
      `### I. MỤC TIÊU BÀI HỌC\n${worksheet.coreObjectives.map((o) => `- ${o}`).join('\n')}\n\n` +
      `### II. NHIỆM VỤ HỌC TẬP\n\n` +
      worksheet.tasks
        .map(
          (t, idx) =>
            `#### Nhiệm vụ ${idx + 1} (${t.score}đ) - ${t.instruction}\n` +
            `**${t.stem}**\n\n` +
            (t.options ? t.options.map((opt) => `- ${opt}`).join('\n') + '\n\n' : '') +
            (t.matchingPairs
              ? t.matchingPairs.map((p) => `* ${p.left}  <----->  ${p.right}`).join('\n') + '\n\n'
              : '') +
            `*Khung làm bài:* \`[ ${t.answerArea} ]\`\n\n` +
            `> **Đáp án giáo viên:** ${t.suggestedAnswer}\n`
        )
        .join('\n---\n');
    exportMarkdown(md, `PhieuHocTap_KHTN${worksheet.grade}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800 text-xs font-bold font-mono">
              MODULE 3
            </span>
            <h2 className="text-xl font-bold text-slate-900">TẠO PHIẾU HỌC TẬP ĐA DẠNG</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thiết kế phiếu học tập cá nhân hóa, đa dạng hình thức (Trắc nghiệm, Đúng/Sai, Điền khuyết, Nối cột, Tự luận) kèm biểu điểm.
          </p>
        </div>

        {worksheet && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              <span>In Phiếu / Xuất PDF</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải Markdown</span>
            </button>
          </div>
        )}
      </div>

      {/* Inputs (Section XII) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Khối lớp THCS:
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(e.target.value as Grade)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="6">Khoa học tự nhiên 6</option>
              <option value="7">Khoa học tự nhiên 7</option>
              <option value="8">Khoa học tự nhiên 8</option>
              <option value="9">Khoa học tự nhiên 9</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số tiết bài học (PPCT):
            </label>
            <select
              value={durationPeriods}
              onChange={(e) => setDurationPeriods(Number(e.target.value))}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value={1}>1 tiết</option>
              <option value={2}>2 tiết (tiêu chuẩn)</option>
              <option value={3}>3 tiết</option>
              <option value={4}>4 tiết</option>
              <option value={5}>5 tiết</option>
              <option value={6}>6 tiết</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phạm vi áp dụng phiếu:
            </label>
            <select
              value={appliedPeriod}
              onChange={(e) => setAppliedPeriod(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Toàn bộ bài học">Toàn bộ bài học ({durationPeriods} tiết)</option>
              <option value="Tiết 1: Khám phá lý thuyết & Khái niệm mới">Tiết 1: Khám phá lý thuyết & Khái niệm mới</option>
              {durationPeriods >= 2 && (
                <option value="Tiết 2: Thực hành thí nghiệm & Khảo sát số liệu">Tiết 2: Thực hành thí nghiệm & Khảo sát số liệu</option>
              )}
              {durationPeriods >= 3 && (
                <option value="Tiết 3: Luyện tập & Vận dụng nâng cao">Tiết 3: Luyện tập & Vận dụng nâng cao</option>
              )}
              {durationPeriods >= 4 && (
                <option value="Tiết 4: Báo cáo dự án STEM & Tổng kết">Tiết 4: Báo cáo dự án STEM & Tổng kết</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thời gian làm bài:
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value={10}>10 phút (Khởi động / Củng cố nhanh)</option>
              <option value={15}>15 phút (Hoạt động nhóm)</option>
              <option value={45}>45 phút (Phiếu học tập cả tiết)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-2 space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn bài chuẩn theo PPCT GDPT 2018:
                </label>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  {lessonData.hasSourceLessons ? 'Ưu tiên PPCT nguồn' : 'SGK Kết nối tri thức'}
                </span>
              </div>
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val.startsWith('SRC::')) {
                    const item = lessonData.sourceLessons.find((l) => l.id === val.replace('SRC::', ''));
                    if (item) {
                      setLessonName(item.lesson);
                      if (item.periods) setDurationPeriods(item.periods);
                      if (item.sourceDocId && selectedDocId !== item.sourceDocId) {
                        setSelectedDocId(item.sourceDocId);
                      }
                    }
                  } else if (val.startsWith('CURR::')) {
                    const item = lessonData.curriculumLessons.find((l) => l.id === val.replace('CURR::', ''));
                    if (item) {
                      setLessonName(item.lesson);
                      if (item.periods) setDurationPeriods(item.periods);
                    }
                  } else {
                    setLessonName(val);
                  }
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none truncate font-medium text-slate-800"
              >
                <option value="">
                  {lessonData.hasSourceLessons
                    ? `-- Chọn bài: ${lessonData.sourceLessons.length} bài PPCT Nguồn hoặc SGK Kết nối tri thức --`
                    : `-- Chọn bài học chuẩn SGK Kết nối tri thức (KHTN ${grade}) --`}
                </option>
                {lessonData.hasSourceLessons && (
                  <optgroup label="🌟 BÀI HỌC THEO PPCT TRONG TÀI LIỆU NGUỒN">
                    {lessonData.sourceLessons.map((item) => (
                      <option key={item.id} value={`SRC::${item.id}`}>
                        📄 [{item.sourceDocName?.slice(0, 16)}...] {item.lesson} ({item.periods || 2} tiết)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={`📚 BỘ SGK CHUẨN: KẾT NỐI TRI THỨC VỚI CUỘC SỐNG (KHTN ${grade})`}>
                  {lessonData.curriculumLessons.map((item) => (
                    <option key={item.id} value={`CURR::${item.id}`}>
                      [{item.strand.slice(0, 12)}...] {item.lesson} ({item.periods || 2} tiết)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài học / Chủ đề (tùy chỉnh):
              </label>
              <input
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đối tượng học sinh:
            </label>
            <select
              value={targetStudents}
              onChange={(e) => setTargetStudents(e.target.value as any)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">Tất cả học sinh (Đại trà)</option>
              <option value="advanced">Học sinh Khá, Giỏi (Nâng cao)</option>
              <option value="support">Học sinh cần hỗ trợ (Củng cố)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tài liệu nguồn trích xuất:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">Tất cả tài liệu đã nạp ({sourceDocs.length})</option>
              {sourceDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {settings.sourceLock ? '🔒 Source Lock = ON: Bám sát tài liệu nguồn' : '🔓 Source Lock = OFF'}
          </span>
          <button
            id="btn-generate-worksheet"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang thiết kế phiếu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 TẠO PHIẾU HỌC TẬP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Worksheet View (Section XII) */}
      {worksheet && (
        <div
          id="printable-worksheet"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-slate-800"
        >
          {/* Header Box */}
          <div className="border-2 border-purple-900/40 rounded-lg p-4 text-center space-y-2 bg-purple-50/20">
            <h2 className="text-lg sm:text-xl font-bold text-purple-950 uppercase tracking-tight">
              {worksheet.title}
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-medium text-slate-600">
              <span>Môn: KHOA HỌC TỰ NHIÊN {worksheet.grade}</span>
              <span>•</span>
              <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                Thời lượng: {worksheet.durationPeriods || durationPeriods} tiết
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {worksheet.appliedPeriod || appliedPeriod}
              </span>
              <span>•</span>
              <span>Thời gian làm bài: {worksheet.durationMinutes} phút</span>
              <span>•</span>
              <span>Họ và tên: ................................................... Lớp: .............</span>
            </div>
          </div>

          {/* Objectives */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-1">
              🎯 MỤC TIÊU CẦN ĐẠT CỦA PHIẾU:
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              {worksheet.coreObjectives.map((o, idx) => (
                <li key={idx}>{o}</li>
              ))}
            </ul>
          </div>

          {/* Task Items */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-purple-900 uppercase tracking-wider border-b pb-2">
              NHIỆM VỤ HỌC TẬP ({worksheet.tasks.length} PHẦN BÀI TẬP)
            </h3>

            {worksheet.tasks.map((task, idx) => (
              <div
                key={task.id}
                className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                    Nhiệm vụ {idx + 1} ({task.score} điểm) - {task.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 italic">{task.instruction}</span>
                </div>

                <p className="text-xs font-semibold text-slate-800">{task.stem}</p>

                {/* Multiple choice options */}
                {task.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pl-3">
                    {task.options.map((opt, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-50 border border-slate-200">
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {/* Matching pairs */}
                {task.matchingPairs && (
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-3 rounded-md border">
                    <div>
                      <span className="font-bold block mb-1">CỘT A (Đại lượng):</span>
                      {task.matchingPairs.map((p, i) => (
                        <div key={i} className="py-1">
                          {p.left}
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="font-bold block mb-1">CỘT B (Đơn vị / Dụng cụ):</span>
                      {task.matchingPairs.map((p, i) => (
                        <div key={i} className="py-1">
                          {p.right}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student Answer Area */}
                <div className="p-3 bg-amber-50/40 rounded border border-dashed border-amber-300 text-xs text-slate-600">
                  <span className="font-bold text-amber-900 block mb-1">✏️ Phần trả lời của học sinh:</span>
                  <div className="font-mono text-slate-700 italic">{task.answerArea}</div>
                </div>

                {/* Teacher suggested answer */}
                <details className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                  <summary className="font-bold cursor-pointer hover:underline">
                    Xem hướng dẫn chấm / Đáp án chuẩn của GV
                  </summary>
                  <p className="mt-1 font-medium">{task.suggestedAnswer}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
