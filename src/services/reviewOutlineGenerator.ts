import {
  Grade,
  ReviewOutlineData,
  ReviewQuestion,
  SourceDocument,
  SourceLockSettings,
} from '../types';
import { KHTN_CURRICULUM } from '../data/curriculumKHTN';
import { callGeminiAPI } from './apiClient';
import { detectStrandAndTopic } from './worksheetGenerator';

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
 * Generate a dynamic pedagogical review outline tailored specifically for the selected topic and period count
 */
export function generatePedagogicalReviewOutline(
  grade: Grade,
  unitOrTopic: string,
  arg3?: number | SourceDocument[],
  arg4?: SourceDocument[] | SourceLockSettings,
  arg5?: SourceLockSettings | number
): ReviewOutlineData {
  let durationPeriods = 2;
  let sourceDocs: SourceDocument[] = [];
  let settings: SourceLockSettings | undefined = undefined;

  if (typeof arg3 === 'number') {
    durationPeriods = arg3;
    if (Array.isArray(arg4)) sourceDocs = arg4;
    if (arg5 && typeof arg5 === 'object') settings = arg5 as SourceLockSettings;
  } else {
    if (Array.isArray(arg3)) sourceDocs = arg3;
    if (arg4 && typeof arg4 === 'object') settings = arg4 as SourceLockSettings;
    if (typeof arg5 === 'number') durationPeriods = arg5;
  }

  const cleanTopic = (unitOrTopic || '').trim() || `Ôn tập học kì KHTN ${grade}`;
  const periods = Math.max(1, Math.min(10, durationPeriods || 2));
  const lowerTopic = cleanTopic.toLowerCase();

  const isSemesterReview =
    lowerTopic.includes('học kì') ||
    lowerTopic.includes('học kỳ') ||
    lowerTopic.includes('giữa kì') ||
    lowerTopic.includes('giữa kỳ') ||
    lowerTopic.includes('cuối kì') ||
    lowerTopic.includes('cuối kỳ') ||
    lowerTopic.includes('tổng hợp');

  // If specific lesson or chapter, detect strand
  const { strand, topicTitle } = detectStrandAndTopic(grade, cleanTopic);
  const cleanTitleOnly = cleanTopic.replace(/^bài\s*\d+[:\.\-–]\s*/i, '').trim();

  let coreKnowledge: ReviewOutlineData['coreKnowledge'] = [];
  let recognitionQuestions: ReviewQuestion[] = [];
  let understandingQuestions: ReviewQuestion[] = [];
  let applicationQuestions: ReviewQuestion[] = [];

  if (isSemesterReview) {
    // Generate multi-strand comprehensive review for that specific Grade
    if (grade === '6') {
      coreKnowledge = [
        {
          topic: '1. Mở đầu về Khoa học tự nhiên & Các phép đo (Vật lí)',
          keyPoints: [
            'Khoa học tự nhiên nghiên cứu các hiện tượng tự nhiên, tìm ra các quy luật chi phối sự vận động và biến đổi của tự nhiên.',
            'Quy tắc an toàn trong phòng thực hành: Không ăn uống, tuân thủ hướng dẫn của GV, nhận biết biển cảnh báo.',
            'Đo chiều dài (thước, GHĐ, ĐCNN), đo khối lượng (cân đồng hồ, cân điện tử), đo thời gian (đồng hồ bấm giây).',
            'Đo nhiệt độ: Sử dụng nhiệt kế hoạt động dựa trên sự dãn nở vì nhiệt của chất lỏng. Thang Celsius: 0 °C (nước đá tan), 100 °C (nước sôi).',
          ],
          comparisonTable: {
            headers: ['Đại lượng', 'Dụng cụ đo chuẩn', 'Đơn vị đo hợp pháp (SI)'],
            rows: [
              ['Chiều dài', 'Thước kẻ, thước dây, thước cuộn', 'Mét (m)'],
              ['Khối lượng', 'Cân Robecvan, cân đồng hồ, cân điện tử', 'Kilôgam (kg)'],
              ['Thời gian', 'Đồng hồ đeo tay, đồng hồ bấm giây hiện số', 'Giây (s)'],
              ['Nhiệt độ', 'Nhiệt kế thủy ngân, nhiệt kế rượu, nhiệt kế hồng ngoại', 'Độ Celsius (°C) / Kelvin (K)'],
            ],
          },
        },
        {
          topic: '2. Chất quanh ta & Tách chất khỏi hỗn hợp (Hóa học)',
          keyPoints: [
            'Chất tồn tại ở 3 thể cơ bản: rắn (hình dạng và thể tích xác định), lỏng (thể tích xác định, hình dạng của bình chứa), khí (không có hình dạng và thể tích xác định).',
            'Các quá trình chuyển thể: Nóng chảy <-> Đông đặc, Bay hơi <-> Ngưng tụ, Sôi.',
            'Không khí là hỗn hợp khí: ~78% Nitrogen, ~21% Oxygen, ~1% Carbon dioxide, hơi nước và khí khác. Oxygen duy trì sự sống và sự cháy.',
            'Phương pháp tách chất: Lọc (tách chất rắn không tan khỏi chất lỏng), Cô cạn (tách chất rắn tan không bay hơi khỏi dung dịch), Chiết (tách hai chất lỏng không hòa tan vào nhau).',
          ],
        },
        {
          topic: '3. Tế bào - Đơn vị cơ bản của sự sống (Sinh học)',
          keyPoints: [
            'Mọi sinh vật đều được cấu tạo từ tế bào. Tế bào thực hiện các hoạt động sống cơ bản: trao đổi chất, lớn lên, phân chia và cảm ứng.',
            'Cấu tạo chung của tế bào gồm: Màng sinh chất (bảo vệ và kiểm soát trao đổi chất), Tế bào chất (nơi diễn ra các hoạt động sống), Nhân hoặc vùng nhân (chứa vật chất di truyền DNA).',
            'Tế bào nhân sơ (chưa có màng nhân: vi khuẩn) và Tế bào nhân thực (đã có màng nhân: thực vật, động vật).',
            'Sự lớn lên và phân chia của tế bào giúp cơ thể sinh vật tăng trưởng về kích thước và khối lượng, đồng thời thay thế các tế bào già, tế bào tổn thương.',
          ],
        },
      ];

      recognitionQuestions = [
        {
          id: 'rec-1',
          type: 'mc',
          stem: 'Thành phần khí chiếm thể tích lớn nhất trong thành phần không khí là:',
          options: ['A. Khí Nitrogen (78%)', 'B. Khí Oxygen (21%)', 'C. Khí Carbon dioxide (0.04%)', 'D. Khí Argon'],
          answer: 'A. Khí Nitrogen (78%).',
        },
        {
          id: 'rec-2',
          type: 'mc',
          stem: 'Đơn vị cơ bản cấu tạo nên mọi cơ thể sinh vật trên Trái Đất là:',
          options: ['A. Phân tử', 'B. Tế bào', 'C. Mô', 'D. Cơ quan'],
          answer: 'B. Tế bào.',
        },
        {
          id: 'rec-3',
          type: 'essay',
          stem: 'Nêu các bước sử dụng nhiệt kế y tế thủy ngân để đo nhiệt độ cơ thể người an toàn và chính xác.',
          answer: 'Bước 1: Vẩy nhẹ nhiệt kế cho mức thủy ngân tụt xuống dưới 35 °C. Bước 2: Dùng cồn y tế lau sạch đầu nhiệt kế. Bước 3: Kẹp bầu nhiệt kế vào nách hoặc ngậm dưới lưỡi trong 3-5 phút. Bước 4: Lấy nhiệt kế ra, giữ ngang tầm mắt và đọc nhiệt độ.',
        },
      ];

      understandingQuestions = [
        {
          id: 'und-1',
          type: 'mc',
          stem: 'Để tách cát ra khỏi hỗn hợp nước và cát, người ta sử dụng phương pháp nào sau đây?',
          options: ['A. Phương pháp lọc', 'B. Phương pháp cô cạn', 'C. Phương pháp chiết', 'D. Phương pháp chưng cất'],
          answer: 'A. Phương pháp lọc (vì cát không tan trong nước, sẽ bị giữ lại trên phễu lọc).',
        },
        {
          id: 'und-2',
          type: 'essay',
          stem: 'Phân biệt tế bào thực vật và tế bào động vật. Điểm khác biệt nào giúp thực vật tự tổng hợp được chất hữu cơ?',
          answer: 'Tế bào thực vật có thành tế bào (cellulose), không bào trung tâm lớn và lục lạp; tế bào động vật không có những bào quan này. Lục lạp chứa diệp lục giúp thực vật quang hợp tự dưỡng.',
        },
      ];

      applicationQuestions = [
        {
          id: 'app-1',
          type: 'essay',
          stem: 'Sau một đợt bão lũ, nguồn nước giếng sinh hoạt của một hộ gia đình bị đục do lẫn bùn đất. Em hãy hướng dẫn gia đình các bước xử lý nước đơn giản bằng phương pháp cơ học để có nước trong sử dụng.',
          answer: '1. Làm lắng cặn: Đánh phèn chua hoặc để yên nước trong bể/chum cho bùn đất lắng xuống đáy. 2. Lọc nước: Dùng phễu lọc có các lớp cát sạch, than hoạt tính, sỏi hoặc vải lọc để giữ lại chất lơ lửng. 3. Đun sôi nước trước khi uống để diệt khuẩn.',
        },
      ];
    } else if (grade === '7') {
      coreKnowledge = [
        {
          topic: '1. Nguyên tử - Bảng tuần hoàn & Liên kết hóa học (Hóa học)',
          keyPoints: [
            'Nguyên tử gồm hạt nhân mang điện dương (proton: điện tích +1; neutron: không mang điện) và lớp vỏ electron mang điện âm (-1).',
            'Bảng tuần hoàn các nguyên tố hóa học: Xếp theo chiều tăng dần điện tích hạt nhân. Gồm các Ô nguyên tố, Chu kì (hàng ngang) và Nhóm (cột dọc).',
            'Phân tử là hạt đại diện cho chất, gồm một số nguyên tử liên kết với nhau. Đơn chất do 1 nguyên tố tạo nên; Hợp chất do từ 2 nguyên tố trở lên tạo nên.',
            'Liên kết hóa học: Liên kết ion (lực hút tĩnh điện giữa ion dương kim loại và ion âm phi kim), Liên kết cộng hóa trị (dùng chung các cặp electron).',
          ],
          comparisonTable: {
            headers: ['Tiêu chí so sánh', 'Liên kết ion', 'Liên kết cộng hóa trị'],
            rows: [
              ['Bản chất liên kết', 'Lực hút tĩnh điện giữa các ion trái dấu', 'Cặp electron dùng chung giữa các nguyên tử'],
              ['Đối tượng hình thành', 'Thường giữa kim loại điển hình và phi kim điển hình', 'Thường giữa các nguyên tử phi kim với nhau'],
              ['Ví dụ hợp chất', 'Muối ăn (NaCl), Magie oxide (MgO)', 'Nước (H2O), Khí Oxygen (O2), Carbon dioxide (CO2)'],
            ],
          },
        },
        {
          topic: '2. Tốc độ, Âm thanh & Ánh sáng (Vật lí)',
          keyPoints: [
            'Tốc độ chuyển động: v = s / t. Cho biết mức độ nhanh hay chậm của chuyển động. Đơn vị đo: m/s hoặc km/h (1 m/s = 3,6 km/h).',
            'Âm thanh: Dao động phát ra âm thanh. Âm truyền qua được chất rắn, lỏng, khí nhưng không truyền được qua chân không. Tốc độ truyền âm: v_rắn > v_lỏng > v_khí.',
            'Ánh sáng: Định luật phản xạ ánh sáng: Tia phản xạ nằm trong mặt phẳng tới; Góc phản xạ bằng góc tới (i\' = i). Ảnh qua gương phẳng là ảnh ảo, lớn bằng vật.',
            'Từ trường: Không gian xung quanh nam châm hoặc dòng điện có từ trường, tác dụng lực từ lên kim nam châm đặt trong nó.',
          ],
        },
        {
          topic: '3. Trao đổi chất và chuyển hóa năng lượng ở sinh vật (Sinh học)',
          keyPoints: [
            'Quang hợp: Nước + Carbon dioxide + Năng lượng ánh sáng -> Glucose + Oxygen (diễn ra ở lục lạp nhờ sắc tố diệp lục).',
            'Hô hấp tế bào: Glucose + Oxygen -> Carbon dioxide + Nước + Năng lượng (ATP) (diễn ra chủ yếu ở ti thể).',
            'Khí khổng ở biểu bì lá có chức năng điều hòa thoát hơi nước và thực hiện trao đổi khí (CO2, O2) với môi trường.',
            'Mạch gỗ vận chuyển nước và muối khoáng từ rễ lên thân lá; Mạch rây vận chuyển chất hữu cơ từ lá đến các cơ quan sử dụng/tích lũy.',
          ],
        },
      ];

      recognitionQuestions = [
        {
          id: 'rec-1',
          type: 'mc',
          stem: 'Trong nguyên tử, hạt không mang điện tích là:',
          options: ['A. Proton', 'B. Neutron', 'C. Electron', 'D. Ion'],
          answer: 'B. Neutron (nằm trong hạt nhân nguyên tử, điện tích bằng 0).',
        },
        {
          id: 'rec-2',
          type: 'mc',
          stem: 'Công thức tính tốc độ chuyển động của một vật là:',
          options: ['A. v = s / t', 'B. v = s * t', 'C. v = t / s', 'D. v = s + t'],
          answer: 'A. v = s / t.',
        },
        {
          id: 'rec-3',
          type: 'mc',
          stem: 'Bào quan đóng vai trò là "nhà máy năng lượng" thực hiện hô hấp tế bào ở sinh vật là:',
          options: ['A. Lục lạp', 'B. Ti thể', 'C. Nhân tế bào', 'D. Không bào'],
          answer: 'B. Ti thể.',
        },
      ];

      understandingQuestions = [
        {
          id: 'und-1',
          type: 'mc',
          stem: 'Khi chiếu chùm tia sáng tới gương phẳng với góc tới i = 40°, góc phản xạ i\' có giá trị bằng:',
          options: ['A. 20°', 'B. 40°', 'C. 80°', 'D. 50°'],
          answer: 'B. 40° (theo định luật phản xạ ánh sáng: i\' = i).',
        },
        {
          id: 'und-2',
          type: 'essay',
          stem: 'Giải thích tại sao khi trời nắng gắt hoặc hạn hán lâu ngày, cây xanh thường bị héo lá?',
          answer: 'Khi nắng gắt nhiệt độ cao, khí khổng mở thoát hơi nước nhanh trong khi rễ cây không hút đủ nước bù lại, làm tế bào mất sức trương nước dẫn đến hiện tượng héo.',
        },
      ];

      applicationQuestions = [
        {
          id: 'app-1',
          type: 'essay',
          stem: 'Một bạn học sinh đạp xe từ nhà đến trường với tốc độ không đổi v = 12 km/h, mất thời gian t = 20 phút. Tính quãng đường từ nhà bạn đến trường.',
          answer: 'Đổi t = 20 phút = 20/60 h = 1/3 h. Quãng đường s = v * t = 12 * (1/3) = 4 km.',
        },
      ];
    } else if (grade === '8') {
      coreKnowledge = [
        {
          topic: '1. Phản ứng hóa học, Acid, Base, pH và Muối (Hóa học)',
          keyPoints: [
            'Định luật bảo toàn khối lượng: Trong một phản ứng hóa học, tổng khối lượng các chất sản phẩm bằng tổng khối lượng các chất phản ứng (m_A + m_B = m_C + m_D).',
            'Khái niệm Mol: Lượng chất chứa 6,022 x 10^23 hạt vi mô (nguyên tử hoặc phân tử). Khối lượng mol (M), Thể tích mol khí ở đktc: V = n x 24,79 (lít).',
            'Nồng độ dung dịch: Nồng độ phần trăm C% = (m_ct / m_dd) x 100%; Nồng độ mol C_M = n / V (mol/l).',
            'Acid: Phân tử gồm một hay nhiều nguyên tử H liên kết với gốc acid (HCl, H2SO4). Làm quỳ tím hóa đỏ, pH < 7. Tác dụng kim loại tạo muối và khí H2.',
            'Base: Phân tử gồm nguyên tử kim loại liên kết với một hay nhiều nhóm hydroxide (-OH) (NaOH, Ca(OH)2). Làm quỳ tím hóa xanh, pH > 7.',
          ],
          comparisonTable: {
            headers: ['Đặc điểm nhận biết', 'Dung dịch Acid', 'Dung dịch Base (Kiềm)'],
            rows: [
              ['Thành phần cấu tạo', 'Chứa ion H+ liên kết gốc acid', 'Chứa ion kim loại liên kết nhóm OH-'],
              ['Đổi màu chỉ thị quỳ tím', 'Làm quỳ tím chuyển sang MÀU ĐỎ', 'Làm quỳ tím chuyển sang MÀU XANH'],
              ['Thang đo pH', 'pH < 7', 'pH > 7 (pH = 7 là trung tính)'],
              ['Phản ứng đặc trưng', 'Tác dụng với Base tạo muối và nước', 'Tác dụng với Acid tạo muối và nước'],
            ],
          },
        },
        {
          topic: '2. Áp suất, Khối lượng riêng & Thang nhiệt độ (Vật lí)',
          keyPoints: [
            'Khối lượng riêng: D = m / V (kg/m3 hoặc g/cm3). Trọng lượng riêng: d = P / V = 10D (N/m3).',
            'Áp suất chất rắn: p = F / S (N/m2 hoặc Pascal - Pa). Tăng áp suất bằng cách tăng áp lực F hoặc giảm diện tích tiếp xúc S.',
            'Áp suất chất lỏng: Tác dụng lên mọi phương. Bình thông nhau chứa cùng 1 chất lỏng đứng yên thì mực mặt thoáng ở các nhánh luôn ở cùng một độ cao.',
            'Lực đẩy Archimedes: F_A = d x V (d là trọng lượng riêng chất lỏng, V là thể tích phần chất lỏng bị vật chiếm chỗ). Điều kiện vật nổi: F_A > P.',
            'Thang nhiệt độ Celsius: Chọn điểm tan chảy của nước đá nguyên chất là 0 °C và điểm sôi của nước là 100 °C ở áp suất tiêu chuẩn.',
          ],
        },
        {
          topic: '3. Cơ thể người và vệ sinh sức khỏe (Sinh học)',
          keyPoints: [
            'Hệ vận động: Bộ xương (xương đầu, xương thân, xương chi) và hệ cơ giúp cơ thể vận động, bảo vệ các nội quan.',
            'Hệ tuần hoàn: Tim và hệ mạch (động mạch, mao mạch, tĩnh mạch). Máu gồm huyết tương và các tế bào máu (hồng cầu, bạch cầu, tiểu cầu). 4 nhóm máu: A, B, AB, O.',
            'Hệ hô hấp: Thực hiện trao đổi khí giữa cơ thể với môi trường (hít O2, thải CO2).',
            'Hệ tiêu hóa: Biến đổi thức ăn thành các chất dinh dưỡng hòa tan hấp thu vào máu qua niêm mạc ruột non.',
          ],
        },
      ];

      recognitionQuestions = [
        {
          id: 'rec-1',
          type: 'mc',
          stem: 'Dung dịch làm giấy quỳ tím chuyển sang màu đỏ là:',
          options: ['A. Hydrochloric acid (HCl)', 'B. Sodium hydroxide (NaOH)', 'C. Nước muối (NaCl)', 'D. Nước cất'],
          answer: 'A. Hydrochloric acid (HCl).',
        },
        {
          id: 'rec-2',
          type: 'mc',
          stem: 'Đơn vị chuẩn đo áp suất trong hệ đo lường quốc tế (SI) là:',
          options: ['A. Newton (N)', 'B. Pascal (Pa)', 'C. Jun (J)', 'D. Kilôgam (kg)'],
          answer: 'B. Pascal (Pa) hoặc N/m2.',
        },
        {
          id: 'rec-3',
          type: 'mc',
          stem: 'Tế bào máu có chức năng vận chuyển khí Oxygen và Carbon dioxide trong cơ thể người là:',
          options: ['A. Bạch cầu', 'B. Tiểu cầu', 'C. Hồng cầu', 'D. Huyết tương'],
          answer: 'C. Hồng cầu (nhờ chứa huyết sắc tố hemoglobin).',
        },
      ];

      understandingQuestions = [
        {
          id: 'und-1',
          type: 'mc',
          stem: 'Tại sao mũi của chiếc đinh lại được làm nhọn còn đầu mũ đinh lại làm to bè ra?',
          options: [
            'A. Mũi nhọn để giảm diện tích S giúp tăng áp suất p dễ đóng vào gỗ; mũ đinh to để giảm áp suất tránh làm hỏng búa',
            'B. Mũi nhọn để giảm áp lực; mũ to để tăng lực',
            'C. Để tiết kiệm kim loại khi sản xuất đinh',
            'D. Không có tác dụng vật lí nào',
          ],
          answer: 'A. Mũi nhọn có diện tích S nhỏ nên với cùng lực đóng F sẽ tạo áp suất p = F/S lớn, giúp đinh dễ xuyên qua vật liệu.',
        },
        {
          id: 'und-2',
          type: 'essay',
          stem: 'Đốt cháy hoàn toàn 2,4 gam kim loại Magnesium (Mg) trong khí Oxygen (O2) thu được 4,0 gam Magnesium oxide (MgO). Tính khối lượng khí Oxygen đã tham gia phản ứng.',
          answer: 'Theo định luật bảo toàn khối lượng: m_Mg + m_O2 = m_MgO. Thay số: 2,4 + m_O2 = 4,0 => m_O2 = 4,0 - 2,4 = 1,6 gam.',
        },
      ];

      applicationQuestions = [
        {
          id: 'app-1',
          type: 'essay',
          stem: 'Một khối gỗ có thể tích V = 0,002 m3 được thả chìm hoàn toàn trong nước. Biết trọng lượng riêng của nước là d = 10000 N/m3. Tính độ lớn lực đẩy Archimedes tác dụng lên khối gỗ.',
          answer: 'Lực đẩy Archimedes tác dụng lên khối gỗ: F_A = d * V = 10000 * 0,002 = 20 N.',
        },
      ];
    } else {
      // Grade 9
      coreKnowledge = [
        {
          topic: '1. Năng lượng cơ học, Khúc xạ ánh sáng & Quang cụ (Vật lí)',
          keyPoints: [
            'Cơ năng gồm Động năng (năng lượng vật có do chuyển động) và Thế năng (thế năng hấp dẫn, thế năng đàn hồi). Định luật bảo toàn cơ năng.',
            'Khúc xạ ánh sáng: Hiện tượng tia sáng bị gãy khúc tại mặt phân cách giữa hai môi trường trong suốt. Khi truyền từ không khí vào nước: r < i.',
            'Thấu kính hội tụ (rìa mỏng) cho ảnh thật ngược chiều hoặc ảnh ảo lớn hơn vật cùng chiều. Thấu kính phân kì (rìa dày) luôn cho ảnh ảo nhỏ hơn vật.',
            'Đoạn mạch điện: Định luật Ohm I = U / R. Mạch nối tiếp: I = I1 = I2, U = U1 + U2. Mạch song song: U = U1 = U2, I = I1 + I2.',
          ],
        },
        {
          topic: '2. Kim loại, Phi kim & Hợp chất hữu cơ (Hóa học)',
          keyPoints: [
            'Dãy hoạt động hóa học của kim loại: K, Na, Ca, Mg, Al, Zn, Fe, Pb, (H), Cu, Ag, Au. Kim loại đứng trước H đẩy được H ra khỏi dung dịch acid HCl, H2SO4 loãng.',
            'Hợp chất hữu cơ: Hợp chất của carbon (trừ CO, CO2, H2CO3, muối cacbonat). Chia thành Hydrocarbon và dẫn xuất hydrocarbon.',
            'Methane (CH4), Ethylene (C2H4 có liên kết đôi làm mất màu dd Brom), Acetylene (C2H2 có liên kết ba).',
            'Rượu ethylic (C2H5OH), Acetic acid (CH3COOH làm quỳ tím đỏ, phản ứng este hóa tạo etyl axetat có mùi thơm).',
          ],
        },
        {
          topic: '3. Di truyền học, DNA & Hệ sinh thái (Sinh học)',
          keyPoints: [
            'Quy luật di truyền Mendel: Phân li độc lập và tổ hợp tự do của các cặp allele.',
            'Cấu trúc DNA: Chuỗi xoắn kép gồm 2 mạch polynucleotide theo nguyên tắc bổ sung (A liên kết T, G liên kết C). Chức năng lưu giữ và truyền đạt thông tin di truyền.',
            'Đột biến gen (thay thế, thêm, mất 1 cặp nucleotide) và Đột biến nhiễm sắc thể (cấu trúc, số lượng).',
            'Hệ sinh thái: Gồm quần xã sinh vật và sinh cảnh. Chuỗi và lưới thức ăn thể hiện mối quan hệ dinh dưỡng giữa các loài sinh vật.',
          ],
        },
      ];

      recognitionQuestions = [
        {
          id: 'rec-1',
          type: 'mc',
          stem: 'Kim loại nào sau đây phản ứng mãnh liệt với nước ở nhiệt độ thường giải phóng khí Hydrogen?',
          options: ['A. Natri (Na)', 'B. Sắt (Fe)', 'C. Đồng (Cu)', 'D. Bạc (Ag)'],
          answer: 'A. Natri (Na).',
        },
        {
          id: 'rec-2',
          type: 'mc',
          stem: 'Theo nguyên tắc bổ sung trong phân tử DNA chuỗi xoắn kép, nucleotide loại Adenine (A) liên kết với:',
          options: ['A. Thymine (T)', 'B. Guanine (G)', 'C. Cytosine (C)', 'D. Uracil (U)'],
          answer: 'A. Thymine (T) bằng 2 liên kết hydro.',
        },
      ];

      understandingQuestions = [
        {
          id: 'und-1',
          type: 'essay',
          stem: 'Phân biệt thấu kính hội tụ và thấu kính phân kì về đặc điểm hình học và đường truyền của chùm tia sáng song song tới thấu kính.',
          answer: 'Thấu kính hội tụ có phần rìa mỏng hơn phần giữa, biến chùm sáng song song thành chùm hội tụ. Thấu kính phân kì có phần rìa dày hơn phần giữa, biến chùm sáng song song thành chùm phân kì.',
        },
      ];

      applicationQuestions = [
        {
          id: 'app-1',
          type: 'essay',
          stem: 'Đặt một vật sáng AB cao 2 cm vuông góc với trục chính của một thấu kính hội tụ có tiêu cự f = 12 cm. Vật cách thấu kính d = 24 cm = 2f. Nêu tính chất của ảnh và tính chiều cao của ảnh thu được.',
          answer: 'Khi vật đặt tại d = 2f thì thấu kính hội tụ cho ảnh thật, ngược chiều với vật, nằm cách thấu kính đúng bằng d\' = 2f = 24 cm và có chiều cao bằng đúng chiều cao của vật: A\'B\' = AB = 2 cm.',
        },
      ];
    }
  } else {
    // Topic is a specific lesson or unit/chapter!
    coreKnowledge = [
      {
        topic: `1. Khái niệm khoa học và bản chất cốt lõi của "${cleanTitleOnly}"`,
        keyPoints: [
          `Nội dung then chốt của ${cleanTitleOnly} thuộc mạch kiến thức "${strand}".`,
          `Các hiện tượng, định luật và nguyên lý vận hành chi phối bản chất của ${cleanTitleOnly}.`,
          `Các quy tắc định lượng, đơn vị đo hoặc quy luật biến đổi quan sát được thông qua thực nghiệm.`,
          `Mối liên hệ giữa cấu trúc, cơ chế vận hành và tính chất đặc thù của đối tượng nghiên cứu trong ${cleanTitleOnly}.`,
        ],
        comparisonTable: {
          headers: ['Nội dung trọng tâm', 'Bản chất khoa học', 'Phương pháp khảo sát / Đo lường'],
          rows: [
            [`Đặc trưng 1: Bản chất lý thuyết`, `Khái niệm và quy luật nền tảng của ${cleanTitleOnly}`, 'Quan sát mô hình, đọc dữ liệu SGK'],
            [`Đặc trưng 2: Thực nghiệm & Thí nghiệm`, `Hiện tượng biến đổi khi thay đổi điều kiện`, `Tiến hành thí nghiệm thực hành / Thí nghiệm ảo`],
            [`Đặc trưng 3: Ứng dụng thực tiễn`, `Giải quyết tình huống thực tế đời sống`, `Vận dụng công thức và lý giải hiện tượng`],
          ],
        },
      },
      {
        topic: `2. Phương pháp nghiên cứu, thực hành đo đạc và thí nghiệm (${periods} tiết)`,
        keyPoints: [
          `Tiến trình ôn tập trong ${periods} tiết được phân bổ từ tái hiện kiến thức cơ sở đến vận dụng giải bài tập và thực hành.`,
          `Dụng cụ, thiết bị dạy học cần chuẩn bị: thiết bị thí nghiệm, tranh ảnh minh họa, bảng số liệu hoặc phần mềm mô phỏng.`,
          `Cách thức thu thập số liệu, thao tác chuẩn xác và kỹ năng xử lý kết quả đo để tránh sai số.`,
          `Quy tắc an toàn trong phòng thực hành khi thao tác với dụng cụ và hóa chất/thiết bị điện của bài học.`,
        ],
      },
      {
        topic: `3. Ý nghĩa thực tiễn và liên hệ đời sống của "${cleanTitleOnly}"`,
        keyPoints: [
          `Ứng dụng trong đời sống hàng ngày: Giải thích các hiện tượng tự nhiên xung quanh ta.`,
          `Ứng dụng trong lao động sản xuất, y tế, nông nghiệp và bảo vệ môi trường.`,
          `Các cảnh báo an toàn và việc áp dụng năng lực số, tư duy phản biện khoa học khi tiếp cận thông tin.`,
        ],
      },
    ];

    recognitionQuestions = [
      {
        id: 'rec-1',
        type: 'mc',
        stem: `Nhận định nào sau đây nêu đúng nhất về khái niệm cơ bản trong bài "${cleanTitleOnly}"?`,
        options: [
          `A. Là khái niệm phản ánh đúng bản chất khoa học thuộc mạch ${strand}`,
          `B. Là đại lượng không đổi trong mọi điều kiện môi trường`,
          `C. Là hiện tượng không bao giờ có thể quan sát hoặc đo đạc được`,
          `D. Là quá trình độc lập hoàn toàn với các quy luật tự nhiên`,
        ],
        answer: `A. Là khái niệm phản ánh đúng bản chất khoa học thuộc mạch ${strand}.`,
      },
      {
        id: 'rec-2',
        type: 'essay',
        stem: `Nêu định nghĩa (hoặc cấu tạo, tính chất) cốt lõi của "${cleanTitleOnly}" theo Chương trình GDPT 2018 môn KHTN ${grade}.`,
        answer: `Học sinh trình bày chính xác định nghĩa/tính chất của ${cleanTitleOnly} theo chuẩn kiến thức sách giáo khoa.`,
      },
    ];

    understandingQuestions = [
      {
        id: 'und-1',
        type: 'essay',
        stem: `Giải thích tại sao trong bài học "${cleanTitleOnly}", khi thay đổi các điều kiện bên ngoài thì hiện tượng khoa học lại diễn ra khác biệt?`,
        answer: `Do các yếu tố môi trường (nhiệt độ, nồng độ, lực tác dụng...) tác động trực tiếp đến tốc độ hoặc trạng thái cân bằng của quá trình trong ${cleanTitleOnly}.`,
      },
      {
        id: 'und-2',
        type: 'mc',
        stem: `Trong tiến trình ${periods} tiết học của "${cleanTitleOnly}", bước nào đóng vai trò kiểm chứng lý thuyết?`,
        options: [
          'A. Thực hành thí nghiệm và thu thập, phân tích số liệu thực tế',
          'B. Chỉ đọc sách giáo khoa và ghi nhớ máy móc',
          'C. Bỏ qua các khâu thí nghiệm',
          'D. Phỏng đoán không căn cứ',
        ],
        answer: 'A. Thực hành thí nghiệm và thu thập, phân tích số liệu thực tế.',
      },
    ];

    applicationQuestions = [
      {
        id: 'app-1',
        type: 'essay',
        stem: `Hãy vận dụng kiến thức bài học "${cleanTitleOnly}" (thời lượng ${periods} tiết) để giải quyết một tình huống thực tiễn cụ thể trong đời sống hoặc sản xuất tại địa phương em.`,
        answer: `Học sinh nêu rõ: (1) Tình huống thực tế gặp phải; (2) Áp dụng nguyên lý/công thức của ${cleanTitleOnly} để giải quyết; (3) Kết luận ý nghĩa thực tiễn mang lại.`,
      },
    ];
  }

  return {
    title: `ĐỀ CƯƠNG ÔN TẬP KHOA HỌC TỰ NHIÊN ${grade} - ${cleanTopic.toUpperCase()} (THỜI LƯỢNG: ${periods} TIẾT)`,
    grade,
    unitOrTopic: cleanTopic,
    durationPeriods: periods,
    coreKnowledge,
    recognitionQuestions,
    understandingQuestions,
    applicationQuestions,
  };
}

/**
 * Generate Review Outline using Gemini AI with fallback to dynamic pedagogical generator
 */
export async function generateReviewOutlineWithAI(
  grade: Grade,
  unitOrTopic: string,
  arg3?: number | SourceDocument[],
  arg4?: SourceDocument[] | SourceLockSettings,
  arg5?: SourceLockSettings | number
): Promise<ReviewOutlineData> {
  let durationPeriods = 2;
  let sourceDocs: SourceDocument[] = [];
  let settings: SourceLockSettings = {
    sourceLock: true,
    allowExternalKnowledge: false,
    curriculumPreset: 'ket-noi-tri-thuc',
  };

  if (typeof arg3 === 'number') {
    durationPeriods = arg3;
    if (Array.isArray(arg4)) sourceDocs = arg4;
    if (arg5 && typeof arg5 === 'object') settings = arg5 as SourceLockSettings;
  } else {
    if (Array.isArray(arg3)) sourceDocs = arg3;
    if (arg4 && typeof arg4 === 'object') settings = arg4 as SourceLockSettings;
    if (typeof arg5 === 'number') durationPeriods = arg5;
  }

  const fallback = generatePedagogicalReviewOutline(grade, unitOrTopic, durationPeriods, sourceDocs, settings);

  try {
    const prompt = `Bạn là chuyên gia giáo dục KHTN THCS 30 năm kinh nghiệm.
Hãy xây dựng ĐỀ CƯƠNG ÔN TẬP (Review Outline) hoàn chỉnh theo Chương trình GDPT 2018:
- Môn học: Khoa học tự nhiên ${grade}
- Chủ đề / Bài học ôn tập: "${unitOrTopic}"
- Thời lượng ôn tập: ${durationPeriods} tiết

YÊU CẦU BẮT BUỘC:
1. Toàn bộ nội dung, câu hỏi A, B, C, D PHẢI 100% BÁM SÁT ĐÚNG CHỦ ĐỀ / BÀI HỌC "${unitOrTopic}". Tuyệt đối không trả về nội dung bài khác.
2. Nội dung được cân đối khoa học theo thời lượng ${durationPeriods} tiết ôn tập.
3. Trả về đúng định dạng JSON có cấu trúc sau:
{
  "title": "ĐỀ CƯƠNG ÔN TẬP KHOA HỌC TỰ NHIÊN ${grade} - ...",
  "grade": "${grade}",
  "unitOrTopic": "${unitOrTopic}",
  "durationPeriods": ${durationPeriods},
  "coreKnowledge": [
    {
      "topic": "1. Tên phân mục kiến thức...",
      "keyPoints": [
        "Ý kiến thức trọng tâm 1...",
        "Ý kiến thức trọng tâm 2..."
      ],
      "comparisonTable": {
        "headers": ["Cột 1", "Cột 2", "Cột 3"],
        "rows": [
          ["Dòng 1 Ô 1", "Dòng 1 Ô 2", "Dòng 1 Ô 3"]
        ]
      }
    }
  ],
  "recognitionQuestions": [
    {
      "id": "rec-1",
      "type": "mc",
      "stem": "Câu hỏi nhận biết trắc nghiệm về ${unitOrTopic}...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A. ..."
    },
    {
      "id": "rec-2",
      "type": "essay",
      "stem": "Câu hỏi nhận biết tự luận về ${unitOrTopic}...",
      "answer": "..."
    }
  ],
  "understandingQuestions": [
    {
      "id": "und-1",
      "type": "mc",
      "stem": "Câu hỏi thông hiểu...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "..."
    },
    {
      "id": "und-2",
      "type": "essay",
      "stem": "Câu hỏi giải thích hiện tượng thông hiểu...",
      "answer": "..."
    }
  ],
  "applicationQuestions": [
    {
      "id": "app-1",
      "type": "essay",
      "stem": "Bài tập tính toán hoặc tình huống vận dụng thực tiễn về ${unitOrTopic}...",
      "answer": "Lời giải chi tiết..."
    }
  ]
}`;

    const apiResult = await callGeminiAPI({
      module: 'review-outline',
      task: `Tạo Đề cương ôn tập KHTN ${grade}: ${unitOrTopic} (${durationPeriods} tiết)`,
      sourceDocuments: sourceDocs.map((d) => ({ name: d.name, content: d.content })),
      userInput: { grade, unitOrTopic, durationPeriods },
      config: { prompt },
      sourceLock: settings.sourceLock,
      allowExternalKnowledge: settings.allowExternalKnowledge,
    });

    if (apiResult && apiResult.success && apiResult.result) {
      const parsed = extractJsonFromText(apiResult.result);
      if (parsed && Array.isArray(parsed.coreKnowledge) && parsed.coreKnowledge.length > 0) {
        return {
          title: parsed.title || fallback.title,
          grade,
          unitOrTopic: parsed.unitOrTopic || unitOrTopic,
          durationPeriods: parsed.durationPeriods || durationPeriods,
          coreKnowledge: parsed.coreKnowledge.map((ck: any) => ({
            topic: ck.topic || 'Kiến thức trọng tâm',
            keyPoints: Array.isArray(ck.keyPoints) ? ck.keyPoints : ['Ghi nhớ kiến thức bài học.'],
            comparisonTable: ck.comparisonTable && Array.isArray(ck.comparisonTable.headers) ? ck.comparisonTable : undefined,
          })),
          recognitionQuestions: Array.isArray(parsed.recognitionQuestions) ? parsed.recognitionQuestions : fallback.recognitionQuestions,
          understandingQuestions: Array.isArray(parsed.understandingQuestions) ? parsed.understandingQuestions : fallback.understandingQuestions,
          applicationQuestions: Array.isArray(parsed.applicationQuestions) ? parsed.applicationQuestions : fallback.applicationQuestions,
        };
      }
    }
  } catch (e) {
    console.warn('AI Review Outline call failed, using pedagogical generator:', e);
  }

  return fallback;
}
