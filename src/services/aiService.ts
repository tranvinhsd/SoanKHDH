import {
  Grade,
  PPCTData,
  TeachingMethod,
  LessonPlan5512Data,
  WorksheetData,
  ReviewOutlineData,
  Exam7991Workspace,
  SourceDocument,
  SourceLockSettings,
  MatrixData,
  SpecificationItem,
  QuestionBankItem,
  ExamPaperData,
  AnswerKeyItem,
  GradingGuideItem,
  PeriodLessonPlan,
  LessonActivityItem,
} from '../types';
import {
  KHTN_CURRICULUM,
  DIGITAL_COMPETENCE_STANDARDS,
  AI_EDUCATION_STANDARDS,
  ONLINE_TEACHING_GUIDELINE,
} from '../data/curriculumKHTN';
import { runValidationPipeline, autoFixExamWorkspace } from './validator7991';

/**
 * Call server-side Gemini API
 */
async function callGeminiAPI(payload: {
  module: string;
  task: string;
  sourceDocuments: Array<{ name: string; content: string }>;
  userInput: any;
  config: any;
  sourceLock: boolean;
  allowExternalKnowledge: boolean;
  previousStepsData?: any;
}) {
  try {
    const res = await fetch('/api/gemini/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`Server responded with status ${res.status}, switching to built-in generator.`);
      return { success: false, useClientFallback: true };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API call error, switching to built-in generator:', err);
    return { success: false, useClientFallback: true };
  }
}

/**
 * Document Analysis Service (RAG)
 * Bước 1: Đọc file
 * Bước 2: Trích xuất nội dung
 * Bước 3: Phân loại (Chủ đề, Bài học, Kiến thức, Yêu cầu cần đạt, Số tiết, Câu hỏi, Bảng biểu, Hình ảnh)
 * Bước 4: Tạo chỉ mục nội bộ
 * Bước 5: Đánh dấu nguồn
 */
export async function analyzeDocumentWithAI(
  doc: SourceDocument,
  settings: SourceLockSettings
): Promise<SourceDocument['extractedAnalysis']> {
  const content = doc.content;

  // If server Gemini is available, query it
  const apiRes = await callGeminiAPI({
    module: 'documents',
    task: 'Phân tích tài liệu giáo khoa KHTN',
    sourceDocuments: [{ name: doc.name, content: doc.content }],
    userInput: { fileName: doc.name },
    config: {},
    sourceLock: settings.sourceLock,
    allowExternalKnowledge: settings.allowExternalKnowledge,
  });

  if (apiRes && apiRes.success && apiRes.result) {
    try {
      const parsed = JSON.parse(apiRes.result);
      if (parsed.topics && parsed.requirements) {
        return parsed;
      }
    } catch {
      // Continue to deterministic extraction
    }
  }

  // Deterministic pedagogical extraction
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const topics: string[] = [];
  const lessons: string[] = [];
  const requirements: string[] = [];
  const sampleQuestions: string[] = [];
  const knowledgeUnits: string[] = [];
  const tablesAndFigures: string[] = [];

  lines.forEach((line) => {
    if (/^(chương|chủ đề|phần|bài|bài học)\s+\d+/i.test(line) || /^[IVXLCDM]+\.\s+/i.test(line)) {
      if (/^(bài|bài học)\s+\d+/i.test(line)) {
        lessons.push(line);
      } else {
        topics.push(line);
      }
    } else if (/(yêu cầu cần đạt|mục tiêu|học sinh cần|nêu được|trình bày được|vận dụng được)/i.test(line)) {
      requirements.push(line);
    } else if (/^(câu\s+\d+|câu hỏi|\?|bài tập)/i.test(line) || /\?$/.test(line)) {
      sampleQuestions.push(line);
    } else if (/(định nghĩa|khái niệm|công thức|phương trình|nguyên lí|định luật)/i.test(line)) {
      knowledgeUnits.push(line);
    } else if (/(bảng|hình|sơ đồ|đồ thị)\s+\d+/i.test(line)) {
      tablesAndFigures.push(line);
    }
  });

  // Fallbacks if text was brief
  if (topics.length === 0) {
    topics.push(`Chủ đề KHTN trích xuất từ [${doc.name}]`);
  }
  if (lessons.length === 0) {
    lessons.push(`Bài học trích xuất từ [${doc.name}]`);
  }
  if (requirements.length === 0) {
    requirements.push(
      `Hiểu và trình bày được nội dung cốt lõi của bài học trong [${doc.name}]`,
      `Vận dụng kiến thức khoa học tự nhiên để giải thích các hiện tượng thực tế`
    );
  }
  if (knowledgeUnits.length === 0) {
    knowledgeUnits.push('Khái niệm trọng tâm', 'Quy tắc và phương pháp thực nghiệm KHTN');
  }

  // Tự động phân tích & tích hợp Năng lực số, Dạy học AI, Dạy học Online & Mã chỉ định từ nguồn
  const lowerContent = content.toLowerCase();
  const digitalCompetencies: string[] = [];
  const aiEducationTopics: string[] = [];
  const onlineTeachingItems: string[] = [];
  const designatedCodes: string[] = [];

  // 1. Phân tích Năng lực số (NLS)
  if (lowerContent.includes('thí nghiệm') || lowerContent.includes('mô phỏng') || lowerContent.includes('đo đạc') || lowerContent.includes('phet')) {
    digitalCompetencies.push('[NLS.2] Thí nghiệm ảo & Mô phỏng hiện tượng KHTN trên máy tính (PhET/Yenka)');
  }
  if (lowerContent.includes('tốc độ') || lowerContent.includes('thời gian') || lowerContent.includes('số liệu') || lowerContent.includes('đồ thị') || lowerContent.includes('bảng')) {
    digitalCompetencies.push('[NLS.3] Bảng tính điện tử (Excel/Sheets) & cảm biến đo đạc xử lý số liệu thực nghiệm');
  }
  if (lowerContent.includes('nguyên tử') || lowerContent.includes('bảng tuần hoàn') || lowerContent.includes('tế bào') || lowerContent.includes('tra cứu')) {
    digitalCompetencies.push('[NLS.1] Khai thác, tra cứu học liệu số và bảng tuần hoàn/mô hình 3D tương tác');
  }
  if (digitalCompetencies.length === 0) {
    digitalCompetencies.push('[NLS.4] Sáng tạo sản phẩm học tập số & Infographic tóm tắt kiến thức');
  }
  digitalCompetencies.push('[NLS.5] Hợp tác và nộp bài trên hệ thống học tập số (LMS/Google Classroom/Azota)');

  // 2. Phân tích Dạy học AI
  if (lowerContent.includes('tế bào') || lowerContent.includes('sinh vật') || lowerContent.includes('động vật') || lowerContent.includes('thực vật') || lowerContent.includes('nguyên tố')) {
    aiEducationTopics.push('[AI.1] Thị giác AI & Nhận diện thông minh hình ảnh sinh vật/mẫu khoáng vật tự nhiên (Seek/Google Lens)');
  }
  if (lowerContent.includes('chuyển động') || lowerContent.includes('đồ thị') || lowerContent.includes('tốc độ') || lowerContent.includes('dự báo') || lowerContent.includes('khí hậu')) {
    aiEducationTopics.push('[AI.3] Ứng dụng AI phân tích xu hướng đồ thị chuyển động, dự báo và mô hình hóa khoa học');
  }
  aiEducationTopics.push('[AI.2] Kỹ năng Prompting đặt câu hỏi khoa học cho trợ lý AI và đối chiếu kiểm chứng thông tin');
  aiEducationTopics.push('[AI.4] Giáo dục sử dụng AI an toàn, có trách nhiệm và liêm chính học thuật trong học tập KHTN');

  // 3. Phân tích & Chỉ rõ nội dung dạy học Online
  lessons.forEach((les, idx) => {
    const isOnlineLesson = idx % 3 === 1;
    if (isOnlineLesson) {
      onlineTeachingItems.push(`${les}: Nhiệm vụ chuẩn bị trước trên LMS (K12Online), xem video mô phỏng và hoàn thành phiếu học tập số`);
    }
  });
  if (onlineTeachingItems.length === 0) {
    onlineTeachingItems.push(`Tự học có hướng dẫn qua hệ thống LMS đối với nội dung ôn tập chủ đề và luyện tập số`);
  }

  // 4. Mã chỉ định chuẩn hóa
  lessons.forEach((_, idx) => {
    designatedCodes.push(`[PPCT-SRC-B${String(idx + 1).padStart(2, '0')}]`);
  });
  designatedCodes.push('[NLS.1]', '[NLS.2]', '[AI.1]', '[AI.3]', '[TT]', '[ONLINE]', '[KẾT HỢP]');

  return {
    topics: topics.slice(0, 8),
    lessons: lessons.slice(0, 15),
    knowledgeUnits: knowledgeUnits.slice(0, 12),
    requirements: requirements.slice(0, 10),
    periods: Math.max(1, Math.min(30, lessons.length * 2 || 4)),
    sampleQuestions: sampleQuestions.slice(0, 8),
    tablesAndFigures: tablesAndFigures.slice(0, 6),
    digitalCompetencies,
    aiEducationTopics,
    onlineTeachingItems,
    designatedCodes,
  };
}

/**
 * MODULE 1: XÂY DỰNG PHÂN PHỐI CHƯƠNG TRÌNH (PPCT)
 * Căn cứ hướng dẫn chỉ đạo chuyên môn Sở GD&ĐT, chuẩn SGK Kết nối tri thức/Cánh diều/GDPT 2018
 * Phân bổ 140 tiết chi tiết, Tiết thứ liên tục, Thiết bị dạy học và Năng lực số / AI
 */
export { generatePPCTWithAI } from './ppctGenerator';


/**
 * MODULE 2: SOẠN KẾ HOẠCH BÀI DẠY (GIÁO ÁN 5512)
 * Logic is dynamically tailored to the selected lesson and periods count in lessonPlan5512Generator
 */
export {
  generateLessonPlan5512WithAI,
  generatePedagogicalLessonPlan5512,
} from './lessonPlan5512Generator';

// MODULE 3: TẠO PHIẾU HỌC TẬP & MODULE 4: ĐỀ CƯƠNG ÔN TẬP
export {
  generateWorksheetWithAI,
  generatePedagogicalWorksheet,
} from './worksheetGenerator';

export {
  generateReviewOutlineWithAI,
  generatePedagogicalReviewOutline,
} from './reviewOutlineGenerator';

/**
 * MODULE 5: HỆ THỐNG KIỂM TRA 7991 PIPELINE
 * Builds standard default Exam Workspace for Step 1 -> 8
 */
export function buildDefaultExam7991Workspace(grade: Grade = '7'): Exam7991Workspace {
  // Setup standard 7991 matrix: 70% Trắc nghiệm (28 câu x 0.25đ = 7.0đ) + 30% Tự luận (3 câu = 3.0đ) = 10.0đ
  const matrixRows: MatrixData['rows'] = [
    {
      id: 'row-1',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử, Nguyên tố hóa học và Bảng tuần hoàn',
      recognition: { mcCount: 7, essayCount: 0, score: 1.75 },
      understanding: { mcCount: 4, essayCount: 0, score: 1.0 },
      application: { mcCount: 1, essayCount: 1, score: 1.25 }, // 0.25 MC + 1.0 Essay
      highApplication: { mcCount: 0, essayCount: 0, score: 0.0 },
      totalQuestions: 13,
      totalScore: 4.0,
    },
    {
      id: 'row-2',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động và đồ thị quãng đường - thời gian',
      recognition: { mcCount: 5, essayCount: 0, score: 1.25 },
      understanding: { mcCount: 3, essayCount: 0, score: 0.75 },
      application: { mcCount: 2, essayCount: 1, score: 1.5 }, // 0.5 MC + 1.0 Essay
      highApplication: { mcCount: 0, essayCount: 0, score: 0.0 },
      totalQuestions: 11,
      totalScore: 3.5,
    },
    {
      id: 'row-3',
      topic: 'Vật sống',
      content: 'Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Quang hợp & Hô hấp)',
      recognition: { mcCount: 4, essayCount: 0, score: 1.0 },
      understanding: { mcCount: 2, essayCount: 0, score: 0.5 },
      application: { mcCount: 0, essayCount: 0, score: 0.0 },
      highApplication: { mcCount: 0, essayCount: 1, score: 1.0 }, // 1.0 Essay
      totalQuestions: 7,
      totalScore: 2.5,
    },
  ];

  const totalScore = 10.0;

  const matrix: MatrixData = {
    rows: matrixRows,
    totalScore,
    targetScore: 10.0,
    isBalanced: true,
    cognitiveRatios: {
      recognition: 40,
      understanding: 30,
      application: 20,
      highApplication: 10,
    },
  };

  // Specification
  const specification: SpecificationItem[] = [
    {
      id: 'SPEC-01',
      matrixRowId: 'row-1',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử, Nguyên tố hóa học và Bảng tuần hoàn',
      requirement: 'Nhận biết được mô hình Rutherford - Bohr, điện tích hạt nhân, kí hiệu hóa học của 20 nguyên tố đầu',
      level: 'Nhận biết',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 7,
      questionIds: ['Q001', 'Q002', 'Q003', 'Q004', 'Q005', 'Q006', 'Q007'],
    },
    {
      id: 'SPEC-02',
      matrixRowId: 'row-1',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử, Nguyên tố hóa học và Bảng tuần hoàn',
      requirement: 'Xác định được vị trí của nguyên tố trong bảng tuần hoàn (ô, chu kì, nhóm) từ số hạt electron',
      level: 'Thông hiểu',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 4,
      questionIds: ['Q008', 'Q009', 'Q010', 'Q011'],
    },
    {
      id: 'SPEC-03',
      matrixRowId: 'row-1',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử, Nguyên tố hóa học và Bảng tuần hoàn',
      requirement: 'Vận dụng lập công thức hóa học và tính phần trăm khối lượng nguyên tố trong hợp chất',
      level: 'Vận dụng',
      questionType: 'Tự luận',
      questionCount: 2,
      questionIds: ['Q012', 'Q029'],
    },
    {
      id: 'SPEC-04',
      matrixRowId: 'row-2',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động và đồ thị quãng đường - thời gian',
      requirement: 'Nêu được định nghĩa tốc độ, công thức v = s / t và đơn vị đo tốc độ',
      level: 'Nhận biết',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 5,
      questionIds: ['Q013', 'Q014', 'Q015', 'Q016', 'Q017'],
    },
    {
      id: 'SPEC-05',
      matrixRowId: 'row-2',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động và đồ thị quãng đường - thời gian',
      requirement: 'Đọc và phân tích đồ thị quãng đường - thời gian, xác định trạng thái chuyển động hoặc đứng yên',
      level: 'Thông hiểu',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 3,
      questionIds: ['Q018', 'Q019', 'Q020'],
    },
    {
      id: 'SPEC-06',
      matrixRowId: 'row-2',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động và đồ thị quãng đường - thời gian',
      requirement: 'Vận dụng công thức v = s/t để giải bài toán hai vật chuyển động gặp nhau và an toàn giao thông',
      level: 'Vận dụng',
      questionType: 'Tự luận',
      questionCount: 3,
      questionIds: ['Q021', 'Q022', 'Q030'],
    },
    {
      id: 'SPEC-07',
      matrixRowId: 'row-3',
      topic: 'Vật sống',
      content: 'Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Quang hợp & Hô hấp)',
      requirement: 'Nêu được các nguyên liệu, sản phẩm và phương trình chữ của quá trình quang hợp và hô hấp tế bào',
      level: 'Nhận biết',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 4,
      questionIds: ['Q023', 'Q024', 'Q025', 'Q026'],
    },
    {
      id: 'SPEC-08',
      matrixRowId: 'row-3',
      topic: 'Vật sống',
      content: 'Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Quang hợp & Hô hấp)',
      requirement: 'Giải thích được các yếu tố ảnh hưởng đến quang hợp (ánh sáng, nước, CO2) và vai trò của khí khổng',
      level: 'Thông hiểu',
      questionType: 'Trắc nghiệm nhiều lựa chọn',
      questionCount: 2,
      questionIds: ['Q027', 'Q028'],
    },
    {
      id: 'SPEC-09',
      matrixRowId: 'row-3',
      topic: 'Vật sống',
      content: 'Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Quang hợp & Hô hấp)',
      requirement: 'Vận dụng cao: Đề xuất giải pháp kĩ thuật canh tác nông nghiệp công nghệ cao điều tiết quang hợp',
      level: 'Vận dụng cao',
      questionType: 'Tự luận',
      questionCount: 1,
      questionIds: ['Q031'],
    },
  ];

  // Question Bank: 28 MC (0.25đ each = 7.0đ) + 3 Essay (1.0đ each = 3.0đ) = exactly 31 questions, 10.0 points
  const questionBank: QuestionBankItem[] = [
    {
      id: 'Q001',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử',
      requirement: 'Nhận biết hạt mang điện tích âm trong nguyên tử',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Trong nguyên tử, hạt mang điện tích âm chuyển động xung quanh hạt nhân là:',
      options: ['A. Electron', 'B. Proton', 'C. Neutron', 'D. Hạt nhân'],
      correctAnswer: 'A',
      explanation: 'Electron mang điện tích âm (-), chuyển động rất nhanh trong không gian xung quanh hạt nhân.',
      source: 'SGK KHTN 7 - Bài 2',
    },
    {
      id: 'Q002',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử',
      requirement: 'Nhận biết điện tích của hạt nhân nguyên tử',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Hạt nhân nguyên tử cấu tạo gồm các loại hạt nào?',
      options: ['A. Proton và neutron', 'B. Proton và electron', 'C. Electron và neutron', 'D. Chỉ có proton'],
      correctAnswer: 'A',
      explanation: 'Hạt nhân nằm ở tâm nguyên tử, gồm các hạt proton (mang điện tích dương) và neutron (không mang điện).',
      source: 'SGK KHTN 7 - Bài 2',
    },
    {
      id: 'Q003',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tố hóa học',
      requirement: 'Nhận biết kí hiệu hóa học của Sodium',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Kí hiệu hóa học của nguyên tố Sodium là:',
      options: ['A. Na', 'B. S', 'C. So', 'D. K'],
      correctAnswer: 'A',
      explanation: 'Sodium có kí hiệu hóa học chuẩn quốc tế IUPAC là Na.',
      source: 'SGK KHTN 7 - Bài 3',
    },
    {
      id: 'Q004',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Nhận biết nguyên tắc sắp xếp nguyên tố trong bảng tuần hoàn',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Trong bảng tuần hoàn, các nguyên tố hóa học được sắp xếp theo chiều tăng dần của:',
      options: ['A. Điện tích hạt nhân nguyên tử', 'B. Khối lượng nguyên tử', 'C. Bán kính nguyên tử', 'D. Số neutron'],
      correctAnswer: 'A',
      explanation: 'Các nguyên tố được sắp xếp theo chiều tăng dần của điện tích hạt nhân nguyên tử.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q005',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Nhận biết khái niệm chu kì',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Chu kì trong bảng tuần hoàn là dãy các nguyên tố mà nguyên tử của chúng có cùng:',
      options: ['A. Số lớp electron', 'B. Số electron hóa trị', 'C. Số proton', 'D. Số neutron'],
      correctAnswer: 'A',
      explanation: 'Các nguyên tố trong cùng một chu kì có cùng số lớp electron trong nguyên tử.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q006',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Nhận biết số electron lớp ngoài cùng của khí hiếm',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Hầu hết các nguyên tử khí hiếm (trừ Helium có 2 electron) đều có số electron ở lớp ngoài cùng là:',
      options: ['A. 8 electron', 'B. 6 electron', 'C. 4 electron', 'D. 2 electron'],
      correctAnswer: 'A',
      explanation: 'Lớp electron ngoài cùng của khí hiếm đã bão hòa vững bền với 8 electron.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q007',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Nhận biết nhóm nguyên tố kim loại kiềm',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Các nguyên tố kim loại kiềm thuộc nhóm nào trong bảng tuần hoàn?',
      options: ['A. Nhóm IA', 'B. Nhóm IIA', 'C. Nhóm VIIA', 'D. Nhóm VIIIA'],
      correctAnswer: 'A',
      explanation: 'Kim loại kiềm (Li, Na, K, Rb, Cs) thuộc nhóm IA.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q008',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Nguyên tử',
      requirement: 'Xác định số proton, neutron, electron từ số khối',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Một nguyên tử Carbon có 6 proton và 6 neutron. Tổng số hạt mang điện trong nguyên tử Carbon này là:',
      options: ['A. 12 hạt', 'B. 6 hạt', 'C. 18 hạt', 'D. 8 hạt'],
      correctAnswer: 'A',
      explanation: 'Trong nguyên tử trung hòa điện: số electron = số proton = 6. Các hạt mang điện gồm proton và electron: 6 + 6 = 12 hạt.',
      source: 'SGK KHTN 7 - Bài 2',
    },
    {
      id: 'Q009',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Xác định vị trí ô nguyên tố trong bảng tuần hoàn',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Nguyên tử Magnesium có 12 electron. Vị trí của Magnesium ở ô số mấy trong bảng tuần hoàn?',
      options: ['A. Ô số 12', 'B. Ô số 6', 'C. Ô số 24', 'D. Ô số 3'],
      correctAnswer: 'A',
      explanation: 'Số thứ tự của ô nguyên tố bằng số hiệu nguyên tử (bằng số proton = số electron) = 12.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q010',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Bảng tuần hoàn',
      requirement: 'Xác định chu kì từ cấu hình electron',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Nguyên tử Chlorine có 17 electron được phân bố vào 3 lớp electron. Chlorine nằm ở chu kì mấy?',
      options: ['A. Chu kì 3', 'B. Chu kì 2', 'C. Chu kì 7', 'D. Chu kì 1'],
      correctAnswer: 'A',
      explanation: 'Số thứ tự chu kì bằng số lớp electron = 3.',
      source: 'SGK KHTN 7 - Bài 4',
    },
    {
      id: 'Q011',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Phân tử',
      requirement: 'Tính khối lượng phân tử',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Khối lượng phân tử của khí Carbon dioxide (CO2) là (biết C = 12 amu, O = 16 amu):',
      options: ['A. 44 amu', 'B. 28 amu', 'C. 32 amu', 'D. 40 amu'],
      correctAnswer: 'A',
      explanation: 'Khối lượng phân tử CO2 = 12 + 16 * 2 = 44 amu.',
      source: 'SGK KHTN 7 - Bài 5',
    },
    {
      id: 'Q012',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Hóa trị',
      requirement: 'Vận dụng quy tắc hóa trị',
      level: 'Vận dụng',
      type: 'mc',
      score: 0.25,
      stem: 'Hợp chất giữa nguyên tố Aluminium (hóa trị III) và nhóm Sulfate (SO4, hóa trị II) có công thức hóa học là:',
      options: ['A. Al2(SO4)3', 'B. AlSO4', 'C. Al3(SO4)2', 'D. Al2SO4'],
      correctAnswer: 'A',
      explanation: 'Theo quy tắc hóa trị: x * III = y * II -> x / y = 2 / 3 -> Công thức là Al2(SO4)3.',
      source: 'SGK KHTN 7 - Bài 7',
    },
    {
      id: 'Q013',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Nhận biết định nghĩa tốc độ',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Đại lượng cho biết mức độ nhanh hay chậm của chuyển động được gọi là:',
      options: ['A. Tốc độ', 'B. Quãng đường', 'C. Thời gian', 'D. Lực'],
      correctAnswer: 'A',
      explanation: 'Tốc độ là đại lượng đặc trưng cho sự nhanh, chậm của chuyển động.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q014',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Nhận biết công thức tính tốc độ',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Công thức tính tốc độ chuyển động là:',
      options: ['A. v = s / t', 'B. v = s * t', 'C. v = t / s', 'D. v = s + t'],
      correctAnswer: 'A',
      explanation: 'Tốc độ v bằng quãng đường đi được s chia cho thời gian t.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q015',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Nhận biết đơn vị đo tốc độ',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Một ô tô chạy với tốc độ 15 m/s. Tốc độ này tương đương với:',
      options: ['A. 54 km/h', 'B. 15 km/h', 'C. 36 km/h', 'D. 60 km/h'],
      correctAnswer: 'A',
      explanation: '1 m/s = 3.6 km/h -> 15 * 3.6 = 54 km/h.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q016',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Đo tốc độ',
      requirement: 'Nhận biết dụng cụ đo tốc độ',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Thiết bị nào sau đây thường được gắn trên xe máy, ô tô để chỉ tốc độ chuyển động tức thời?',
      options: ['A. Tốc kế (công tơ mét)', 'B. Nhiệt kế', 'C. Lực kế', 'D. Cân đồng hồ'],
      correctAnswer: 'A',
      explanation: 'Tốc kế dùng để đo trực tiếp tốc độ chuyển động của phương tiện.',
      source: 'SGK KHTN 7 - Bài 9',
    },
    {
      id: 'Q017',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Đo tốc độ',
      requirement: 'Nhận biết ưu điểm của cổng quang điện',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Ưu điểm lớn nhất của việc dùng cổng quang điện và đồng hồ đo thời gian hiện số để đo thời gian là:',
      options: [
        'A. Giảm thiểu sai số do phản xạ bấm giờ của con người',
        'B. Dụng cụ có kích thước rất nhỏ gọn',
        'C. Không cần đo quãng đường chuyển động',
        'D. Luôn cho kết quả bằng 0',
      ],
      correctAnswer: 'A',
      explanation: 'Hệ thống quang điện tự động ngắt/mở đồng hồ điện tử chính xác đến hàng phần nghìn giây, loại bỏ sai số bấm tay.',
      source: 'SGK KHTN 7 - Bài 9',
    },
    {
      id: 'Q018',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Đồ thị quãng đường - thời gian',
      requirement: 'Đọc đồ thị quãng đường - thời gian khi vật đứng yên',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Trên đồ thị quãng đường - thời gian (s - t), đoạn đồ thị song song với trục thời gian t biểu diễn:',
      options: [
        'A. Vật đang đứng yên không chuyển động',
        'B. Vật chuyển động nhanh dần đều',
        'C. Vật chuyển động thẳng đều',
        'D. Vật quay đầu chuyển động ngược lại',
      ],
      correctAnswer: 'A',
      explanation: 'Đoạn nằm ngang song song trục Ot biểu thị quãng đường s không đổi theo thời gian, tức vật đứng yên.',
      source: 'SGK KHTN 7 - Bài 10',
    },
    {
      id: 'Q019',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Tính tốc độ trung bình',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Một vận động viên bơi lội bơi hết quãng đường 100m trong thời gian 50 giây. Tốc độ bơi của người đó là:',
      options: ['A. 2 m/s', 'B. 5 m/s', 'C. 0.5 m/s', 'D. 50 m/s'],
      correctAnswer: 'A',
      explanation: 'v = s / t = 100 / 50 = 2 m/s.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q020',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Tính quãng đường khi biết tốc độ và thời gian',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Một đoàn tàu hỏa chuyển động đều với tốc độ 72 km/h. Trong 30 phút, đoàn tàu đi được quãng đường là:',
      options: ['A. 36 km', 'B. 144 km', 'C. 216 km', 'D. 24 km'],
      correctAnswer: 'A',
      explanation: 'Đổi 30 phút = 0.5 giờ. Quãng đường s = v * t = 72 * 0.5 = 36 km.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q021',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'So sánh tốc độ các chuyển động',
      level: 'Vận dụng',
      type: 'mc',
      score: 0.25,
      stem: 'Cho ba chuyển động: (1) Con rùa bò 0.05 m/s; (2) Người đi bộ 5.4 km/h; (3) Con ốc sên bò 18 m/h. Chuyển động có tốc độ lớn nhất là:',
      options: ['A. (2)', 'B. (1)', 'C. (3)', 'D. Cả ba chuyển động bằng nhau'],
      correctAnswer: 'A',
      explanation: 'Đổi về cùng đơn vị m/s: (1) 0.05 m/s; (2) 5.4 km/h = 1.5 m/s; (3) 18 m/h = 0.005 m/s. Lớn nhất là người đi bộ (2).',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q022',
      topic: 'Năng lượng và sự biến đổi',
      content: 'An toàn giao thông',
      requirement: 'Vận dụng khoảng cách an toàn',
      level: 'Vận dụng',
      type: 'mc',
      score: 0.25,
      stem: 'Theo quy định an toàn giao thông đường bộ, khi xe chạy với tốc độ từ trên 60 km/h đến 80 km/h trong điều kiện đường khô ráo, khoảng cách an toàn tối thiểu với xe chạy liền trước là:',
      options: ['A. 55 m', 'B. 35 m', 'C. 70 m', 'D. 100 m'],
      correctAnswer: 'A',
      explanation: 'Thông tư 31/2019/TT-BGTVT quy định khoảng cách an toàn tối thiểu cho dải tốc độ 60 - 80 km/h là 55 mét.',
      source: 'SGK KHTN 7 - Bài 10',
    },
    {
      id: 'Q023',
      topic: 'Vật sống',
      content: 'Quang hợp ở thực vật',
      requirement: 'Nhận biết nguyên liệu của quá trình quang hợp',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Các nguyên liệu đầu vào cần thiết cho quá trình quang hợp ở thực vật là:',
      options: [
        'A. Nước và khí Carbon dioxide',
        'B. Nước và khí Oxygen',
        'C. Chất hữu cơ và khí Oxygen',
        'D. Khí Carbon dioxide và khí Nitrogen',
      ],
      correctAnswer: 'A',
      explanation: 'Quang hợp hấp thu nước (H2O) từ rễ và khí Carbon dioxide (CO2) qua khí khổng của lá cây.',
      source: 'SGK KHTN 7 - Bài 18',
    },
    {
      id: 'Q024',
      topic: 'Vật sống',
      content: 'Quang hợp ở thực vật',
      requirement: 'Nhận biết sản phẩm của quá trình quang hợp',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Sản phẩm tạo ra của quá trình quang hợp gồm có:',
      options: [
        'A. Chất hữu cơ (Glucose) và khí Oxygen',
        'B. Nước và khí Carbon dioxide',
        'C. Khí Carbon dioxide và ATP',
        'D. Năng lượng nhiệt và nước',
      ],
      correctAnswer: 'A',
      explanation: 'Sản phẩm quang hợp là chất hữu cơ (tinh bột, glucose) và khí Oxygen thải ra môi trường.',
      source: 'SGK KHTN 7 - Bài 18',
    },
    {
      id: 'Q025',
      topic: 'Vật sống',
      content: 'Hô hấp tế bào',
      requirement: 'Nhận biết bào quan diễn ra hô hấp tế bào',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Bào quan đóng vai trò là "nhà máy năng lượng", nơi diễn ra quá trình hô hấp tế bào là:',
      options: ['A. Ti thể', 'B. Lục lạp', 'C. Nhân tế bào', 'D. Ribosome'],
      correctAnswer: 'A',
      explanation: 'Ti thể là nơi diễn ra quá trình phân giải chất hữu cơ giải phóng năng lượng ATP.',
      source: 'SGK KHTN 7 - Bài 20',
    },
    {
      id: 'Q026',
      topic: 'Vật sống',
      content: 'Hô hấp tế bào',
      requirement: 'Nhận biết dạng năng lượng tạo ra từ hô hấp',
      level: 'Nhận biết',
      type: 'mc',
      score: 0.25,
      stem: 'Hô hấp tế bào chuyển hóa năng lượng hóa học tích lũy trong chất hữu cơ thành năng lượng dưới dạng:',
      options: ['A. ATP và nhiệt năng', 'B. Quang năng', 'C. Cơ năng', 'D. Điện năng'],
      correctAnswer: 'A',
      explanation: 'Hô hấp tế bào giải phóng năng lượng ATP để phục vụ mọi hoạt động sống và một phần tỏa ra dưới dạng nhiệt.',
      source: 'SGK KHTN 7 - Bài 20',
    },
    {
      id: 'Q027',
      topic: 'Vật sống',
      content: 'Trao đổi khí',
      requirement: 'Giải thích hoạt động của khí khổng',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Khí khổng ở lá cây mở ra chủ yếu khi:',
      options: [
        'A. Tế bào hạt đậu no nước, thành mỏng dãn nhiều làm thành dày cong theo',
        'B. Tế bào hạt đậu mất nước, thành mỏng co lại',
        'C. Ban đêm khi không có ánh sáng',
        'D. Cây bị ngập úng thiếu oxy',
      ],
      correctAnswer: 'A',
      explanation: 'Khi tế bào hạt đậu no nước, thành mỏng bên ngoài dãn nhanh hơn thành dày bên trong làm khe khí khổng mở ra.',
      source: 'SGK KHTN 7 - Bài 21',
    },
    {
      id: 'Q028',
      topic: 'Vật sống',
      content: 'Quang hợp và hô hấp',
      requirement: 'So sánh quang hợp và hô hấp',
      level: 'Thông hiểu',
      type: 'mc',
      score: 0.25,
      stem: 'Nhận định nào sau đây là ĐÚNG khi so sánh giữa quá trình quang hợp và hô hấp tế bào ở thực vật?',
      options: [
        'A. Quang hợp tích lũy năng lượng, hô hấp tế bào giải phóng năng lượng',
        'B. Quang hợp diễn ra cả ngày lẫn đêm, hô hấp chỉ diễn ra ban ngày',
        'C. Cả hai quá trình đều lấy khí Oxygen và thải khí Carbon dioxide',
        'D. Quang hợp chỉ diễn ra ở nấm, hô hấp chỉ diễn ra ở cây xanh',
      ],
      correctAnswer: 'A',
      explanation: 'Quang hợp tổng hợp chất hữu cơ và tích lũy năng lượng, hô hấp phân giải chất hữu cơ để giải phóng năng lượng.',
      source: 'SGK KHTN 7 - Bài 20',
    },
    // 3 CÂU TỰ LUẬN (3.0đ)
    {
      id: 'Q029',
      topic: 'Chất và sự biến đổi của chất',
      content: 'Phân tử và hợp chất',
      requirement: 'Vận dụng tính thành phần phần trăm khối lượng nguyên tố trong hợp chất',
      level: 'Vận dụng',
      type: 'essay',
      score: 1.0,
      stem: 'Khí methane (thành phần chính của khí biogas, khí thiên nhiên) có công thức phân tử là CH4. Cho biết khối lượng nguyên tử C = 12 amu, H = 1 amu. Hãy:\na) Tính khối lượng phân tử của methane.\nb) Tính phần trăm khối lượng của nguyên tố Carbon trong phân tử methane.',
      correctAnswer: 'a) M = 16 amu; b) %C = 75%.',
      explanation: 'Áp dụng công thức tính phân tử khối và công thức tính tỉ lệ phần trăm nguyên tố.',
      source: 'SGK KHTN 7 - Bài 5 & Bài 7',
    },
    {
      id: 'Q030',
      topic: 'Năng lượng và sự biến đổi',
      content: 'Tốc độ chuyển động',
      requirement: 'Vận dụng giải bài toán chuyển động',
      level: 'Vận dụng',
      type: 'essay',
      score: 1.0,
      stem: 'Hai người cùng xuất phát từ A đến B trên một con đường thẳng dài 12 km. Người thứ nhất đi xe đạp với tốc độ không đổi v1 = 12 km/h. Người thứ hai đi xe máy với tốc độ v2 = 36 km/h. Hỏi người thứ hai đến B trước người thứ nhất bao nhiêu phút?',
      correctAnswer: 'Người thứ hai đến trước 40 phút.',
      explanation: 'Tính thời gian đi của người 1 (1 giờ), thời gian đi của người 2 (1/3 giờ = 20 phút), hiệu thời gian là 40 phút.',
      source: 'SGK KHTN 7 - Bài 8',
    },
    {
      id: 'Q031',
      topic: 'Vật sống',
      content: 'Quang hợp và thực tiễn nông nghiệp',
      requirement: 'Vận dụng cao giải thích và đề xuất biện pháp canh tác',
      level: 'Vận dụng cao',
      type: 'essay',
      score: 1.0,
      stem: 'Tại sao trong các nhà kính nông nghiệp công nghệ cao hiện đại trồng dưa lưới hoặc dâu tây, người ta thường lắp đặt hệ thống đèn LED chuyên dụng chiếu sáng bổ sung vào ban đêm và tăng nhẹ nồng độ khí CO2? Việc làm này mang lại lợi ích kinh tế gì?',
      correctAnswer: 'Kéo dài thời gian và tăng cường độ quang hợp giúp cây tổng hợp nhiều đường, tăng năng suất và rút ngắn vụ mùa.',
      explanation: 'Ánh sáng và CO2 là hai nhân tố thiết yếu quyết định tốc độ quang hợp; điều tiết hợp lí giúp tối ưu hóa sản lượng.',
      source: 'SGK KHTN 7 - Bài 19',
    },
  ];

  // Exam Paper Parts
  const examPaper: ExamPaperData = {
    header: {
      schoolName: 'TRƯỜNG THCS NGUYỄN DU',
      examTitle: 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN KHOA HỌC TỰ NHIÊN',
      subject: `Khoa học tự nhiên ${grade}`,
      grade,
      timeMinutes: 60,
      code: 'KHTN-701',
    },
    parts: [
      {
        partTitle: 'PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU LỰA CHỌN (7,0 điểm)',
        instructions:
          'Thí sinh chọn 01 phương án đúng duy nhất cho mỗi câu hỏi từ Câu 1 đến Câu 28. Mỗi câu trả lời đúng được 0,25 điểm.',
        questions: questionBank.slice(0, 28).map((q, idx) => ({
          id: q.id,
          num: idx + 1,
          stem: q.stem,
          options: q.options,
          score: q.score,
        })),
      },
      {
        partTitle: 'PHẦN II. CÂU HỎI TỰ LUẬN (3,0 điểm)',
        instructions:
          'Thí sinh trình bày lời giải chi tiết, rõ ràng các bước lập luận, tính toán và giải thích hiện tượng vào giấy kiểm tra.',
        questions: questionBank.slice(28, 31).map((q, idx) => ({
          id: q.id,
          num: idx + 29,
          stem: q.stem,
          score: q.score,
        })),
      },
    ],
  };

  // Answer Key
  const answers: AnswerKeyItem[] = questionBank.map((q, idx) => ({
    questionNum: idx + 1,
    questionId: q.id,
    type: q.type,
    answer: q.correctAnswer,
    explanation: q.explanation,
    score: q.score,
  }));

  // Grading Guide for Essay
  const gradingGuide: GradingGuideItem[] = [
    {
      questionNum: 29,
      questionId: 'Q029',
      stem: 'Tính phân tử khối và thành phần phần trăm Carbon trong CH4',
      totalScore: 1.0,
      criteria: [
        {
          idea: 'Ý 1: Tính khối lượng phân tử CH4',
          requirement: 'Viết đúng công thức M(CH4) = 12 * 1 + 1 * 4 = 16 (amu).',
          score: 0.5,
        },
        {
          idea: 'Ý 2: Tính % khối lượng nguyên tố C',
          requirement: 'Viết đúng công thức %C = (12 / 16) * 100% = 75%.',
          score: 0.5,
        },
      ],
    },
    {
      questionNum: 30,
      questionId: 'Q030',
      stem: 'Bài toán chuyển động hai người đi từ A đến B',
      totalScore: 1.0,
      criteria: [
        {
          idea: 'Ý 1: Tính thời gian đi của hai người',
          requirement: 'Thời gian người 1: t1 = 12 / 12 = 1 giờ (60 phút); Thời gian người 2: t2 = 12 / 36 = 1/3 giờ (20 phút).',
          score: 0.5,
        },
        {
          idea: 'Ý 2: Tính khoảng thời gian đến trước',
          requirement: 'Hiệu thời gian Δt = t1 - t2 = 60 - 20 = 40 phút. Kết luận đúng: người thứ hai đến B trước 40 phút.',
          score: 0.5,
        },
      ],
    },
    {
      questionNum: 31,
      questionId: 'Q031',
      stem: 'Giải thích việc chiếu sáng đèn LED và tăng CO2 trong nhà kính',
      totalScore: 1.0,
      criteria: [
        {
          idea: 'Ý 1: Cơ sở khoa học về quang hợp',
          requirement:
            'Nêu rõ: Ánh sáng và CO2 là hai nguyên liệu/yếu tố quyết định cường độ quang hợp. Chiếu đèn LED ban đêm giúp kéo dài thời gian quang hợp; tăng CO2 giúp tăng hiệu suất tạo chất hữu cơ (đường glucose).',
          score: 0.5,
        },
        {
          idea: 'Ý 2: Ý nghĩa thực tiễn kinh tế',
          requirement:
            'Quả ngọt hơn, tích lũy nhiều chất dinh dưỡng hơn, cây lớn nhanh, rút ngắn thời gian sinh trưởng thu hoạch, nâng cao năng suất và chất lượng nông sản xuất khẩu.',
          score: 0.5,
        },
      ],
    },
  ];

  const initialWorkspace: Exam7991Workspace = {
    step: 1,
    config: {
      schoolName: 'TRƯỜNG THCS NGUYỄN DU',
      grade,
      examType: 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN KHOA HỌC TỰ NHIÊN',
      durationMinutes: 60,
      totalScore: 10.0,
      multipleChoiceRatio: 70,
      essayRatio: 30,
      targetCognitive: {
        recognition: 40,
        understanding: 30,
        application: 20,
        highApplication: 10,
      },
    },
    matrix,
    specification,
    questionBank,
    examPaper,
    answers,
    gradingGuide,
    validation: {
      overallStatus: 'green',
      passedCount: 10,
      warningCount: 0,
      failedCount: 0,
      checks: [],
      canExport: true,
    },
  };

  initialWorkspace.validation = runValidationPipeline(initialWorkspace);

  return initialWorkspace;
}
