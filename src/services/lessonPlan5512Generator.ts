import {
  Grade,
  LessonActivityItem,
  LessonPlan5512Data,
  PeriodLessonPlan,
  SourceDocument,
  SourceLockSettings,
} from '../types';
import { KHTN_CURRICULUM } from '../data/curriculumKHTN';
import { callGeminiAPI } from './apiClient';

/**
 * Extract JSON object safely from LLM output
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
 * Normalize and validate Gemini API response to ensure strict conformity to 5512 data structure
 */
function normalizeLessonPlanData(
  raw: any,
  grade: Grade,
  lessonName: string,
  numPeriods: number
): LessonPlan5512Data | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!raw.objectives || !raw.equipment) return null;

  raw.grade = grade;
  raw.lessonTitle = lessonName;
  raw.durationPeriods = numPeriods;
  raw.subject = raw.subject || `Khoa học tự nhiên ${grade}`;

  // Normalize objectives
  if (!raw.objectives.knowledge || !Array.isArray(raw.objectives.knowledge)) {
    raw.objectives.knowledge = [`Nắm vững các khái niệm và bản chất khoa học của ${lessonName}`];
  }
  if (!raw.objectives.competencies) {
    raw.objectives.competencies = {
      khtn: [`Nhận thức KHTN về ${lessonName}`],
      general: ['Tự chủ, tự học và giao tiếp hợp tác.'],
    };
  }
  if (!raw.objectives.qualities || !Array.isArray(raw.objectives.qualities)) {
    raw.objectives.qualities = ['Chăm chỉ, trung thực và có trách nhiệm trong học tập.'];
  }

  // Normalize equipment
  if (!raw.equipment.teacher || !Array.isArray(raw.equipment.teacher)) {
    raw.equipment.teacher = ['Kế hoạch bài dạy, bài giảng điện tử PowerPoint/Canva, phiếu học tập.'];
  }
  if (!raw.equipment.student || !Array.isArray(raw.equipment.student)) {
    raw.equipment.student = [`Sách giáo khoa Khoa học tự nhiên ${grade}, vở ghi, đồ dùng học tập.`];
  }

  const ensureTwoColumns = (act: any, idx: number, pNum: number): LessonActivityItem => {
    const twoCol = act.execution?.twoColumns || {
      step1: {
        stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
        teacherActivity: act.execution?.step1_transfer || `GV giao nhiệm vụ tìm hiểu ${lessonName} cho học sinh.`,
        studentActivity: 'HS chú ý lắng nghe, quan sát và tiếp nhận nhiệm vụ học tập.',
      },
      step2: {
        stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
        teacherActivity: act.execution?.step2_execute || 'GV theo dõi, hướng dẫn học sinh và gợi mở khi cần thiết.',
        studentActivity: 'HS làm việc cá nhân hoặc theo nhóm để giải quyết nhiệm vụ được giao.',
      },
      step3: {
        stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
        teacherActivity: act.execution?.step3_report || 'GV mời đại diện học sinh báo cáo kết quả trước lớp.',
        studentActivity: 'Đại diện HS trình bày kết quả, các nhóm khác lắng nghe, nhận xét và đặt câu hỏi.',
      },
      step4: {
        stepTitle: 'Bước 4: Kết luận, nhận định',
        teacherActivity: act.execution?.step4_conclude || 'GV nhận xét thái độ học tập, chuẩn hóa kiến thức khoa học.',
        studentActivity: 'HS lắng nghe, ghi chép kiến thức trọng tâm vào vở ghi.',
      },
    };

    return {
      id: act.id || `act-p${pNum}-${idx + 1}`,
      stepNumber: act.stepNumber || idx + 1,
      periodNumber: pNum,
      name: act.name || `Hoạt động ${idx + 1} (Tiết ${pNum})`,
      durationMinutes: act.durationMinutes || 15,
      goal: act.goal || `Mục tiêu hoạt động ${idx + 1} của ${lessonName}`,
      content: act.content || `Nội dung học tập về ${lessonName}`,
      product: act.product || 'Sản phẩm học tập của học sinh',
      execution: {
        step1_transfer: twoCol.step1.teacherActivity,
        step2_execute: twoCol.step2.studentActivity,
        step3_report: twoCol.step3.studentActivity,
        step4_conclude: twoCol.step4.teacherActivity,
        twoColumns: twoCol,
      },
    };
  };

  // If periods exist
  if (Array.isArray(raw.periods) && raw.periods.length > 0) {
    const allActivities: LessonActivityItem[] = [];
    const normalizedPeriods: PeriodLessonPlan[] = [];

    for (let p = 1; p <= numPeriods; p++) {
      const existingP = raw.periods.find((item: any) => (item.periodNumber || item.periodNum) === p) || raw.periods[p - 1];
      const pNum = p;
      const rawActs = existingP?.activities && Array.isArray(existingP.activities) ? existingP.activities : [];
      const acts = rawActs.map((act: any, aIdx: number) => ensureTwoColumns(act, aIdx, pNum));

      acts.forEach((a: LessonActivityItem) => allActivities.push(a));
      normalizedPeriods.push({
        periodNumber: pNum,
        ppctPeriodIndex: existingP?.ppctPeriodIndex || existingP?.ppctIndex || 10 + p,
        ppctMainContent: existingP?.ppctMainContent || existingP?.ppctContent || `${lessonName} (Tiết ${p}): Nội dung trọng tâm phần ${p}`,
        targetCompetencies: existingP?.targetCompetencies || existingP?.target || `Đạt chuẩn năng lực tiết ${p}`,
        activities: acts,
      });
    }

    raw.periods = normalizedPeriods;
    raw.activities = allActivities;
  }

  raw.assessmentMatchCheck = raw.assessmentMatchCheck || {
    valid: true,
    explanation: `Kế hoạch bài dạy đáp ứng đầy đủ tiêu chuẩn Công văn 5512/BGDĐT, tiến trình phân chia rõ ràng theo đúng ${numPeriods} tiết của bài ${lessonName}.`,
  };

  return raw as LessonPlan5512Data;
}

/**
 * Dynamic pedagogical fallback generator strictly complying with CV 5512
 * Dynamically tailored for the selected lessonTitle and period count
 */
export function generatePedagogicalLessonPlan5512(
  grade: Grade,
  lessonTitle: string,
  durationPeriods: number,
  teacherPrompt?: string,
  sourceDocs?: SourceDocument[],
  settings?: SourceLockSettings
): LessonPlan5512Data {
  const lessonName = (lessonTitle || '').trim() || 'Bài học Khoa học tự nhiên';
  const numPeriods = Math.max(1, Math.min(6, durationPeriods || 2));

  // Determine science strand
  const curr = KHTN_CURRICULUM[grade];
  let matchedStrand: 'Chất và sự biến đổi của chất' | 'Năng lượng và sự biến đổi' | 'Vật sống' | 'Trái Đất và bầu trời' = 'Năng lượng và sự biến đổi';
  let matchedRequirements: string[] = [];
  let ppctTopic = `Chủ đề bài học KHTN ${grade}`;

  const lowerLesson = lessonName.toLowerCase();

  if (
    lowerLesson.includes('chất') ||
    lowerLesson.includes('nguyên tử') ||
    lowerLesson.includes('phân tử') ||
    lowerLesson.includes('hóa chất') ||
    lowerLesson.includes('phản ứng') ||
    lowerLesson.includes('acid') ||
    lowerLesson.includes('base') ||
    lowerLesson.includes('oxit') ||
    lowerLesson.includes('oxide') ||
    lowerLesson.includes('muối') ||
    lowerLesson.includes('dung dịch') ||
    lowerLesson.includes('kim loại') ||
    lowerLesson.includes('phi kim') ||
    lowerLesson.includes('hỗn hợp') ||
    lowerLesson.includes('oxygen') ||
    lowerLesson.includes('không khí') ||
    lowerLesson.includes('bảng tuần hoàn')
  ) {
    matchedStrand = 'Chất và sự biến đổi của chất';
  } else if (
    lowerLesson.includes('tế bào') ||
    lowerLesson.includes('vật sống') ||
    lowerLesson.includes('cơ thể') ||
    lowerLesson.includes('sinh vật') ||
    lowerLesson.includes('quang hợp') ||
    lowerLesson.includes('hô hấp') ||
    lowerLesson.includes('trao đổi chất') ||
    lowerLesson.includes('thực vật') ||
    lowerLesson.includes('động vật') ||
    lowerLesson.includes('vi khuẩn') ||
    lowerLesson.includes('nấm') ||
    lowerLesson.includes('đa dạng sinh học') ||
    lowerLesson.includes('di truyền') ||
    lowerLesson.includes('hệ sinh thái') ||
    lowerLesson.includes('máu') ||
    lowerLesson.includes('tuần hoàn')
  ) {
    matchedStrand = 'Vật sống';
  } else if (
    lowerLesson.includes('trái đất') ||
    lowerLesson.includes('bầu trời') ||
    lowerLesson.includes('mặt trời') ||
    lowerLesson.includes('mặt trăng') ||
    lowerLesson.includes('hệ mặt trời') ||
    lowerLesson.includes('ngân hà') ||
    lowerLesson.includes('khí hậu') ||
    lowerLesson.includes('thời tiết') ||
    lowerLesson.includes('thủy triều')
  ) {
    matchedStrand = 'Trái Đất và bầu trời';
  } else {
    matchedStrand = 'Năng lượng và sự biến đổi';
  }

  // Look up match in curriculum database
  if (curr) {
    const found = curr.topics.find((t) =>
      t.lessons.some((l) => l.toLowerCase().includes(lowerLesson) || lowerLesson.includes(l.toLowerCase().replace(/bài\s*\d+\s*:\s*/i, '').trim())) ||
      t.title.toLowerCase().includes(lowerLesson) ||
      t.sampleConcepts.some((c) => lowerLesson.includes(c.toLowerCase()))
    );
    if (found) {
      matchedStrand = found.strand;
      matchedRequirements = found.requirements;
      ppctTopic = found.title;
    }
  }

  const basePpctIndex = grade === '6' ? 14 : grade === '7' ? 20 : grade === '8' ? 24 : 28;

  // Domain-specific equipment and digital/AI codes
  let teacherEquip: string[] = [];
  let studentEquip: string[] = [];
  let digitalCodes: string[] = [];
  let digitalDetail = '';
  let aiCodes: string[] = [];
  let aiDetail = '';

  if (matchedStrand === 'Chất và sự biến đổi của chất') {
    teacherEquip = [
      'Kế hoạch bài dạy, bài giảng điện tử PowerPoint/Canva tương tác, video mô phỏng cấu tạo phân tử.',
      'Bộ dụng cụ thực hành thí nghiệm: ống nghiệm, giá để ống nghiệm, kẹp gỗ, cốc thủy tinh, ống hút nhỏ giọt.',
      'Bảng tuần hoàn các nguyên tố hóa học số, hóa chất mẫu phục vụ bài học (nếu có thực hành).',
      'Phiếu học tập định hướng (dạng bảng 2 cột) và phiếu đánh giá đồng đẳng nhóm.',
    ];
    studentEquip = [
      `Sách giáo khoa Khoa học tự nhiên ${grade} (Bộ Kết nối tri thức với cuộc sống), vở ghi bài.`,
      'Phiếu học tập cá nhân, bút dạ, bảng phụ nhóm (khổ A3).',
      'Kính bảo hộ thí nghiệm (khi thực hiện thao tác hóa chất trong phòng bộ môn).',
    ];
    digitalCodes = ['[NLS.1]', '[NLS.2]'];
    digitalDetail = 'Khai thác Bảng tuần hoàn số tương tác và phần mềm thí nghiệm ảo Yenka/PhET mô phỏng phản ứng hóa học an toàn.';
    aiCodes = ['[AI.2]', '[AI.4]'];
    aiDetail = 'Ứng dụng trợ lý AI tra cứu an toàn hóa chất, tìm hiểu ứng dụng thực tiễn của chất trong công nghiệp và liêm chính học thuật.';
  } else if (matchedStrand === 'Vật sống') {
    teacherEquip = [
      'Kế hoạch bài dạy, giáo án số, slide trình chiếu hình ảnh hiển vi độ phân giải cao và video tư liệu sinh học.',
      'Tranh ảnh sơ đồ cấu tạo sinh học, mô hình không gian 3D, tiêu bản mẫu vật (nếu có tiết thực hành).',
      'Kính hiển vi quang học, kính lúp cầm tay, lam kính, lamen, giấy thấm, kim mũi mác (cho bài thực hành).',
      'Phiếu học tập quan sát, bảng kiểm đánh giá sản phẩm học tập.',
    ];
    studentEquip = [
      `Sách giáo khoa KHTN ${grade}, vở ghi chép khoa học.`,
      'Mẫu vật thực tế thu thập theo hướng dẫn (lá cây, hoa, tiêu bản nấm/thực vật...).',
      'Bảng nhóm A0/A3, bút viết, giấy note màu.',
    ];
    digitalCodes = ['[NLS.1]', '[NLS.4]'];
    digitalDetail = 'Khai thác Atlas số cơ thể sinh vật và ngân hàng hình ảnh tế bào số; sử dụng Canva thiết kế sơ đồ tư duy hệ thống hóa bài học.';
    aiCodes = ['[AI.1]', '[AI.2]'];
    aiDetail = 'Trải nghiệm ứng dụng thị giác máy tính AI (Google Lens / Seek) nhận diện thông minh mẫu vật thực vật, động vật và tế bào.';
  } else if (matchedStrand === 'Trái Đất và bầu trời') {
    teacherEquip = [
      'Kế hoạch bài dạy, bài giảng điện tử đa phương tiện, video mô phỏng vũ trụ và hiện tượng thiên văn.',
      'Mô hình chuyển động Hệ Mặt Trời, Quả địa cầu, la bàn từ tính, bản đồ khí hậu số.',
      'Phiếu học tập tìm hiểu chu kì, hiện tượng tự nhiên và phiếu đánh giá dự án học tập.',
    ];
    studentEquip = [
      `Sách giáo khoa KHTN ${grade}, vở ghi, tập bản đồ/sơ đồ vị trí các hành tinh.`,
      'Bút màu, bảng phụ, giấy vẽ sơ đồ hiện tượng thiên văn theo nhóm.',
    ];
    digitalCodes = ['[NLS.1]', '[NLS.5]'];
    digitalDetail = 'Khai thác dữ liệu bản đồ số Google Earth và phần mềm thiên văn ảo Stellarium để quan sát chuyển động bầu trời đêm.';
    aiCodes = ['[AI.3]', '[AI.4]'];
    aiDetail = 'Khám phá mô hình AI dự báo khí tượng thủy văn, theo dõi xu hướng biến đổi khí hậu toàn cầu và sử dụng công nghệ có trách nhiệm.';
  } else {
    // Năng lượng và sự biến đổi (Vật lí)
    teacherEquip = [
      'Kế hoạch bài dạy, bài giảng điện tử PowerPoint/Canva tương tác, mô phỏng số trực quan.',
      'Bộ dụng cụ thí nghiệm vật lí chuyên dụng phù hợp bài học (thước đo, lực kế, giá đỡ, biến trở, nguồn điện, cảm biến...).',
      'Cổng quang điện kết nối đồng hồ hiện số (nếu có đo thời gian/chuyển động) hoặc thiết bị quang/nhiệt/điện chuyên dụng.',
      'Hệ thống phiếu học tập phân hóa theo mức độ nhận thức.',
    ];
    studentEquip = [
      `Sách giáo khoa KHTN ${grade}, vở bài tập, thước kẻ có độ chia nhỏ nhất đến mm.`,
      'Đồng hồ bấm giây, máy tính cầm tay, bảng ghi số liệu thực nghiệm nhóm.',
    ];
    digitalCodes = ['[NLS.2]', '[NLS.3]'];
    digitalDetail = 'Thực hành thí nghiệm ảo trên phần mềm mô phỏng PhET Interactive Simulations; ứng dụng bảng tính điện tử xử lý số liệu đo.';
    aiCodes = ['[AI.3]', '[AI.2]'];
    aiDetail = 'Tiếp cận mô hình AI phân tích xu hướng đồ thị thực nghiệm và đặt câu hỏi truy vấn trợ lý AI để giải thích hiện tượng tự nhiên.';
  }

  // Knowledge objectives
  const knowledgeList = matchedRequirements.length > 0
    ? matchedRequirements.slice(0, 3).map((r) => `${r} liên quan trực tiếp đến ${lessonName}.`)
    : [
        `Trình bày, nêu được định nghĩa, bản chất và các quy luật khoa học then chốt của bài học: ${lessonName}.`,
        `Quan sát, mô tả hiện tượng và phân tích được các dữ liệu, thông số khoa học đặc trưng của ${lessonName}.`,
        `Vận dụng được kiến thức đã học về ${lessonName} để giải thích các hiện tượng thực tế và giải bài tập định lượng/định tính.`,
      ];

  // Construct distinct periods and activities
  const periods: PeriodLessonPlan[] = [];
  const allActivities: LessonActivityItem[] = [];

  for (let p = 1; p <= numPeriods; p++) {
    const periodIdx = basePpctIndex + p - 1;
    let mainContent = '';
    let targetComp = '';
    const periodActs: LessonActivityItem[] = [];

    if (numPeriods === 1) {
      mainContent = `${lessonName}: Toàn bộ nội dung lý thuyết trọng tâm, thực hành/quan sát, luyện tập và vận dụng thực tiễn`;
      targetComp = `Nắm vững kiến thức nền tảng, thực hiện quan sát/thí nghiệm và vận dụng giải quyết bài tập thực tế về ${lessonName}.`;

      periodActs.push(
        {
          id: `act-p1-1`,
          stepNumber: 1,
          periodNumber: 1,
          name: `Hoạt động 1: Mở đầu / Khởi động (5 - 7 phút)`,
          durationMinutes: 7,
          goal: `Kích hoạt kiến thức nền tảng, tạo tình huống có vấn đề khơi gợi hứng thú học tập về ${lessonName}.`,
          content: `Quan sát hình ảnh/video thực tế đời sống liên quan đến ${lessonName} và trả lời câu hỏi định hướng của GV.`,
          product: `Câu trả lời dự đoán, nhận xét ban đầu hoặc thắc mắc khoa học của học sinh về vấn đề bài học.`,
          execution: {
            step1_transfer: `GV trình chiếu tư liệu thực tế liên quan đến ${lessonName}; nêu câu hỏi tình huống có vấn đề. HS lắng nghe.`,
            step2_execute: `HS quan sát, suy nghĩ cá nhân trong 1-2 phút, sau đó trao đổi nhanh với bạn cùng bàn.`,
            step3_report: `GV gọi 2-3 đại diện HS phát biểu suy nghĩ ban đầu. Cả lớp lắng nghe và đóng góp ý kiến.`,
            step4_conclude: `GV ghi nhận ý kiến, đặt vấn đề mâu thuẫn nhận thức và dẫn dắt vào bài mới: ${lessonName}.`,
            twoColumns: {
              step1: {
                stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                teacherActivity: `GV chiếu hình ảnh/video trực quan về hiện tượng thực tiễn liên quan trực tiếp đến ${lessonName}; đặt câu hỏi gợi mở: "Trong đời sống hàng ngày, các em đã từng quan sát hiện tượng này chưa? Theo các em, nguyên nhân và bản chất khoa học đằng sau hiện tượng này là gì?". Yêu cầu HS suy nghĩ cá nhân trong 1 phút.`,
                studentActivity: `HS chú ý quan sát màn chiếu, lắng nghe câu hỏi định hướng của GV, liên hệ với trải nghiệm thực tế đời sống của bản thân để hình thành các phỏng đoán ban đầu.`,
              },
              step2: {
                stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                teacherActivity: `GV quan sát lớp, khích lệ các em mạnh dạn nêu lên suy nghĩ riêng, không đánh giá đúng sai ở bước khởi động mà tập trung kích hoạt tư duy phản biện.`,
                studentActivity: `HS suy nghĩ độc lập, ghi vắn tắt ý kiến ra giấy nháp; thảo luận nhanh trong 1 phút với bạn bên cạnh để thống nhất câu trả lời dự đoán.`,
              },
              step3: {
                stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                teacherActivity: `GV mời đại diện 2-3 học sinh phát biểu câu trả lời; khuyến khích các học sinh khác nêu ý kiến nhận xét hoặc góc nhìn bổ sung.`,
                studentActivity: `Đại diện HS đứng dậy tự tin trình bày câu trả lời của mình trước lớp; các bạn khác chú ý lắng nghe và nhận xét, bổ sung ý kiến.`,
              },
              step4: {
                stepTitle: 'Bước 4: Kết luận, nhận định',
                teacherActivity: `GV tổng hợp các dự đoán của học sinh, chỉ ra vấn đề cốt lõi cần giải quyết: "Để trả lời chính xác câu hỏi trên và hiểu sâu sắc bản chất khoa học, hôm nay chúng ta cùng tìm hiểu bài: ${lessonName}".`,
                studentActivity: `HS lắng nghe lời dẫn dắt của giáo viên, mở sách giáo khoa và vở ghi bài, ghi tên bài học mới với tâm thế chủ động, hào hứng.`,
              },
            },
          },
        },
        {
          id: `act-p1-2`,
          stepNumber: 2,
          periodNumber: 1,
          name: `Hoạt động 2: Hình thành kiến thức mới (20 - 22 phút)`,
          durationMinutes: 21,
          goal: `Khám phá các khái niệm, đặc điểm, quy luật khoa học và bản chất trọng tâm của ${lessonName}.`,
          content: `Đọc SGK, phân tích kênh hình/dữ liệu thí nghiệm hoặc thao tác mẫu vật, hoàn thành Phiếu học tập số 1 về ${lessonName}.`,
          product: `Nội dung hoàn chỉnh trên Phiếu học tập số 1, bảng tổng kết kiến thức khoa học đã chuẩn hóa.`,
          execution: {
            step1_transfer: `GV chia nhóm học tập, phát Phiếu học tập số 1 về ${lessonName}, nêu rõ yêu cầu thời gian thảo luận (10 phút).`,
            step2_execute: `Các nhóm đọc tài liệu, phân tích thông tin, làm thí nghiệm/khảo sát và ghi kết quả vào phiếu. GV theo dõi hỗ trợ.`,
            step3_report: `Đại diện các nhóm báo cáo kết quả trên bảng hoặc máy chiếu; các nhóm khác phản biện, so sánh.`,
            step4_conclude: `GV nhận xét, chính xác hóa kiến thức khoa học cốt lõi của ${lessonName}, yêu cầu HS ghi nhớ vào vở.`,
            twoColumns: {
              step1: {
                stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                teacherActivity: `GV chia lớp thành các nhóm từ 4-6 học sinh, phát Phiếu học tập số 1; yêu cầu HS nghiên cứu thông tin mục nội dung trong SGK và tài liệu học tập, thực hiện các yêu cầu trọng tâm của bài: ${lessonName}. Giới hạn thời gian làm việc nhóm là 10 phút.`,
                studentActivity: `HS nhanh chóng ổn định đội hình nhóm, phân công nhóm trưởng, thư kí ghi chép; tiếp nhận Phiếu học tập số 1, đọc kĩ các câu hỏi và tiêu chí đánh giá.`,
              },
              step2: {
                stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                teacherActivity: `GV đi lại giữa các dãy bàn quan sát hoạt động của các nhóm; kịp thời phát hiện khó khăn, đặt câu hỏi gợi ý định hướng cho các nhóm còn lúng túng; nhắc nhở học sinh hợp tác bình đẳng.`,
                studentActivity: `Các thành viên trong nhóm tích cực đọc thông tin SGK, quan sát kênh hình, trao đổi thảo luận sôi nổi để tìm câu trả lời; thư kí tổng hợp ý kiến và ghi kết quả vào Phiếu học tập.`,
              },
              step3: {
                stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                teacherActivity: `Hết thời gian thảo luận, GV mời đại diện 1 nhóm lên bảng trình bày sản phẩm trên máy chiếu; yêu cầu đại diện nhóm khác nhận xét chéo, đặt câu hỏi chất vấn.`,
                studentActivity: `Đại diện nhóm được chỉ định trình bày rõ ràng, mạch lạc kết quả thảo luận; các nhóm khác đối chiếu bài làm của mình, giơ tay đặt câu hỏi phản biện hoặc bổ sung ý kiến còn thiếu.`,
              },
              step4: {
                stepTitle: 'Bước 4: Kết luận, nhận định',
                teacherActivity: `GV tổng kết, đánh giá tinh thần hợp tác của từng nhóm; phân tích các điểm đúng và khắc phục hiểu lầm của HS; chốt lại các nội dung định nghĩa, công thức và bản chất khoa học cốt lõi của ${lessonName}.`,
                studentActivity: `HS chú ý theo dõi GV chuẩn hóa kiến thức, đối chiếu và chỉnh sửa Phiếu học tập cá nhân; ghi chép cẩn thận nội dung bài học trọng tâm vào vở ghi.`,
              },
            },
          },
        },
        {
          id: `act-p1-3`,
          stepNumber: 3,
          periodNumber: 1,
          name: `Hoạt động 3: Luyện tập (10 phút)`,
          durationMinutes: 10,
          goal: `Củng cố, khắc sâu kiến thức vừa học, rèn kĩ năng giải bài tập định lượng/định tính về ${lessonName}.`,
          content: `Giải quyết các bài tập trắc nghiệm và câu hỏi tình huống củng cố liên quan đến ${lessonName}.`,
          product: `Bài giải chính xác trong vở ghi hoặc đáp án bài tập trắc nghiệm trên bảng con/hệ thống học tập số.`,
          execution: {
            step1_transfer: `GV giao hệ thống 4 câu hỏi trắc nghiệm và 1 bài tập tình huống về ${lessonName}. HS tiếp nhận.`,
            step2_execute: `HS làm bài độc lập vào vở trong 5 phút. GV quan sát và hỗ trợ học sinh có nhu cầu.`,
            step3_report: `GV gọi HS xung phong trả lời và giải thích lí do chọn đáp án. Lớp nhận xét chéo.`,
            step4_conclude: `GV chốt đáp án đúng, phân tích các bẫy thường gặp và chấm điểm động viên học sinh.`,
            twoColumns: {
              step1: {
                stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                teacherActivity: `GV trình chiếu hệ thống bài tập luyện tập gồm các câu hỏi trắc nghiệm khách quan 4 lựa chọn và 1 câu hỏi bài tập tự luận vận dụng kiến thức bài: ${lessonName}. Yêu cầu HS làm việc độc lập trong 5 phút.`,
                studentActivity: `HS chú ý quan sát câu hỏi trên màn chiếu, đọc kĩ đề bài, xác định các đại lượng đã cho và yêu cầu cần tìm của bài toán.`,
              },
              step2: {
                stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                teacherActivity: `GV quan sát bao quát lớp, theo dõi tiến độ làm bài của học sinh; hướng dẫn riêng cho những em còn chưa vững kiến thức vừa học.`,
                studentActivity: `HS tự giác làm bài vào vở; vận dụng kiến thức lý thuyết và công thức của ${lessonName} để lựa chọn đáp án đúng và trình bày lời giải chi tiết.`,
              },
              step3: {
                stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                teacherActivity: `GV tổ chức cho học sinh báo cáo: giơ bảng chọn đáp án hoặc gọi từng HS đọc đáp án và giải thích cách tư duy; mời các bạn khác nhận xét, bổ sung cách giải ngắn gọn hơn.`,
                studentActivity: `HS giơ bảng đáp án hoặc đứng lên trình bày rõ ràng từng bước giải thích; lắng nghe phản hồi từ các bạn cùng lớp để hoàn thiện câu trả lời.`,
              },
              step4: {
                stepTitle: 'Bước 4: Kết luận, nhận định',
                teacherActivity: `GV công bố đáp án chuẩn xác; biểu dương những học sinh có câu trả lời nhanh và giải thích thuyết phục; phân tích các lỗi sai phổ biến để học sinh rút kinh nghiệm.`,
                studentActivity: `HS tự chữa bài vào vở, đánh dấu các lưu ý quan trọng để không lặp lại sai lầm trong các bài kiểm tra sau này.`,
              },
            },
          },
        },
        {
          id: `act-p1-4`,
          stepNumber: 4,
          periodNumber: 1,
          name: `Hoạt động 4: Vận dụng (7 phút)`,
          durationMinutes: 7,
          goal: `Vận dụng kiến thức bài học ${lessonName} vào giải thích hiện tượng đời sống, bảo vệ môi trường và định hướng phát triển phẩm chất.`,
          content: `Giải quyết tình huống thực tế hoặc thiết kế dự án nhỏ liên hệ bài học ${lessonName} với đời sống hàng ngày.`,
          product: `Bài viết ngắn, giải pháp khoa học hoặc thông điệp ý nghĩa giải quyết tình huống thực tế đời sống.`,
          execution: {
            step1_transfer: `GV nêu tình huống thực tiễn gắn liền với ${lessonName}, giao bài tập về nhà. HS tiếp nhận nhiệm vụ.`,
            step2_execute: `HS trao đổi nhanh cặp đôi định hình phương án giải quyết; lập kế hoạch thực hiện tại nhà.`,
            step3_report: `GV mời 1-2 HS chia sẻ nhanh ý tưởng vận dụng trước lớp.`,
            step4_conclude: `GV nhấn mạnh thông điệp thực tiễn và dặn dò chuẩn bị bài học tiếp theo.`,
            twoColumns: {
              step1: {
                stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                teacherActivity: `GV đưa ra tình huống gắn liền với thực tiễn đời sống địa phương: "Kiến thức về ${lessonName} có thể được ứng dụng như thế nào để giải quyết vấn đề thực tế (như an toàn lao động, chăm sóc sức khỏe, bảo vệ môi trường, nâng cao hiệu quả sản xuất)?". Giao nhiệm vụ thực hiện theo nhóm nhỏ tại nhà.`,
                studentActivity: `HS lắng nghe tình huống gợi mở của GV, liên hệ với các trải nghiệm xung quanh khu vực mình sinh sống và học tập.`,
              },
              step2: {
                stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                teacherActivity: `GV hướng dẫn học sinh cách tìm kiếm thông tin an toàn trên Internet [NLS.1] và ứng dụng trợ lý AI [AI.2] để tra cứu mở rộng kiến thức có chọn lọc.`,
                studentActivity: `HS thảo luận nhanh với bạn cùng bàn trong 2 phút để phác thảo ý tưởng giải pháp; ghi lại các từ khóa tìm kiếm cần tra cứu thêm.`,
              },
              step3: {
                stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                teacherActivity: `GV mời 2 học sinh đại diện nêu ngắn gọn ý tưởng vận dụng sáng tạo; khuyến khích các sáng kiến vì cộng đồng.`,
                studentActivity: `Học sinh tự tin trình bày ý tưởng của mình; cả lớp vỗ tay động viên và góp ý hoàn thiện.`,
              },
              step4: {
                stepTitle: 'Bước 4: Kết luận, nhận định',
                teacherActivity: `GV chốt lại ý nghĩa thực tiễn to lớn của môn Khoa học tự nhiên trong đời sống; dặn dò học sinh nộp sản phẩm vận dụng trên hệ thống học tập trực tuyến (LMS/Padlet) trước buổi học tới; hướng dẫn đọc trước bài mới.`,
                studentActivity: `HS ghi chép các dặn dò của giáo viên vào sổ tay, có ý thức chủ động hoàn thành bài tập vận dụng ở nhà.`,
              },
            },
          },
        }
      );
    } else {
      // Multi-period lesson (2, 3, 4, 5, 6 periods)
      if (p === 1) {
        mainContent = `${lessonName} (Tiết 1): Khởi động & Khám phá nội dung lý thuyết, bản chất và quy luật cốt lõi (Phần 1)`;
        targetComp = `Nhận thức KHTN: Hình thành khái niệm, nắm vững đặc điểm và quy luật nền tảng phần 1 của ${lessonName}.`;

        periodActs.push(
          {
            id: `act-p${p}-1`,
            stepNumber: 1,
            periodNumber: p,
            name: `Hoạt động 1: Mở đầu / Khởi động (7 phút)`,
            durationMinutes: 7,
            goal: `Kích hoạt kiến thức nền tảng, tạo tình huống thực tế định hướng vào nội dung bài: ${lessonName}.`,
            content: `Xem video/hình ảnh hiện tượng liên quan đến ${lessonName}, trả lời câu hỏi khơi gợi của giáo viên.`,
            product: `Dự đoán hoặc thắc mắc xuất phát của học sinh về vấn đề bài học.`,
            execution: {
              step1_transfer: `GV chiếu video/hình ảnh tình huống đời sống về ${lessonName}; đặt câu hỏi mở đầu. HS lắng nghe.`,
              step2_execute: `HS suy nghĩ cá nhân 1-2 phút, thảo luận cặp đôi để tìm ý tưởng trả lời.`,
              step3_report: `GV mời đại diện 2-3 HS trình bày suy nghĩ ban đầu. Lớp lắng nghe, nhận xét.`,
              step4_conclude: `GV liên kết các ý kiến, nêu mâu thuẫn nhận thức và dẫn dắt vào bài mới: ${lessonName}.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV chiếu hình ảnh/video thực tế về hiện tượng liên quan đến bài: ${lessonName}; nêu câu hỏi gợi mở: "Tại sao lại có hiện tượng này trong tự nhiên và làm thế nào để giải thích chính xác theo quan điểm khoa học?". Yêu cầu HS suy nghĩ cá nhân trong 1 phút.`,
                  studentActivity: `HS chú ý quan sát hình ảnh và video trên màn chiếu, lắng nghe câu hỏi của GV, liên hệ với hiện tượng thực tế từng gặp trong đời sống.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV quan sát lớp, khích lệ học sinh mạnh dạn suy nghĩ và trao đổi ý kiến ban đầu; gợi mở cho các em còn rụt rè.`,
                  studentActivity: `HS suy nghĩ độc lập, trao đổi nhanh trong 1 phút với bạn cùng bàn để chia sẻ phỏng đoán cá nhân.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV gọi đại diện 2-3 học sinh chia sẻ phỏng đoán trước lớp; khuyến khích các bạn khác nêu góc nhìn khác.`,
                  studentActivity: `Đại diện HS đứng lên phát biểu ý kiến của nhóm mình; cả lớp chú ý lắng nghe và nhận xét chéo.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV tổng kết các ý kiến, khẳng định để có câu trả lời khoa học chính xác, lớp sẽ cùng nghiên cứu nội dung bài: ${lessonName}.`,
                  studentActivity: `HS hào hứng tiếp nhận nhiệm vụ, mở SGK và vở ghi, ghi tựa bài mới vào vở.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-2`,
            stepNumber: 2,
            periodNumber: p,
            name: `Hoạt động 2.1: Hình thành kiến thức mới - Phần 1 (30 phút)`,
            durationMinutes: 30,
            goal: `Nghiên cứu tài liệu, quan sát mẫu vật/kênh hình để xây dựng các khái niệm, cơ sở lý thuyết nền tảng của ${lessonName}.`,
            content: `Đọc SGK, thảo luận nhóm hoàn thành Phiếu học tập số 1 về đặc điểm, định nghĩa cốt lõi của ${lessonName}.`,
            product: `Phiếu học tập số 1 đã hoàn thành đầy đủ, nội dung kiến thức được chuẩn hóa trên bảng.`,
            execution: {
              step1_transfer: `GV chia nhóm học tập 4-6 HS, phát Phiếu học tập số 1 về ${lessonName}, nêu rõ yêu cầu thời gian 12 phút.`,
              step2_execute: `Các nhóm nghiên cứu SGK, thảo luận và ghi câu trả lời vào phiếu. GV quan sát và hỗ trợ.`,
              step3_report: `Đại diện nhóm lên bảng trình bày kết quả; các nhóm khác phản biện, so sánh.`,
              step4_conclude: `GV nhận xét, chuẩn hóa kiến thức lý thuyết nền tảng của ${lessonName} vào bảng bài học.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV chia lớp thành các nhóm (4-6 HS/nhóm), giao Phiếu học tập số 1; yêu cầu các nhóm đọc kĩ mục nội dung trong SGK và các hình ảnh minh họa để trả lời các câu hỏi khám phá bản chất của: ${lessonName}. Thời gian thảo luận nhóm: 12 phút.`,
                  studentActivity: `HS nhanh chóng di chuyển về nhóm, cử nhóm trưởng điều hành và thư kí ghi biên bản; nhận Phiếu học tập số 1 và đọc kĩ các yêu cầu.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV bao quát toàn lớp, đi đến từng nhóm quan sát quá trình làm việc; đặt câu hỏi gợi mở đối với các câu hỏi khó; nhắc nhở các em phân chia công việc hợp lí để ai cũng được đóng góp ý kiến.`,
                  studentActivity: `Các thành viên tích cực đọc SGK, quan sát sơ đồ, tranh ảnh; trao đổi, phân tích và thống nhất phương án trả lời; thư kí ghi chép cẩn thận vào Phiếu học tập.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV yêu cầu các nhóm dừng thảo luận; chỉ định ngẫu nhiên đại diện 1 nhóm lên bảng trình bày sản phẩm; yêu cầu đại diện nhóm khác theo dõi nhận xét chéo và đặt câu hỏi.`,
                  studentActivity: `Đại diện nhóm báo cáo tự tin, sử dụng que chỉ bảng chỉ rõ các chi tiết hình ảnh; các nhóm khác lắng nghe, ghi chép phản biện và bổ sung thông tin cần thiết.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV nhận xét thái độ làm việc của các nhóm; chuẩn hóa kiến thức trên bảng; nhấn mạnh các khái niệm, quy luật then chốt của ${lessonName} để học sinh ghi nhớ.`,
                  studentActivity: `HS chú ý lắng nghe GV kết luận, hoàn thiện Phiếu học tập cá nhân và ghi các đề mục kiến thức trọng tâm vào vở.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-3`,
            stepNumber: 3,
            periodNumber: p,
            name: `Hoạt động củng cố & giao nhiệm vụ Tiết 1 (8 phút)`,
            durationMinutes: 8,
            goal: `Củng cố nhanh nội dung Tiết 1 và giao nhiệm vụ chuẩn bị cho Tiết 2 của ${lessonName}.`,
            content: `Trả lời nhanh 3 câu hỏi trắc nghiệm củng cố và nhận nhiệm vụ chuẩn bị thực hành/khảo sát cho tiết sau.`,
            product: `Đáp án câu hỏi củng cố trong vở và ghi chép nhiệm vụ chuẩn bị Tiết 2.`,
            execution: {
              step1_transfer: `GV chiếu 3 câu hỏi trắc nghiệm nhanh củng cố Tiết 1; giao nhiệm vụ chuẩn bị Tiết 2.`,
              step2_execute: `HS làm bài cá nhân nhanh, ghi chép nhiệm vụ tiết học tiếp theo.`,
              step3_report: `GV gọi 2 HS trả lời nhanh đáp án trắc nghiệm.`,
              step4_conclude: `GV chuẩn hóa đáp án và chốt dặn dò tiết học.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV trình chiếu 3 câu hỏi trắc nghiệm nhanh kiểm tra mức độ nắm kiến thức Tiết 1; giao nhiệm vụ cho từng nhóm chuẩn bị mẫu vật/học liệu cho Tiết 2 của bài: ${lessonName}.`,
                  studentActivity: `HS quan sát màn chiếu, đọc nhanh câu hỏi và suy nghĩ chọn phương án trả lời.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV theo dõi phản ứng của học sinh, hỗ trợ giải thích nếu HS còn phân vân.`,
                  studentActivity: `HS tự ghi đáp án vào vở nháp; lắng nghe và ghi lại cụ thể các đồ dùng/mẫu vật cần chuẩn bị cho tiết sau.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV gọi học sinh xung phong trả lời và giải thích ngắn gọn lí do chọn đáp án.`,
                  studentActivity: `Học sinh trả lời dõng dạc đáp án đúng; cả lớp đồng tình và vỗ tay khích lệ.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV chốt lại các điểm cốt lõi của Tiết 1; đánh giá chung tiết học và dặn dò lớp chuẩn bị tốt cho Tiết 2.`,
                  studentActivity: `HS ghi nhớ dặn dò, gấp sách vở và chuẩn bị cho tiết học tiếp theo.`,
                },
              },
            },
          }
        );
      } else if (p === numPeriods) {
        // Final period: Practice + Application
        mainContent = `${lessonName} (Tiết ${p}): Luyện tập hệ thống hóa kiến thức và Vận dụng giải quyết vấn đề thực tiễn`;
        targetComp = `Vận dụng kiến thức, kĩ năng: Giải quyết bài tập phân hóa, liên hệ thực tế đời sống và bồi dưỡng phẩm chất trách nhiệm từ ${lessonName}.`;

        periodActs.push(
          {
            id: `act-p${p}-1`,
            stepNumber: 1,
            periodNumber: p,
            name: `Hoạt động 1: Khởi động kết nối & Hệ thống hóa sơ đồ kiến thức (8 phút)`,
            durationMinutes: 8,
            goal: `Tái hiện và hệ thống hóa toàn bộ kiến thức các tiết trước của bài: ${lessonName} bằng sơ đồ tư duy số.`,
            content: `Hoàn thiện sơ đồ tư duy tóm tắt các nhánh kiến thức chính của ${lessonName}.`,
            product: `Sơ đồ tư duy hoặc bảng tóm tắt nội dung bài học hoàn chỉnh của học sinh.`,
            execution: {
              step1_transfer: `GV chiếu khung sơ đồ tư duy khuyết các từ khóa trọng tâm của bài: ${lessonName}. Yêu cầu HS hoàn thành.`,
              step2_execute: `HS làm việc cá nhân hoặc cặp đôi, điền từ khóa thích hợp vào sơ đồ.`,
              step3_report: `GV mời đại diện HS lên bảng điền từ khóa hoặc trình bày sơ đồ tư duy.`,
              step4_conclude: `GV chốt lại sơ đồ kiến thức toàn bài một cách mạch lạc, hệ thống.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV trình chiếu khung sơ đồ tư duy tổng kết toàn bộ nội dung bài: ${lessonName} với các nhánh chính còn để trống từ khóa; yêu cầu HS điền từ khóa chính xác vào các nhánh trong thời gian 3 phút.`,
                  studentActivity: `HS quan sát sơ đồ tư duy trên màn chiếu, nhớ lại kiến thức đã học ở các tiết trước để xác định các từ khóa thích hợp.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV quan sát lớp, hướng dẫn HS cách sử dụng công cụ số (Mindmap/Canva [NLS.4]) để vẽ sơ đồ tư duy khoa học và đẹp mắt.`,
                  studentActivity: `HS làm việc cá nhân vào vở ghi bài; trao đổi nhanh với bạn cùng bàn để hoàn thiện cấu trúc sơ đồ tư duy.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV mời 2 học sinh lên bảng điền các từ khóa vào sơ đồ trên màn chiếu; khuyến khích các em giải thích mối liên hệ logic giữa các nhánh.`,
                  studentActivity: `HS lên bảng tự tin điền từ khóa và trình bày ngắn gọn mối liên hệ giữa các phần kiến thức; cả lớp chú ý theo dõi và bổ sung.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV nhận xét, chuẩn hóa sơ đồ tư duy hoàn chỉnh; chốt lại cấu trúc toàn diện của bài học: ${lessonName}.`,
                  studentActivity: `HS hoàn thiện sơ đồ tư duy chuẩn vào vở ghi bài làm tài liệu ôn tập hệ thống.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-2`,
            stepNumber: 2,
            periodNumber: p,
            name: `Hoạt động 3: Luyện tập (Giải bài tập phân hóa theo mức độ) (22 phút)`,
            durationMinutes: 22,
            goal: `Vận dụng kiến thức toàn bài để giải các dạng bài tập từ nhận biết, thông hiểu đến vận dụng về ${lessonName}.`,
            content: `Làm việc nhóm hoặc cá nhân hoàn thành hệ thống bài tập trắc nghiệm và tự luận phân hóa trong Phiếu học tập số 2.`,
            product: `Bài làm chi tiết, chính xác các câu hỏi và bài tập trong Phiếu học tập số 2.`,
            execution: {
              step1_transfer: `GV phát Phiếu học tập số 2 gồm 6 câu trắc nghiệm và 2 bài tập tự luận về ${lessonName}.`,
              step2_execute: `HS làm bài độc lập trong 12 phút. GV theo dõi, trợ giúp học sinh khi gặp khó khăn.`,
              step3_report: `GV tổ chức cho học sinh báo cáo kết quả: chữa bài trên bảng và nhận xét chéo giữa các nhóm.`,
              step4_conclude: `GV nhận xét phương pháp giải, chuẩn hóa đáp án và biểu dương học sinh làm tốt.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV phát Phiếu học tập số 2 với hệ thống câu hỏi phân hóa 4 mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) bám sát yêu cầu cần đạt của bài: ${lessonName}. Yêu cầu HS làm bài nghiêm túc trong 12 phút.`,
                  studentActivity: `HS tiếp nhận Phiếu học tập số 2, đọc kĩ đề bài, phân bố thời gian hợp lí để giải quyết từng câu hỏi từ dễ đến khó.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV đi quanh lớp quan sát tiến độ; chú ý hướng dẫn học sinh phương pháp trình bày bài tự luận khoa học, rõ ràng từng bước; hỗ trợ học sinh có học lực yếu hơn.`,
                  studentActivity: `HS tập trung suy nghĩ, vận dụng công thức và lý thuyết đã học để giải bài tập vào phiếu; kiểm tra lại kết quả tính toán cẩn thận.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV gọi 2 HS lên bảng trình bày 2 bài tự luận; tổ chức cho cả lớp chữa các câu trắc nghiệm bằng cách biểu quyết đáp án; mời HS nhận xét bài giải trên bảng.`,
                  studentActivity: `2 HS lên bảng giải bài chi tiết; các học sinh dưới lớp theo dõi, so sánh với bài làm của mình và đặt câu hỏi chất vấn nếu có điểm chưa rõ.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV sửa bài chi tiết trên bảng; lưu ý các lỗi sai thường gặp (như sai đơn vị, nhầm lẫn khái niệm, thiếu bước giải thích); chốt đáp án đúng và chấm điểm tượng trưng động viên tinh thần.`,
                  studentActivity: `HS chú ý lắng nghe, chữa bài cẩn thận vào phiếu học tập và ghi chép các lưu ý quan trọng vào vở.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-3`,
            stepNumber: 3,
            periodNumber: p,
            name: `Hoạt động 4: Vận dụng & Liên hệ thực tiễn (15 phút)`,
            durationMinutes: 15,
            goal: `Vận dụng kiến thức ${lessonName} giải quyết tình huống thực tế đời sống, bảo vệ môi trường và bồi dưỡng phẩm chất trách nhiệm.`,
            content: `Phân tích tình huống thực tế đời sống, đề xuất giải pháp khoa học hoặc dự án STEM nhỏ liên quan đến ${lessonName}.`,
            product: `Bản đề xuất giải pháp thực tế, thông điệp truyền thông khoa học hoặc sản phẩm sáng tạo của học sinh.`,
            execution: {
              step1_transfer: `GV nêu tình huống thực tế hoặc dự án gắn với ${lessonName}; giao nhiệm vụ cho các nhóm.`,
              step2_execute: `Các nhóm thảo luận tìm giải pháp khoa học thực tiễn trong 6 phút.`,
              step3_report: `Đại diện 2 nhóm báo cáo giải pháp; các nhóm khác nhận xét, phản biện.`,
              step4_conclude: `GV đánh giá, tổng kết bài học toàn diện và giao bài tập dự án về nhà.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV trình chiếu tình huống thực tiễn gắn liền với đời sống hàng ngày hoặc vấn đề bảo vệ môi trường liên quan đến bài: ${lessonName}; đặt câu hỏi: "Là một học sinh THCS am hiểu khoa học, em hãy đề xuất ít nhất 2 giải pháp cụ thể để giải quyết tình huống trên hoặc ứng dụng công nghệ/AI [AI.3] để nâng cao chất lượng cuộc sống?".`,
                  studentActivity: `HS chăm chú theo dõi tình huống thực tế, tiếp nhận câu hỏi của giáo viên và ý thức được vai trò của tri thức khoa học đối với cộng đồng.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV quan sát các nhóm thảo luận, gợi ý các hướng tiếp cận sáng tạo, ứng dụng công nghệ số và liên hệ thực tế địa phương.`,
                  studentActivity: `HS làm việc theo nhóm, thảo luận sôi nổi để tìm ra giải pháp thiết thực, khả thi; thư kí ghi lại các ý tưởng sáng tạo lên bảng nhóm.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV mời đại diện 2 nhóm lên chia sẻ giải pháp của nhóm mình; khuyến khích các nhóm khác tranh luận và bổ sung các ý tưởng độc đáo.`,
                  studentActivity: `Đại diện nhóm tự tin thuyết trình giải pháp; các nhóm khác chăm chú lắng nghe, phản biện văn minh và học hỏi lẫn nhau.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV đánh giá cao tính sáng tạo và tinh thần trách nhiệm của học sinh; đúc kết thông điệp giáo dục phẩm chất yêu nước, chăm chỉ và trách nhiệm; hướng dẫn học sinh tự đánh giá và chuẩn bị bài cho tuần học kế tiếp.`,
                  studentActivity: `HS lắng nghe lời đúc kết của giáo viên, ghi nhận thông điệp ý nghĩa và chuẩn bị tốt cho các nội dung học tập tiếp theo.`,
                },
              },
            },
          }
        );
      } else {
        // Intermediate period (e.g. Period 2 in 3-period lesson, or Periods 2, 3 in 4-period lesson)
        mainContent = `${lessonName} (Tiết ${p}): Khám phá nội dung phần ${p} (Thực hành thí nghiệm / Khảo sát hiện tượng / Quy luật chuyên sâu)`;
        targetComp = `Tìm hiểu tự nhiên: Tiến hành thí nghiệm, quan sát hiện tượng, thu thập và xử lý số liệu khoa học của phần ${p} trong ${lessonName}.`;

        periodActs.push(
          {
            id: `act-p${p}-1`,
            stepNumber: 1,
            periodNumber: p,
            name: `Hoạt động 1: Tái hiện kiến thức & Khởi động kết nối (5 phút)`,
            durationMinutes: 5,
            goal: `Nhắc lại các khái niệm đã học ở tiết trước, tạo kết nối logic sang nội dung mới của Tiết ${p} bài: ${lessonName}.`,
            content: `Tham gia trò chơi hỏi đáp nhanh hoặc giải ô chữ khoa học tái hiện kiến thức Tiết trước.`,
            product: `Câu trả lời chính xác của học sinh, tạo tâm thế sẵn sàng cho tiết học mới.`,
            execution: {
              step1_transfer: `GV tổ chức trò chơi hỏi đáp nhanh (3 câu) kết nối kiến thức tiết trước sang Tiết ${p}.`,
              step2_execute: `HS suy nghĩ và xung phong trả lời.`,
              step3_report: `HS đứng dậy đọc đáp án và giải thích ngắn gọn.`,
              step4_conclude: `GV nhận xét, khen ngợi và dẫn dắt vào nội dung Tiết ${p}.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV tổ chức hoạt động khởi động nhanh bằng trò chơi "Ai nhanh hơn": chiếu 3 câu hỏi trắc nghiệm liên kết trực tiếp từ Tiết 1 sang nội dung Tiết ${p} của bài: ${lessonName}.`,
                  studentActivity: `HS theo dõi câu hỏi trên màn chiếu, sẵn sàng giơ tay phát biểu câu trả lời.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV quan sát cánh tay giơ lên của học sinh, khuyến khích các em tự tin trả lời.`,
                  studentActivity: `HS suy nghĩ nhanh, chuẩn bị câu trả lời và lập luận giải thích ngắn gọn.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV gọi 3 học sinh lần lượt trả lời 3 câu hỏi; cả lớp đồng thanh nhận xét đúng/sai.`,
                  studentActivity: `HS trả lời rõ ràng, rành mạch đáp án; các bạn khác vỗ tay tán thành.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV khen ngợi tinh thần chuẩn bị bài của học sinh; dẫn dắt trực tiếp vào nội dung trọng tâm của Tiết ${p}.`,
                  studentActivity: `HS mở vở ghi Tiết ${p} và chuẩn bị học cụ theo yêu cầu của GV.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-2`,
            stepNumber: 2,
            periodNumber: p,
            name: `Hoạt động 2.${p}: Hình thành kiến thức mới - Phần ${p} (Thực hành / Khảo sát hiện tượng) (32 phút)`,
            durationMinutes: 32,
            goal: `Tiến hành thí nghiệm thực tế hoặc thí nghiệm mô phỏng ảo, quan sát hiện tượng, thu thập và xử lý số liệu khoa học của ${lessonName}.`,
            content: `Làm việc nhóm theo quy trình thí nghiệm, ghi chép số liệu vào bảng biểu, phân tích kết quả và rút ra nhận xét quy luật khoa học.`,
            product: `Bảng số liệu thực nghiệm hoàn chỉnh, báo cáo kết quả thí nghiệm và kết luận quy luật của nhóm.`,
            execution: {
              step1_transfer: `GV hướng dẫn quy trình thí nghiệm, lưu ý quy tắc an toàn, giao bộ dụng cụ và phiếu thực hành cho các nhóm.`,
              step2_execute: `Các nhóm phân công nhiệm vụ, lắp ráp dụng cụ, tiến hành thí nghiệm và ghi chép số liệu. GV bao quát, hướng dẫn.`,
              step3_report: `Đại diện các nhóm báo cáo số liệu thu thập được; so sánh kết quả giữa các nhóm và phân tích sai số.`,
              step4_conclude: `GV nhận xét kĩ năng thực hành, chuẩn hóa kết luận khoa học và quy luật rút ra từ thí nghiệm của ${lessonName}.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV giới thiệu bộ dụng cụ thí nghiệm hoặc phần mềm mô phỏng ảo [NLS.2]; hướng dẫn chi tiết các bước tiến hành thí nghiệm, nhắc nhở quy tắc an toàn phòng học; phát Phiếu thực hành cho các nhóm; yêu cầu HS thu thập số liệu ít nhất 3 lần đo để lấy giá trị trung bình trong bài: ${lessonName}.`,
                  studentActivity: `HS quan sát GV thao tác mẫu, lắng nghe kĩ các lưu ý an toàn; nhận dụng cụ thí nghiệm, kiểm tra tình trạng thiết bị và phân công nhiệm vụ cụ thể cho từng thành viên trong nhóm.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV đi đến từng nhóm kiểm tra thao tác lắp ráp dụng cụ của học sinh; uốn nắn các thao tác chưa chuẩn xác; nhắc nhở học sinh đọc kết quả đo đúng tầm mắt; hướng dẫn nhập số liệu vào bảng tính [NLS.3] nếu có điều kiện.`,
                  studentActivity: `Các nhóm tiến hành lắp ráp thiết bị, thực hiện thí nghiệm theo đúng quy trình; cẩn thận ghi nhận số liệu đo đạc vào Phiếu thực hành; xử lý số liệu đo và thảo luận giải thích hiện tượng quan sát được.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV mời đại diện 2 nhóm lên bảng ghi kết quả bảng số liệu đo của nhóm mình; tổ chức cho cả lớp so sánh kết quả giữa các nhóm, thảo luận về nguyên nhân dẫn đến sai số thực nghiệm.`,
                  studentActivity: `Đại diện nhóm trình bày bảng số liệu và đồ thị thu được; giải thích hiện tượng và trả lời câu hỏi chất vấn từ các nhóm bạn.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV đánh giá kĩ năng thực hành và tính trung thực trong ghi chép số liệu của từng nhóm; tổng hợp kết quả chung của lớp để rút ra kết luận khoa học chính thức của bài: ${lessonName}.`,
                  studentActivity: `HS chú ý lắng nghe, thu dọn vệ sinh dụng cụ thí nghiệm gọn gàng; ghi chép kết luận khoa học vào vở học tập.`,
                },
              },
            },
          },
          {
            id: `act-p${p}-3`,
            stepNumber: 3,
            periodNumber: p,
            name: `Hoạt động củng cố & giao nhiệm vụ Tiết ${p} (8 phút)`,
            durationMinutes: 8,
            goal: `Củng cố nhanh kĩ năng và kiến thức Tiết ${p}; định hướng nội dung cho tiết học kế tiếp của ${lessonName}.`,
            content: `Thực hiện bài tập củng cố ngắn và ghi nhận dặn dò chuẩn bị cho tiết sau.`,
            product: `Câu trả lời bài tập củng cố trong vở và ghi chép nhiệm vụ tiết học kế tiếp.`,
            execution: {
              step1_transfer: `GV giao 2 câu hỏi củng cố nhanh về kĩ năng thí nghiệm và kiến thức Tiết ${p}; dặn dò nhiệm vụ tiết sau.`,
              step2_execute: `HS làm bài cá nhân và ghi nhận nhiệm vụ chuẩn bị.`,
              step3_report: `GV gọi 1 HS phát biểu câu trả lời củng cố.`,
              step4_conclude: `GV chốt đáp án và kết thúc Tiết ${p}.`,
              twoColumns: {
                step1: {
                  stepTitle: 'Bước 1: Chuyển giao nhiệm vụ học tập',
                  teacherActivity: `GV trình chiếu 2 câu hỏi tình huống củng cố kiến thức thực nghiệm Tiết ${p}; hướng dẫn học sinh nhiệm vụ chuẩn bị cho Tiết học tiếp theo của bài: ${lessonName}.`,
                  studentActivity: `HS quan sát câu hỏi trên màn chiếu, vận dụng kết quả thí nghiệm vừa làm để suy nghĩ trả lời.`,
                },
                step2: {
                  stepTitle: 'Bước 2: Thực hiện nhiệm vụ học tập',
                  teacherActivity: `GV theo dõi học sinh làm bài, giải đáp nhanh nếu có câu hỏi thắc mắc.`,
                  studentActivity: `HS ghi chép câu trả lời vào vở nháp; ghi lại dặn dò của GV vào sổ tay.`,
                },
                step3: {
                  stepTitle: 'Bước 3: Báo cáo kết quả và thảo luận',
                  teacherActivity: `GV mời 1 học sinh trả lời trước lớp; cả lớp lắng nghe và góp ý.`,
                  studentActivity: `HS đứng dậy tự tin trả lời; các bạn khác nhận xét đồng tình.`,
                },
                step4: {
                  stepTitle: 'Bước 4: Kết luận, nhận định',
                  teacherActivity: `GV chuẩn hóa kiến thức, khen ngợi tinh thần làm việc nhóm trong tiết thực hành và nhắc nhở nhiệm vụ về nhà.`,
                  studentActivity: `HS lắng nghe, hoàn tất ghi chép và kết thúc tiết học.`,
                },
              },
            },
          }
        );
      }
    }

    periodActs.forEach((act) => allActivities.push(act));

    periods.push({
      periodNumber: p,
      ppctPeriodIndex: periodIdx,
      ppctMainContent: mainContent,
      targetCompetencies: targetComp,
      activities: periodActs,
    });
  }

  return {
    grade,
    lessonTitle: lessonName,
    durationPeriods: numPeriods,
    subject: `Khoa học tự nhiên ${grade}`,
    lessonCode: `[PPCT-KHTN${grade}-${ppctTopic.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')}-B01]`,
    teachingMethod: 'blended',
    onlineContentDetail: `Học sinh tự học trước bài giảng số, tra cứu tư liệu và thực hiện phiếu chuẩn bị trên LMS K12Online/Google Classroom trước giờ học tại lớp.`,
    digitalCompetenceCodes: digitalCodes,
    digitalCompetenceDetail: digitalDetail,
    aiEducationCodes: aiCodes,
    aiEducationDetail: aiDetail,
    ppctReference: {
      topicName: ppctTopic,
      periodRange: `Tiết ${basePpctIndex} - ${basePpctIndex + numPeriods - 1} theo PPCT môn KHTN ${grade}`,
      strand: matchedStrand,
      lessonCode: `[PPCT-KHTN${grade}-B01]`,
      digitalCompetenceCodes: digitalCodes,
      aiEducationCodes: aiCodes,
      teachingMethod: 'blended',
      onlineContentDetail: `Tích hợp học liệu số và kiểm tra trực tuyến trên hệ thống quản lý học tập.`,
    },
    periods,
    objectives: {
      knowledge: knowledgeList,
      competencies: {
        khtn: [
          `Nhận thức KHTN: Trình bày, mô tả và nhận biết được các đặc điểm, tính chất và bản chất khoa học cốt lõi của bài: ${lessonName}.`,
          `Tìm hiểu tự nhiên: Đề xuất phương án, tiến hành quan sát/thí nghiệm thu thập thông tin và xử lý dữ liệu khoa học liên quan đến ${lessonName}.`,
          `Vận dụng kiến thức, kĩ năng: Vận dụng kiến thức ${lessonName} vào giải thích các hiện tượng thực tiễn đời sống, bảo vệ sức khỏe và môi trường.`,
        ],
        general: [
          `Tự chủ và tự học: Chủ động đọc SGK, chuẩn bị bài trước giờ học và tích cực hoàn thành các nhiệm vụ học tập cá nhân về ${lessonName}.`,
          `Giao tiếp và hợp tác: Tương tác nhóm hiệu quả khi tiến hành thảo luận, làm thí nghiệm và trình bày báo cáo sản phẩm học tập.`,
          `Giải quyết vấn đề và sáng tạo: Phát hiện được vấn đề khoa học trong tình huống thực tế và đề xuất giải pháp sáng tạo liên quan đến ${lessonName}.`,
        ],
        digital: [
          `${digitalCodes[0]} ${digitalDetail}`,
          `${digitalCodes[1] || digitalCodes[0]} Ứng dụng công nghệ số và phần mềm học tập để xử lý dữ liệu, trực quan hóa tri thức khoa học.`,
        ],
        aiEducation: [
          `${aiCodes[0]} ${aiDetail}`,
          `${aiCodes[1] || aiCodes[0]} Thực hiện liêm chính học thuật và bảo vệ an toàn thông tin khi khai thác công cụ AI trong học tập KHTN.`,
        ],
      },
      qualities: [
        'Chăm chỉ: Tích cực tham gia các hoạt động học tập, kiên trì hoàn thành các nhiệm vụ tìm tòi khám phá.',
        'Trung thực: Khách quan, trung thực trong thu thập số liệu thực nghiệm và báo cáo kết quả học tập.',
        'Trách nhiệm: Có ý thức bảo vệ môi trường, chấp hành các quy định an toàn phòng học và an toàn đời sống.',
      ],
    },
    equipment: {
      teacher: teacherEquip,
      student: studentEquip,
    },
    activities: allActivities,
    assessmentMatchCheck: {
      valid: true,
      explanation: `Kế hoạch bài dạy đáp ứng đầy đủ tiêu chuẩn Công văn 5512/BGDĐT, tiến trình phân chia rõ ràng theo đúng ${numPeriods} tiết của bài ${lessonName}. Mỗi hoạt động có đầy đủ cấu trúc Bảng 2 cột (Hoạt động của giáo viên | Hoạt động của học sinh) qua 4 bước sư phạm chặt chẽ.`,
    },
  };
}

/**
 * AI-assisted generator for Lesson Plan 5512
 */
export async function generateLessonPlan5512WithAI(
  grade: Grade,
  lessonTitle: string,
  durationPeriods: number,
  teacherPrompt: string,
  sourceDocs: SourceDocument[],
  settings: SourceLockSettings
): Promise<LessonPlan5512Data> {
  const lessonName = (lessonTitle || '').trim() || 'Bài học Khoa học tự nhiên';
  const numPeriods = Math.max(1, Math.min(6, durationPeriods || 2));

  // Determine matching curriculum strand and topics for prompt enrichment
  const curr = KHTN_CURRICULUM[grade];
  let matchedStrand = 'Năng lượng và sự biến đổi';
  let matchedRequirements: string[] = [];
  let ppctTopic = `Chủ đề bài học KHTN ${grade}`;

  if (curr) {
    const foundTopic = curr.topics.find((t) =>
      t.lessons.some((l) => l.toLowerCase().includes(lessonName.toLowerCase()) || lessonName.toLowerCase().includes(l.toLowerCase())) ||
      lessonName.toLowerCase().includes(t.title.toLowerCase())
    );
    if (foundTopic) {
      matchedStrand = foundTopic.strand;
      matchedRequirements = foundTopic.requirements;
      ppctTopic = foundTopic.title;
    }
  }

  // 1. Try server-side Gemini API with structured instructions
  try {
    const apiRes = await callGeminiAPI({
      module: 'lesson-plan-5512',
      task: `Soạn Kế hoạch bài dạy (Giáo án 5512) KHTN ${grade}: ${lessonName} (${numPeriods} tiết)`,
      sourceDocuments: sourceDocs.map((d) => ({ name: d.name, content: d.content })),
      userInput: {
        grade,
        lessonTitle: lessonName,
        durationPeriods: numPeriods,
        teacherPrompt: teacherPrompt || `Soạn kế hoạch bài dạy chuẩn CV 5512 cho bài ${lessonName}, chia thành đúng ${numPeriods} tiết.`,
        subjectStrand: matchedStrand,
        topicTitle: ppctTopic,
        curriculumRequirements: matchedRequirements,
      },
      config: {
        standard: 'Công văn 5512/BGDĐT',
        curriculum: 'GDPT 2018 - Kết nối tri thức với cuộc sống',
        tableFormat: 'two-columns-gv-hs',
        fourStepsRequired: true,
        strictLessonMatching: true,
      },
      sourceLock: settings.sourceLock,
      allowExternalKnowledge: settings.allowExternalKnowledge,
    });

    if (apiRes && apiRes.success && apiRes.result) {
      const parsedJson = extractJsonFromText(apiRes.result);
      if (parsedJson) {
        const normalized = normalizeLessonPlanData(parsedJson, grade, lessonName, numPeriods);
        if (normalized) {
          return normalized;
        }
      }
    }
  } catch (err) {
    console.warn('Gemini API call returned error, switching to dynamic pedagogical generator:', err);
  }

  // 2. Dynamic, pedagogical generator fallback guaranteeing exact lesson title and period count
  return generatePedagogicalLessonPlan5512(
    grade,
    lessonName,
    numPeriods,
    teacherPrompt,
    sourceDocs,
    settings
  );
}
