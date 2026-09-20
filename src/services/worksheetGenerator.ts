import {
  Grade,
  QuestionTypeEnum,
  SourceDocument,
  SourceLockSettings,
  WorksheetData,
  WorksheetTask,
} from '../types';
import { KHTN_CURRICULUM } from '../data/curriculumKHTN';
import { callGeminiAPI } from './apiClient';

/**
 * Extract JSON safely from response text
 */
function extractJsonFromText(text: string): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

/**
 * Determine science domain / strand from lesson name and grade
 */
export function detectStrandAndTopic(grade: Grade, lessonName: string) {
  const lower = lessonName.toLowerCase();
  const curr = KHTN_CURRICULUM[grade];

  let strand: 'Chất và sự biến đổi của chất' | 'Năng lượng và sự biến đổi' | 'Vật sống' | 'Trái Đất và bầu trời' =
    'Năng lượng và sự biến đổi';
  let matchedRequirements: string[] = [];
  let sampleConcepts: string[] = [];
  let topicTitle = `Chủ đề KHTN ${grade}`;

  if (
    lower.includes('chất') ||
    lower.includes('nguyên tử') ||
    lower.includes('phân tử') ||
    lower.includes('hóa chất') ||
    lower.includes('phản ứng') ||
    lower.includes('acid') ||
    lower.includes('base') ||
    lower.includes('oxide') ||
    lower.includes('oxit') ||
    lower.includes('muối') ||
    lower.includes('dung dịch') ||
    lower.includes('kim loại') ||
    lower.includes('phi kim') ||
    lower.includes('hỗn hợp') ||
    lower.includes('oxygen') ||
    lower.includes('không khí') ||
    lower.includes('bảng tuần hoàn') ||
    lower.includes('mol') ||
    lower.includes('nồng độ') ||
    lower.includes('hydrocarbon') ||
    lower.includes('methane') ||
    lower.includes('ethanol') ||
    lower.includes('rượu') ||
    lower.includes('axit') ||
    lower.includes('vật liệu') ||
    lower.includes('nhiên liệu')
  ) {
    strand = 'Chất và sự biến đổi của chất';
  } else if (
    lower.includes('tế bào') ||
    lower.includes('vật sống') ||
    lower.includes('cơ thể') ||
    lower.includes('sinh vật') ||
    lower.includes('quang hợp') ||
    lower.includes('hô hấp') ||
    lower.includes('trao đổi chất') ||
    lower.includes('thực vật') ||
    lower.includes('động vật') ||
    lower.includes('vi khuẩn') ||
    lower.includes('nấm') ||
    lower.includes('virus') ||
    lower.includes('đa dạng sinh học') ||
    lower.includes('di truyền') ||
    lower.includes('hệ sinh thái') ||
    lower.includes('máu') ||
    lower.includes('tuần hoàn') ||
    lower.includes('tiêu hóa') ||
    lower.includes('bài tiết') ||
    lower.includes('thần kinh') ||
    lower.includes('gen') ||
    lower.includes('dna') ||
    lower.includes('nhiễm sắc thể')
  ) {
    strand = 'Vật sống';
  } else if (
    lower.includes('trái đất') ||
    lower.includes('bầu trời') ||
    lower.includes('mặt trời') ||
    lower.includes('mặt trăng') ||
    lower.includes('hệ mặt trời') ||
    lower.includes('ngân hà') ||
    lower.includes('khí hậu') ||
    lower.includes('thời tiết') ||
    lower.includes('thủy triều') ||
    lower.includes('pha của mặt trăng') ||
    lower.includes('nhật thực') ||
    lower.includes('nguyệt thực')
  ) {
    strand = 'Trái Đất và bầu trời';
  } else {
    strand = 'Năng lượng và sự biến đổi';
  }

  if (curr) {
    const found = curr.topics.find(
      (t) =>
        t.lessons.some((l) => {
          const cleanCur = l.toLowerCase().replace(/bài\s*\d+[:\.\-–]\s*/i, '').trim();
          const cleanUser = lower.replace(/bài\s*\d+[:\.\-–]\s*/i, '').trim();
          return lower.includes(cleanCur) || cleanUser.includes(cleanCur);
        }) ||
        t.title.toLowerCase().includes(lower) ||
        t.sampleConcepts.some((c) => lower.includes(c.toLowerCase()))
    );

    if (found) {
      strand = found.strand;
      matchedRequirements = found.requirements;
      sampleConcepts = found.sampleConcepts;
      topicTitle = found.title;
    }
  }

  return { strand, matchedRequirements, sampleConcepts, topicTitle };
}

/**
 * Generate a dynamic, high-quality pedagogical Worksheet strictly adhering to the selected lesson and periods
 */
export function generatePedagogicalWorksheet(
  grade: Grade,
  lessonName: string,
  arg3?: number | 'all' | 'advanced' | 'support',
  arg4?: string | number,
  arg5?: 'all' | 'advanced' | 'support' | SourceDocument[],
  arg6?: number | SourceLockSettings,
  arg7?: SourceDocument[] | number,
  arg8?: SourceLockSettings | string
): WorksheetData {
  let durationPeriods = 2;
  let appliedPeriod = 'Toàn bộ bài học';
  let targetStudents: 'all' | 'advanced' | 'support' = 'all';
  let durationMinutes = 15;
  let sourceDocs: SourceDocument[] = [];
  let settings: SourceLockSettings | undefined = undefined;

  if (typeof arg3 === 'string' && (arg3 === 'all' || arg3 === 'advanced' || arg3 === 'support')) {
    // Order: (grade, lessonName, targetStudents, durationMinutes, sourceDocs, settings, durationPeriods, appliedPeriod)
    targetStudents = arg3;
    if (typeof arg4 === 'number') durationMinutes = arg4;
    if (Array.isArray(arg5)) sourceDocs = arg5;
    if (arg6 && typeof arg6 === 'object') settings = arg6 as SourceLockSettings;
    if (typeof arg7 === 'number') durationPeriods = arg7;
    if (typeof arg8 === 'string') appliedPeriod = arg8;
  } else {
    // Standard Order: (grade, lessonName, durationPeriods, appliedPeriod, targetStudents, durationMinutes, sourceDocs, settings)
    if (typeof arg3 === 'number') durationPeriods = arg3;
    if (typeof arg4 === 'string') appliedPeriod = arg4;
    if (typeof arg5 === 'string' && (arg5 === 'all' || arg5 === 'advanced' || arg5 === 'support')) targetStudents = arg5;
    if (typeof arg6 === 'number') durationMinutes = arg6;
    if (Array.isArray(arg7)) sourceDocs = arg7;
    if (arg8 && typeof arg8 === 'object') settings = arg8 as SourceLockSettings;
  }

  const cleanLesson = (lessonName || '').trim() || `Bài học Khoa học tự nhiên ${grade}`;
  const periods = Math.max(1, Math.min(6, durationPeriods || 2));
  const { strand, matchedRequirements, sampleConcepts, topicTitle } = detectStrandAndTopic(grade, cleanLesson);

  const cleanTitleOnly = cleanLesson.replace(/^bài\s*\d+[:\.\-–]\s*/i, '').trim();

  // Determine period scope text
  const periodScopeNotice =
    appliedPeriod && appliedPeriod !== 'Toàn bộ bài học'
      ? `${appliedPeriod}`
      : `Toàn bộ bài học (${periods} tiết)`;

  // Pedagogical objectives tailored to lesson, strand, and student level
  const coreObjectives: string[] = [
    `Nêu và nhận biết được các khái niệm cốt lõi, hiện tượng và định luật liên quan đến "${cleanTitleOnly}".`,
    periods > 1
      ? `Phân tích, xử lý số liệu hoặc tiến hành thí nghiệm/khảo sát mô phỏng để giải thích cơ chế của "${cleanTitleOnly}".`
      : `Hiểu rõ bản chất khoa học và ý nghĩa thực tế của "${cleanTitleOnly}".`,
    targetStudents === 'advanced'
      ? `Vận dụng sáng tạo kiến thức "${cleanTitleOnly}" để giải bài tập định lượng nâng cao và giải quyết vấn đề thực tiễn liên môn.`
      : targetStudents === 'support'
      ? `Tự tin hoàn thành các câu hỏi trắc nghiệm nhận biết, điền từ cơ bản và ghi nhớ công thức/định nghĩa cốt lõi.`
      : `Vận dụng kiến thức bài học để giải thích hiện tượng đời sống, bảo vệ sức khỏe và môi trường sống xung quanh.`,
  ];

  if (matchedRequirements.length > 0) {
    coreObjectives.splice(1, 0, `Đạt chuẩn năng lực GDPT 2018: ${matchedRequirements[0]}`);
  }

  // Generate 5 dynamic, differentiated tasks strictly tailored to cleanLesson
  const tasks: WorksheetTask[] = [];

  // TASK 1: MULTIPLE CHOICE (Trắc nghiệm 4 phương án A, B, C, D)
  let mcStem = '';
  let mcOptions: string[] = [];
  let mcAnswer = '';

  if (strand === 'Chất và sự biến đổi của chất') {
    if (cleanLesson.toLowerCase().includes('nguyên tử') || cleanLesson.toLowerCase().includes('bảng tuần hoàn')) {
      mcStem = `Trong cấu tạo của nguyên tử, hạt mang điện tích âm quay xung quanh hạt nhân là:`;
      mcOptions = ['A. Proton', 'B. Neutron', 'C. Electron', 'D. Phân tử'];
      mcAnswer = 'Đáp án C: Electron (mang điện tích âm, chuyển động ở lớp vỏ nguyên tử).';
    } else if (cleanLesson.toLowerCase().includes('acid') || cleanLesson.toLowerCase().includes('base')) {
      mcStem = `Dung dịch làm đổi màu giấy quỳ tím thành màu đỏ là đặc trưng của chất nào sau đây?`;
      mcOptions = ['A. Dung dịch base (kiềm)', 'B. Dung dịch acid', 'C. Dung dịch muối ăn', 'D. Nước cất'];
      mcAnswer = 'Đáp án B: Dung dịch acid (có pH < 7 làm quỳ tím chuyển đỏ).';
    } else if (cleanLesson.toLowerCase().includes('oxygen') || cleanLesson.toLowerCase().includes('không khí')) {
      mcStem = `Khí chiếm tỉ lệ thể tích lớn nhất trong thành phần không khí khô ở bề mặt Trái Đất là:`;
      mcOptions = ['A. Khí Oxygen (khoảng 21%)', 'B. Khí Nitrogen (khoảng 78%)', 'C. Khí Carbon dioxide', 'D. Khí Argon'];
      mcAnswer = 'Đáp án B: Khí Nitrogen (chiếm xấp xỉ 78% thể tích không khí).';
    } else {
      mcStem = `Khi nghiên cứu về nội dung "${cleanTitleOnly}", nhận định nào sau đây là hoàn toàn chính xác?`;
      mcOptions = [
        `A. Khái niệm và tính chất đặc trưng của ${cleanTitleOnly} thể hiện rõ qua cấu tạo và sự biến đổi của các chất cấu thành.`,
        `B. Quá trình biến đổi của ${cleanTitleOnly} không bao giờ tuân theo định luật bảo toàn khối lượng.`,
        `C. Mọi hiện tượng liên quan đến ${cleanTitleOnly} đều chỉ mang tính chất vật lí thuần túy.`,
        `D. Không thể áp dụng phương pháp thực hành thí nghiệm đối với ${cleanTitleOnly}.`,
      ];
      mcAnswer = `Đáp án A: Khái niệm và tính chất đặc trưng của ${cleanTitleOnly} thể hiện rõ qua cấu tạo và sự biến đổi của các chất.`;
    }
  } else if (strand === 'Vật sống') {
    if (cleanLesson.toLowerCase().includes('tế bào')) {
      mcStem = `Thành phần nào sau đây có chức năng kiểm soát sự đi vào và đi ra của các chất đối với tế bào?`;
      mcOptions = ['A. Màng sinh chất', 'B. Tế bào chất', 'C. Nhân tế bào', 'D. Không bào'];
      mcAnswer = 'Đáp án A: Màng sinh chất (màng tế bào) kiểm soát sự vận chuyển chất.';
    } else if (cleanLesson.toLowerCase().includes('quang hợp')) {
      mcStem = `Bào quan trực tiếp thực hiện quá trình quang hợp ở tế bào lá cây là:`;
      mcOptions = ['A. Ti thể', 'B. Lục lạp (chứa chất diệp lục)', 'C. Nhân tế bào', 'D. Lưới nội chất'];
      mcAnswer = 'Đáp án B: Lục lạp (chứa chất diệp lục hấp thu năng lượng ánh sáng Mặt Trời).';
    } else if (cleanLesson.toLowerCase().includes('hô hấp')) {
      mcStem = `Nguyên liệu tham gia trực tiếp vào quá trình hô hấp tế bào ở sinh vật bao gồm:`;
      mcOptions = [
        'A. Khí Oxygen và chất hữu cơ (Glucose)',
        'B. Khí Carbon dioxide và nước',
        'C. Ánh sáng Mặt Trời và chất diệp lục',
        'D. Nước và chất khoáng',
      ];
      mcAnswer = 'Đáp án A: Khí Oxygen và chất hữu cơ (Glucose) bị oxy hóa để giải phóng năng lượng ATP.';
    } else {
      mcStem = `Đơn vị chức năng và cấu trúc cơ bản của sự sống trong nội dung "${cleanTitleOnly}" là:`;
      mcOptions = [
        `A. Tế bào và các cơ chế chuyển hóa sinh học đặc thù của sinh vật trong ${cleanTitleOnly}`,
        `B. Các phân tử vô cơ không có khả năng tự tái tạo`,
        `C. Hệ cơ quan không chịu sự chỉ huy của hệ thần kinh hay nội tiết`,
        `D. Quá trình biến đổi địa chất tự nhiên`,
      ];
      mcAnswer = `Đáp án A: Tế bào và các cơ chế sinh học đặc thù của cơ thể sinh vật.`;
    }
  } else if (strand === 'Trái Đất và bầu trời') {
    mcStem = `Hiện tượng nào sau đây giải thích chính xác chuyển động nhìn thấy liên quan đến "${cleanTitleOnly}"?`;
    mcOptions = [
      `A. Chuyển động tự quay quanh trục từ Tây sang Đông của Trái Đất tạo ra sự luân phiên ngày và đêm`,
      `B. Mặt Trời thực tế quay xung quanh Trái Đất theo quỹ đạo tròn hoàn hảo`,
      `C. Các hành tinh trong Hệ Mặt Trời chuyển động hoàn toàn độc lập không chịu lực hấp dẫn`,
      `D. Trục Trái Đất luôn thay đổi phương liên tục theo từng ngày`,
    ];
    mcAnswer = 'Đáp án A: Chuyển động tự quay quanh trục từ Tây sang Đông của Trái Đất.';
  } else {
    // Năng lượng và sự biến đổi
    if (cleanLesson.toLowerCase().includes('nhiệt') || cleanLesson.toLowerCase().includes('celsius')) {
      mcStem = `Nhiệt độ nóng chảy của nước đá nguyên chất ở áp suất tiêu chuẩn theo thang nhiệt độ Celsius là:`;
      mcOptions = ['A. 0 °C', 'B. 100 °C', 'C. 37 °C', 'D. 32 °C'];
      mcAnswer = 'Đáp án A: 0 °C (nhiệt độ đóng băng / tan chảy của nước đá).';
    } else if (cleanLesson.toLowerCase().includes('tốc độ')) {
      mcStem = `Đơn vị đo tốc độ hợp pháp trong hệ thống đo lường chính thức (SI) của nước ta là:`;
      mcOptions = ['A. Mét trên giây (m/s) và kilômét trên giờ (km/h)', 'B. Mét trên phút (m/min)', 'C. Centimét trên giây (cm/s)', 'D. Dặm trên giờ (mph)'];
      mcAnswer = 'Đáp án A: Mét trên giây (m/s) và Kilômét trên giờ (km/h).';
    } else if (cleanLesson.toLowerCase().includes('ánh sáng') || cleanLesson.toLowerCase().includes('phản xạ')) {
      mcStem = `Theo định luật phản xạ ánh sáng, mối quan hệ giữa góc phản xạ (i') và góc tới (i) là:`;
      mcOptions = ['A. i\' = i', 'B. i\' = 2i', 'C. i\' = i / 2', 'D. i\' + i = 180°'];
      mcAnswer = 'Đáp án A: Góc phản xạ luôn bằng góc tới (i\' = i).';
    } else {
      mcStem = `Đại lượng vật lý đặc trưng khi khảo sát quy luật trong bài "${cleanTitleOnly}" là:`;
      mcOptions = [
        `A. Đại lượng định lượng mô tả mối liên hệ giữa năng lượng, lực và trạng thái chuyển động của vật`,
        `B. Đại lượng luôn luôn bằng 0 trong mọi điều kiện môi trường`,
        `C. Đại lượng không thể đo lường bằng bất kỳ dụng cụ thí nghiệm nào`,
        `D. Đại lượng chỉ xuất hiện trong môi trường chân không tuyệt đối`,
      ];
      mcAnswer = `Đáp án A: Đại lượng định lượng mô tả trạng thái và quy luật của ${cleanTitleOnly}.`;
    }
  }

  tasks.push({
    id: 'task-1-mc',
    type: 'multiple-choice' as QuestionTypeEnum,
    instruction: 'Khoanh tròn vào chữ cái (A, B, C hoặc D) đứng trước câu trả lời đúng nhất:',
    stem: mcStem,
    options: mcOptions,
    answerArea: 'Học sinh khoanh tròn vào đáp án trực tiếp trên đề.',
    suggestedAnswer: mcAnswer,
    score: 2.0,
  });

  // TASK 2: TRUE / FALSE (Trắc nghiệm Đúng - Sai 4 ý phân hóa)
  const tfStems = [
    `1. Các quy luật khoa học trong bài "${cleanTitleOnly}" có thể được kiểm chứng bằng thực nghiệm hoặc quan sát thực tế.`,
    `2. Khi tăng hoặc giảm điều kiện môi trường (nhiệt độ, nồng độ, lực tác dụng), tính chất của ${cleanTitleOnly} hoàn toàn không thay đổi.`,
    `3. Ứng dụng thực tiễn của ${cleanTitleOnly} đóng vai trò quan trọng trong đời sống, sản xuất và bảo vệ môi trường.`,
    `4. Để nghiên cứu ${cleanTitleOnly} (được thiết kế cho ${periods} tiết học), ta cần sử dụng phương pháp quan sát, thu thập dữ liệu và xử lý kết quả đo.`,
  ];

  tasks.push({
    id: 'task-2-tf',
    type: 'true-false' as QuestionTypeEnum,
    instruction: 'Đọc kĩ các phát biểu sau và đánh dấu (X) vào cột ĐÚNG hoặc SAI tương ứng:',
    stem: `Đánh giá tính đúng/sai của các nhận định liên quan đến bài học "${cleanTitleOnly}" (${periodScopeNotice}):`,
    options: tfStems,
    answerArea: 'Bảng lựa chọn ĐÚNG / SAI gồm 4 dòng.',
    suggestedAnswer: '1. Đúng | 2. Sai (tính chất thay đổi theo điều kiện) | 3. Đúng | 4. Đúng.',
    score: 2.0,
  });

  // TASK 3: FILL IN THE BLANK (Điền khuyết từ khóa khoa học)
  let fbStem = '';
  let fbAnswerArea = '';
  let fbAnswer = '';

  if (strand === 'Chất và sự biến đổi của chất') {
    fbStem = `Điền từ thích hợp vào chỗ trống (...): Trong bài "${cleanTitleOnly}", các chất được tạo nên từ ...(1)... Các nguyên tử liên kết với nhau bằng liên kết ...(2)... hoặc liên kết cộng hóa trị để tạo thành ...(3)... Trong phản ứng hóa học, tổng khối lượng các chất sản phẩm ...(4)... tổng khối lượng các chất phản ứng.`;
    fbAnswerArea = '(1): ......................... | (2): ......................... | (3): ......................... | (4): .........................';
    fbAnswer = '(1) nguyên tử | (2) ion | (3) phân tử | (4) bằng';
  } else if (strand === 'Vật sống') {
    fbStem = `Điền từ thích hợp vào chỗ trống (...): Cơ thể sinh vật trong bài "${cleanTitleOnly}" được cấu tạo từ đơn vị cơ bản là ...(1)... Ở thực vật, quá trình ...(2)... hấp thu năng lượng ánh sáng để tạo ra chất hữu cơ và giải phóng khí ...(3)... Ngược lại, quá trình hô hấp tế bào giải phóng năng lượng dưới dạng ...(4)... cho hoạt động sống.`;
    fbAnswerArea = '(1): ......................... | (2): ......................... | (3): ......................... | (4): .........................';
    fbAnswer = '(1) tế bào | (2) quang hợp | (3) Oxygen (O2) | (4) ATP';
  } else if (strand === 'Trái Đất và bầu trời') {
    fbStem = `Điền từ thích hợp vào chỗ trống (...): Trong hệ Mặt Trời, Trái Đất là hành tinh thứ ...(1)... tính từ Mặt Trời. Trái Đất chuyển động tự quay quanh trục theo chiều từ ...(2)... sang ...(3)... và chuyển động quanh Mặt Trời theo quỹ đạo hình ...(4)...`;
    fbAnswerArea = '(1): ......................... | (2): ......................... | (3): ......................... | (4): .........................';
    fbAnswer = '(1) ba | (2) Tây | (3) Đông | (4) elip gần tròn';
  } else {
    fbStem = `Điền từ thích hợp vào chỗ trống (...): Khi tìm hiểu về "${cleanTitleOnly}", để xác định đại lượng vật lý, ta cần sử dụng dụng cụ đo có ...(1)... và độ chia nhỏ nhất phù hợp. Kết quả đo được ghi kèm theo ...(2)... quy chuẩn. Năng lượng trong quá trình chuyển hóa luôn tuân theo định luật ...(3)... và chuyển hóa năng lượng, không tự sinh ra cũng không tự ...(4)...`;
    fbAnswerArea = '(1): ......................... | (2): ......................... | (3): ......................... | (4): .........................';
    fbAnswer = '(1) giới hạn đo (GHĐ) | (2) đơn vị đo | (3) bảo toàn | (4) mất đi';
  }

  tasks.push({
    id: 'task-3-fill',
    type: 'fill-blank' as QuestionTypeEnum,
    instruction: 'Điền từ hoặc cụm từ khoa học chính xác vào chỗ trống (...) để hoàn thiện nhận định:',
    stem: fbStem,
    answerArea: fbAnswerArea,
    suggestedAnswer: fbAnswer,
    score: 2.0,
  });

  // TASK 4: MATCHING (Ghép nối nội dung tương ứng theo tiến trình tiết học)
  let matchingPairs: { left: string; right: string }[] = [];
  if (periods >= 2) {
    matchingPairs = [
      { left: `1. Nội dung Tiết 1 (${cleanTitleOnly})`, right: 'a. Nhận biết hiện tượng, tìm hiểu lý thuyết bản chất và khái niệm cơ sở' },
      { left: `2. Nội dung Tiết 2 (${cleanTitleOnly})`, right: 'b. Tiến hành thí nghiệm, thu thập số liệu hoặc khảo sát tính chất chuyên sâu' },
      { left: `3. Nội dung Luyện tập - Vận dụng`, right: 'c. Giải bài tập định lượng/định tính, liên hệ thực tế và giải quyết tình huống' },
      { left: `4. Dụng cụ / Thiết bị học tập`, right: 'd. SGK KHTN, phiếu học tập, thiết bị thí nghiệm hoặc phần mềm mô phỏng số' },
    ];
  } else {
    matchingPairs = [
      { left: `1. Khái niệm / Hiện tượng cốt lõi`, right: 'a. Bản chất khoa học đặc trưng của bài học' },
      { left: `2. Phương pháp nghiên cứu`, right: 'b. Thực nghiệm, quan sát, đo lường và xử lý dữ liệu' },
      { left: `3. Ứng dụng thực tiễn`, right: 'c. Phục vụ sinh hoạt, sản xuất công nông nghiệp và y tế' },
      { left: `4. Biện pháp an toàn`, right: 'd. Tuân thủ quy định phòng thực hành và bảo vệ môi trường' },
    ];
  }

  tasks.push({
    id: 'task-4-match',
    type: 'matching' as QuestionTypeEnum,
    instruction: 'Nối nội dung ở Cột bên trái với nội dung tương ứng ở Cột bên phải:',
    stem: `Ghép nối tiến trình sư phạm và kiến thức trọng tâm của bài "${cleanTitleOnly}" (Phân bổ ${periods} tiết):`,
    matchingPairs,
    answerArea: '1 nối với ... | 2 nối với ... | 3 nối với ... | 4 nối với ...',
    suggestedAnswer: '1 - a | 2 - b | 3 - c | 4 - d',
    score: 2.0,
  });

  // TASK 5: ESSAY / PRACTICAL SCENARIO (Tự luận / Tình huống thực tiễn / Phân tích số liệu)
  let essayStem = '';
  let essayAnswer = '';

  if (strand === 'Chất và sự biến đổi của chất') {
    essayStem = `[Tình huống thực tiễn - ${cleanTitleOnly}]: Một học sinh tiến hành thí nghiệm khảo sát tính chất trong bài học. Em hãy:
a) Nêu các bước tiến hành an toàn và hiện tượng quan sát được.
b) Viết phương trình chữ (hoặc công thức/nhận xét) mô tả sự biến đổi chất.
c) Giải thích tại sao trong đời sống người ta cần kiểm soát điều kiện này để bảo quản sản phẩm hoặc phòng chống cháy nổ/ngộ độc?`;
    essayAnswer = `a) Các bước tiến hành: Đeo kính bảo hộ, lấy lượng hóa chất vừa đủ, quan sát hiện tượng đổi màu/sủi bọt/kết tủa.
b) Mô tả sự biến đổi: Chất tham gia -> Chất sản phẩm mới với tính chất vật lý và hóa học khác biệt.
c) Ứng dụng: Giúp bảo quản thực phẩm, kiểm soát tốc độ phản ứng, ngăn ngừa phản ứng độc hại trong sinh hoạt.`;
  } else if (strand === 'Vật sống') {
    essayStem = `[Tình huống đời sống & Sinh học - ${cleanTitleOnly}]: 
a) Hãy mô tả cơ chế hoạt động chính của cơ thể sinh vật được học trong bài "${cleanTitleOnly}".
b) Tại sao khi chăm sóc cây trồng (hoặc bảo vệ cơ thể người), chúng ta cần đảm bảo điều kiện cân bằng (nước, ánh sáng, dinh dưỡng, nhiệt độ)?
c) Đề xuất 2 việc làm cụ thể của học sinh để ứng dụng kiến thức bài học vào bảo vệ sức khỏe hoặc chăm sóc cây xanh tại trường học.`;
    essayAnswer = `a) Cơ chế hoạt động: Quá trình trao đổi chất, vận chuyển và chuyển hóa năng lượng diễn ra nhịp nhàng ở cấp độ tế bào và cơ quan.
b) Ý nghĩa: Thiếu hụt hoặc dư thừa quá mức đều làm rối loạn chức năng sống, ức chế enzyme và cản trở trao đổi chất.
c) Việc làm cụ thể: Tưới nước vừa đủ vào sáng sớm/chiều mát, trồng cây nơi có ánh sáng phù hợp, ăn uống lành mạnh, giữ vệ sinh thân thể.`;
  } else if (strand === 'Trái Đất và bầu trời') {
    essayStem = `[Vận dụng kiến thức Thiên văn / Trái Đất - ${cleanTitleOnly}]:
a) Dựa vào kiến thức bài học, giải thích nguyên nhân gây ra hiện tượng ngày - đêm (hoặc các mùa / các pha Mặt Trăng) được học trong bài "${cleanTitleOnly}".
b) Nếu một người quan sát bầu trời từ một điểm trên Trái Đất, vì sao họ lại nhìn thấy vị trí các thiên thể thay đổi theo thời gian trong ngày?`;
    essayAnswer = `a) Nguyên nhân: Do Trái Đất tự quay quanh trục từ Tây sang Đông và quay quanh Mặt Trời với trục nghiêng không đổi phương trong không gian.
b) Giải thích: Đó là chuyển động nhìn thấy biểu kiến do Trái Đất – hệ quy chiếu của người quan sát – đang tự quay liên tục.`;
  } else {
    // Năng lượng và sự biến đổi
    essayStem = `[Giải quyết vấn đề thực tiễn - ${cleanTitleOnly}]:
Một nhóm học sinh thực hiện đo đạc và khảo sát đại lượng trong bài học "${cleanTitleOnly}" (thời lượng ${periods} tiết).
a) Nêu dụng cụ đo cần chuẩn bị và thao tác đúng cách để tránh sai số đo.
b) Nếu thu được kết quả qua các lần đo khác nhau, nhóm học sinh cần làm gì để có giá trị chính xác nhất?
c) Lấy 01 ví dụ thực tiễn trong đời sống minh họa cho việc ứng dụng quy luật của "${cleanTitleOnly}".`;
    essayAnswer = `a) Dụng cụ: Chọn dụng cụ có GHĐ lớn hơn giá trị cần đo và ĐCNN phù hợp; đặt mắt vuông góc với thang đo và hiệu chỉnh kim/điểm 0 trước khi đo.
b) Xử lý số liệu: Tiến hành đo lặp lại ít nhất 3 lần và lấy giá trị trung bình cộng để giảm thiểu sai số ngẫu nhiên.
c) Ví dụ thực tiễn: Ứng dụng đo nhiệt độ cơ thể bằng nhiệt kế y tế để phát hiện sốt kịp thời (hoặc tính toán thời gian đi lại an toàn trên đường).`;
  }

  tasks.push({
    id: 'task-5-essay',
    type: 'essay' as QuestionTypeEnum,
    instruction: 'Đọc kĩ tình huống khoa học và giải quyết các yêu cầu vào khung bài làm bên dưới:',
    stem: essayStem,
    answerArea: 'Khung kẻ dòng ô ly dành cho học sinh trình bày chi tiết lời giải (10-15 dòng).',
    suggestedAnswer: essayAnswer,
    score: 2.0,
  });

  return {
    title: `PHIẾU HỌC TẬP: ${cleanLesson.toUpperCase()} (${periodScopeNotice.toUpperCase()})`,
    grade,
    lessonName: cleanLesson,
    durationPeriods: periods,
    appliedPeriod: periodScopeNotice,
    targetStudents,
    durationMinutes,
    coreObjectives,
    tasks,
  };
}

/**
 * Generate Worksheet using Gemini AI with fallback to dynamic pedagogical generator
 */
export async function generateWorksheetWithAI(
  grade: Grade,
  lessonName: string,
  arg3?: 'all' | 'advanced' | 'support' | number,
  arg4?: number | string,
  arg5?: SourceDocument[] | 'all' | 'advanced' | 'support',
  arg6?: SourceLockSettings | number,
  arg7?: number | SourceDocument[],
  arg8?: string | SourceLockSettings
): Promise<WorksheetData> {
  let targetStudents: 'all' | 'advanced' | 'support' = 'all';
  let durationMinutes = 15;
  let durationPeriods = 2;
  let appliedPeriod = 'Toàn bộ bài học';
  let sourceDocs: SourceDocument[] = [];
  let settings: SourceLockSettings = {
    sourceLock: true,
    allowExternalKnowledge: false,
    curriculumPreset: 'ket-noi-tri-thuc',
  };

  // Detect signature variant:
  // Variant A (standard in WorksheetModule): (grade, lessonName, targetStudents, durationMinutes, sourceDocs, settings, durationPeriods, appliedPeriod)
  if (typeof arg3 === 'string' && (arg3 === 'all' || arg3 === 'advanced' || arg3 === 'support')) {
    targetStudents = arg3;
    if (typeof arg4 === 'number') durationMinutes = arg4;
    if (Array.isArray(arg5)) sourceDocs = arg5;
    if (arg6 && typeof arg6 === 'object') settings = arg6 as SourceLockSettings;
    if (typeof arg7 === 'number') durationPeriods = arg7;
    if (typeof arg8 === 'string') appliedPeriod = arg8;
  } else if (typeof arg3 === 'number') {
    // Variant B: (grade, lessonName, durationPeriods, appliedPeriod, targetStudents, durationMinutes, sourceDocs, settings)
    durationPeriods = arg3;
    if (typeof arg4 === 'string') appliedPeriod = arg4;
    if (typeof arg5 === 'string' && (arg5 === 'all' || arg5 === 'advanced' || arg5 === 'support')) targetStudents = arg5;
    if (typeof arg6 === 'number') durationMinutes = arg6;
    if (Array.isArray(arg7)) sourceDocs = arg7;
    if (arg8 && typeof arg8 === 'object') settings = arg8 as SourceLockSettings;
  }

  const fallback = generatePedagogicalWorksheet(
    grade,
    lessonName,
    durationPeriods,
    appliedPeriod,
    targetStudents,
    durationMinutes,
    sourceDocs,
    settings
  );

  try {
    const prompt = `Bạn là chuyên gia giáo dục KHTN THCS 30 năm kinh nghiệm.
Hãy thiết kế một PHIẾU HỌC TẬP (Worksheet) hoàn chỉnh, chuẩn sư phạm theo Chương trình GDPT 2018 cho:
- Môn học: Khoa học tự nhiên ${grade}
- Tên bài học: "${lessonName}"
- Thời lượng bài học: ${durationPeriods} tiết
- Phạm vi áp dụng phiếu: "${appliedPeriod}"
- Đối tượng học sinh: ${targetStudents === 'advanced' ? 'Khá/Giỏi (Nâng cao)' : targetStudents === 'support' ? 'Cần hỗ trợ (Cơ bản/Củng cố)' : 'Đại trà (Tất cả học sinh)'}
- Thời gian làm phiếu: ${durationMinutes} phút

YÊU CẦU BẮT BUỘC:
1. Nội dung, câu hỏi, bài tập PHẢI 100% TRỰC TIẾP VỀ BÀI HỌC "${lessonName}". Tuyệt đối KHÔNG xuất ra nội dung bài học khác.
2. Thiết kế đúng theo số tiết (${durationPeriods} tiết) và phạm vi "${appliedPeriod}".
3. Trả về đúng định dạng JSON có cấu trúc sau:
{
  "title": "PHIẾU HỌC TẬP: TÊN BÀI HỌC...",
  "grade": "${grade}",
  "lessonName": "${lessonName}",
  "durationPeriods": ${durationPeriods},
  "appliedPeriod": "${appliedPeriod}",
  "targetStudents": "${targetStudents}",
  "durationMinutes": ${durationMinutes},
  "coreObjectives": ["Mục tiêu 1...", "Mục tiêu 2...", "Mục tiêu 3..."],
  "tasks": [
    {
      "id": "task-1",
      "type": "multiple-choice",
      "instruction": "Khoanh tròn...",
      "stem": "Câu hỏi trắc nghiệm 4 lựa chọn trực tiếp về ${lessonName}...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answerArea": "...",
      "suggestedAnswer": "Đáp án...",
      "score": 2.0
    },
    {
      "id": "task-2",
      "type": "true-false",
      "instruction": "Đánh dấu Đúng/Sai...",
      "stem": "Đánh giá các nhận định về ${lessonName}...",
      "options": ["1. ...", "2. ...", "3. ...", "4. ..."],
      "answerArea": "...",
      "suggestedAnswer": "1. Đúng | 2. Sai...",
      "score": 2.0
    },
    {
      "id": "task-3",
      "type": "fill-blank",
      "instruction": "Điền từ thích hợp...",
      "stem": "Đoạn văn điền từ khóa về ${lessonName}...",
      "answerArea": "...",
      "suggestedAnswer": "...",
      "score": 2.0
    },
    {
      "id": "task-4",
      "type": "matching",
      "instruction": "Nối cột A với cột B...",
      "stem": "Ghép nối kiến thức ${lessonName}...",
      "matchingPairs": [
        {"left": "1. ...", "right": "a. ..."},
        {"left": "2. ...", "right": "b. ..."}
      ],
      "answerArea": "...",
      "suggestedAnswer": "...",
      "score": 2.0
    },
    {
      "id": "task-5",
      "type": "essay",
      "instruction": "Tự luận / Tình huống thực tiễn...",
      "stem": "Bài tập tình huống thực tế hoặc xử lý số liệu về ${lessonName}...",
      "answerArea": "...",
      "suggestedAnswer": "...",
      "score": 2.0
    }
  ]
}`;

    const apiResult = await callGeminiAPI({
      module: 'worksheet',
      task: `Tạo Phiếu học tập KHTN ${grade}: ${lessonName} (${durationPeriods} tiết)`,
      sourceDocuments: sourceDocs.map((d) => ({ name: d.name, content: d.content })),
      userInput: { grade, lessonName, durationPeriods, appliedPeriod, targetStudents, durationMinutes },
      config: { prompt },
      sourceLock: settings.sourceLock,
      allowExternalKnowledge: settings.allowExternalKnowledge,
    });

    if (apiResult && apiResult.success && apiResult.result) {
      const parsed = extractJsonFromText(apiResult.result);
      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return {
          title: parsed.title || fallback.title,
          grade,
          lessonName: parsed.lessonName || lessonName,
          durationPeriods: parsed.durationPeriods || durationPeriods,
          appliedPeriod: parsed.appliedPeriod || appliedPeriod,
          targetStudents,
          durationMinutes: parsed.durationMinutes || durationMinutes,
          coreObjectives: Array.isArray(parsed.coreObjectives) ? parsed.coreObjectives : fallback.coreObjectives,
          tasks: parsed.tasks.map((t: any, idx: number) => ({
            id: t.id || `task-${idx + 1}`,
            type: t.type || 'multiple-choice',
            instruction: t.instruction || 'Hoàn thành nhiệm vụ sau:',
            stem: t.stem || `Nhiệm vụ về ${lessonName}`,
            options: t.options,
            matchingPairs: t.matchingPairs,
            tableData: t.tableData,
            answerArea: t.answerArea || 'Học sinh ghi câu trả lời.',
            suggestedAnswer: t.suggestedAnswer || 'Gợi ý đáp án giáo viên.',
            score: typeof t.score === 'number' ? t.score : 2.0,
          })),
        };
      }
    }
  } catch (e) {
    console.warn('AI Worksheet call failed, using pedagogical generator:', e);
  }

  return fallback;
}
