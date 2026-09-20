import * as XLSX from 'xlsx';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, Packer } from 'docx';
import {
  Exam7991Workspace,
  PPCTData,
  LessonPlan5512Data,
  WorksheetData,
  ReviewOutlineData,
} from '../types';

/**
 * Trigger file download in browser
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export text / Markdown
 */
export function exportMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  downloadFile(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
}

/**
 * Export Matrix and Specifications to Excel (.xlsx)
 */
export function exportExamToExcel(workspace: Exam7991Workspace, filename: string) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ma trận đề kiểm tra
  const matrixHeaders = [
    'STT',
    'Chủ đề/Mạch nội dung',
    'Đơn vị kiến thức',
    'Nhận biết (Số câu TN)',
    'Nhận biết (Số câu TL)',
    'Nhận biết (Điểm)',
    'Thông hiểu (Số câu TN)',
    'Thông hiểu (Số câu TL)',
    'Thông hiểu (Điểm)',
    'Vận dụng (Số câu TN)',
    'Vận dụng (Số câu TL)',
    'Vận dụng (Điểm)',
    'Vận dụng cao (Số câu TL)',
    'Vận dụng cao (Điểm)',
    'Tổng số câu',
    'Tổng điểm',
  ];

  const matrixRows = workspace.matrix.rows.map((row, idx) => [
    idx + 1,
    row.topic,
    row.content,
    row.recognition.mcCount,
    row.recognition.essayCount,
    row.recognition.score,
    row.understanding.mcCount,
    row.understanding.essayCount,
    row.understanding.score,
    row.application.mcCount,
    row.application.essayCount,
    row.application.score,
    row.highApplication.essayCount,
    row.highApplication.score,
    row.totalQuestions,
    row.totalScore,
  ]);

  // Summary row
  matrixRows.push([
    'TỔNG',
    'TẤT CẢ MẠCH NỘI DUNG',
    '--',
    workspace.matrix.rows.reduce((s, r) => s + r.recognition.mcCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.recognition.essayCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.recognition.score, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.understanding.mcCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.understanding.essayCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.understanding.score, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.application.mcCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.application.essayCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.application.score, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.highApplication.essayCount, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.highApplication.score, 0),
    workspace.matrix.rows.reduce((s, r) => s + r.totalQuestions, 0),
    workspace.matrix.totalScore,
  ]);

  const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixRows]);
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Ma trận 7991');

  // Sheet 2: Bản đặc tả
  const specHeaders = ['Mã', 'Chủ đề', 'Đơn vị kiến thức', 'Yêu cầu cần đạt', 'Mức độ nhận thức', 'Dạng câu', 'Số câu'];
  const specRows = workspace.specification.map((s) => [
    s.id,
    s.topic,
    s.content,
    s.requirement,
    s.level,
    s.questionType,
    s.questionCount,
  ]);
  const wsSpec = XLSX.utils.aoa_to_sheet([specHeaders, ...specRows]);
  XLSX.utils.book_append_sheet(wb, wsSpec, 'Bản đặc tả');

  // Sheet 3: Bảng đáp án
  const ansHeaders = ['Câu số', 'Mã câu', 'Dạng câu', 'Đáp án chuẩn', 'Điểm', 'Hướng dẫn giải thích'];
  const ansRows = workspace.answers.map((a) => [a.questionNum, a.questionId, a.type, a.answer, a.score, a.explanation]);
  const wsAns = XLSX.utils.aoa_to_sheet([ansHeaders, ...ansRows]);
  XLSX.utils.book_append_sheet(wb, wsAns, 'Đáp án & Thang điểm');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Export PPCT to Excel (.xlsx) với đầy đủ Năng lực số, Dạy học AI, Mã chỉ định và Nội dung Dạy học Online
 */
export function exportPPCTToExcel(ppct: PPCTData, filename: string) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Chi tiết Kế hoạch dạy học (PPCT)
  const headers = [
    'STT',
    'Mã chỉ định PPCT',
    'Chủ đề / Bài học',
    'Nội dung dạy học chủ yếu',
    'Số tiết',
    'Tiết thứ',
    'Thời gian thực hiện (Tuần)',
    'Thiết bị dạy học và học liệu số',
    'Địa điểm dạy học',
    'Hình thức dạy học',
    'Nội dung dạy học Online đã xác định',
    'Nền tảng / Công cụ số',
    'Mã Năng lực số',
    'Chi tiết Năng lực số',
    'Mã Dạy học AI',
    'Chi tiết Dạy học AI',
    'Căn cứ Sở GD&ĐT / Ghi chú',
  ];

  const rows = ppct.items.map((it) => [
    it.stt,
    it.lessonCode || `[PPCT-KHTN-${it.stt}]`,
    it.topicOrLesson,
    it.content,
    it.periods,
    it.periodIndex || `${it.stt}`,
    it.timeline,
    it.equipmentAndMaterials || 'Theo danh mục thiết bị dạy học tối thiểu',
    it.location || 'Phòng học bộ môn KHTN / Lớp học',
    it.teachingMethod === 'online'
      ? 'Trực tuyến [ONLINE]'
      : it.teachingMethod === 'blended'
      ? 'Kết hợp [KẾT HỢP]'
      : 'Trực tiếp [TT]',
    it.onlineContentDetail || '',
    it.onlinePlatform || '',
    (it.digitalCompetenceCodes || []).join(', '),
    it.digitalCompetenceDetail || '',
    (it.aiEducationCodes || []).join(', '),
    it.aiEducationDetail || '',
    it.departmentGuidanceRef || it.notes || '',
  ]);

  rows.push([
    'TỔNG CỘNG',
    '--',
    'TẤT CẢ CÁC BÀI HỌC KHTN',
    `Đã phân bổ: ${ppct.totalPeriodsAllocated} tiết`,
    ppct.totalPeriodsAllocated,
    `Quy định: ${ppct.totalPeriodsRequired} tiết`,
    `Tỷ lệ Online: ${ppct.onlineRatioPercent || 0}% (${ppct.isOnlineRatioValid ? 'Đạt chuẩn TT 09 <= 35%' : 'Vượt trần'})`,
    `Tổng số tiết trực tuyến / kết hợp: ${ppct.totalOnlinePeriods || 0} tiết`,
    '--',
    '--',
    '--',
    '--',
    '--',
    ppct.isBalanced ? 'Đã cân đối 100%' : 'Chưa cân đối',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, 'PPCT KHTN Chi Tiết');

  // Sheet 2: Thống kê kiểm định Năng lực số & Dạy học AI & Dạy học Online
  const statHeaders = ['Chỉ tiêu kiểm định', 'Giá trị thực tế', 'Tiêu chuẩn quy định', 'Đánh giá'];
  const statRows: any[][] = [
    [
      'Tổng số tiết chương trình',
      `${ppct.totalPeriodsAllocated} tiết`,
      `${ppct.totalPeriodsRequired} tiết`,
      ppct.isBalanced ? 'ĐẠT CHUẨN' : 'CHƯA ĐẠT',
    ],
    [
      'Số tiết dạy học Trực tuyến & Kết hợp',
      `${ppct.totalOnlinePeriods || 0} tiết`,
      'Không quá 35% tổng thời lượng',
      ppct.isOnlineRatioValid ? 'ĐẠT CHUẨN THÔNG TƯ 09/2021' : 'VƯỢT TRẦN',
    ],
    [
      'Tỷ lệ dạy học trực tuyến thực tế',
      `${ppct.onlineRatioPercent || 0}%`,
      'Tối đa 35% (Cấp THCS)',
      ppct.isOnlineRatioValid ? 'ĐẠT CHUẨN' : 'CẦN ĐIỀU CHỈNH GIẢM',
    ],
    ['---', '---', '---', '---'],
    ['THỐNG KÊ TÍCH HỢP NĂNG LỰC SỐ (NLS)', 'SỐ TIẾT TÍCH HỢP', 'MÃ CHỈ ĐỊNH', 'CHUẨN KHUNG'],
  ];

  if (ppct.digitalCompetenceSummary) {
    ppct.digitalCompetenceSummary.forEach((s) => {
      statRows.push([s.label, `${s.count} tiết`, s.code, 'Khung Năng lực số']);
    });
  }

  statRows.push(['---', '---', '---', '---']);
  statRows.push(['THỐNG KÊ TÍCH HỢP DẠY HỌC AI', 'SỐ TIẾT TÍCH HỢP', 'MÃ CHỈ ĐỊNH', 'ĐỊNH HƯỚNG']);
  if (ppct.aiEducationSummary) {
    ppct.aiEducationSummary.forEach((s) => {
      statRows.push([s.label, `${s.count} tiết`, s.code, 'Khung Dạy học AI']);
    });
  }

  const wsStats = XLSX.utils.aoa_to_sheet([statHeaders, ...statRows]);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Thống kê NLS - AI - Online');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Export PPCT to Word (.docx) chuẩn format văn bản Bộ Giáo dục & Đào tạo
 */
export async function exportPPCTToDocx(ppct: PPCTData, filename: string) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 5, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mã PPCT', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bài học / Nội dung', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Số tiết', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Thời điểm', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Hình thức', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nội dung Online / Năng lực số / AI', bold: true, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: 'EBF3FB' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ghi chú / Nguồn', bold: true, size: 18 })] })],
        }),
      ],
    }),
    ...ppct.items.map(
      (it) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${it.stt}`, size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: it.lessonCode || `[PPCT-${it.stt}]`, bold: true, size: 18, color: '003366' })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: it.topicOrLesson, bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: it.content, size: 17, italics: true })], spacing: { before: 40 } }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${it.periods}`, bold: true, size: 18 })] }),
                ...(it.periodIndex ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `(Tiết ${it.periodIndex})`, size: 15, color: '64748B' })] })] : []),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: it.timeline, size: 17 })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: it.teachingMethod === 'online' ? '[ONLINE]' : it.teachingMethod === 'blended' ? '[KẾT HỢP]' : '[TT]',
                      bold: true,
                      size: 18,
                      color: it.teachingMethod === 'online' ? 'B91C1C' : it.teachingMethod === 'blended' ? 'D97706' : '15803D',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                ...(it.onlineContentDetail
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• Online: ', bold: true, size: 17, color: '0284C7' }),
                          new TextRun({ text: it.onlineContentDetail, size: 17 }),
                        ],
                      }),
                    ]
                  : []),
                ...(it.digitalCompetenceCodes && it.digitalCompetenceCodes.length > 0
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• NLS: ', bold: true, size: 17, color: '0D9488' }),
                          new TextRun({ text: `${it.digitalCompetenceCodes.join(' ')}: ${it.digitalCompetenceDetail || ''}`, size: 17 }),
                        ],
                        spacing: { before: 40 },
                      }),
                    ]
                  : []),
                ...(it.aiEducationCodes && it.aiEducationCodes.length > 0
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: '• AI: ', bold: true, size: 17, color: '7C3AED' }),
                          new TextRun({ text: `${it.aiEducationCodes.join(' ')}: ${it.aiEducationDetail || ''}`, size: 17 }),
                        ],
                        spacing: { before: 40 },
                      }),
                    ]
                  : []),
              ],
            }),
            new TableCell({
              children: [
                ...(it.location ? [new Paragraph({ children: [new TextRun({ text: `📍 ${it.location}`, bold: true, size: 16, color: '0F172A' })] })] : []),
                ...(it.equipmentAndMaterials ? [new Paragraph({ children: [new TextRun({ text: `🔬 ${it.equipmentAndMaterials}`, size: 15, color: '334155' })], spacing: { before: 30 } })] : []),
                new Paragraph({ children: [new TextRun({ text: it.departmentGuidanceRef || it.notes || it.sourceRef || '', size: 15, italics: true, color: '64748B' })], spacing: { before: 30 } }),
              ],
            }),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'KẾ HOẠCH DẠY HỌC MÔN KHOA HỌC TỰ NHIÊN\n', bold: true, size: 26 }),
              new TextRun({ text: `KHỐI LỚP ${ppct.grade} - NĂM HỌC ${ppct.schoolYear}\n`, bold: true, size: 24 }),
              new TextRun({
                text: `(Tích hợp Năng lực số, Dạy học AI, Mã hóa chỉ định và Dạy học trực tuyến theo Thông tư 09/2021/TT-BGDĐT)\n\n`,
                italics: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `• Tổng số tiết phân phối: `, bold: true }),
              new TextRun({ text: `${ppct.totalPeriodsAllocated} / ${ppct.totalPeriodsRequired} tiết (${ppct.isBalanced ? 'Đã cân đối 100%' : 'Chưa cân đối'})\n` }),
              new TextRun({ text: `• Thời lượng dạy học trực tuyến / kết hợp: `, bold: true }),
              new TextRun({ text: `${ppct.totalOnlinePeriods || 0} tiết (${ppct.onlineRatioPercent || 0}% - Chuẩn Thông tư 09/2021: <= 35%)\n` }),
            ],
            spacing: { after: 150 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
}

/**
 * Export Native Word (.docx) for Exam 7991
 */
export async function exportExamToDocx(workspace: Exam7991Workspace, filename: string) {
  const { config, examPaper, answers, gradingGuide } = workspace;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              bottom: 1134,
              left: 1417, // ~2.5cm
              right: 1134,
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${config.schoolName || 'TRƯỜNG THCS NGUYỄN DU'}\n`, bold: true, size: 24 }),
              new TextRun({ text: `${config.examType || 'ĐỀ KIỂM TRA ĐỊNH KỲ'} - MÔN KHOA HỌC TỰ NHIÊN ${config.grade}\n`, bold: true, size: 26 }),
              new TextRun({ text: `Thời gian làm bài: ${config.durationMinutes} phút (Không kể thời gian phát đề)\n\n`, italics: true, size: 22 }),
            ],
          }),

          // Content of Exam
          ...examPaper.parts.flatMap((part) => [
            new Paragraph({
              children: [new TextRun({ text: part.partTitle, bold: true, size: 24 })],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [new TextRun({ text: part.instructions, italics: true })],
              spacing: { after: 150 },
            }),
            ...part.questions.flatMap((q) => [
              new Paragraph({
                children: [
                  new TextRun({ text: `Câu ${q.num} (${q.score}đ): `, bold: true }),
                  new TextRun({ text: q.stem }),
                ],
                spacing: { before: 100, after: 50 },
              }),
              ...(q.options
                ? q.options.map(
                    (opt) =>
                      new Paragraph({
                        text: opt,
                        indent: { left: 400 },
                        spacing: { after: 40 },
                      })
                  )
                : []),
              ...(q.subQuestions
                ? q.subQuestions.map(
                    (sub) =>
                      new Paragraph({
                        text: `${sub.label}. ${sub.text}`,
                        indent: { left: 400 },
                        spacing: { after: 40 },
                      })
                  )
                : []),
            ]),
          ]),

          new Paragraph({
            text: '-------------------------- HẾT ĐỀ THI --------------------------',
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 300 },
          }),

          // ĐÁP ÁN VÀ THANG ĐIỂM
          new Paragraph({
            children: [new TextRun({ text: 'ĐÁP ÁN VÀ BIỂU ĐIỂM CHI TIẾT', bold: true, size: 26 })],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          ...answers.map(
            (ans) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `Câu ${ans.questionNum}: `, bold: true }),
                  new TextRun({ text: `Đáp án: ${ans.answer} `, bold: true, color: '006600' }),
                  new TextRun({ text: `(${ans.score} điểm) - ${ans.explanation}` }),
                ],
                spacing: { after: 60 },
              })
          ),

          // HƯỚNG DẪN CHẤM TỰ LUẬN
          ...(gradingGuide.length > 0
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'HƯỚNG DẪN CHẤM CÂU HỎI TỰ LUẬN', bold: true, size: 24 })],
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300, after: 150 },
                }),
                ...gradingGuide.flatMap((g) => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `Câu ${g.questionNum}: `, bold: true }),
                      new TextRun({ text: `${g.stem} (Tổng: ${g.totalScore}đ)`, italics: true }),
                    ],
                    spacing: { before: 100, after: 50 },
                  }),
                  ...g.criteria.map(
                    (c) =>
                      new Paragraph({
                        text: `• [${c.score}đ] ${c.idea}: ${c.requirement}`,
                        indent: { left: 400 },
                        spacing: { after: 40 },
                      })
                  ),
                ]),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
}

/**
 * Export Lesson Plan 5512 to Native Word (.docx)
 */
/**
 * Export Lesson Plan 5512 to Native Word (.docx) with 2-Column Table and PPCT Period Breakdown
 */
function build2ColumnActivityTable(act: LessonPlan5512Data['activities'][0]) {
  const twoCol = act.execution.twoColumns;

  const step1Teacher = twoCol?.step1?.teacherActivity || act.execution.step1_transfer;
  const step1Student = twoCol?.step1?.studentActivity || 'HS tiếp nhận nhiệm vụ học tập, quan sát hướng dẫn của GV và chuẩn bị thực hiện.';

  const step2Teacher = twoCol?.step2?.teacherActivity || 'GV quan sát, theo dõi quá trình thực hiện nhiệm vụ của HS, hỗ trợ khi cần thiết.';
  const step2Student = twoCol?.step2?.studentActivity || act.execution.step2_execute;

  const step3Teacher = twoCol?.step3?.teacherActivity || 'GV yêu cầu đại diện báo cáo, điều phối học sinh nhận xét và thảo luận.';
  const step3Student = twoCol?.step3?.studentActivity || act.execution.step3_report;

  const step4Teacher = twoCol?.step4?.teacherActivity || act.execution.step4_conclude;
  const step4Student = twoCol?.step4?.studentActivity || 'HS đối chiếu kết quả, ghi nhận kết luận chuẩn của GV và hoàn thiện vở ghi.';

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Tiêu đề 2 cột
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'EBF3FB' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'HOẠT ĐỘNG CỦA GIÁO VIÊN', bold: true, size: 20, color: '003366' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'EBF3FB' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'HOẠT ĐỘNG CỦA HỌC SINH', bold: true, size: 20, color: '003366' })],
              }),
            ],
          }),
        ],
      }),
      // Hàng 1: Bước 1
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 1: Chuyển giao nhiệm vụ học tập', bold: true, color: '003366' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step1Teacher }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 1: Tiếp nhận nhiệm vụ học tập', bold: true, color: '006600' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step1Student }),
            ],
          }),
        ],
      }),
      // Hàng 2: Bước 2
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 2: Theo dõi, hướng dẫn thực hiện', bold: true, color: '003366' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step2Teacher }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 2: Thực hiện nhiệm vụ học tập', bold: true, color: '006600' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step2Student }),
            ],
          }),
        ],
      }),
      // Hàng 3: Bước 3
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 3: Tổ chức báo cáo, thảo luận', bold: true, color: '003366' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step3Teacher }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 3: Báo cáo kết quả và thảo luận', bold: true, color: '006600' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step3Student }),
            ],
          }),
        ],
      }),
      // Hàng 4: Bước 4
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 4: Đánh giá, chuẩn hóa kiến thức', bold: true, color: '003366' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step4Teacher }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Bước 4: Tiếp nhận kết luận, hoàn thiện vở', bold: true, color: '006600' })],
                spacing: { after: 60 },
              }),
              new Paragraph({ text: step4Student }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function exportLessonPlanToDocx(plan: LessonPlan5512Data, filename: string) {
  // Group activities by periods according to PPCT
  const periodList =
    plan.periods && plan.periods.length > 0
      ? plan.periods
      : [
          {
            periodNumber: 1,
            ppctPeriodIndex: 1,
            ppctMainContent: `${plan.lessonTitle} - Nội dung chủ yếu theo phân phối chương trình`,
            activities: plan.activities,
          },
        ];

  const activitiesElements: (Paragraph | Table)[] = [];

  periodList.forEach((period) => {
    activitiesElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `TIẾT ${period.periodNumber} (Theo PPCT: Tiết ${period.ppctPeriodIndex || period.periodNumber}): ${period.ppctMainContent.toUpperCase()}`,
            bold: true,
            size: 24,
            color: '990000',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
      })
    );

    if (period.targetCompetencies) {
      activitiesElements.push(
        new Paragraph({
          children: [
            new TextRun({ text: '* Trọng tâm tiết dạy: ', bold: true, italics: true }),
            new TextRun({ text: period.targetCompetencies, italics: true }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    period.activities.forEach((act) => {
      activitiesElements.push(
        new Paragraph({
          children: [new TextRun({ text: act.name, bold: true, size: 22, color: '003366' })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 60 },
        }),
        new Paragraph({ text: `a) Mục tiêu: ${act.goal}`, indent: { left: 200 }, spacing: { after: 40 } }),
        new Paragraph({ text: `b) Nội dung: ${act.content}`, indent: { left: 200 }, spacing: { after: 40 } }),
        new Paragraph({ text: `c) Sản phẩm: ${act.product}`, indent: { left: 200 }, spacing: { after: 60 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'd) Tổ chức thực hiện (Bảng 2 cột: Hoạt động của giáo viên | Hoạt động của học sinh):',
              bold: true,
            }),
          ],
          indent: { left: 200 },
          spacing: { after: 80 },
        }),
        build2ColumnActivityTable(act),
        new Paragraph({ text: '', spacing: { after: 120 } })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'KẾ HOẠCH BÀI DẠY (THEO CÔNG VĂN 5512/BGDĐT)\n', bold: true, size: 28 }),
              new TextRun({ text: `MÔN KHOA HỌC TỰ NHIÊN ${plan.grade}\n`, bold: true, size: 26 }),
              new TextRun({ text: `BÀI: ${plan.lessonTitle.toUpperCase()}\n`, bold: true, size: 26, color: '003366' }),
              new TextRun({
                text: `Thời lượng: ${plan.durationPeriods} tiết ${plan.ppctReference ? `(${plan.ppctReference.periodRange})` : ''} | Mã chỉ định: ${plan.lessonCode || plan.ppctReference?.lessonCode || 'PPCT-KHTN'}\n`,
                italics: true,
                size: 20,
              }),
              new TextRun({
                text: `Hình thức tổ chức: ${
                  plan.teachingMethod === 'online'
                    ? 'Trực tuyến [ONLINE]'
                    : plan.teachingMethod === 'blended'
                    ? 'Kết hợp [KẾT HỢP]'
                    : 'Trực tiếp [TT]'
                }\n\n`,
                bold: true,
                size: 20,
                color: plan.teachingMethod === 'online' ? 'B91C1C' : plan.teachingMethod === 'blended' ? 'D97706' : '15803D',
              }),
            ],
          }),

          ...(plan.onlineContentDetail
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'NỘI DUNG DẠY HỌC TRỰC TUYẾN ĐÃ XÁC ĐỊNH TRONG PPCT (TT 09/2021/TT-BGDĐT): ', bold: true, size: 20, color: '0284C7' }),
                    new TextRun({ text: plan.onlineContentDetail, italics: true, size: 20 }),
                  ],
                  spacing: { before: 80, after: 120 },
                }),
              ]
            : []),

          // I. MỤC TIÊU
          new Paragraph({
            children: [new TextRun({ text: 'I. MỤC TIÊU DẠY HỌC', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun({ text: '1. Kiến thức:', bold: true })] }),
          ...plan.objectives.knowledge.map((k) => new Paragraph({ text: `• ${k}`, indent: { left: 400 } })),

          new Paragraph({ children: [new TextRun({ text: '2. Năng lực:', bold: true })], spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: 'a) Năng lực Khoa học tự nhiên:', italics: true })], indent: { left: 200 } }),
          ...plan.objectives.competencies.khtn.map((c) => new Paragraph({ text: `• ${c}`, indent: { left: 400 } })),
          new Paragraph({ children: [new TextRun({ text: 'b) Năng lực chung:', italics: true })], indent: { left: 200 } }),
          ...plan.objectives.competencies.general.map((c) => new Paragraph({ text: `• ${c}`, indent: { left: 400 } })),

          new Paragraph({ children: [new TextRun({ text: `c) Năng lực số (NLS) ${(plan.digitalCompetenceCodes || []).join(' ')}:`, italics: true, color: '0D9488' })], indent: { left: 200 } }),
          ...(plan.objectives.competencies.digital && plan.objectives.competencies.digital.length > 0
            ? plan.objectives.competencies.digital.map((d) => new Paragraph({ text: `• ${d}`, indent: { left: 400 } }))
            : [new Paragraph({ text: `• ${plan.digitalCompetenceDetail || 'Sử dụng thí nghiệm ảo và phần mềm số.'}`, indent: { left: 400 } })]),

          new Paragraph({ children: [new TextRun({ text: `d) Dạy học Trí tuệ nhân tạo (AI) ${(plan.aiEducationCodes || []).join(' ')}:`, italics: true, color: '7C3AED' })], indent: { left: 200 } }),
          ...(plan.objectives.competencies.aiEducation && plan.objectives.competencies.aiEducation.length > 0
            ? plan.objectives.competencies.aiEducation.map((ai) => new Paragraph({ text: `• ${ai}`, indent: { left: 400 } }))
            : [new Paragraph({ text: `• ${plan.aiEducationDetail || 'Ứng dụng AI phân tích dữ liệu và đạo đức số.'}`, indent: { left: 400 } })]),

          new Paragraph({ children: [new TextRun({ text: '3. Phẩm chất:', bold: true })], spacing: { before: 100 } }),
          ...plan.objectives.qualities.map((q) => new Paragraph({ text: `• ${q}`, indent: { left: 400 } })),

          // II. THIẾT BỊ DẠY HỌC
          new Paragraph({
            children: [new TextRun({ text: 'II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({ children: [new TextRun({ text: '1. Giáo viên:', bold: true })] }),
          ...plan.equipment.teacher.map((e) => new Paragraph({ text: `• ${e}`, indent: { left: 400 } })),
          new Paragraph({ children: [new TextRun({ text: '2. Học sinh:', bold: true })], spacing: { before: 80 } }),
          ...plan.equipment.student.map((e) => new Paragraph({ text: `• ${e}`, indent: { left: 400 } })),

          // III. TIẾN TRÌNH DẠY HỌC (PHÂN THEO NỘI DUNG CHỦ YẾU CỦA PPCT VÀ BẢNG 2 CỘT)
          new Paragraph({
            children: [
              new TextRun({
                text: 'III. TIẾN TRÌNH DẠY HỌC (CHI TIẾT THEO CÁC TIẾT TRONG PPCT)',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 220, after: 100 },
          }),

          ...activitiesElements,

          // IV. KIỂM ĐỊNH TÍNH TƯƠNG THÍCH ĐÁNH GIÁ
          new Paragraph({
            children: [new TextRun({ text: 'IV. ĐÁNH GIÁ SỰ PHÙ HỢP CỦA TIẾN TRÌNH VỚI MỤC TIÊU', bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Trạng thái: ', bold: true }),
              new TextRun({ text: plan.assessmentMatchCheck.valid ? 'ĐẠT CHUẨN CÔNG VĂN 5512' : 'CẦN ĐIỀU CHỈNH', bold: true, color: '008800' }),
            ],
          }),
          new Paragraph({
            text: plan.assessmentMatchCheck.explanation,
            indent: { left: 200 },
            spacing: { before: 60, after: 100 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
}

/**
 * Print to PDF (uses browser native print with styled container)
 */
export function printElementToPDF(elementId: string, docTitle: string) {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${docTitle}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 20mm 15mm 20mm 20mm; }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          h1, h2, h3, h4 { font-family: "Times New Roman", serif; font-weight: bold; margin: 10px 0 6px 0; }
          h1 { font-size: 16pt; text-align: center; }
          h2 { font-size: 14pt; }
          h3 { font-size: 13pt; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11pt; }
          th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
