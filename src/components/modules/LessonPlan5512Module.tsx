import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Edit3,
  Save,
  Printer,
  FileText,
  Target,
  BookOpen,
  Layers,
  Clock,
  Columns,
  Table as TableIcon,
  List,
  Calendar,
  ChevronRight,
  Info,
  Globe,
  Bot,
  Binary,
} from 'lucide-react';
import {
  Grade,
  LessonPlan5512Data,
  SourceDocument,
  SourceLockSettings,
  PeriodLessonPlan,
  LessonActivityItem,
} from '../../types';
import { generateLessonPlan5512WithAI } from '../../services/aiService';
import {
  exportLessonPlanToDocx,
  exportMarkdown,
  printElementToPDF,
} from '../../services/exportService';
import {
  KHTN_CURRICULUM,
  getAvailableLessonsFromSourcesAndCurriculum,
  STANDARD_TEXTBOOK_NAME,
  STANDARD_TEXTBOOK_SERIES,
} from '../../data/curriculumKHTN';

interface LessonPlan5512ModuleProps {
  currentGrade: Grade;
  sourceDocs: SourceDocument[];
  settings: SourceLockSettings;
}

export const LessonPlan5512Module: React.FC<LessonPlan5512ModuleProps> = ({
  currentGrade,
  sourceDocs,
  settings,
}) => {
  const [grade, setGrade] = useState<Grade>(currentGrade);
  const [lessonTitle, setLessonTitle] = useState('Bài 8: Tốc độ chuyển động và ứng dụng');
  const [durationPeriods, setDurationPeriods] = useState<number>(2);
  const [teacherPrompt, setTeacherPrompt] = useState(
    'Thiết kế bài dạy tích hợp thí nghiệm đo tốc độ bằng cổng quang điện; phân chia rõ các tiết theo PPCT và tổ chức thực hiện dạng bảng 2 cột.'
  );
  const [selectedDocId, setSelectedDocId] = useState<string>('all');

  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan5512Data | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'two-column' | 'sequential'>('two-column');

  // Load lessons: Priority from uploaded source PPCT documents + Standard KNTT curriculum
  const lessonData = React.useMemo(() => {
    return getAvailableLessonsFromSourcesAndCurriculum(grade, sourceDocs, selectedDocId);
  }, [grade, sourceDocs, selectedDocId]);

  // Sync current grade change
  useEffect(() => {
    if (grade !== currentGrade) {
      setGrade(currentGrade);
    }
  }, [currentGrade]);

  // When grade changes or lesson data is loaded, ensure lessonTitle and periods belong to the active grade
  useEffect(() => {
    const allAvailable = [
      ...lessonData.sourceLessons.map((l) => ({ lesson: l.lesson, periods: l.periods })),
      ...lessonData.curriculumLessons.map((l) => ({ lesson: l.lesson, periods: l.periods })),
    ];
    const match = allAvailable.find(
      (item) => item.lesson.toLowerCase() === lessonTitle.toLowerCase()
    );
    if (!match && allAvailable.length > 0) {
      const first = allAvailable[0];
      setLessonTitle(first.lesson);
      if (first.periods) {
        setDurationPeriods(first.periods);
      }
    }
  }, [grade, lessonData]);

  const handleSelectLessonOption = (selectedKey: string) => {
    if (!selectedKey) return;
    if (selectedKey.startsWith('SRC::')) {
      const srcId = selectedKey.replace('SRC::', '');
      const found = lessonData.sourceLessons.find((l) => l.id === srcId);
      if (found) {
        setLessonTitle(found.lesson);
        if (found.periods) {
          setDurationPeriods(found.periods);
        }
        if (found.sourceDocId && selectedDocId !== found.sourceDocId) {
          setSelectedDocId(found.sourceDocId);
        }
        if (found.ppctCode && !teacherPrompt.includes(found.ppctCode)) {
          setTeacherPrompt((prev) =>
            prev
              ? `${prev}\nÁp dụng mã chỉ định PPCT nguồn: ${found.ppctCode}`
              : `Áp dụng mã chỉ định PPCT nguồn: ${found.ppctCode}`
          );
        }
      }
    } else if (selectedKey.startsWith('CURR::')) {
      const currId = selectedKey.replace('CURR::', '');
      const found = lessonData.curriculumLessons.find((l) => l.id === currId);
      if (found) {
        setLessonTitle(found.lesson);
        setDurationPeriods(found.periods);
      }
    } else {
      setLessonTitle(selectedKey);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const activeDocs =
        selectedDocId === 'all'
          ? sourceDocs
          : sourceDocs.filter((d) => d.id === selectedDocId);

      const res = await generateLessonPlan5512WithAI(
        grade,
        lessonTitle,
        durationPeriods,
        teacherPrompt,
        activeDocs,
        settings
      );
      setLessonPlan(res);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!lessonPlan) return;

    const periodsData =
      lessonPlan.periods && lessonPlan.periods.length > 0
        ? lessonPlan.periods
        : [
            {
              periodNumber: 1,
              ppctPeriodIndex: 1,
              ppctMainContent: lessonPlan.lessonTitle,
              activities: lessonPlan.activities,
            },
          ];

    let text =
      `KẾ HOẠCH BÀI DẠY (THEO CÔNG VĂN 5512/BGDĐT)\n` +
      `MÔN: KHOA HỌC TỰ NHIÊN ${lessonPlan.grade}\n` +
      `BÀI: ${lessonPlan.lessonTitle.toUpperCase()}\n` +
      `Thời lượng: ${lessonPlan.durationPeriods} tiết (${lessonPlan.ppctReference?.periodRange || 'Theo PPCT'})\n\n` +
      `I. MỤC TIÊU DẠY HỌC\n` +
      `1. Kiến thức:\n${lessonPlan.objectives.knowledge.map((k) => '- ' + k).join('\n')}\n\n` +
      `2. Năng lực:\n- Năng lực KHTN: ${lessonPlan.objectives.competencies.khtn.join('; ')}\n- Năng lực chung: ${lessonPlan.objectives.competencies.general.join('; ')}\n\n` +
      `3. Phẩm chất:\n${lessonPlan.objectives.qualities.map((q) => '- ' + q).join('\n')}\n\n` +
      `II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n` +
      `- GV: ${lessonPlan.equipment.teacher.join('; ')}\n` +
      `- HS: ${lessonPlan.equipment.student.join('; ')}\n\n` +
      `III. TIẾN TRÌNH DẠY HỌC (PHÂN THEO CÁC TIẾT TRONG PPCT VÀ BẢNG 2 CỘT)\n\n`;

    periodsData.forEach((p) => {
      text += `=========================================\n`;
      text += `TIẾT ${p.periodNumber} (Theo PPCT: Tiết ${p.ppctPeriodIndex || p.periodNumber}): ${p.ppctMainContent.toUpperCase()}\n`;
      if (p.targetCompetencies) {
        text += `Trọng tâm: ${p.targetCompetencies}\n`;
      }
      text += `=========================================\n\n`;

      p.activities.forEach((a) => {
        text += `${a.name} (${a.durationMinutes || 10} phút)\n`;
        text += `a) Mục tiêu: ${a.goal}\n`;
        text += `b) Nội dung: ${a.content}\n`;
        text += `c) Sản phẩm: ${a.product}\n`;
        text += `d) Tổ chức thực hiện (Bảng 2 cột: Hoạt động của GV | Hoạt động của HS):\n`;
        text += `+-------------------------------------------------------------+-------------------------------------------------------------+\n`;
        text += `| HOẠT ĐỘNG CỦA GIÁO VIÊN                                     | HOẠT ĐỘNG CỦA HỌC SINH                                      |\n`;
        text += `+-------------------------------------------------------------+-------------------------------------------------------------+\n`;
        text += `| Bước 1 (Chuyển giao nhiệm vụ):                              | Bước 1 (Tiếp nhận nhiệm vụ):                                |\n`;
        text += `| ${a.execution.twoColumns?.step1.teacherActivity || a.execution.step1_transfer}\n| | ${a.execution.twoColumns?.step1.studentActivity || 'HS tiếp nhận nhiệm vụ và quan sát hướng dẫn.'}\n`;
        text += `| Bước 2 (Theo dõi, hướng dẫn):                               | Bước 2 (Thực hiện nhiệm vụ):                                |\n`;
        text += `| ${a.execution.twoColumns?.step2.teacherActivity || 'GV theo dõi, hướng dẫn.'}\n| | ${a.execution.twoColumns?.step2.studentActivity || a.execution.step2_execute}\n`;
        text += `| Bước 3 (Tổ chức báo cáo):                                   | Bước 3 (Báo cáo, thảo luận):                                |\n`;
        text += `| ${a.execution.twoColumns?.step3.teacherActivity || 'GV điều phối báo cáo.'}\n| | ${a.execution.twoColumns?.step3.studentActivity || a.execution.step3_report}\n`;
        text += `| Bước 4 (Đánh giá, kết luận):                                | Bước 4 (Tiếp nhận kết luận, ghi bài):                       |\n`;
        text += `| ${a.execution.twoColumns?.step4.teacherActivity || a.execution.step4_conclude}\n| | ${a.execution.twoColumns?.step4.studentActivity || 'HS đối chiếu, sửa sai và ghi vở.'}\n`;
        text += `+-------------------------------------------------------------+-------------------------------------------------------------+\n\n`;
      });
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = () => {
    if (!lessonPlan) return;
    exportLessonPlanToDocx(
      lessonPlan,
      `GiaoAn5512_KHTN${lessonPlan.grade}_${lessonPlan.lessonTitle.replace(/[\s:/]+/g, '_')}`
    );
  };

  const handlePrintPDF = () => {
    if (!lessonPlan) return;
    printElementToPDF(
      'printable-lesson-plan',
      `GiaoAn5512_KHTN${lessonPlan.grade}_${lessonPlan.lessonTitle}`
    );
  };

  const handleDownloadMarkdown = () => {
    if (!lessonPlan) return;
    const periodsData =
      lessonPlan.periods && lessonPlan.periods.length > 0
        ? lessonPlan.periods
        : [
            {
              periodNumber: 1,
              ppctPeriodIndex: 1,
              ppctMainContent: lessonPlan.lessonTitle,
              activities: lessonPlan.activities,
            },
          ];

    let md =
      `# KẾ HOẠCH BÀI DẠY (CÔNG VĂN 5512/BGDĐT)\n\n` +
      `## MÔN: KHOA HỌC TỰ NHIÊN ${lessonPlan.grade} - BÀI: ${lessonPlan.lessonTitle}\n\n` +
      `**Thời lượng:** ${lessonPlan.durationPeriods} tiết (${lessonPlan.ppctReference?.periodRange || 'Theo PPCT'})\n\n` +
      `### I. MỤC TIÊU DẠY HỌC\n\n` +
      `#### 1. Kiến thức\n${lessonPlan.objectives.knowledge.map((k) => `- ${k}`).join('\n')}\n\n` +
      `#### 2. Năng lực\n- **Năng lực KHTN:** ${lessonPlan.objectives.competencies.khtn.join('\n- ')}\n` +
      `- **Năng lực chung:** ${lessonPlan.objectives.competencies.general.join('\n- ')}\n\n` +
      `#### 3. Phẩm chất\n${lessonPlan.objectives.qualities.map((q) => `- ${q}`).join('\n')}\n\n` +
      `### II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n` +
      `- **Giáo viên:** ${lessonPlan.equipment.teacher.join(', ')}\n` +
      `- **Học sinh:** ${lessonPlan.equipment.student.join(', ')}\n\n` +
      `### III. TIẾN TRÌNH DẠY HỌC (PHÂN THEO CÁC TIẾT TRONG PPCT VÀ BẢNG 2 CỘT)\n\n`;

    periodsData.forEach((p) => {
      md += `### TIẾT ${p.periodNumber} (Theo PPCT: Tiết ${p.ppctPeriodIndex || p.periodNumber}): ${p.ppctMainContent}\n\n`;
      if (p.targetCompetencies) {
        md += `*Trọng tâm tiết dạy: ${p.targetCompetencies}*\n\n`;
      }

      p.activities.forEach((a) => {
        md += `#### ${a.name} (${a.durationMinutes || 10} phút)\n`;
        md += `- **a) Mục tiêu:** ${a.goal}\n`;
        md += `- **b) Nội dung:** ${a.content}\n`;
        md += `- **c) Sản phẩm:** ${a.product}\n`;
        md += `- **d) Tổ chức thực hiện (Bảng 2 cột):**\n\n`;
        md += `| Hoạt động của Giáo viên (GV) | Hoạt động của Học sinh (HS) |\n`;
        md += `| :--- | :--- |\n`;
        md += `| **Bước 1: Chuyển giao nhiệm vụ học tập**<br>${a.execution.twoColumns?.step1.teacherActivity || a.execution.step1_transfer} | **Bước 1: Tiếp nhận nhiệm vụ học tập**<br>${a.execution.twoColumns?.step1.studentActivity || 'HS tiếp nhận nhiệm vụ, lắng nghe hướng dẫn.'} |\n`;
        md += `| **Bước 2: Theo dõi, hướng dẫn thực hiện**<br>${a.execution.twoColumns?.step2.teacherActivity || 'GV quan sát, theo dõi và trợ giúp.'} | **Bước 2: Thực hiện nhiệm vụ học tập**<br>${a.execution.twoColumns?.step2.studentActivity || a.execution.step2_execute} |\n`;
        md += `| **Bước 3: Tổ chức báo cáo, thảo luận**<br>${a.execution.twoColumns?.step3.teacherActivity || 'GV điều phối báo cáo, thảo luận.'} | **Bước 3: Báo cáo kết quả và thảo luận**<br>${a.execution.twoColumns?.step3.studentActivity || a.execution.step3_report} |\n`;
        md += `| **Bước 4: Đánh giá, chuẩn hóa kiến thức**<br>${a.execution.twoColumns?.step4.teacherActivity || a.execution.step4_conclude} | **Bước 4: Tiếp nhận kết luận, hoàn thiện vở**<br>${a.execution.twoColumns?.step4.studentActivity || 'HS đối chiếu kết quả, ghi bài vào vở.'} |\n\n`;
      });
    });

    exportMarkdown(md, `GiaoAn5512_KHTN${lessonPlan.grade}_2Cot`);
  };

  // Helper to update text in activities for inline editing
  const updateActivityStep = (
    periodIdx: number,
    activityIdx: number,
    stepKey: 'step1' | 'step2' | 'step3' | 'step4',
    actor: 'teacherActivity' | 'studentActivity',
    newVal: string
  ) => {
    if (!lessonPlan || !lessonPlan.periods) return;
    const newPeriods = [...lessonPlan.periods];
    const targetPeriod = newPeriods[periodIdx];
    if (!targetPeriod) return;
    const targetActivity = targetPeriod.activities[activityIdx];
    if (!targetActivity || !targetActivity.execution.twoColumns) return;

    targetActivity.execution.twoColumns[stepKey][actor] = newVal;
    setLessonPlan({ ...lessonPlan, periods: newPeriods });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              MODULE 2
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              SOẠN KẾ HOẠCH BÀI DẠY THEO CÔNG VĂN 5512
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chuẩn hóa cấu trúc <strong>Bảng 2 cột (Hoạt động của giáo viên | Hoạt động của học sinh)</strong> và{' '}
            <strong>chia riêng từng tiết theo nội dung dạy học chủ yếu có trong PPCT</strong>.
          </p>
        </div>

        {lessonPlan && (
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('two-column')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'two-column'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Bảng 2 cột (Chuẩn CV 5512)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sequential')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'sequential'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tuần tự</span>
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                isEditing
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Lưu chỉnh sửa' : 'Sửa trực tiếp'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handleDownloadDocx}
              className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Tải Word (.docx)</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Parameters Form (Section XI) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Row 1: Grade, Pre-configured lesson picker, Custom lesson, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Khối lớp THCS:
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as Grade)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="6">Khoa học tự nhiên 6</option>
              <option value="7">Khoa học tự nhiên 7</option>
              <option value="8">Khoa học tự nhiên 8</option>
              <option value="9">Khoa học tự nhiên 9</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Chọn bài chuẩn theo PPCT GDPT 2018:
              </label>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  lessonData.hasSourceLessons
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
                title={lessonData.hasSourceLessons ? 'Trích xuất từ tài liệu PPCT tải lên' : 'SGK chuẩn Kết nối tri thức'}
              >
                {lessonData.hasSourceLessons
                  ? `🌟 ${lessonData.sourceLessons.length} bài từ PPCT Nguồn`
                  : `📚 SGK Kết nối tri thức (${lessonData.curriculumLessons.length} bài)`}
              </span>
            </div>
            <select
              value=""
              onChange={(e) => handleSelectLessonOption(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate font-medium text-slate-800"
            >
              <option value="">
                {lessonData.hasSourceLessons
                  ? `-- Chọn bài: ${lessonData.sourceLessons.length} bài PPCT Nguồn hoặc SGK Kết nối tri thức --`
                  : `-- Chọn bài học chuẩn SGK Kết nối tri thức (KHTN ${grade}) --`}
              </option>

              {lessonData.hasSourceLessons && (
                <optgroup label="🌟 BÀI HỌC THEO PPCT TRONG TÀI LIỆU NGUỒN (Khóa nguồn)">
                  {lessonData.sourceLessons.map((item) => (
                    <option key={item.id} value={`SRC::${item.id}`}>
                      📄 [{item.sourceDocName?.slice(0, 16)}...] {item.lesson} ({item.periods} tiết)
                    </option>
                  ))}
                </optgroup>
              )}

              <optgroup label={`📚 BỘ SGK CHUẨN: KẾT NỐI TRI THỨC VỚI CUỘC SỐNG (KHTN ${grade})`}>
                {lessonData.curriculumLessons.map((item) => (
                  <option key={item.id} value={`CURR::${item.id}`}>
                    [{item.strand.slice(0, 12)}...] {item.lesson}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên bài dạy (tùy chỉnh):
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="vd: Bài 8: Tốc độ chuyển động"
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thời lượng (Số tiết theo PPCT):
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={durationPeriods}
              onChange={(e) => setDurationPeriods(Number(e.target.value))}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Reference Docs & Specific teacher requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tài liệu nguồn tham chiếu:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả tài liệu đã nạp ({sourceDocs.length})</option>
              {sourceDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Yêu cầu cụ thể của giáo viên về phương pháp / thiết bị:
            </label>
            <input
              type="text"
              value={teacherPrompt}
              onChange={(e) => setTeacherPrompt(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Yêu cầu về hoạt động nhóm, thí nghiệm thực hành, chia nhỏ các tiết..."
            />
          </div>
        </div>

        {/* Bottom Bar: Status and Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {settings.sourceLock
                ? '🔒 Chế độ Source Lock: Khóa nguồn SGK & tài liệu chính khóa'
                : '🔓 Chế độ Mở rộng: Tích hợp kinh nghiệm 30 năm KHTN THCS'}
            </span>
          </div>

          <button
            id="btn-generate-lesson-plan"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tạo giáo án 5512 chia tiết & 2 cột...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 SOẠN GIÁO ÁN 5512 (2 CỘT & CHIA TIẾT THEO PPCT)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Match Check (Section XI) */}
      {lessonPlan && lessonPlan.assessmentMatchCheck && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">ĐÁNH GIÁ ĐỘ TƯƠNG THÍCH THEO CÔNG VĂN 5512: </span>
            {lessonPlan.assessmentMatchCheck.explanation}
          </div>
        </div>
      )}

      {/* Lesson Plan Result View (Printable / Word formatted container) */}
      {lessonPlan && (
        <div
          id="printable-lesson-plan"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-slate-800 leading-relaxed font-sans"
        >
          {/* Header Title */}
          <div className="text-center border-b border-slate-200 pb-5 space-y-1">
            <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              BỘ GIÁO DỤC VÀ ĐÀO TẠO • KHUNG KẾ HOẠCH BÀI DẠY THEO CÔNG VĂN 5512/BGDĐT
            </h3>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              KHOA HỌC TỰ NHIÊN {lessonPlan.grade}: {lessonPlan.lessonTitle.toUpperCase()}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
              {(lessonPlan.lessonCode || lessonPlan.ppctReference?.lessonCode) && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold text-xs">
                  {lessonPlan.lessonCode || lessonPlan.ppctReference?.lessonCode}
                </span>
              )}
              <span>
                Thời lượng: <strong>{lessonPlan.durationPeriods} tiết</strong>
              </span>
              {lessonPlan.ppctReference && (
                <span className="text-blue-700 font-medium">
                  • PPCT: <strong>{lessonPlan.ppctReference.periodRange}</strong> ({lessonPlan.ppctReference.strand})
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                  lessonPlan.teachingMethod === 'online'
                    ? 'bg-rose-100 text-rose-800'
                    : lessonPlan.teachingMethod === 'blended'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {lessonPlan.teachingMethod === 'online'
                  ? '🌐 Trực tuyến [ONLINE]'
                  : lessonPlan.teachingMethod === 'blended'
                  ? '⚡ Kết hợp [KẾT HỢP]'
                  : '🏫 Trực tiếp [TT]'}
              </span>
            </div>

            {/* Banner Nội dung dạy học Online nếu có */}
            {lessonPlan.onlineContentDetail && (
              <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-left text-xs text-sky-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>Nội dung dạy học trực tuyến đã xác định trong PPCT (Thông tư 09/2021/TT-BGDĐT):</span>
                </div>
                <p className="pl-5 text-sky-900 leading-relaxed">
                  {lessonPlan.onlineContentDetail}
                </p>
              </div>
            )}
          </div>

          {/* I. MỤC TIÊU DẠY HỌC */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              I. MỤC TIÊU DẠY HỌC
            </h3>

            {/* 1. Kiến thức */}
            <div className="pl-4 space-y-1">
              <h4 className="text-xs font-bold text-slate-800">1. Về kiến thức:</h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
                {lessonPlan.objectives.knowledge.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>

            {/* 2. Năng lực */}
            <div className="pl-4 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800">2. Về năng lực:</h4>
              <div className="pl-2 space-y-2 text-xs text-slate-700">
                <div>
                  <p>
                    <strong className="text-slate-800 italic">a) Năng lực Khoa học tự nhiên:</strong>
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-0.5 mt-0.5">
                    {lessonPlan.objectives.competencies.khtn.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p>
                    <strong className="text-slate-800 italic">b) Năng lực chung:</strong>
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-0.5 mt-0.5">
                    {lessonPlan.objectives.competencies.general.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* c) Năng lực số (NLS) */}
                <div>
                  <p className="flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-teal-600 inline" />
                    <strong className="text-teal-900 italic font-semibold">c) Năng lực số (NLS):</strong>
                    {lessonPlan.digitalCompetenceCodes && (
                      <span className="font-mono text-[11px] text-teal-700 font-bold">
                        {lessonPlan.digitalCompetenceCodes.join(', ')}
                      </span>
                    )}
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-0.5 mt-0.5 text-slate-700">
                    {lessonPlan.objectives.competencies.digital && lessonPlan.objectives.competencies.digital.length > 0 ? (
                      lessonPlan.objectives.competencies.digital.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))
                    ) : (
                      <li>{lessonPlan.digitalCompetenceDetail || 'Sử dụng phần mềm mô phỏng và công cụ số tra cứu khoa học.'}</li>
                    )}
                  </ul>
                </div>

                {/* d) Dạy học Trí tuệ nhân tạo (AI) */}
                <div>
                  <p className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-600 inline" />
                    <strong className="text-purple-900 italic font-semibold">d) Dạy học Trí tuệ nhân tạo (AI):</strong>
                    {lessonPlan.aiEducationCodes && (
                      <span className="font-mono text-[11px] text-purple-700 font-bold">
                        {lessonPlan.aiEducationCodes.join(', ')}
                      </span>
                    )}
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-0.5 mt-0.5 text-slate-700">
                    {lessonPlan.objectives.competencies.aiEducation && lessonPlan.objectives.competencies.aiEducation.length > 0 ? (
                      lessonPlan.objectives.competencies.aiEducation.map((ai, i) => (
                        <li key={i}>{ai}</li>
                      ))
                    ) : (
                      <li>{lessonPlan.aiEducationDetail || 'Ứng dụng AI phân tích dữ liệu và rèn luyện đạo đức công nghệ.'}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Phẩm chất */}
            <div className="pl-4 space-y-1">
              <h4 className="text-xs font-bold text-slate-800">3. Về phẩm chất:</h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
                {lessonPlan.objectives.qualities.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
            </h3>
            <div className="pl-4 text-xs space-y-1 text-slate-700">
              <p>
                <strong>1. Giáo viên:</strong> {lessonPlan.equipment.teacher.join('; ')}.
              </p>
              <p>
                <strong>2. Học sinh:</strong> {lessonPlan.equipment.student.join('; ')}.
              </p>
            </div>
          </div>

          {/* III. TIẾN TRÌNH DẠY HỌC: CHIA RIÊNG TỪNG TIẾT THEO NỘI DUNG CHỦ YẾU PPCT */}
          <div className="space-y-8 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                III. TIẾN TRÌNH DẠY HỌC (CHI TIẾT THEO CÁC TIẾT TRONG PPCT)
              </h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Mục d) Tổ chức thực hiện định dạng bảng 2 cột chuẩn CV 5512
              </span>
            </div>

            {(lessonPlan.periods && lessonPlan.periods.length > 0
              ? lessonPlan.periods
              : [
                  {
                    periodNumber: 1,
                    ppctPeriodIndex: 1,
                    ppctMainContent: lessonPlan.lessonTitle,
                    activities: lessonPlan.activities,
                  },
                ]
            ).map((period: PeriodLessonPlan, pIdx: number) => (
              <div
                key={pIdx}
                className="space-y-4 border-2 border-blue-100 rounded-2xl p-4 sm:p-6 bg-blue-50/20"
              >
                {/* Period Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        TIẾT {period.periodNumber}
                      </span>
                      <span className="text-xs text-blue-200">
                        (Theo PPCT: Tiết {period.ppctPeriodIndex || period.periodNumber})
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      NỘI DUNG DẠY HỌC CHỦ YẾU THEO PPCT: {period.ppctMainContent}
                    </h4>
                  </div>
                  {period.targetCompetencies && (
                    <div className="text-[11px] text-blue-200 max-w-sm italic">
                      🎯 {period.targetCompetencies}
                    </div>
                  )}
                </div>

                {/* Activities inside this period */}
                <div className="space-y-6 pt-2">
                  {period.activities.map((act: LessonActivityItem, aIdx: number) => {
                    const twoCol = act.execution.twoColumns;
                    return (
                      <div
                        key={act.id || aIdx}
                        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs"
                      >
                        {/* Activity Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-mono">
                              {act.stepNumber || aIdx + 1}
                            </span>
                            {act.name}
                          </h5>
                          <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 rounded-full font-mono text-slate-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {act.durationMinutes || 10} phút
                          </span>
                        </div>

                        {/* Objectives, Content, Product */}
                        <div className="text-xs space-y-1.5 text-slate-700 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                          <p>
                            <strong className="text-slate-900 font-bold">a) Mục tiêu:</strong> {act.goal}
                          </p>
                          <p>
                            <strong className="text-slate-900 font-bold">b) Nội dung:</strong> {act.content}
                          </p>
                          <p>
                            <strong className="text-slate-900 font-bold">c) Sản phẩm:</strong> {act.product}
                          </p>
                        </div>

                        {/* d) TỔ CHỨC THỰC HIỆN: BẢNG 2 CỘT */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Columns className="w-3.5 h-3.5 text-blue-600" />
                              d) Tổ chức thực hiện (Hoạt động của GV và HS qua 4 bước):
                            </strong>
                          </div>

                          {viewMode === 'two-column' ? (
                            /* 2-Column Table */
                            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="bg-blue-50/80 text-blue-950 font-bold border-b border-blue-200">
                                    <th className="w-1/2 p-3 border-r border-blue-200 uppercase tracking-wider text-[11px]">
                                      🧑‍🏫 HOẠT ĐỘNG CỦA GIÁO VIÊN (GV)
                                    </th>
                                    <th className="w-1/2 p-3 uppercase tracking-wider text-[11px] text-emerald-950 bg-emerald-50/40">
                                      🧑‍🎓 HOẠT ĐỘNG CỦA HỌC SINH (HS)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {/* Bước 1 */}
                                  <tr className="hover:bg-slate-50/50">
                                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                                      <div className="font-bold text-blue-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Bước 1: Chuyển giao nhiệm vụ học tập
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={twoCol?.step1.teacherActivity || act.execution.step1_transfer}
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step1', 'teacherActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step1.teacherActivity || act.execution.step1_transfer}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-3 align-top space-y-1 bg-emerald-50/10">
                                      <div className="font-bold text-emerald-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        Bước 1: Tiếp nhận nhiệm vụ học tập
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={
                                            twoCol?.step1.studentActivity ||
                                            'HS chú ý lắng nghe nhiệm vụ, quan sát tình huống và chuẩn bị đồ dùng.'
                                          }
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step1', 'studentActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step1.studentActivity ||
                                            'HS chú ý lắng nghe nhiệm vụ, quan sát tình huống và chuẩn bị đồ dùng.'}
                                        </p>
                                      )}
                                    </td>
                                  </tr>

                                  {/* Bước 2 */}
                                  <tr className="hover:bg-slate-50/50">
                                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                                      <div className="font-bold text-blue-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Bước 2: Theo dõi, hỗ trợ thực hiện nhiệm vụ
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={
                                            twoCol?.step2.teacherActivity ||
                                            'GV bao quát lớp học, khích lệ HS chủ động và hỗ trợ các nhóm gặp khó khăn.'
                                          }
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step2', 'teacherActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step2.teacherActivity ||
                                            'GV bao quát lớp học, khích lệ HS chủ động và hỗ trợ các nhóm gặp khó khăn.'}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-3 align-top space-y-1 bg-emerald-50/10">
                                      <div className="font-bold text-emerald-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        Bước 2: Thực hiện nhiệm vụ học tập
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={twoCol?.step2.studentActivity || act.execution.step2_execute}
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step2', 'studentActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step2.studentActivity || act.execution.step2_execute}
                                        </p>
                                      )}
                                    </td>
                                  </tr>

                                  {/* Bước 3 */}
                                  <tr className="hover:bg-slate-50/50">
                                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                                      <div className="font-bold text-blue-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Bước 3: Tổ chức báo cáo, thảo luận
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={
                                            twoCol?.step3.teacherActivity ||
                                            'GV chỉ định đại diện báo cáo, điều phối học sinh nhận xét và phản biện chéo.'
                                          }
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step3', 'teacherActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step3.teacherActivity ||
                                            'GV chỉ định đại diện báo cáo, điều phối học sinh nhận xét và phản biện chéo.'}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-3 align-top space-y-1 bg-emerald-50/10">
                                      <div className="font-bold text-emerald-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        Bước 3: Báo cáo kết quả và thảo luận
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={twoCol?.step3.studentActivity || act.execution.step3_report}
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step3', 'studentActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step3.studentActivity || act.execution.step3_report}
                                        </p>
                                      )}
                                    </td>
                                  </tr>

                                  {/* Bước 4 */}
                                  <tr className="hover:bg-slate-50/50">
                                    <td className="p-3 align-top border-r border-slate-200 space-y-1">
                                      <div className="font-bold text-blue-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        Bước 4: Đánh giá, chuẩn hóa kiến thức
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={twoCol?.step4.teacherActivity || act.execution.step4_conclude}
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step4', 'teacherActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step4.teacherActivity || act.execution.step4_conclude}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-3 align-top space-y-1 bg-emerald-50/10">
                                      <div className="font-bold text-emerald-900 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        Bước 4: Tiếp nhận kết luận, hoàn thiện vở
                                      </div>
                                      {isEditing ? (
                                        <textarea
                                          value={
                                            twoCol?.step4.studentActivity ||
                                            'HS đối chiếu kết quả, sửa sai nếu có và ghi nhớ kiến thức trọng tâm.'
                                          }
                                          onChange={(e) =>
                                            updateActivityStep(pIdx, aIdx, 'step4', 'studentActivity', e.target.value)
                                          }
                                          className="w-full text-xs p-1.5 border border-amber-300 rounded-md bg-amber-50/40 focus:outline-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-slate-700 leading-relaxed">
                                          {twoCol?.step4.studentActivity ||
                                            'HS đối chiếu kết quả, sửa sai nếu có và ghi nhớ kiến thức trọng tâm.'}
                                        </p>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            /* Sequential Mode */
                            <div className="space-y-2 pl-3 border-l-2 border-blue-400 text-xs">
                              <p>
                                <strong className="text-blue-900">• Bước 1 - Chuyển giao:</strong>{' '}
                                {act.execution.step1_transfer}
                              </p>
                              <p>
                                <strong className="text-blue-900">• Bước 2 - Thực hiện:</strong>{' '}
                                {act.execution.step2_execute}
                              </p>
                              <p>
                                <strong className="text-blue-900">• Bước 3 - Báo cáo, thảo luận:</strong>{' '}
                                {act.execution.step3_report}
                              </p>
                              <p>
                                <strong className="text-blue-900">• Bước 4 - Kết luận, nhận định:</strong>{' '}
                                {act.execution.step4_conclude}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
