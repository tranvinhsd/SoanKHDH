export type ModuleType =
  | 'home'
  | 'ppct'
  | 'lesson-plan-5512'
  | 'lesson-plan'
  | 'worksheet'
  | 'review-outline'
  | 'review'
  | 'exam-7991'
  | 'documents'
  | 'history'
  | 'settings';

export type ExamStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface WorkspaceSummary {
  id: string;
  title: string;
  type: ModuleType;
  grade: Grade;
  updatedAt: string;
}

export type Grade = '6' | '7' | '8' | '9';

export type CurriculumPreset =
  | 'custom'
  | 'ket-noi-tri-thuc'
  | 'canh-dieu'
  | 'chan-troi-sang-tao';

export interface SourceDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'jpg' | 'png' | 'image';
  size: number;
  uploadDate: string;
  status: 'analyzing' | 'ready' | 'error';
  content: string;
  digitalCompetencies?: string[]; // Trích xuất chỉ định năng lực số
  aiEducationTopics?: string[]; // Trích xuất chỉ định dạy học AI
  onlineTeachingItems?: string[]; // Trích xuất nội dung dạy học trực tuyến xác định
  designatedCodes?: string[]; // Các mã chỉ định trong nguồn
  extractedAnalysis?: {
    topics: string[];
    lessons: string[];
    knowledgeUnits: string[];
    requirements: string[]; // Yêu cầu cần đạt
    periods: number;
    sampleQuestions: string[];
    tablesAndFigures: string[];
    digitalCompetencies?: string[]; // Trích xuất chỉ định năng lực số
    aiEducationTopics?: string[]; // Trích xuất chỉ định dạy học AI
    onlineTeachingItems?: string[]; // Trích xuất nội dung dạy học trực tuyến xác định
    designatedCodes?: string[]; // Các mã chỉ định trong nguồn
  };
}

export interface SourceLockSettings {
  sourceLock: boolean; // default true
  allowExternalKnowledge: boolean; // default false
  curriculumPreset: CurriculumPreset;
  strictness?: 'strict' | 'moderate';
  schoolName?: string;
  teacherName?: string;
}

// MODULE 1: PPCT
export type TeachingMethod = 'direct' | 'online' | 'blended';

export interface PPCTItem {
  stt: number;
  lessonCode: string; // Mã chỉ định định danh bài học trong PPCT nguồn (vd: [PPCT-KHTN7-B08])
  topicOrLesson: string;
  content: string;
  periods: number;
  periodIndex?: string; // Tiết thứ (vd: "1 - 4", "5 - 6", "7" theo thứ tự 1 đến 140)
  timeline: string;
  equipmentAndMaterials?: string; // Thiết bị dạy học và học liệu số (dụng cụ thí nghiệm, hóa chất, tranh, mô hình, PhET...)
  location?: string; // Địa điểm dạy học (Lớp học, Phòng học bộ môn KHTN, Phòng thực hành, Trực tuyến...)
  departmentGuidanceRef?: string; // Căn cứ hướng dẫn Sở GD&ĐT / Công văn 5512
  // Tích hợp Năng lực số
  digitalCompetenceCodes: string[]; // Mã chỉ định NLS (ví dụ: ['[NLS.2: Thí nghiệm ảo PhET]'])
  digitalCompetenceDetail?: string; // Nội dung năng lực số cụ thể
  // Tích hợp Dạy học AI
  aiEducationCodes: string[]; // Mã chỉ định Dạy học AI (ví dụ: ['[AI.1: Nhận diện ảnh sinh vật]'])
  aiEducationDetail?: string; // Nội dung dạy học AI cụ thể
  // Chỉ rõ hình thức & nội dung dạy học Online
  teachingMethod: TeachingMethod; // 'direct' ([TT]) | 'online' ([ONLINE]) | 'blended' ([KẾT HỢP])
  onlineContentDetail: string; // Chỉ rõ nội dung/hoạt động dạy học online đã xác định trong PPCT
  onlinePlatform?: string; // Nền tảng số: LMS, K12Online, Google Classroom, Azota, PhET, Padlet...
  notes: string;
  sourceRef?: string;
}

export interface PPCTData {
  grade: Grade;
  schoolYear: string;
  guidancePreset?: string; // Căn cứ hướng dẫn chuyên môn của Sở GD&ĐT
  textbookSeries?: string; // Bộ sách giáo khoa chuẩn
  totalPeriodsRequired: number;
  totalPeriodsAllocated: number;
  isBalanced: boolean;
  // Thống kê & Kiểm định dạy học Online theo Thông tư 09/2021/TT-BGDĐT
  totalOnlinePeriods: number; // Tổng số tiết dạy học trực tuyến hoặc kết hợp
  onlineRatioPercent: number; // Tỷ lệ % dạy học trực tuyến
  maxOnlineRatioPercent: number; // Mức trần theo Thông tư 09/2021 (35% đối với THCS)
  isOnlineRatioValid: boolean; // Kiểm tra không vượt quá 35%
  // Thống kê Năng lực số và AI
  digitalCompetenceSummary: { code: string; label: string; count: number }[];
  aiEducationSummary: { code: string; label: string; count: number }[];
  additionalRequirements?: string;
  items: PPCTItem[];
}

// MODULE 2: GIÁO ÁN 5512
export interface StepDetail2Col {
  stepTitle: string; // "Bước 1: Chuyển giao nhiệm vụ học tập"
  teacherActivity: string; // Hoạt động của giáo viên
  studentActivity: string; // Hoạt động của học sinh
}

export interface ActivityExecution2Col {
  step1_transfer: string; // Chuyển giao nhiệm vụ học tập (tóm tắt)
  step2_execute: string; // Thực hiện nhiệm vụ học tập (tóm tắt)
  step3_report: string; // Báo cáo, thảo luận (tóm tắt)
  step4_conclude: string; // Kết luận, nhận định (Đánh giá)
  // Hai cột chuẩn CV 5512: Hoạt động của GV | Hoạt động của HS
  twoColumns?: {
    step1: StepDetail2Col;
    step2: StepDetail2Col;
    step3: StepDetail2Col;
    step4: StepDetail2Col;
  };
}

export interface LessonActivityItem {
  id: string;
  stepNumber: number;
  periodNumber?: number; // Thuộc Tiết 1, Tiết 2... theo PPCT
  name: string; // "Hoạt động 1: Mở đầu / Khởi động", "Hoạt động 2: Hình thành kiến thức mới", v.v.
  durationMinutes?: number;
  goal: string; // Mục tiêu
  content: string; // Nội dung
  product: string; // Sản phẩm
  execution: ActivityExecution2Col;
}

export interface PeriodLessonPlan {
  periodNumber: number; // 1, 2, 3...
  ppctPeriodIndex?: number; // Số tiết theo PPCT trong năm học (ví dụ: Tiết 15, Tiết 16)
  ppctMainContent: string; // Nội dung dạy học chủ yếu có trong PPCT (Kế hoạch dạy học)
  targetCompetencies?: string; // Yêu cầu cần đạt / mục tiêu chính của tiết
  activities: LessonActivityItem[]; // Các hoạt động diễn ra trong tiết này
}

export interface LessonPlan5512Data {
  grade: Grade;
  lessonTitle: string;
  durationPeriods: number;
  subject: string;
  lessonCode?: string; // Mã chỉ định định danh bài học theo PPCT nguồn
  teachingMethod?: TeachingMethod; // Trực tiếp [TT], Trực tuyến [ONLINE], Kết hợp [KẾT HỢP]
  onlineContentDetail?: string; // Nội dung dạy học online đã xác định
  digitalCompetenceCodes?: string[]; // Mã chỉ định Năng lực số
  digitalCompetenceDetail?: string; // Nội dung cụ thể năng lực số
  aiEducationCodes?: string[]; // Mã chỉ định Dạy học AI
  aiEducationDetail?: string; // Nội dung cụ thể dạy học AI
  ppctReference?: {
    topicName: string; // Tên chủ đề / bài học trong PPCT
    periodRange: string; // Ví dụ "Tiết 15 - 16 theo PPCT"
    strand: string; // Mạch nội dung (Chất, Năng lượng, Vật sống, Trái Đất)
    lessonCode?: string; // Mã chỉ định định danh bài học theo PPCT nguồn
    digitalCompetenceCodes?: string[]; // Mã chỉ định Năng lực số
    aiEducationCodes?: string[]; // Mã chỉ định Dạy học AI
    teachingMethod?: TeachingMethod; // Trực tiếp [TT], Trực tuyến [ONLINE], Kết hợp [KẾT HỢP]
    onlineContentDetail?: string; // Nội dung dạy học online đã xác định
  };
  periods?: PeriodLessonPlan[]; // Nội dung dạy các tiết được chia riêng rõ ràng theo nội dung dạy học chủ yếu có trong PPCT
  objectives: {
    knowledge: string[];
    competencies: {
      khtn: string[]; // Nhận thức KHTN, Tìm hiểu tự nhiên, Vận dụng kiến thức kĩ năng
      general: string[]; // Tự chủ & tự học, Giao tiếp & hợp tác, Giải quyết vấn đề & sáng tạo
      digital?: string[]; // Năng lực số tích hợp
      aiEducation?: string[]; // Nội dung dạy học AI tích hợp
    };
    qualities: string[]; // Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm
  };
  equipment: {
    teacher: string[];
    student: string[];
  };
  activities: LessonActivityItem[];
  assessmentMatchCheck: {
    valid: boolean;
    explanation: string;
  };
}

// MODULE 3: PHIẾU HỌC TẬP
export type QuestionTypeEnum =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'matching'
  | 'table'
  | 'diagram'
  | 'essay';

export interface WorksheetTask {
  id: string;
  type: QuestionTypeEnum;
  instruction: string;
  stem: string;
  options?: string[];
  matchingPairs?: { left: string; right: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  answerArea: string;
  suggestedAnswer: string;
  score: number;
  sourceRef?: string;
}

export interface WorksheetData {
  title: string;
  grade: Grade;
  lessonName: string;
  targetStudents: 'all' | 'advanced' | 'support';
  durationMinutes: number;
  durationPeriods?: number;
  appliedPeriod?: string;
  coreObjectives: string[];
  tasks: WorksheetTask[];
}

// MODULE 4: ĐỀ CƯƠNG ÔN TẬP
export interface ReviewQuestion {
  id: string;
  stem: string;
  type?: 'mc' | 'essay';
  options?: string[];
  answer: string;
  sourceRef?: string;
}

export interface ReviewOutlineData {
  title: string;
  grade: Grade;
  unitOrTopic: string;
  durationPeriods?: number;
  coreKnowledge: Array<{
    topic: string;
    keyPoints: string[];
    comparisonTable?: { headers: string[]; rows: string[][] };
  }>;
  recognitionQuestions: ReviewQuestion[]; // Mức A: Nhận biết
  understandingQuestions: ReviewQuestion[]; // Mức B: Thông hiểu
  applicationQuestions: ReviewQuestion[]; // Mức C: Vận dụng
}

// MODULE 5: KIỂM TRA 7991
export interface MatrixRow {
  id: string;
  topic: string; // Mạch nội dung: Chất, Năng lượng, Vật sống, Trái Đất...
  content: string; // Đơn vị kiến thức cụ thể
  recognition: { mcCount: number; essayCount: number; score: number };
  understanding: { mcCount: number; essayCount: number; score: number };
  application: { mcCount: number; essayCount: number; score: number };
  highApplication: { mcCount: number; essayCount: number; score: number };
  totalQuestions: number;
  totalScore: number;
}

export interface MatrixData {
  rows: MatrixRow[];
  totalScore: number;
  targetScore: number; // 10.0
  isBalanced: boolean;
  cognitiveRatios: {
    recognition: number; // e.g. 40%
    understanding: number; // e.g. 30%
    application: number; // e.g. 20%
    highApplication: number; // e.g. 10%
  };
}

export interface SpecificationItem {
  id: string;
  matrixRowId: string;
  topic: string;
  content: string;
  requirement: string; // Yêu cầu cần đạt
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  questionType: 'Trắc nghiệm nhiều lựa chọn' | 'Trắc nghiệm Đúng/Sai' | 'Tự luận';
  questionCount: number;
  questionIds: string[];
}

export interface QuestionBankItem {
  id: string; // Q001
  topic: string;
  content: string;
  requirement: string;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  type: 'mc' | 'tf' | 'essay';
  score: number;
  stem: string;
  options?: string[]; // A, B, C, D
  subQuestions?: Array<{ label: string; text: string; answer: boolean }>; // for Đúng/Sai
  correctAnswer: string;
  explanation: string;
  source: string;
}

export interface ExamPaperPart {
  partTitle: string;
  instructions: string;
  questions: Array<{
    id: string;
    num: number;
    stem: string;
    options?: string[];
    subQuestions?: Array<{ label: string; text: string }>;
    score: number;
  }>;
}

export interface ExamPaperData {
  header: {
    schoolName: string;
    examTitle: string;
    subject: string;
    grade: Grade;
    timeMinutes: number;
    code: string;
  };
  parts: ExamPaperPart[];
}

export interface AnswerKeyItem {
  questionNum: number;
  questionId: string;
  type: string;
  answer: string;
  explanation: string;
  score: number;
}

export interface GradingGuideCriterion {
  idea: string;
  requirement: string;
  score: number;
}

export interface GradingGuideItem {
  questionNum: number;
  questionId: string;
  stem: string;
  totalScore: number;
  criteria: GradingGuideCriterion[];
}

export interface ValidationCheckItem {
  code: string; // CHECK 01 -> CHECK 10
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  details?: string;
}

export interface ValidationReport {
  overallStatus: 'green' | 'yellow' | 'red';
  passedCount: number;
  warningCount: number;
  failedCount: number;
  checks: ValidationCheckItem[];
  canExport: boolean;
}

export interface Exam7991Workspace {
  step: number; // 1 -> 8
  config: {
    schoolName: string;
    grade: Grade;
    examType: string;
    durationMinutes: number;
    totalScore: number;
    multipleChoiceRatio: number;
    essayRatio: number;
    targetCognitive: {
      recognition: number;
      understanding: number;
      application: number;
      highApplication: number;
    };
  };
  matrix: MatrixData;
  specification: SpecificationItem[];
  questionBank: QuestionBankItem[];
  examPaper: ExamPaperData;
  answers: AnswerKeyItem[];
  gradingGuide: GradingGuideItem[];
  validation: ValidationReport;
}

// GENERAL WORKSPACE / HISTORY
export interface WorkspaceItem {
  id: string;
  name: string;
  module: ModuleType;
  grade: Grade;
  unitName: string;
  createdAt: string;
  updatedAt: string;
  status: 'green' | 'yellow' | 'red';
  data: any;
}
