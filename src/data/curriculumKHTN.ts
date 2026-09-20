import { Grade, SourceDocument } from '../types';

export interface DigitalCompetenceStandard {
  code: string; // e.g. '[NLS.1]'
  label: string; // 'Khai thác & Tìm kiếm dữ liệu số an toàn'
  description: string;
  suggestedTools: string[];
}

export interface AIEducationStandard {
  code: string; // e.g. '[AI.1]'
  label: string; // 'Thị giác AI & Nhận diện thông minh'
  description: string;
  suggestedApplications: string[];
}

export const STANDARD_TEXTBOOK_NAME = 'Kết nối tri thức với cuộc sống';
export const STANDARD_TEXTBOOK_SERIES = 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)';

export const DIGITAL_COMPETENCE_STANDARDS: DigitalCompetenceStandard[] = [
  {
    code: '[NLS.1]',
    label: 'Khai thác & Tìm kiếm dữ liệu số',
    description: 'Tìm kiếm, chọn lọc tư liệu khoa học, hình ảnh, bài báo KHTN số có bản quyền và an toàn trên Internet',
    suggestedTools: ['Google Khoa học', 'Wikipedia tiếng Việt', 'Cổng học liệu số Bộ GD&ĐT'],
  },
  {
    code: '[NLS.2]',
    label: 'Thí nghiệm ảo & Mô phỏng số',
    description: 'Thao tác và quan sát hiện tượng vi mô, nguy hiểm hoặc phức tạp thông qua phần mềm mô phỏng và thí nghiệm ảo',
    suggestedTools: ['PhET Interactive Simulations', 'Yenka', 'Crocodile Physics/Chemistry', 'Stellarium', 'GeoGebra 3D'],
  },
  {
    code: '[NLS.3]',
    label: 'Xử lý dữ liệu & Bảng tính số',
    description: 'Thu thập số liệu đo đạc bằng cảm biến, nhập bảng tính điện tử, vẽ biểu đồ và đồ thị tự động',
    suggestedTools: ['Microsoft Excel', 'Google Sheets', 'Cổng quang đo thời gian hiện số', 'Phần mềm Logger Pro'],
  },
  {
    code: '[NLS.4]',
    label: 'Sáng tạo sản phẩm học tập số',
    description: 'Thiết kế báo cáo khoa học số, infographic tóm tắt bài học, sơ đồ tư duy điện tử, video ngắn minh họa hiện tượng',
    suggestedTools: ['Canva', 'Mindmeister/Coggle', 'CapCut/Clipchamp', 'PowerPoint đa phương tiện'],
  },
  {
    code: '[NLS.5]',
    label: 'Hợp tác & Giao tiếp trong không gian số',
    description: 'Làm việc nhóm trực tuyến, tương tác trên bảng trắng số, nộp bài và nhận phản hồi trên hệ thống quản lý học tập (LMS)',
    suggestedTools: ['Padlet', 'Google Classroom / K12Online', 'MS Teams', 'Azota', 'Google Drive'],
  },
];

export const AI_EDUCATION_STANDARDS: AIEducationStandard[] = [
  {
    code: '[AI.1]',
    label: 'Thị giác AI & Nhận diện thông minh',
    description: 'Ứng dụng mô hình AI thị giác máy tính nhận dạng loài thực vật, động vật, cấu trúc tế bào, khoáng vật và nguyên tố',
    suggestedApplications: ['Google Lens', 'Seek by iNaturalist', 'PlantNet', 'AI phân loại sinh học'],
  },
  {
    code: '[AI.2]',
    label: 'Trợ lý AI tra cứu & Kiểm chứng khoa học',
    description: 'Kỹ năng đặt câu hỏi (prompting) cho trợ lý AI để tra cứu giải thích hiện tượng KHTN; rèn luyện tư duy phản biện và kiểm chứng thông tin',
    suggestedApplications: ['Gemini / Chatbot KHTN', 'Kiểm chứng Fact-checking', 'Trợ lý học tập tương tác'],
  },
  {
    code: '[AI.3]',
    label: 'Phân tích dữ liệu & Mô hình hóa AI',
    description: 'Ứng dụng AI phân tích xu hướng đồ thị chuyển động, dự báo thời tiết, mô hình hóa biến đổi khí hậu và lưới thức ăn sinh thái',
    suggestedApplications: ['Mô hình AI dự báo khí tượng', 'Phân tích xu hướng đồ thị s - t', 'AI mô phỏng tương tác hệ sinh thái'],
  },
  {
    code: '[AI.4]',
    label: 'Đạo đức, Liêm chính & An toàn AI',
    description: 'Giáo dục sử dụng trí tuệ nhân tạo có trách nhiệm, liêm chính học thuật (không chép giải), bảo vệ quyền riêng tư và bản quyền',
    suggestedApplications: ['Quy tắc ứng xử học đường với AI', 'Trích dẫn nguồn AI', 'Nhận diện thông tin sai lệch từ AI'],
  },
];

export const ONLINE_TEACHING_GUIDELINE = {
  maxRatioTHCS: 0.35, // 35% theo Thông tư 09/2021/TT-BGDĐT
  circularRef: 'Thông tư số 09/2021/TT-BGDĐT của Bộ GD&ĐT về quản lý và tổ chức dạy học trực tuyến',
  methods: [
    { code: '[TT]', name: 'Trực tiếp', desc: 'Dạy học trực tiếp tại lớp học' },
    { code: '[ONLINE]', name: 'Trực tuyến', desc: 'Dạy học trực tuyến hoàn toàn qua hệ thống LMS/phòng học số (tối đa 35% tổng số tiết)' },
    { code: '[KẾT HỢP]', name: 'Kết hợp', desc: 'Blended Learning: kết hợp chuẩn bị trực tuyến trước trên LMS và tổ chức tại lớp' },
  ],
};

export interface CurriculumTopic {
  id: string;
  strand: 'Chất và sự biến đổi của chất' | 'Năng lượng và sự biến đổi' | 'Vật sống' | 'Trái Đất và bầu trời';
  title: string;
  defaultPeriods: number;
  lessons: string[];
  requirements: string[]; // Yêu cầu cần đạt chuẩn GDPT 2018
  sampleConcepts: string[];
}

export const KHTN_CURRICULUM: Record<
  Grade,
  { totalPeriods: number; textbookSeries: string; topics: CurriculumTopic[] }
> = {
  '6': {
    totalPeriods: 140,
    textbookSeries: 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)',
    topics: [
      {
        id: 'khtn6-chuong1',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương I: Mở đầu về Khoa học tự nhiên',
        defaultPeriods: 16,
        lessons: [
          'Bài 1: Giới thiệu về Khoa học tự nhiên',
          'Bài 2: An toàn trong phòng thực hành',
          'Bài 3: Sử dụng kính lúp',
          'Bài 4: Sử dụng kính hiển vi quang học',
          'Bài 5: Đo chiều dài',
          'Bài 6: Đo khối lượng',
          'Bài 7: Đo thời gian',
          'Bài 8: Đo nhiệt độ',
        ],
        requirements: [
          'Nêu được đối tượng nghiên cứu và vai trò của Khoa học tự nhiên trong đời sống',
          'Trình bày và thực hiện đúng các quy định an toàn khi học trong phòng thực hành',
          'Biết cách chọn dụng cụ đo và sử dụng đúng cách kính lúp, kính hiển vi, thước, cân, đồng hồ, nhiệt kế',
        ],
        sampleConcepts: ['Khoa học tự nhiên', 'Quy tắc an toàn', 'Kính lúp', 'Kính hiển vi', 'Đo lường', 'Nhiệt độ Celsius'],
      },
      {
        id: 'khtn6-chuong2',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương II: Chất quanh ta',
        defaultPeriods: 12,
        lessons: [
          'Bài 9: Sự đa dạng của chất',
          'Bài 10: Các thể của chất và sự chuyển thể',
          'Bài 11: Oxygen. Không khí',
        ],
        requirements: [
          'Nhận biết được 3 thể rắn, lỏng, khí và các hiện tượng chuyển thể (nóng chảy, đông đặc, bay hơi, ngưng tụ, sôi)',
          'Nêu được tính chất và vai trò của Oxygen đối với sự sống và sự cháy',
          'Giải thích được nguyên nhân gây ô nhiễm không khí và đề xuất biện pháp bảo vệ nguồn không khí trong lành',
        ],
        sampleConcepts: ['Thể rắn, lỏng, khí', 'Nóng chảy', 'Bay hơi', 'Oxygen', 'Không khí', 'Ô nhiễm không khí'],
      },
      {
        id: 'khtn6-chuong3',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương III: Một số vật liệu, nguyên liệu, nhiên liệu, lương thực - thực phẩm thông dụng',
        defaultPeriods: 10,
        lessons: [
          'Bài 12: Một số vật liệu',
          'Bài 13: Một số nguyên liệu',
          'Bài 14: Một số nhiên liệu',
          'Bài 15: Một số lương thực, thực phẩm',
        ],
        requirements: [
          'Nêu được tính chất và ứng dụng của một số vật liệu, nguyên liệu, nhiên liệu thông dụng',
          'Trình bày được cách sử dụng an toàn, tiết kiệm và hiệu quả các nguồn tài nguyên, nhiên liệu',
          'Nêu được vai trò của lương thực, thực phẩm đối với sức khỏe con người',
        ],
        sampleConcepts: ['Vật liệu', 'Kim loại', 'Nhựa', 'Nhiên liệu hóa thạch', 'Lương thực', 'Thực phẩm an toàn'],
      },
      {
        id: 'khtn6-chuong4',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương IV: Hỗn hợp. Tách chất ra khỏi hỗn hợp',
        defaultPeriods: 8,
        lessons: [
          'Bài 16: Hỗn hợp các chất',
          'Bài 17: Tách chất khỏi hỗn hợp',
        ],
        requirements: [
          'Phân biệt được hỗn hợp đồng nhất và hỗn hợp không đồng nhất, dung dịch, huyền phù, nhũ tương',
          'Thực hành tách một số chất đơn giản ra khỏi hỗn hợp bằng các phương pháp: lọc, cô cạn, chiết',
        ],
        sampleConcepts: ['Hỗn hợp', 'Dung dịch', 'Huyền phù', 'Nhũ tương', 'Lọc', 'Cô cạn', 'Chiết'],
      },
      {
        id: 'khtn6-chuong5',
        strand: 'Vật sống',
        title: 'Chương V: Tế bào',
        defaultPeriods: 14,
        lessons: [
          'Bài 18: Tế bào – Đơn vị cơ bản của sự sống',
          'Bài 19: Cấu tạo và chức năng các thành phần của tế bào',
          'Bài 20: Sự lớn lên và sinh sản của tế bào',
          'Bài 21: Thực hành: Quan sát và phân biệt một số loại tế bào',
        ],
        requirements: [
          'Nêu được tế bào là đơn vị cơ bản cấu tạo nên mọi cơ thể sinh vật',
          'Phân biệt được tế bào nhân sơ và tế bào nhân thực, tế bào thực vật và tế bào động vật',
          'Mô tả được ý nghĩa của sự lớn lên và sinh sản của tế bào đối với cơ thể',
        ],
        sampleConcepts: ['Tế bào', 'Màng tế bào', 'Tế bào chất', 'Nhân tế bào', 'Lục lạp', 'Phân chia tế bào'],
      },
      {
        id: 'khtn6-chuong6',
        strand: 'Vật sống',
        title: 'Chương VI: Từ tế bào đến cơ thể',
        defaultPeriods: 10,
        lessons: [
          'Bài 22: Cơ thể sinh vật',
          'Bài 23: Tổ chức cơ thể đa bào',
          'Bài 24: Thực hành: Quan sát và mô tả cơ thể đơn bào, cơ thể đa bào',
        ],
        requirements: [
          'Phân biệt được cơ thể đơn bào và cơ thể đa bào',
          'Mô tả được các cấp độ tổ chức trong cơ thể đa bào: Tế bào -> Mô -> Cơ quan -> Hệ cơ quan -> Cơ thể',
        ],
        sampleConcepts: ['Cơ thể đơn bào', 'Cơ thể đa bào', 'Mô', 'Cơ quan', 'Hệ cơ quan'],
      },
      {
        id: 'khtn6-chuong7',
        strand: 'Vật sống',
        title: 'Chương VII: Đa dạng thế giới sống',
        defaultPeriods: 36,
        lessons: [
          'Bài 25: Hệ thống phân loại sinh vật',
          'Bài 26: Khoá lưỡng phân',
          'Bài 27: Vi khuẩn',
          'Bài 28: Thực hành: Làm sữa chua và quan sát vi khuẩn',
          'Bài 29: Virus',
          'Bài 30: Nguyên sinh vật',
          'Bài 31: Thực hành: Quan sát nguyên sinh vật',
          'Bài 32: Nấm',
          'Bài 33: Thực hành: Quan sát các loại nấm',
          'Bài 34: Thực vật',
          'Bài 35: Thực hành: Quan sát và phân biệt một số nhóm thực vật',
          'Bài 36: Động vật',
          'Bài 37: Thực hành: Quan sát và nhận biết một số nhóm động vật ngoài thiên nhiên',
          'Bài 38: Đa dạng sinh học',
          'Bài 39: Tìm hiểu sinh vật ngoài thiên nhiên',
        ],
        requirements: [
          'Xây dựng được khóa lưỡng phân để phân loại sinh vật',
          'Phân biệt được virus và vi khuẩn; nêu tác hại và ứng dụng trong đời sống',
          'Phân biệt được các nhóm thực vật (Rêu, Dương xỉ, Hạt trần, Hạt kín) và động vật (Không xương sống, Có xương sống)',
          'Nêu được ý nghĩa của đa dạng sinh học và các biện pháp bảo tồn',
        ],
        sampleConcepts: ['Khóa lưỡng phân', 'Vi khuẩn', 'Virus', 'Nấm', 'Thực vật hạt kín', 'Động vật có xương sống', 'Đa dạng sinh học'],
      },
      {
        id: 'khtn6-chuong8',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương VIII: Lực trong đời sống',
        defaultPeriods: 14,
        lessons: [
          'Bài 40: Lực là gì?',
          'Bài 41: Biểu diễn lực',
          'Bài 42: Biến dạng của lò xo',
          'Bài 43: Trọng lượng, lực hấp dẫn',
          'Bài 44: Lực ma sát',
          'Bài 45: Lực cản của nước',
        ],
        requirements: [
          'Biểu diễn được lực bằng mũi tên có điểm đặt, phương, chiều và độ lớn',
          'Giải thích được lực ma sát, lực cản và ứng dụng trong thực tiễn',
          'Phân biệt được trọng lượng và khối lượng của một vật',
        ],
        sampleConcepts: ['Lực (Newton)', 'Vectơ lực', 'Biến dạng lò xo', 'Trọng lượng', 'Lực ma sát', 'Lực cản'],
      },
      {
        id: 'khtn6-chuong9',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương IX: Năng lượng',
        defaultPeriods: 12,
        lessons: [
          'Bài 46: Năng lượng và sự truyền năng lượng',
          'Bài 47: Một số dạng năng lượng',
          'Bài 48: Sự chuyển hoá năng lượng',
          'Bài 49: Năng lượng hao phí',
          'Bài 50: Năng lượng tái tạo',
          'Bài 51: Tiết kiệm năng lượng',
        ],
        requirements: [
          'Nhận biết được các dạng năng lượng: cơ năng, nhiệt năng, quang năng, điện năng, hóa năng',
          'Nêu được định luật bảo toàn năng lượng và phân biệt năng lượng có ích với năng lượng hao phí',
          'Đề xuất các biện pháp tiết kiệm năng lượng và phát triển năng lượng tái tạo',
        ],
        sampleConcepts: ['Động năng', 'Thế năng', 'Chuyển hóa năng lượng', 'Năng lượng hao phí', 'Năng lượng mặt trời'],
      },
      {
        id: 'khtn6-chuong10',
        strand: 'Trái Đất và bầu trời',
        title: 'Chương X: Trái Đất và bầu trời',
        defaultPeriods: 8,
        lessons: [
          'Bài 52: Chuyển động nhìn thấy của Mặt Trời. Thiên thể',
          'Bài 53: Mặt Trăng',
          'Bài 54: Hệ Mặt Trời',
          'Bài 55: Ngân Hà',
        ],
        requirements: [
          'Giải thích được hiện tượng mọc, lặn của Mặt Trời và hiện tượng ngày đêm luân phiên',
          'Giải thích được các hình dạng nhìn thấy của Mặt Trăng (tuần trăng)',
          'Nêu được cấu trúc Hệ Mặt Trời và vị trí của Trái Đất trong Ngân Hà',
        ],
        sampleConcepts: ['Mặt Trời', 'Mặt Trăng', 'Tuần trăng', 'Hệ Mặt Trời', 'Ngân Hà'],
      },
    ],
  },
  '7': {
    totalPeriods: 140,
    textbookSeries: 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)',
    topics: [
      {
        id: 'khtn7-mo-dau',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Mở đầu: Phương pháp và kĩ năng học tập môn KHTN',
        defaultPeriods: 4,
        lessons: ['Bài 1: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên'],
        requirements: [
          'Trình bày được phương pháp tìm hiểu tự nhiên',
          'Thực hiện được các kĩ năng tiến trình: quan sát, phân loại, liên kết, đo, dự báo',
          'Sử dụng thành thạo một số dụng cụ đo và làm báo cáo thực hành khoa học',
        ],
        sampleConcepts: ['Phương pháp tìm hiểu tự nhiên', 'Kĩ năng quan sát', 'Dự báo', 'Báo cáo khoa học'],
      },
      {
        id: 'khtn7-chuong1',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương I: Nguyên tử. Sơ lược về bảng tuần hoàn các nguyên tố hóa học',
        defaultPeriods: 16,
        lessons: [
          'Bài 2: Nguyên tử',
          'Bài 3: Nguyên tố hóa học',
          'Bài 4: Sơ lược về bảng tuần hoàn các nguyên tố hóa học',
        ],
        requirements: [
          'Mô tả được mô hình nguyên tử Rutherford - Bohr; cấu tạo hạt proton, neutron, electron',
          'Xác định được kí hiệu hóa học của các nguyên tố thường gặp',
          'Sử dụng bảng tuần hoàn để xác định ô nguyên tố, chu kì, nhóm của 20 nguyên tố đầu',
        ],
        sampleConcepts: ['Nguyên tử', 'Hạt nhân', 'Proton', 'Electron', 'Bảng tuần hoàn', 'Chu kì', 'Nhóm A'],
      },
      {
        id: 'khtn7-chuong2',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương II: Phân tử. Liên kết hóa học',
        defaultPeriods: 14,
        lessons: [
          'Bài 5: Phân tử - Đơn chất - Hợp chất',
          'Bài 6: Giới thiệu về liên kết hóa học',
          'Bài 7: Hóa trị và công thức hóa học',
        ],
        requirements: [
          'Phân biệt được đơn chất, hợp chất và phân tử; tính được khối lượng phân tử',
          'Mô tả được sự hình thành liên kết ion và liên kết cộng hóa trị đơn giản',
          'Lập được công thức hóa học của hợp chất dựa vào hóa trị',
        ],
        sampleConcepts: ['Phân tử', 'Đơn chất', 'Hợp chất', 'Liên kết ion', 'Liên kết cộng hóa trị', 'Hóa trị'],
      },
      {
        id: 'khtn7-chuong3',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương III: Tốc độ',
        defaultPeriods: 14,
        lessons: [
          'Bài 8: Tốc độ chuyển động',
          'Bài 9: Đo tốc độ',
          'Bài 10: Đồ thị quãng đường - thời gian',
          'Bài 11: Thảo luận về ảnh hưởng của tốc độ trong an toàn giao thông',
        ],
        requirements: [
          'Nêu được ý nghĩa của tốc độ, công thức v = s / t và đơn vị đo hợp pháp (m/s, km/h)',
          'Đo được tốc độ bằng đồng hồ bấm giây và cổng quang điện hiện số',
          'Vẽ và đọc được đồ thị quãng đường - thời gian của chuyển động',
          'Thảo luận và liên hệ thực tế về an toàn giao thông đường bộ',
        ],
        sampleConcepts: ['Tốc độ', 'v = s / t', 'Cổng quang điện', 'Đồ thị s - t', 'Khoảng cách an toàn'],
      },
      {
        id: 'khtn7-chuong4',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương IV: Âm thanh',
        defaultPeriods: 10,
        lessons: [
          'Bài 12: Sóng âm',
          'Bài 13: Độ to và độ cao của âm',
          'Bài 14: Phản xạ âm, chống ô nhiễm tiếng ồn',
        ],
        requirements: [
          'Giải thích được nguồn âm luôn dao động; sóng âm truyền qua rắn, lỏng, khí',
          'Phân biệt được độ cao gắn với tần số (Hz) và độ to gắn với biên độ dao động',
          'Nêu được hiện tượng phản xạ âm và đề xuất biện pháp chống ô nhiễm tiếng ồn',
        ],
        sampleConcepts: ['Dao động', 'Sóng âm', 'Tần số', 'Hertz (Hz)', 'Biên độ', 'Phản xạ âm', 'Tiếng vang'],
      },
      {
        id: 'khtn7-chuong5',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương V: Ánh sáng',
        defaultPeriods: 12,
        lessons: [
          'Bài 15: Năng lượng ánh sáng. Tia sáng, vùng tối',
          'Bài 16: Sự phản xạ ánh sáng',
          'Bài 17: Ảnh của vật qua gương phẳng',
        ],
        requirements: [
          'Nêu được ánh sáng là một dạng năng lượng; biểu diễn tia sáng bằng đường thẳng có mũi tên',
          'Phát biểu và vận dụng định luật phản xạ ánh sáng (góc phản xạ bằng góc tới)',
          'Vẽ và nêu được tính chất ảnh tạo bởi gương phẳng',
        ],
        sampleConcepts: ['Tia sáng', 'Chùm sáng', 'Vùng tối', 'Định luật phản xạ ánh sáng', 'Gương phẳng', 'Ảnh ảo'],
      },
      {
        id: 'khtn7-chuong6',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương VI: Từ',
        defaultPeriods: 10,
        lessons: [
          'Bài 18: Nam châm',
          'Bài 19: Từ trường',
          'Bài 20: Chế tạo nam châm điện đơn giản',
        ],
        requirements: [
          'Mô tả được từ trường bằng đường sức từ và từ phổ của nam châm',
          'Giải thích được từ trường Trái Đất và ứng dụng la bàn định hướng',
          'Chế tạo và điều khiển được độ mạnh của nam châm điện đơn giản',
        ],
        sampleConcepts: ['Từ cực N và S', 'Từ trường', 'Đường sức từ', 'La bàn', 'Nam châm điện'],
      },
      {
        id: 'khtn7-chuong7',
        strand: 'Vật sống',
        title: 'Chương VII: Trao đổi chất và chuyển hóa năng lượng ở sinh vật',
        defaultPeriods: 38,
        lessons: [
          'Bài 21: Khái quát về trao đổi chất và chuyển hóa năng lượng',
          'Bài 22: Quang hợp ở thực vật',
          'Bài 23: Một số yếu tố ảnh hưởng đến quang hợp',
          'Bài 24: Thực hành: Chứng minh quang hợp ở cây xanh',
          'Bài 25: Hô hấp tế bào',
          'Bài 26: Một số yếu tố ảnh hưởng hô hấp tế bào',
          'Bài 27: Thực hành: Hô hấp tế bào ở thực vật',
          'Bài 28: Trao đổi khí ở sinh vật',
          'Bài 29: Vai trò của nước và các chất dinh dưỡng đối với cơ thể sinh vật',
          'Bài 30: Trao đổi nước và chất dinh dưỡng ở thực vật',
          'Bài 31: Trao đổi nước và chất dinh dưỡng ở động vật',
          'Bài 32: Thực hành: Thân vận chuyển nước và lá thoát hơi nước',
        ],
        requirements: [
          'Viết được phương trình quang hợp và hô hấp tế bào dưới dạng chữ',
          'Nêu được các yếu tố ảnh hưởng đến quang hợp và hô hấp tế bào; liên hệ thực tiễn trồng trọt và bảo quản nông sản',
          'Mô tả được cơ chế trao đổi khí ở khí khổng và các cơ quan hô hấp ở động vật',
          'Trình bày được con đường vận chuyển nước và chất khoáng trong cây',
        ],
        sampleConcepts: ['Quang hợp', 'Hô hấp tế bào', 'Khí khổng', 'Thoát hơi nước', 'Mạch gỗ, mạch rây', 'Dinh dưỡng'],
      },
      {
        id: 'khtn7-chuong8',
        strand: 'Vật sống',
        title: 'Chương VIII: Cảm ứng ở sinh vật',
        defaultPeriods: 6,
        lessons: [
          'Bài 33: Cảm ứng ở sinh vật và tập tính ở động vật',
          'Bài 34: Vận dụng hiện tượng cảm ứng ở sinh vật vào thực tiễn',
          'Bài 35: Thực hành: Cảm ứng ở thực vật',
        ],
        requirements: [
          'Nêu được khái niệm cảm ứng và tập tính ở động vật (bẩm sinh và học được)',
          'Lấy được ví dụ về vận dụng cảm ứng trong trồng trọt và chăn nuôi',
        ],
        sampleConcepts: ['Cảm ứng', 'Hướng sáng', 'Hướng nước', 'Tập tính bẩm sinh', 'Tập tính học được'],
      },
      {
        id: 'khtn7-chuong9',
        strand: 'Vật sống',
        title: 'Chương IX: Sinh trưởng và phát triển ở sinh vật',
        defaultPeriods: 6,
        lessons: [
          'Bài 36: Sinh trưởng và phát triển ở sinh vật',
          'Bài 37: Các yếu tố ảnh hưởng đến sinh trưởng và phát triển ở sinh vật',
          'Bài 38: Thực hành: Quan sát và mô tả sự sinh trưởng, phát triển ở một số sinh vật',
        ],
        requirements: [
          'Phân biệt được sinh trưởng và phát triển; mô tả các giai đoạn phát triển của sinh vật',
          'Nêu được các nhân tố bên trong và bên ngoài ảnh hưởng đến sinh trưởng, phát triển',
        ],
        sampleConcepts: ['Sinh trưởng', 'Phát triển', 'Biến thái hoàn toàn', 'Mô phân sinh'],
      },
      {
        id: 'khtn7-chuong10',
        strand: 'Vật sống',
        title: 'Chương X: Sinh sản ở sinh vật',
        defaultPeriods: 8,
        lessons: [
          'Bài 39: Sinh sản ở sinh vật',
          'Bài 40: Sinh sản hữu tính ở thực vật và động vật',
          'Bài 41: Thực hành: Tìm hiểu sinh sản ở một số sinh vật',
          'Bài 42: Khái quát về giảm phân và thụ tinh',
        ],
        requirements: [
          'Phân biệt được sinh sản vô tính và sinh sản hữu tính ở thực vật và động vật',
          'Mô tả được các bộ phận của hoa lưỡng tính và quá trình thụ phấn, thụ tinh',
          'Nêu được vai trò của thụ tinh và giảm phân trong việc duy trì loài',
        ],
        sampleConcepts: ['Sinh sản vô tính', 'Sinh sản hữu tính', 'Thụ phấn', 'Thụ tinh', 'Giảm phân'],
      },
    ],
  },
  '8': {
    totalPeriods: 140,
    textbookSeries: 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)',
    topics: [
      {
        id: 'khtn8-mo-dau',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Mở đầu: Hóa chất và thiết bị thí nghiệm KHTN 8',
        defaultPeriods: 4,
        lessons: ['Bài 1: Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm'],
        requirements: [
          'Nhận biết và sử dụng đúng cách một số hóa chất, dụng cụ thủy tinh và thiết bị an toàn trong phòng thí nghiệm',
          'Tuân thủ nghiêm ngặt các quy tắc an toàn khi làm việc với hóa chất nguy hiểm',
        ],
        sampleConcepts: ['Hóa chất', 'Ống nghiệm', 'Bình tam giác', 'Đèn cồn', 'An toàn hóa chất'],
      },
      {
        id: 'khtn8-chuong1',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 1: Phản ứng hóa học',
        defaultPeriods: 24,
        lessons: [
          'Bài 2: Phản ứng hóa học',
          'Bài 3: Mol và tỉ khối chất khí',
          'Bài 4: Dung dịch và nồng độ',
          'Bài 5: Định luật bảo toàn khối lượng và phương trình hóa học',
          'Bài 6: Tính theo phương trình hóa học',
          'Bài 7: Tốc độ phản ứng và chất xúc tác',
        ],
        requirements: [
          'Phân biệt được phản ứng tỏa nhiệt và phản ứng thu nhiệt',
          'Tính được số mol, khối lượng, thể tích khí ở điều kiện chuẩn (25°C, 1 bar)',
          'Tính được nồng độ phần trăm C% và nồng độ mol CM của dung dịch',
          'Lập phương trình hóa học đúng và giải bài toán tính theo phương trình hóa học',
          'Nêu các yếu tố ảnh hưởng đến tốc độ phản ứng (nhiệt độ, nồng độ, diện tích tiếp xúc, chất xúc tác)',
        ],
        sampleConcepts: ['Phản ứng hóa học', 'Mol', 'Định luật bảo toàn khối lượng', 'Phương trình hóa học', 'Nồng độ mol', 'Chất xúc tác'],
      },
      {
        id: 'khtn8-chuong2',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 2: Một số hợp chất thông dụng',
        defaultPeriods: 20,
        lessons: [
          'Bài 8: Acid',
          'Bài 9: Base – thang pH',
          'Bài 10: Oxide',
          'Bài 11: Muối',
          'Bài 12: Phân bón hóa học',
        ],
        requirements: [
          'Nhận biết được dung dịch acid, base bằng quỳ tím, chỉ thị màu và thang pH',
          'Viết được phương trình hóa học minh họa tính chất hóa học của acid, base, oxide, muối',
          'Nêu được vai trò và cách sử dụng hợp lí các loại phân bón hóa học (đạm, lân, kali)',
        ],
        sampleConcepts: ['Acid (HCl, H2SO4)', 'Base (NaOH, Ca(OH)2)', 'Thang pH', 'Oxide', 'Muối NaCl', 'Phân bón NPK'],
      },
      {
        id: 'khtn8-chuong3',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 3: Khối lượng riêng và áp suất',
        defaultPeriods: 18,
        lessons: [
          'Bài 13: Khối lượng riêng',
          'Bài 14: Thực hành xác định khối lượng riêng',
          'Bài 15: Áp suất trên một bề mặt',
          'Bài 16: Áp suất chất lỏng. Áp suất khí quyển',
          'Bài 17: Lực đẩy Archimedes',
        ],
        requirements: [
          'Tính được khối lượng riêng (D = m / V) và áp suất (p = F / S)',
          'Giải thích được tác dụng của áp suất chất lỏng và áp suất khí quyển trong đời sống',
          'Mô tả và tính được lực đẩy Archimedes (FA = d * V); giải thích điều kiện vật nổi, vật chìm',
        ],
        sampleConcepts: ['Khối lượng riêng D', 'Áp suất p', 'Pascal (Pa)', 'Áp suất khí quyển', 'Lực Archimedes', 'Vật nổi - chìm'],
      },
      {
        id: 'khtn8-chuong4',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 4: Tác dụng làm quay của lực',
        defaultPeriods: 8,
        lessons: [
          'Bài 18: Tác dụng làm quay của lực. Moment lực',
          'Bài 19: Đòn bẩy và ứng dụng',
        ],
        requirements: [
          'Mô tả được tác dụng làm quay của lực đối với vật có trục quay cố định; khái niệm moment lực',
          'Xác định được trục quay, cánh tay đòn và vận dụng quy tắc đòn bẩy vào máy cơ đơn giản',
        ],
        sampleConcepts: ['Trục quay', 'Moment lực', 'Đòn bẩy loại 1, 2, 3', 'Cánh tay đòn'],
      },
      {
        id: 'khtn8-chuong5',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 5: Điện',
        defaultPeriods: 16,
        lessons: [
          'Bài 20: Hiện tượng nhiễm điện do cọ xát',
          'Bài 21: Dòng điện, nguồn điện',
          'Bài 22: Mạch điện đơn giản',
          'Bài 23: Tác dụng của dòng điện',
          'Bài 24: Cường độ dòng điện và hiệu điện thế',
          'Bài 25: Thực hành đo cường độ dòng điện và hiệu điện thế',
        ],
        requirements: [
          'Giải thích được sự nhiễm điện do cọ xát và tương tác giữa các điện tích (+ và -)',
          'Vẽ sơ đồ mạch điện đơn giản và lắp ráp mạch điện an toàn',
          'Nêu các tác dụng của dòng điện: nhiệt, phát sáng, từ, hóa học, sinh lí',
          'Đo được cường độ dòng điện (Ampe kế) và hiệu điện thế (Vôn kế)',
        ],
        sampleConcepts: ['Điện tích', 'Dòng điện', 'Nguồn điện', 'Sơ đồ mạch điện', 'Ampe (A)', 'Volt (V)'],
      },
      {
        id: 'khtn8-chuong6',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 6: Nhiệt',
        defaultPeriods: 12,
        lessons: [
          'Bài 26: Năng lượng nhiệt và nhiệt năng',
          'Bài 27: Thực hành đo năng lượng nhiệt bằng joulemeter',
          'Bài 28: Sự truyền nhiệt',
          'Bài 29: Sự nở vì nhiệt',
        ],
        requirements: [
          'Nêu được khái niệm năng lượng nhiệt, nhiệt năng và nội năng của vật',
          'Phân biệt được 3 hình thức truyền nhiệt: dẫn nhiệt, đối lưu, bức xạ nhiệt',
          'Mô tả và giải thích được sự nở vì nhiệt của chất rắn, chất lỏng, chất khí',
        ],
        sampleConcepts: ['Nhiệt năng', 'Joule (J)', 'Dẫn nhiệt', 'Đối lưu', 'Bức xạ nhiệt', 'Nở vì nhiệt'],
      },
      {
        id: 'khtn8-chuong7',
        strand: 'Vật sống',
        title: 'Chương 7: Sinh học cơ thể người',
        defaultPeriods: 30,
        lessons: [
          'Bài 30: Khái quát về cơ thể người',
          'Bài 31: Hệ vận động ở người',
          'Bài 32: Dinh dưỡng và tiêu hóa ở người',
          'Bài 33: Máu và hệ tuần hoàn ở người',
          'Bài 34: Hệ hô hấp ở người',
          'Bài 35: Hệ bài tiết ở người',
          'Bài 36: Hệ thần kinh ở người',
          'Bài 37: Các giác quan ở người',
          'Bài 38: Hệ nội tiết ở người',
          'Bài 39: Da và điều hòa thân nhiệt ở người',
          'Bài 40: Sinh sản ở người',
        ],
        requirements: [
          'Trình bày được cấu tạo và chức năng các hệ cơ quan chính trong cơ thể người',
          'Giải thích được sơ đồ truyền máu ABO và các biện pháp bảo vệ tim mạch, huyết áp',
          'Đề xuất chế độ dinh dưỡng, tập luyện và vệ sinh học đường hợp lí phòng ngừa bệnh tật',
        ],
        sampleConcepts: ['Hệ xương cơ', 'Enzyme tiêu hóa', 'Hồng cầu', 'Nhóm máu ABO', 'Phế nang', 'Nephron thận', 'Synapse', 'Hormone'],
      },
      {
        id: 'khtn8-chuong8',
        strand: 'Trái Đất và bầu trời',
        title: 'Chương 8: Sinh vật và môi trường',
        defaultPeriods: 12,
        lessons: [
          'Bài 41: Môi trường và các nhân tố sinh thái',
          'Bài 42: Quần thể sinh vật',
          'Bài 43: Quần xã sinh vật',
          'Bài 44: Hệ sinh thái',
          'Bài 45: Sinh quyển',
          'Bài 46: Cân bằng tự nhiên',
          'Bài 47: Bảo vệ môi trường',
        ],
        requirements: [
          'Phân tích được các nhân tố sinh thái vô sinh và hữu sinh tác động lên sinh vật',
          'Nêu được đặc trưng của quần thể và quần xã sinh vật; chuỗi và lưới thức ăn trong hệ sinh thái',
          'Đề xuất các hành động thiết thực bảo vệ môi trường và ứng phó với biến đổi khí hậu',
        ],
        sampleConcepts: ['Nhân tố sinh thái', 'Quần thể', 'Quần xã', 'Hệ sinh thái', 'Chuỗi thức ăn', 'Sinh quyển', 'Bảo vệ môi trường'],
      },
    ],
  },
  '9': {
    totalPeriods: 140,
    textbookSeries: 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)',
    topics: [
      {
        id: 'khtn9-mo-dau',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Mở đầu: Dụng cụ hóa chất và thuyết trình khoa học KHTN 9',
        defaultPeriods: 4,
        lessons: ['Bài 1: Nhận biết một số dụng cụ, hóa chất. Thuyết trình một số vấn đề khoa học'],
        requirements: [
          'Nhận biết và sử dụng an toàn các dụng cụ, thiết bị thí nghiệm hiện đại môn KHTN',
          'Thực hiện thuyết trình báo cáo một đề tài khoa học tự nhiên trước tập thể',
        ],
        sampleConcepts: ['Dụng cụ thí nghiệm', 'Thuyết trình khoa học', 'Báo cáo poster', 'Kĩ năng khoa học'],
      },
      {
        id: 'khtn9-chuong1',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 1: Năng lượng cơ học',
        defaultPeriods: 10,
        lessons: [
          'Bài 2: Động năng. Thế năng',
          'Bài 3: Cơ năng',
          'Bài 4: Công và công suất',
        ],
        requirements: [
          'Viết được công thức tính công cơ học (A = F * s) và công suất (P = A / t)',
          'Nêu được khái niệm động năng, thế năng trọng trường và cơ năng; định luật bảo toàn cơ năng',
        ],
        sampleConcepts: ['Động năng', 'Thế năng', 'Cơ năng', 'Công cơ học (Joule)', 'Công suất (Watt)'],
      },
      {
        id: 'khtn9-chuong2',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 2: Ánh sáng',
        defaultPeriods: 16,
        lessons: [
          'Bài 5: Khúc xạ ánh sáng',
          'Bài 6: Phản xạ toàn phần',
          'Bài 7: Lăng kính',
          'Bài 8: Thấu kính',
          'Bài 9: Thực hành đo tiêu cự của thấu kính hội tụ',
          'Bài 10: Kính lúp. Bài tập thấu kính',
        ],
        requirements: [
          'Mô tả được hiện tượng khúc xạ ánh sáng và phản xạ toàn phần; điều kiện xảy ra phản xạ toàn phần',
          'Vẽ đường truyền của chùm tia sáng qua thấu kính hội tụ và thấu kính phân kì; dựng ảnh của vật',
          'Tính được số bội giác của kính lúp và vận dụng vào sửa tật của mắt',
        ],
        sampleConcepts: ['Khúc xạ ánh sáng', 'Phản xạ toàn phần', 'Thấu kính hội tụ', 'Thấu kính phân kì', 'Tiêu cự', 'Kính lúp'],
      },
      {
        id: 'khtn9-chuong3',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 3: Điện',
        defaultPeriods: 12,
        lessons: [
          'Bài 11: Điện trở. Định luật Ohm',
          'Bài 12: Đoạn mạch nối tiếp, song song',
          'Bài 13: Năng lượng của dòng điện và công suất điện',
        ],
        requirements: [
          'Phát biểu và vận dụng định luật Ohm (I = U / R) cho đoạn mạch nối tiếp và song song',
          'Tính được năng lượng điện tiêu thụ (A = P * t) và công suất điện của các thiết bị gia dụng',
        ],
        sampleConcepts: ['Điện trở R (Ohm)', 'Định luật Ohm', 'Mạch nối tiếp, song song', 'Công suất điện P', 'Điện năng (kWh)'],
      },
      {
        id: 'khtn9-chuong4',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 4: Điện từ',
        defaultPeriods: 8,
        lessons: [
          'Bài 14: Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều',
          'Bài 15: Tác dụng của dòng điện xoay chiều',
        ],
        requirements: [
          'Mô tả được hiện tượng cảm ứng điện từ khi số đường sức từ xuyên qua tiết diện cuộn dây biến thiên',
          'Giải thích được nguyên tắc hoạt động của máy phát điện xoay chiều và máy biến áp',
        ],
        sampleConcepts: ['Hiện tượng cảm ứng điện từ', 'Dòng điện xoay chiều (AC)', 'Máy phát điện', 'Máy biến áp'],
      },
      {
        id: 'khtn9-chuong5',
        strand: 'Năng lượng và sự biến đổi',
        title: 'Chương 5: Năng lượng với cuộc sống',
        defaultPeriods: 6,
        lessons: [
          'Bài 16: Vòng năng lượng trên Trái Đất. Năng lượng hóa thạch',
          'Bài 17: Một số dạng năng lượng tái tạo',
        ],
        requirements: [
          'Mô tả được vòng tuần hoàn năng lượng trên Trái Đất và tác động của nhiên liệu hóa thạch đến khí hậu',
          'Đánh giá tiềm năng và giải pháp khai thác các nguồn năng lượng tái tạo (gió, mặt trời, thủy triều)',
        ],
        sampleConcepts: ['Vòng năng lượng', 'Năng lượng hóa thạch', 'Năng lượng tái tạo', 'Hiệu ứng nhà kính'],
      },
      {
        id: 'khtn9-chuong6',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 6: Kim loại. Sự khác nhau cơ bản giữa phi kim và kim loại',
        defaultPeriods: 14,
        lessons: [
          'Bài 18: Tính chất chung của kim loại',
          'Bài 19: Dãy hoạt động hóa học',
          'Bài 20: Tách kim loại và việc sử dụng hợp kim',
          'Bài 21: Sự khác nhau cơ bản giữa phi kim và kim loại',
        ],
        requirements: [
          'Vận dụng dãy hoạt động hóa học (K Na Ca Mg Al Zn Fe Pb H Cu Ag Au) để dự đoán và viết phương trình hóa học',
          'Nêu các phương pháp tách kim loại (nhiệt luyện, thủy luyện, điện phân) và ứng dụng hợp kim thép, gang',
          'So sánh sự khác nhau về tính chất vật lí và hóa học giữa kim loại và phi kim (C, S, Cl2)',
        ],
        sampleConcepts: ['Kim loại', 'Dãy hoạt động hóa học', 'Gang, thép', 'Tách kim loại', 'Phi kim'],
      },
      {
        id: 'khtn9-chuong7',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 7: Giới thiệu về chất hữu cơ. Hydrocarbon và nguồn nhiên liệu',
        defaultPeriods: 12,
        lessons: [
          'Bài 22: Giới thiệu về hợp chất hữu cơ',
          'Bài 23: Alkane',
          'Bài 24: Alkene',
          'Bài 25: Nguồn nhiên liệu',
        ],
        requirements: [
          'Phân biệt được hợp chất vô cơ và hợp chất hữu cơ; viết công thức cấu tạo của Methane (CH4), Ethylene (C2H4)',
          'Nêu tính chất cháy, phản ứng thế của alkane và phản ứng cộng làm mất màu bromine của alkene',
          'Trình bày về dầu mỏ, khí thiên nhiên và các biện pháp sử dụng nhiên liệu an toàn, bảo vệ môi trường',
        ],
        sampleConcepts: ['Hợp chất hữu cơ', 'Hydrocarbon', 'Alkane (CH4)', 'Alkene (C2H4)', 'Dầu mỏ', 'Khí thiên nhiên'],
      },
      {
        id: 'khtn9-chuong8',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 8: Ethylic alcohol và Acetic acid',
        defaultPeriods: 8,
        lessons: [
          'Bài 26: Ethylic alcohol',
          'Bài 27: Acetic acid',
        ],
        requirements: [
          'Viết được công thức phân tử, công thức cấu tạo của C2H5OH và CH3COOH',
          'Nêu tính chất hóa học đặc trưng và phản ứng este hóa tạo ethyl acetate; giải thích độ cồn',
        ],
        sampleConcepts: ['Ethylic alcohol (C2H5OH)', 'Độ cồn', 'Acetic acid (CH3COOH)', 'Phản ứng este hóa', 'Giấm ăn'],
      },
      {
        id: 'khtn9-chuong9',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 9: Lipid. Carbohydrate. Protein. Polymer',
        defaultPeriods: 12,
        lessons: [
          'Bài 28: Lipid',
          'Bài 29: Carbohydrate. Glucose và saccharose',
          'Bài 30: Tinh bột và cellulose',
          'Bài 31: Protein',
          'Bài 32: Polymer',
        ],
        requirements: [
          'Nêu thành phần hóa học, tính chất và vai trò sinh học của lipid (chất béo), carbohydrate (glucose, tinh bột, cellulose) và protein',
          'Trình bày khái niệm polymer, phân loại polymer tự nhiên và polymer nhân tạo (PE, PVC, tơ tằm)',
        ],
        sampleConcepts: ['Lipid (Chất béo)', 'Glucose', 'Saccharose', 'Tinh bột', 'Protein', 'Polymer (PE, PVC)'],
      },
      {
        id: 'khtn9-chuong10',
        strand: 'Chất và sự biến đổi của chất',
        title: 'Chương 10: Khai thác tài nguyên từ vỏ Trái Đất',
        defaultPeriods: 8,
        lessons: [
          'Bài 33: Sơ lược về hóa học vỏ Trái Đất và khai thác tài nguyên từ vỏ Trái Đất',
          'Bài 34: Khai thác đá vôi. Công nghiệp silicate',
          'Bài 35: Khai thác nhiên liệu hóa thạch. Nguồn carbon. Chu trình carbon và sự ấm lên toàn cầu',
        ],
        requirements: [
          'Nêu được các dạng tài nguyên khoáng sản chủ yếu trong vỏ Trái Đất (đá vôi CaCO3, silicate, than đá)',
          'Mô tả chu trình carbon trong tự nhiên và giải thích nguyên nhân gây ra sự ấm lên toàn cầu',
        ],
        sampleConcepts: ['Vỏ Trái Đất', 'Đá vôi CaCO3', 'Silicate', 'Chu trình carbon', 'Biến đổi khí hậu'],
      },
      {
        id: 'khtn9-chuong11',
        strand: 'Vật sống',
        title: 'Chương 11: Di truyền học Mendel. Cơ sở phân tử của hiện tượng di truyền',
        defaultPeriods: 14,
        lessons: [
          'Bài 36: Khái quát về di truyền học',
          'Bài 37: Các quy luật di truyền của Mendel',
          'Bài 38: Nucleic acid và gene',
          'Bài 39: Tái bản DNA và phiên mã tạo RNA',
          'Bài 40: Dịch mã và mối quan hệ từ gene đến tính trạng',
        ],
        requirements: [
          'Giải thích các thí nghiệm lai của Mendel; quy luật phân li và quy luật phân li độc lập',
          'Mô tả cấu trúc xoắn kép của DNA và nguyên tắc bổ sung (A-T, G-C)',
          'Trình bày sơ đồ dòng thông tin di truyền: Gene (DNA) -> mRNA -> Polypeptide (Protein) -> Tính trạng',
        ],
        sampleConcepts: ['Mendel', 'Allele', 'DNA', 'RNA', 'Tái bản DNA', 'Phiên mã', 'Dịch mã', 'Tính trạng'],
      },
      {
        id: 'khtn9-chuong12',
        strand: 'Vật sống',
        title: 'Chương 12: Di truyền nhiễm sắc thể',
        defaultPeriods: 14,
        lessons: [
          'Bài 41: Đột biến gene',
          'Bài 42: Nhiễm sắc thể và bộ nhiễm sắc thể',
          'Bài 43: Nguyên phân và giảm phân',
          'Bài 44: Nhiễm sắc thể giới tính và cơ chế xác định giới tính',
          'Bài 45: Di truyền liên kết',
          'Bài 46: Đột biến nhiễm sắc thể',
        ],
        requirements: [
          'Phân biệt được đột biến gene và đột biến nhiễm sắc thể (cấu trúc và số lượng)',
          'Mô tả ý nghĩa của nguyên phân, giảm phân và thụ tinh trong việc duy trì bộ NST 2n',
          'Giải thích cơ chế xác định giới tính (XX và XY) và hiện tượng di truyền liên kết của Morgan',
        ],
        sampleConcepts: ['Đột biến gene', 'Nhiễm sắc thể 2n', 'Nguyên phân', 'Giảm phân', 'NST giới tính', 'Di truyền liên kết'],
      },
      {
        id: 'khtn9-chuong13',
        strand: 'Vật sống',
        title: 'Chương 13: Di truyền học với con người và đời sống',
        defaultPeriods: 6,
        lessons: [
          'Bài 47: Di truyền học với con người',
          'Bài 48: Ứng dụng công nghệ di truyền vào đời sống',
        ],
        requirements: [
          'Nêu được nguyên nhân và biểu hiện một số bệnh, tật di truyền ở người (hội chứng Down, mù màu, máu khó đông)',
          'Trình bày các thành tựu của công nghệ di truyền (CRISPR, sinh vật biến đổi gene GMO)',
        ],
        sampleConcepts: ['Di truyền y học', 'Hội chứng Down', 'Công nghệ gene', 'Sinh vật biến đổi gene (GMO)'],
      },
      {
        id: 'khtn9-chuong14',
        strand: 'Vật sống',
        title: 'Chương 14: Tiến hóa',
        defaultPeriods: 8,
        lessons: [
          'Bài 49: Khái niệm tiến hóa và các hình thức chọn lọc',
          'Bài 50: Cơ chế tiến hóa',
          'Bài 51: Sự phát sinh và phát triển sự sống trên Trái Đất',
        ],
        requirements: [
          'Phân biệt được chọn lọc nhân tạo và chọn lọc tự nhiên theo quan điểm Darwin',
          'Mô tả các giai đoạn phát sinh và phát triển của sự sống trên Trái Đất (tiến hóa hóa học, tiền sinh học, sinh học)',
        ],
        sampleConcepts: ['Tiến hóa sinh học', 'Chọn lọc tự nhiên', 'Thuyết Darwin', 'Tiến hóa hóa học', 'Sự phát sinh sự sống'],
      },
    ],
  },
};

export interface SelectableLessonOption {
  id: string;
  sourceType: 'source_doc' | 'curriculum';
  sourceDocName?: string;
  sourceDocId?: string;
  topicTitle: string;
  strand: string;
  lesson: string;
  periods: number;
  requirements?: string[];
  ppctCode?: string;
  notes?: string;
}

/**
 * Lấy danh sách bài học kết hợp giữa:
 * 1. PPCT trong tài liệu nguồn (ưu tiên hàng đầu nếu có tài liệu phân tích hoặc PPCT)
 * 2. PPCT chuẩn GDPT 2018 theo bộ sách giáo khoa chuẩn "Kết nối tri thức với cuộc sống"
 */
export function getAvailableLessonsFromSourcesAndCurriculum(
  grade: Grade,
  sourceDocs: SourceDocument[],
  selectedDocId: string = 'all'
): {
  sourceLessons: SelectableLessonOption[];
  curriculumLessons: SelectableLessonOption[];
  hasSourceLessons: boolean;
} {
  const sourceLessons: SelectableLessonOption[] = [];
  const seenLessons = new Set<string>();

  const activeDocs =
    selectedDocId === 'all'
      ? sourceDocs
      : sourceDocs.filter((d) => d.id === selectedDocId);

  // 1. Trích xuất bài học từ PPCT trong các tài liệu nguồn đã tải lên
  activeDocs.forEach((doc) => {
    // Trích xuất từ extractedAnalysis.lessons nếu có
    if (doc.extractedAnalysis?.lessons && doc.extractedAnalysis.lessons.length > 0) {
      doc.extractedAnalysis.lessons.forEach((lName, idx) => {
        const cleanName = lName.trim();
        const key = `${doc.id}-${cleanName}`;
        if (!seenLessons.has(key)) {
          seenLessons.add(key);
          const reqs = doc.extractedAnalysis?.requirements || [];
          const code = doc.extractedAnalysis?.designatedCodes?.[idx] || `[PPCT-SRC-${doc.name.slice(0, 8)}-B${String(idx + 1).padStart(2, '0')}]`;
          sourceLessons.push({
            id: `src-${doc.id}-${idx}`,
            sourceType: 'source_doc',
            sourceDocName: doc.name,
            sourceDocId: doc.id,
            topicTitle: doc.extractedAnalysis?.topics?.[0] || 'Phân phối chương trình nguồn',
            strand: 'Theo tài liệu nguồn',
            lesson: cleanName,
            periods: doc.extractedAnalysis?.periods ? Math.ceil(doc.extractedAnalysis.periods / doc.extractedAnalysis.lessons.length) : 2,
            requirements: reqs.length > 0 ? reqs : undefined,
            ppctCode: code,
            notes: `Trích xuất từ tài liệu: ${doc.name}`,
          });
        }
      });
    }

    // Nếu doc.content có dạng dòng Bài học / Tiết học mà extractedAnalysis chưa có
    if (sourceLessons.length === 0 && doc.content) {
      const lines = doc.content.split('\n');
      let extractedCount = 0;
      lines.forEach((line) => {
        const trimmed = line.trim();
        const match = trimmed.match(/^(Bài\s+\d+[:\.\-–].*?)(?:;|\n|$)/i);
        if (match && match[1] && match[1].length < 100) {
          const lTitle = match[1].trim();
          const key = `${doc.id}-${lTitle}`;
          if (!seenLessons.has(key)) {
            seenLessons.add(key);
            extractedCount++;
            sourceLessons.push({
              id: `src-line-${doc.id}-${extractedCount}`,
              sourceType: 'source_doc',
              sourceDocName: doc.name,
              sourceDocId: doc.id,
              topicTitle: 'PPCT nhận diện từ nội dung file',
              strand: 'Theo tài liệu nguồn',
              lesson: lTitle,
              periods: 2,
              notes: `Nhận diện từ nội dung: ${doc.name}`,
            });
          }
        }
      });
    }
  });

  // 2. Danh sách bài học chuẩn theo PPCT GDPT 2018 (SGK Kết nối tri thức với cuộc sống)
  const curriculumTopics = KHTN_CURRICULUM[grade]?.topics || [];
  const curriculumLessons: SelectableLessonOption[] = [];

  curriculumTopics.forEach((t) => {
    t.lessons.forEach((l, lIdx) => {
      curriculumLessons.push({
        id: `kntt-${grade}-${t.id}-${lIdx}`,
        sourceType: 'curriculum',
        topicTitle: t.title,
        strand: t.strand,
        lesson: l,
        periods: l.toLowerCase().includes('thực hành') || l.toLowerCase().includes('đo') ? 2 : (lIdx === 0 ? 3 : 2),
        requirements: t.requirements,
        notes: 'SGK Kết nối tri thức với cuộc sống',
      });
    });
  });

  return {
    sourceLessons,
    curriculumLessons,
    hasSourceLessons: sourceLessons.length > 0,
  };
}
