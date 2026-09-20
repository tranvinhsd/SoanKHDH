import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  HelpCircle,
  Table,
  CheckCircle2,
} from 'lucide-react';
import { Grade, ReviewOutlineData, SourceDocument, SourceLockSettings } from '../../types';
import { generateReviewOutlineWithAI } from '../../services/aiService';
import { exportMarkdown, printElementToPDF } from '../../services/exportService';
import { getAvailableLessonsFromSourcesAndCurriculum } from '../../data/curriculumKHTN';

interface ReviewOutlineModuleProps {
  currentGrade: Grade;
  sourceDocs: SourceDocument[];
  settings: SourceLockSettings;
}

export const ReviewOutlineModule: React.FC<ReviewOutlineModuleProps> = ({
  currentGrade,
  sourceDocs,
  settings,
}) => {
  const [grade, setGrade] = useState<Grade>(currentGrade);
  const [unitOrTopic, setUnitOrTopic] = useState('Ôn tập Giữa học kì I (Chất và Năng lượng)');
  const [durationPeriods, setDurationPeriods] = useState<number>(2);
  const [selectedDocId, setSelectedDocId] = useState<string>('all');

  const lessonData = React.useMemo(() => {
    return getAvailableLessonsFromSourcesAndCurriculum(grade, sourceDocs, selectedDocId);
  }, [grade, sourceDocs, selectedDocId]);

  const [isLoading, setIsLoading] = useState(false);
  const [outline, setOutline] = useState<ReviewOutlineData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGradeChange = (newGrade: Grade) => {
    setGrade(newGrade);
    const available = getAvailableLessonsFromSourcesAndCurriculum(newGrade, sourceDocs, selectedDocId);
    if (available.hasSourceLessons && available.sourceLessons.length > 0) {
      setUnitOrTopic(`Chủ đề: ${available.sourceLessons[0].lesson}`);
      if (available.sourceLessons[0].periods) setDurationPeriods(available.sourceLessons[0].periods);
    } else {
      setUnitOrTopic(`Ôn tập Giữa học kì I - KHTN ${newGrade}`);
      setDurationPeriods(2);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const activeDocs =
        selectedDocId === 'all'
          ? sourceDocs
          : sourceDocs.filter((d) => d.id === selectedDocId);

      const res = await generateReviewOutlineWithAI(
        grade,
        unitOrTopic,
        activeDocs,
        settings,
        durationPeriods
      );
      setOutline(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outline) return;
    const text = `${outline.title}\nThời lượng ôn tập: ${outline.durationPeriods || durationPeriods} tiết\n\n` +
      `A. KIẾN THỨC CẦN NHỚ:\n` +
      outline.coreKnowledge
        .map((k) => `${k.topic}\n${k.keyPoints.map((kp) => '- ' + kp).join('\n')}`)
        .join('\n\n') +
      `\n\nB. CÂU HỎI NHẬN BIẾT:\n` +
      outline.recognitionQuestions.map((q, i) => `${i + 1}. ${q.stem} -> ĐA: ${q.answer}`).join('\n') +
      `\n\nC. CÂU HỎI THÔNG HIỂU:\n` +
      outline.understandingQuestions.map((q, i) => `${i + 1}. ${q.stem} -> ĐA: ${q.answer}`).join('\n') +
      `\n\nD. CÂU HỎI VẬN DỤNG:\n` +
      outline.applicationQuestions.map((q, i) => `${i + 1}. ${q.stem} -> ĐA: ${q.answer}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    if (!outline) return;
    printElementToPDF('printable-review-outline', outline.title);
  };

  const handleDownloadMarkdown = () => {
    if (!outline) return;
    const md = `# ${outline.title}\n\n` +
      `**Khối lớp:** KHTN ${outline.grade} | **Thời lượng ôn tập:** ${outline.durationPeriods || durationPeriods} tiết\n\n` +
      `## A. KIẾN THỨC CẦN NHỚ\n\n` +
      outline.coreKnowledge
        .map(
          (ck) =>
            `### ${ck.topic}\n${ck.keyPoints.map((p) => `- ${p}`).join('\n')}\n` +
            (ck.comparisonTable
              ? `\n| ${ck.comparisonTable.headers.join(' | ')} |\n| ${ck.comparisonTable.headers.map(() => '---').join(' | ')} |\n` +
                ck.comparisonTable.rows.map((r) => `| ${r.join(' | ')} |`).join('\n') + '\n'
              : '')
        )
        .join('\n') +
      `\n## B. CÂU HỎI NHẬN BIẾT\n\n` +
      outline.recognitionQuestions
        .map((q, i) => `**Câu ${i + 1}:** ${q.stem}\n${q.options ? q.options.join('\n') + '\n' : ''}> **Đáp án:** ${q.answer}\n`)
        .join('\n') +
      `\n## C. CÂU HỎI THÔNG HIỂU\n\n` +
      outline.understandingQuestions
        .map((q, i) => `**Câu ${i + 1}:** ${q.stem}\n${q.options ? q.options.join('\n') + '\n' : ''}> **Đáp án:** ${q.answer}\n`)
        .join('\n') +
      `\n## D. CÂU HỎI VẬN DỤNG\n\n` +
      outline.applicationQuestions
        .map((q, i) => `**Câu ${i + 1}:** ${q.stem}\n${q.options ? q.options.join('\n') + '\n' : ''}> **Đáp án:** ${q.answer}\n`)
        .join('\n');
    exportMarkdown(md, `DeCuongOnTap_KHTN${outline.grade}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-xs font-bold font-mono">
              MODULE 4
            </span>
            <h2 className="text-xl font-bold text-slate-900">TẠO ĐỀ CƯƠNG ÔN TẬP</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống hóa toàn bộ kiến thức trọng tâm theo 4 phân mục: A. Kiến thức cần nhớ • B. Nhận biết • C. Thông hiểu • D. Vận dụng.
          </p>
        </div>

        {outline && (
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
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span>In Đề cương / Xuất PDF</span>
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

      {/* Input Box (Section XIII) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Khối lớp THCS:
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(e.target.value as Grade)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="6">Khoa học tự nhiên 6</option>
              <option value="7">Khoa học tự nhiên 7</option>
              <option value="8">Khoa học tự nhiên 8</option>
              <option value="9">Khoa học tự nhiên 9</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số tiết ôn tập (PPCT):
            </label>
            <select
              value={durationPeriods}
              onChange={(e) => setDurationPeriods(Number(e.target.value))}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value={1}>1 tiết (Ôn tập nhanh / Củng cố)</option>
              <option value={2}>2 tiết (Chuẩn ôn tập định kỳ)</option>
              <option value={3}>3 tiết (Ôn tập chủ đề lớn)</option>
              <option value={4}>4 tiết (Ôn tập học kỳ mở rộng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tài liệu nguồn trích xuất:
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Chọn đợt thi hoặc bài học chuẩn:
              </label>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {lessonData.hasSourceLessons ? 'PPCT nguồn + SGK' : 'SGK Kết nối tri thức'}
              </span>
            </div>
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (val.startsWith('PRESET::')) {
                  const name = val.replace('PRESET::', '');
                  setUnitOrTopic(name);
                  setDurationPeriods(2);
                } else if (val.startsWith('SRC::')) {
                  const item = lessonData.sourceLessons.find((l) => l.id === val.replace('SRC::', ''));
                  if (item) {
                    setUnitOrTopic(`Chủ đề: ${item.lesson}`);
                    if (item.periods) setDurationPeriods(item.periods);
                    if (item.sourceDocId && selectedDocId !== item.sourceDocId) {
                      setSelectedDocId(item.sourceDocId);
                    }
                  }
                } else if (val.startsWith('CURR::')) {
                  const item = lessonData.curriculumLessons.find((l) => l.id === val.replace('CURR::', ''));
                  if (item) {
                    setUnitOrTopic(`Chủ đề: ${item.lesson}`);
                    if (item.periods) setDurationPeriods(item.periods);
                  }
                } else {
                  setUnitOrTopic(val);
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none truncate font-medium text-slate-800"
            >
              <option value="">-- Chọn đợt ôn tập hoặc bài học KHTN {grade} --</option>
              <optgroup label="🎯 CÁC ĐỢT ÔN TẬP ĐỊNH KỲ">
                <option value={`PRESET::Ôn tập Giữa học kì I (KHTN ${grade})`}>Ôn tập Giữa học kì I</option>
                <option value={`PRESET::Ôn tập Cuối học kì I (KHTN ${grade})`}>Ôn tập Cuối học kì I</option>
                <option value={`PRESET::Ôn tập Giữa học kì II (KHTN ${grade})`}>Ôn tập Giữa học kì II</option>
                <option value={`PRESET::Ôn tập Cuối học kì II (KHTN ${grade})`}>Ôn tập Cuối học kì II</option>
              </optgroup>
              {lessonData.hasSourceLessons && (
                <optgroup label="🌟 THEO BÀI HỌC TRONG TÀI LIỆU NGUỒN">
                  {lessonData.sourceLessons.map((item) => (
                    <option key={item.id} value={`SRC::${item.id}`}>
                      📄 [{item.sourceDocName?.slice(0, 16)}...] {item.lesson} ({item.periods || 2} tiết)
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={`📚 BÀI HỌC SGK KẾT NỐI TRI THỨC (KHTN ${grade})`}>
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
              Chủ đề / Đợt ôn tập (tùy chỉnh):
            </label>
            <input
              type="text"
              value={unitOrTopic}
              onChange={(e) => setUnitOrTopic(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {settings.sourceLock ? '🔒 Source Lock = ON: Bám sát chuẩn SGK' : '🔓 Source Lock = OFF'}
          </span>
          <button
            id="btn-generate-review-outline"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang hệ thống hóa đề cương...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🚀 TẠO ĐỀ CƯƠNG ÔN TẬP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable / Formatted Output Container (Section XIII: A, B, C, D) */}
      {outline && (
        <div
          id="printable-review-outline"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 text-slate-800"
        >
          {/* Header */}
          <div className="text-center border-b pb-4 space-y-2">
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-medium text-slate-600">
              <span className="font-bold text-amber-800 uppercase tracking-wider">
                TÀI LIỆU ÔN TẬP HỌC KỲ • MÔN KHOA HỌC TỰ NHIÊN {outline.grade}
              </span>
              <span>•</span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                Thời lượng ôn tập: {outline.durationPeriods || durationPeriods} tiết
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {outline.title}
            </h2>
          </div>

          {/* A. KIẾN THỨC CẦN NHỚ */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-amber-900 border-b-2 border-amber-300 pb-1">
              A. KIẾN THỨC CẦN NHỚ
            </h3>
            <div className="space-y-4">
              {outline.coreKnowledge.map((ck, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{ck.topic}</h4>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-2">
                    {ck.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>

                  {/* Comparison Table if present */}
                  {ck.comparisonTable && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs border border-slate-300">
                        <thead className="bg-amber-100 text-amber-950 font-bold">
                          <tr>
                            {ck.comparisonTable.headers.map((h, i) => (
                              <th key={i} className="p-2 border border-slate-300">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ck.comparisonTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-amber-50/50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2 border border-slate-300">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* B. CÂU HỎI NHẬN BIẾT */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-blue-900 border-b-2 border-blue-300 pb-1">
              B. CÂU HỎI NHẬN BIẾT (TÁI HIỆN KIẾN THỨC)
            </h3>
            <div className="space-y-2 text-xs">
              {outline.recognitionQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-lg border bg-white space-y-1">
                  <p className="font-semibold text-slate-900">
                    Câu {i + 1}: {q.stem}
                  </p>
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-3 text-slate-700">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>{opt}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                    <strong>Đáp án:</strong> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. CÂU HỎI THÔNG HIỂU */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-emerald-900 border-b-2 border-emerald-300 pb-1">
              C. CÂU HỎI THÔNG HIỂU (GIẢI THÍCH & PHÂN TÍCH)
            </h3>
            <div className="space-y-2 text-xs">
              {outline.understandingQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-lg border bg-white space-y-1">
                  <p className="font-semibold text-slate-900">
                    Câu {i + 1}: {q.stem}
                  </p>
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-3 text-slate-700">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>{opt}</div>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                    <strong>Đáp án:</strong> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. CÂU HỎI VẬN DỤNG */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-purple-900 border-b-2 border-purple-300 pb-1">
              D. CÂU HỎI VẬN DỤNG (BÀI TOÁN & THỰC TIỄN ĐỜI SỐNG)
            </h3>
            <div className="space-y-2 text-xs">
              {outline.applicationQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-lg border bg-white space-y-1">
                  <p className="font-semibold text-slate-900">
                    Câu {i + 1}: {q.stem}
                  </p>
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                    <strong>Đáp án / Hướng dẫn giải:</strong> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
