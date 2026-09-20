import {
  Grade,
  PPCTData,
  PPCTItem,
  SourceDocument,
  SourceLockSettings,
  TeachingMethod,
} from '../types';
import { callGeminiAPI } from './apiClient';

export interface StandardLessonBlueprint {
  title: string;
  strand: 'Chất và sự biến đổi của chất' | 'Năng lượng và sự biến đổi' | 'Vật sống' | 'Trái Đất và bầu trời' | 'Mở đầu & Đo lường';
  periods: number;
  content: string;
  equipment: string;
  location: string;
  semester: 1 | 2;
  nlsCodes: string[];
  nlsDetail: string;
  aiCodes: string[];
  aiDetail: string;
  method?: TeachingMethod;
  onlineContent?: string;
  onlinePlatform?: string;
}

// Dữ liệu chuẩn hóa chi tiết từng bài học theo SGK Kết nối tri thức & hướng dẫn của Sở GD&ĐT
export const OFFICIAL_KHTN_LESSONS: Record<Grade, StandardLessonBlueprint[]> = {
  '6': [
    // HỌC KÌ I: 72 tiết (Tuần 1 - 18, 4 tiết/tuần)
    {
      title: 'Bài 1: Giới thiệu về Khoa học tự nhiên',
      strand: 'Mở đầu & Đo lường',
      periods: 4,
      semester: 1,
      content: 'Khái niệm KHTN, các lĩnh vực chủ yếu của KHTN, vai trò của KHTN trong đời sống và sản xuất',
      equipment: 'Tranh ảnh, video về các thành tựu KHTN, bài giảng điện tử tương tác',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]', '[NLS.4]'],
      nlsDetail: 'Khai thác kho học liệu số của Bộ GD&ĐT; làm việc nhóm thiết kế sơ đồ tư duy số giới thiệu các nhánh KHTN',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Tìm hiểu cách trợ lý AI giải thích các hiện tượng tự nhiên xung quanh',
    },
    {
      title: 'Bài 2: An toàn trong phòng thực hành',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Các quy tắc an toàn trong phòng thực hành; nhận biết các biển cảnh báo nguy hiểm',
      equipment: 'Biển cảnh báo nguy hiểm trong phòng thực hành, bình chữa cháy mô hình, dụng cụ sơ cứu',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Tra cứu quy định an toàn hóa chất trên cơ sở dữ liệu số an toàn phòng thí nghiệm',
      aiCodes: ['[AI.4]'],
      aiDetail: 'Sử dụng AI phân tích tình huống giả định vi phạm an toàn phòng thực hành',
    },
    {
      title: 'Bài 3: Sử dụng kính lúp',
      strand: 'Mở đầu & Đo lường',
      periods: 1,
      semester: 1,
      content: 'Cấu tạo kính lúp cầm tay, cách sử dụng và bảo quản kính lúp',
      equipment: 'Kính lúp cầm tay (độ phóng đại 5x, 10x), mẫu vật nhỏ (lá cây, côn trùng, vân tay)',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Chụp ảnh phóng đại mẫu vật bằng điện thoại gắn kính lúp nộp lên Padlet lớp học',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Ứng dụng Google Lens nhận diện cấu trúc bề mặt lá cây qua ảnh phóng đại',
    },
    {
      title: 'Bài 4: Sử dụng kính hiển vi quang học',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Cấu tạo, nguyên lí hoạt động, các bước sử dụng và bảo quản kính hiển vi quang học',
      equipment: 'Kính hiển vi quang học, lam kính, lamen, tiêu bản mẫu tế bào thực vật',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Sử dụng mô phỏng kính hiển vi ảo 3D trước khi thực hành trên kính thật',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Tìm hiểu công nghệ AI nhận diện tự động tế bào bất thường trong y học',
    },
    {
      title: 'Bài 5: Đo chiều dài',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Đơn vị đo chiều dài, dụng cụ đo (thước kẻ, thước cuộn, thước kẹp), cách đo và đọc kết quả',
      equipment: 'Thước mét, thước dây, thước kẹp; các vật thể cần đo trong lớp học',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Sử dụng ứng dụng thước đo AR trên điện thoại thông minh so sánh với thước cơ học',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu thuật toán ước lượng khoảng cách và chiều sâu trong xe tự hành',
    },
    {
      title: 'Bài 6: Đo khối lượng',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Đơn vị đo khối lượng, các loại cân (cân Roborval, cân đồng hồ, cân điện tử), thực hành đo',
      equipment: 'Cân đồng hồ, cân điện tử độ chính xác 0.1g, quả cân mẫu, các vật mẫu',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Nhập bảng số liệu đo vào Google Sheets, tính giá trị trung bình và sai số đo',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu ứng dụng AI trong dây chuyền cân định lượng tự động công nghiệp',
    },
    {
      title: 'Bài 7: Đo thời gian',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Đơn vị thời gian, đồng hồ bấm giây cơ học và điện tử, đo khoảng thời gian của một hoạt động',
      equipment: 'Đồng hồ bấm giây điện tử hiện số, cổng quang điện tử kết nối máy đo thời gian',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Khai thác cảm biến gia tốc và đồng hồ số trên thiết bị thông minh đo chu kì dao động',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Khám phá cách AI đo đạc chuyển động thể thao chính xác qua camera tốc độ cao',
    },
    {
      title: 'Bài 8: Đo nhiệt độ',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Thang nhiệt độ Celsius, nhiệt kế thủy ngân, nhiệt kế rượu, nhiệt kế hồng ngoại điện tử',
      equipment: 'Nhiệt kế rượu, nhiệt kế thủy ngân, nhiệt kế hồng ngoại, cốc thủy tinh, nước nóng/lạnh',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Theo dõi biểu đồ nhiệt độ tự động trên phần mềm thu thập số liệu cảm biến nhiệt',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu hệ thống camera ảnh nhiệt AI kiểm soát thân nhiệt tự động nơi công cộng',
    },
    {
      title: 'Bài 9: Sự đa dạng của chất',
      strand: 'Chất và sự biến đổi của chất',
      periods: 2,
      semester: 1,
      content: 'Vật thể tự nhiên, vật thể nhân tạo, chất tinh khiết và hỗn hợp, tính chất của chất',
      equipment: 'Bộ mẫu vật thể tự nhiên và nhân tạo (gỗ, đá, cốc thủy tinh, thìa inox, muối ăn, đường)',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]', '[NLS.4]'],
      nlsDetail: 'Thiết kế sơ đồ phân loại vật thể và chất trên bảng tương tác Padlet / Canva',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Đặt câu hỏi phản biện cho AI phân biệt vật thể và chất trong đời sống',
    },
    {
      title: 'Bài 10: Các thể của chất và sự chuyển thể',
      strand: 'Chất và sự biến đổi của chất',
      periods: 4,
      semester: 1,
      content: 'Ba thể rắn, lỏng, khí; sự nóng chảy, đông đặc, bay hơi, ngưng tụ và sôi của nước',
      equipment: 'Bộ thí nghiệm chuyển thể của nước (đèn cồn, giá thí nghiệm, cốc chịu nhiệt, nhiệt kế)',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Thực hành mô phỏng PhET States of Matter khảo sát khoảng cách và chuyển động phân tử',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Xem mô phỏng AI dự báo mô hình chuyển pha vật chất trong điều kiện khắc nghiệt',
      method: 'blended',
      onlineContent: 'Giao nhiệm vụ trên LMS: Thực hành thí nghiệm ảo PhET States of Matter và nộp phiếu nhận xét',
      onlinePlatform: 'PhET Interactive / K12Online',
    },
    {
      title: 'Bài 11: Oxygen. Không khí',
      strand: 'Chất và sự biến đổi của chất',
      periods: 4,
      semester: 1,
      content: 'Tính chất của oxygen, vai trò của oxygen với sự sống và sự cháy; thành phần không khí, ô nhiễm không khí',
      equipment: 'Bình khí oxygen, que đóm, nến, chậu thủy tinh, chuông thủy tinh úp trên chậu nước',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]', '[NLS.4]'],
      nlsDetail: 'Tra cứu chỉ số chất lượng không khí AQI trực tuyến tại địa phương trên web moitruong.gov.vn',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Khám phá cách AI dự báo mức độ ô nhiễm bụi mịn PM2.5 tại các đô thị lớn',
    },
    {
      title: 'Bài 12: Một số vật liệu thông dụng',
      strand: 'Chất và sự biến đổi của chất',
      periods: 3,
      semester: 1,
      content: 'Tính chất và ứng dụng của kim loại, nhựa, thủy tinh, cao su, gốm sứ; sử dụng an toàn, tiết kiệm',
      equipment: 'Mẫu vật liệu: mẩu đồng, sắt, thanh nhôm, mẩu nhựa, cao su, cốc thủy tinh, đèn cồn',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Thiết kế bảng so sánh số hóa tính chất các loại vật liệu trên Google Docs chia sẻ',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Tìm hiểu công nghệ AI phát hiện và phân loại vật liệu tái chế tự động',
    },
    {
      title: 'Bài 13: Một số nguyên liệu thông dụng',
      strand: 'Chất và sự biến đổi của chất',
      periods: 2,
      semester: 1,
      content: 'Đá vôi, quặng; khai thác khoáng sản an toàn và phát triển bền vững',
      equipment: 'Mẫu đá vôi, quặng sắt, dung dịch acid loãng nhỏ giọt thử mẫu, kính lúp',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Tìm kiếm tư liệu bản đồ tài nguyên khoáng sản Việt Nam trên Cổng thông tin địa chất số',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Sử dụng AI phân tích tác động môi trường khi khai thác mỏ lộ thiên',
    },
    {
      title: 'Bài 14: Một số nhiên liệu thông dụng',
      strand: 'Chất và sự biến đổi của chất',
      periods: 2,
      semester: 1,
      content: 'Than đá, dầu mỏ, khí thiên nhiên, củi; sử dụng nhiên liệu hiệu quả, giảm phát thải',
      equipment: 'Tranh ảnh các loại nhiên liệu, mô hình nhà máy nhiệt điện, pin mặt trời mini',
      location: 'Lớp học',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Thiết kế infographic tuyên truyền "Tiết kiệm năng lượng - Giảm khí thải nhà kính"',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Mô phỏng AI tối ưu hóa tiêu thụ năng lượng thông minh trong gia đình (Smart Home)',
    },
    {
      title: 'Ôn tập giữa học kì I',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Hệ thống hóa kiến thức mở đầu, phép đo, các thể của chất, không khí, vật liệu, nhiên liệu',
      equipment: 'Bộ câu hỏi ôn tập tương tác, sơ đồ tư duy tổng kết chủ đề, đề kiểm tra thử trên LMS',
      location: 'Lớp học / Trực tuyến',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Học sinh làm bài tập số trên LMS K12Online / Azota có chấm điểm và phản hồi tức thì',
      aiCodes: ['[AI.2]', '[AI.4]'],
      aiDetail: 'AI chỉ ra các lỗi sai thường gặp khi đổi đơn vị đo lường và nhận biết chất',
      method: 'blended',
      onlineContent: 'Ôn tập hệ thống hóa kiến thức trên LMS; luyện đề trắc nghiệm khách quan trực tuyến',
      onlinePlatform: 'LMS K12Online / Azota',
    },
    {
      title: 'Kiểm tra, đánh giá giữa học kì I',
      strand: 'Mở đầu & Đo lường',
      periods: 2,
      semester: 1,
      content: 'Kiểm tra định kì đánh giá năng lực nhận thức KHTN và tìm hiểu tự nhiên theo CV 7991/BGDĐT',
      equipment: 'Đề kiểm tra in sẵn chuẩn ma trận đặc tả theo quy định Công văn 7991',
      location: 'Phòng thi trực tiếp',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Quản lý điểm số và ma trận đánh giá học sinh trên sổ điểm điện tử của Sở GD&ĐT',
      aiCodes: ['[AI.4]'],
      aiDetail: 'Tuân thủ quy chế thi cử, liêm chính học thuật, trung thực trong kiểm tra đánh giá',
    },
    {
      title: 'Bài 15: Một số lương thực, thực phẩm',
      strand: 'Chất và sự biến đổi của chất',
      periods: 2,
      semester: 1,
      content: 'Vai trò của lương thực, thực phẩm; các nhóm dinh dưỡng chính; bảo quản an toàn thực phẩm',
      equipment: 'Mẫu vật gạo, ngô, khoai, dầu ăn, trứng; thuốc thử iot kiểm tra tinh bột',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Khai thác cơ sở dữ liệu dinh dưỡng Viện Dinh Dưỡng Quốc Gia tra cứu tháp dinh dưỡng',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Ứng dụng AI phân tích thành phần nhãn mác dinh dưỡng thực phẩm qua camera',
    },
    {
      title: 'Bài 16: Hỗn hợp các chất',
      strand: 'Chất và sự biến đổi của chất',
      periods: 3,
      semester: 1,
      content: 'Hỗn hợp đồng nhất và không đồng nhất; dung dịch, chất tan, dung môi; huyền phù và nhũ tương',
      equipment: 'Cốc thủy tinh, đũa khuấy, nước, đường, muối ăn, dầu ăn, bột mì, cát',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Quan sát thí nghiệm mô phỏng dung dịch và độ tan trên PhET Sugar and Salt Solutions',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Nhờ AI phân tích ví dụ đời sống để phân biệt huyền phù, nhũ tương và dung dịch',
    },
    {
      title: 'Bài 17: Tách chất khỏi hỗn hợp',
      strand: 'Chất và sự biến đổi của chất',
      periods: 3,
      semester: 1,
      content: 'Các phương pháp tách chất cơ bản: lọc, cô cạn, chiết; thực hành tách muối ăn khỏi cát',
      equipment: 'Phễu lọc, giấy lọc, bình tam giác, bát sứ, đèn cồn, phễu chiết, kẹp gỗ',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Xem video thí nghiệm chuẩn tách chất độ phân giải cao trên thư viện học liệu số',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu ứng dụng của máy học trong công nghệ xử lý nước thải và lọc khoáng sản',
    },
    {
      title: 'Bài 18: Tế bào – Đơn vị cơ bản của sự sống',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Khái niệm tế bào; kích thước và hình dạng đa dạng của tế bào thực vật và động vật',
      equipment: 'Tranh ảnh kích thước tế bào, mô hình tế bào động vật và thực vật 3D',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]', '[NLS.4]'],
      nlsDetail: 'Tương tác với mô hình tế bào 3D trên BioDigital Human / Cell World',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Khám phá cách AI hỗ trợ kính hiển vi điện tử tự động nhận diện bào quan tế bào',
    },
    {
      title: 'Bài 19: Cấu tạo và chức năng các thành phần của tế bào',
      strand: 'Vật sống',
      periods: 3,
      semester: 1,
      content: 'Màng tế bào, chất tế bào, nhân hoặc vùng nhân; tế bào nhân sơ và tế bào nhân thực',
      equipment: 'Mô hình tháo lắp tế bào nhân thực và nhân sơ; bảng đối chiếu thành phần tế bào',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Thực hành tương tác lắp ráp các thành phần tế bào trên phần mềm mô phỏng sinh học',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Prompting hỏi AI đối chiếu sự khác biệt giữa tế bào thực vật và tế bào động vật',
    },
    {
      title: 'Bài 20: Sự lớn lên và sinh sản của tế bào',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Quá trình lớn lên của tế bào; phân chia tế bào; ý nghĩa đối với sự lớn lên của cơ thể',
      equipment: 'Video mô phỏng quá trình nguyên phân phân chia tế bào; tranh sơ đồ 1 tế bào thành 2^n tế bào',
      location: 'Lớp học',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Lập bảng tính Excel mô phỏng số lượng tế bào sinh ra qua các lần phân chia: 2^n',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu mô hình AI dự đoán tốc độ nhân đôi tế bào trong y sinh học',
    },
    {
      title: 'Bài 21: Thực hành: Quan sát và phân biệt một số loại tế bào',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Thực hành làm tiêu bản tạm thời tế bào vảy hành ta và tế bào biểu mô khoang miệng',
      equipment: 'Kính hiển vi, lam kính, lamen, kim mũi mác, củ hành ta, tăm tre sạch, dung dịch xanh methylen',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Chụp ảnh vi trường qua thị kính, gắn nhãn chú thích các bộ phận tế bào bằng Canva',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Ứng dụng AI nhận diện và đếm số lượng tế bào trong trường nhìn thị kính',
    },
    {
      title: 'Bài 22: Cơ thể sinh vật',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Cơ thể đơn bào và cơ thể đa bào; các cấp độ tổ chức của cơ thể đa bào (tế bào - mô - cơ quan - hệ cơ quan - cơ thể)',
      equipment: 'Tranh ảnh trùng roi, vi khuẩn, cây xanh, cơ thể người; mô hình hệ cơ quan người',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Khám phá sơ đồ giải phẫu các hệ cơ quan 3D trên Google Arts & Culture / BioDigital',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Đặt câu hỏi phân tích cơ chế phối hợp hoạt động của các hệ cơ quan với trợ lý AI',
    },
    {
      title: 'Bài 23: Thực hành: Quan sát sinh vật đơn bào',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Lấy mẫu nước rơm ngâm hoặc nước ao hồ, quan sát trùng roi, trùng giày dưới kính hiển vi',
      equipment: 'Nước ngâm rơm cỏ 3 ngày, kính hiển vi, lam kính, ống hút nhỏ giọt, bông gòn làm chậm chuyển động',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Quay video chuyển động của trùng giày dưới kính hiển vi và biên tập clip ngắn thuyết minh',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Sử dụng công cụ AI phân loại vi sinh vật qua đặc điểm hình thái di động',
    },
    {
      title: 'Ôn tập cuối học kì I',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Hệ thống hóa toàn bộ kiến thức Học kì I: Phép đo, Chất và biến đổi chất, Tế bào và Cơ thể sinh vật',
      equipment: 'Sơ đồ cây kiến thức học kì I, bộ câu hỏi trắc nghiệm khách quan và bài tập tự luận',
      location: 'Lớp học / Trực tuyến',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Học sinh làm bài thi thử trực tuyến trên hệ thống quản lý học tập (LMS)',
      aiCodes: ['[AI.2]', '[AI.4]'],
      aiDetail: 'Trợ lý AI tổng hợp báo cáo điểm yếu kiến thức của từng học sinh để định hướng ôn luyện',
      method: 'blended',
      onlineContent: 'Học sinh tham gia phiên ôn tập trực tuyến trên LMS; làm đề thi thử định kỳ có chấm tự động',
      onlinePlatform: 'LMS K12Online / Azota',
    },
    {
      title: 'Kiểm tra, đánh giá cuối học kì I',
      strand: 'Vật sống',
      periods: 2,
      semester: 1,
      content: 'Đánh giá tổng kết học kì I môn KHTN 6 theo chuẩn Thông tư 22 và Công văn 7991/BGDĐT',
      equipment: 'Đề kiểm tra in sẵn chuẩn ma trận 4 mức độ: nhận biết, thông hiểu, vận dụng, vận dụng cao',
      location: 'Phòng thi trực tiếp',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Nhập điểm số và xuất báo cáo chất lượng bộ môn trên cổng cơ sở dữ liệu ngành',
      aiCodes: ['[AI.4]'],
      aiDetail: 'Ý thức tự giác, tuyệt đối nghiêm túc, không sử dụng công nghệ gian lận kiểm tra',
    },

    // HỌC KÌ II: 68 tiết (Tuần 19 - 35, 4 tiết/tuần)
    {
      title: 'Bài 24: Đa dạng sinh học',
      strand: 'Vật sống',
      periods: 3,
      semester: 2,
      content: 'Khái niệm đa dạng sinh học; vai trò của đa dạng sinh học; bảo vệ đa dạng sinh học',
      equipment: 'Bản đồ các vườn quốc gia Việt Nam, video đa dạng sinh học rừng mưa nhiệt đới',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]', '[NLS.4]'],
      nlsDetail: 'Tra cứu danh lục Sách Đỏ Việt Nam trên cổng dữ liệu đa dạng sinh học số',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Khám phá ứng dụng AI camera bẫy ảnh tự động theo dõi động vật hoang dã nguy cấp',
    },
    {
      title: 'Bài 25: Hệ thống phân loại sinh giới',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Khóa lưỡng phân, các bậc phân loại sinh giới (loài, chi, họ, bộ, lớp, ngành, giới), năm giới sinh vật',
      equipment: 'Sơ đồ 5 giới sinh vật của Whittaker; mẫu vật thật (cây rêu, nấm, cành thông, tiêu bản cá)',
      location: 'Lớp học',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Xây dựng khóa lưỡng phân số tương tác phân loại sinh vật trên Miro / Canva',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Sử dụng AI hỗ trợ xây dựng thuật toán phân nhánh phân loại sinh vật',
    },
    {
      title: 'Bài 26: Khóa lưỡng phân',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Nguyên tắc xây dựng khóa lưỡng phân; thực hành lập khóa lưỡng phân phân loại một số sinh vật',
      equipment: 'Bộ thẻ ảnh sinh vật: con thỏ, con chim bồ câu, con cá chép, con ếch đồng, con giun đất',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Thực hành tạo trò chơi trắc nghiệm phân loại bằng khóa lưỡng phân trên Quizizz',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Nhờ AI kiểm tra tính hợp lý của các cặp đặc điểm đối lập trong khóa lưỡng phân',
    },
    {
      title: 'Bài 27: Vi khuẩn',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Hình dạng, cấu tạo vi khuẩn; vai trò có ích trong đời sống và vi khuẩn gây bệnh; kháng sinh',
      equipment: 'Mô hình cấu tạo vi khuẩn, tranh ảnh vi khuẩn lactic trong sữa chua, vi khuẩn nốt sần',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Tìm kiếm infographic số về nguyên tắc sử dụng thuốc kháng sinh an toàn',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Tra cứu thông tin AI về cơ chế kháng kháng sinh của siêu vi khuẩn trong y tế',
    },
    {
      title: 'Bài 28: Thực hành: Làm sữa chua và quan sát vi khuẩn',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Quy trình lên men lactic làm sữa chua tại nhà; làm tiêu bản quan sát vi khuẩn lên men',
      equipment: 'Sữa tươi, sữa chua cái, hũ thủy tinh, thùng xốp giữ ấm nhiệt, kính hiển vi quang học, thuốc nhuộm',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Quay video TikTok / Shorts ghi lại các bước làm sữa chua chuẩn khoa học báo cáo GV',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu cách AI kiểm soát nhiệt độ và độ ẩm trong các nhà máy sữa chua công nghiệp',
    },
    {
      title: 'Bài 29: Virus',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Cấu tạo đơn giản của virus (vỏ protein và lõi acid nucleic); một số bệnh do virus; vaccine',
      equipment: 'Mô hình 3D virus Corona, virus HIV, tranh ảnh cơ chế lây nhiễm và tiêm chủng vaccine',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Quan sát mô hình không gian 3D của các loại virus trên trang web rcsb.org/pdb',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu vai trò của AlphaFold và AI trong việc giải mã cấu trúc virus chế tạo vaccine',
    },
    {
      title: 'Bài 30: Nguyên sinh vật',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Đặc điểm nguyên sinh vật; vai trò trong tự nhiên và một số bệnh do nguyên sinh vật (sốt rét, kiết lỵ)',
      equipment: 'Tranh ảnh trùng roi xanh, trùng biến hình, trùng sốt rét Plasmodium; vòng đời muỗi Anopheles',
      location: 'Lớp học',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Khai thác bản đồ số dịch tễ học bệnh truyền nhiễm của Tổ chức Y tế Thế giới (WHO)',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Khám phá AI thị giác nhận diện ký sinh trùng sốt rét trong lam máu tự động',
    },
    {
      title: 'Bài 31: Nấm',
      strand: 'Vật sống',
      periods: 3,
      semester: 2,
      content: 'Đa dạng các loại nấm (nấm đơn bào, nấm mốc, nấm đảm); nấm ăn, nấm dược liệu và nấm độc',
      equipment: 'Mẫu nấm sò, nấm rơm, mộc nhĩ; bánh mì bị mốc, kính lúp, tranh ảnh các loại nấm độc nguy hiểm',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Tra cứu cẩm nang số nhận diện các loài nấm độc gây chết người của Cục An toàn Thực phẩm',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Dùng app AI (Seek/Google Lens) chụp ảnh nhận diện nấm mọc trong tự nhiên',
    },
    {
      title: 'Bài 32: Thực hành: Quan sát các loại nấm',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Quan sát cấu tạo thể quả nấm rơm/nấm sò bằng mắt và kính lúp; làm tiêu bản nấm mốc',
      equipment: 'Kính hiển vi, kính lúp, kim mũi mác, nấm rơm tươi, bánh mì mốc, lam kính, lamen',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Vẽ sơ đồ cấu tạo cây nấm trên phần mềm đồ họa số và gắn chú thích các bộ phận',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Sử dụng AI phân tích cấu trúc sợi nấm mốc dưới kính hiển vi',
    },
    {
      title: 'Bài 33: Thực vật',
      strand: 'Vật sống',
      periods: 4,
      semester: 2,
      content: 'Các ngành thực vật: Rêu, Dương xỉ, Hạt trần, Hạt kín; đặc điểm cơ quan sinh dưỡng và sinh sản',
      equipment: 'Cây rêu tường, cây dương xỉ có ổ túi bào tử, cành thông mang nón, cành hoa bưởi/hoa huệ',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Thu thập tiêu bản ảnh thực vật số tại sân trường tạo album "Vườn thực vật số KHTN 6"',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Sử dụng PlantNet / Google Lens nhận diện loài cây và cơ quan sinh sản của cây',
    },
    {
      title: 'Bài 34: Thực hành: Quan sát sinh vật ngoài thiên nhiên',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Tham quan sân trường hoặc công viên; quan sát và ghi chép đa dạng thực vật và động vật',
      equipment: 'Kính lúp cầm tay, máy ảnh/điện thoại, sổ tay ghi chép dã ngoại, vợt bắt bướm, găng tay',
      location: 'Ngoài khuôn viên trường học',
      nlsCodes: ['[NLS.4]', '[NLS.5]'],
      nlsDetail: 'Định vị GPS vị trí cây xanh trên sân trường và gắn thẻ thông tin loài trên Google My Maps',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Thực hành quét AI nhận diện nhanh tên khoa học của 5 loài cây trên sân trường',
    },
    {
      title: 'Bài 35: Động vật không xương sống',
      strand: 'Vật sống',
      periods: 4,
      semester: 2,
      content: 'Đặc điểm ruột khoang, giun, thân mềm, chân khớp; vai trò trong tự nhiên và nông nghiệp',
      equipment: 'Mẫu vật ngâm: thủy tức, giun đất, mực ống, tôm sông, châu chấu; tranh cấu tạo đại diện',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Khai thác bách khoa toàn thư động vật số tra cứu các loài động vật không xương sống',
      aiCodes: ['[AI.1]'],
      aiDetail: 'Sử dụng AI nhận diện loài côn trùng gây hại mùa màng và côn trùng có ích',
    },
    {
      title: 'Bài 36: Động vật có xương sống',
      strand: 'Vật sống',
      periods: 4,
      semester: 2,
      content: 'Năm lớp động vật có xương sống: Cá, Lưỡng cư, Bò sát, Chim, Thú; đặc điểm thích nghi môi trường',
      equipment: 'Tranh ảnh mẫu vật cá chép, ếch đồng, thằn lằn, chim bồ câu, mèo/thỏ; mô hình bộ xương',
      location: 'Lớp học',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Thiết kế bài thuyết trình đa phương tiện PowerPoint về đời sống và tập tính các lớp động vật',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Đặt câu hỏi phản biện với AI về sự tiến hóa của hệ hô hấp và tuần hoàn qua 5 lớp động vật',
    },
    {
      title: 'Ôn tập giữa học kì II',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Hệ thống hóa phân loại sinh giới, vi khuẩn, virus, nấm, giới thực vật và giới động vật',
      equipment: 'Bộ câu hỏi ôn tập tương tác, sơ đồ phân loại động thực vật, đề kiểm tra thử trên LMS',
      location: 'Lớp học / Trực tuyến',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Luyện tập đề ôn tập trắc nghiệm số trên K12Online / Azota với ngân hàng câu hỏi phân hóa',
      aiCodes: ['[AI.2]', '[AI.4]'],
      aiDetail: 'Trợ lý AI phân tích các lỗi học sinh hay nhầm lẫn giữa ngành Hạt trần và Hạt kín',
      method: 'blended',
      onlineContent: 'Học sinh tham gia lớp học số trên LMS: ôn tập hệ thống hóa kiến thức và làm bài tập củng cố',
      onlinePlatform: 'LMS K12Online / Azota',
    },
    {
      title: 'Kiểm tra, đánh giá giữa học kì II',
      strand: 'Vật sống',
      periods: 2,
      semester: 2,
      content: 'Kiểm tra định kì đánh giá kết quả học tập giữa kì II môn KHTN 6 theo CV 7991',
      equipment: 'Đề kiểm tra in sẵn chuẩn ma trận đặc tả theo quy định Công văn 7991',
      location: 'Phòng thi trực tiếp',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Cập nhật điểm kiểm tra và nhận xét học sinh trên phần mềm quản trị nhà trường',
      aiCodes: ['[AI.4]'],
      aiDetail: 'Nghiêm túc chấp hành quy chế kiểm tra, giáo dục tính tự chủ và liêm chính',
    },
    {
      title: 'Bài 37: Lực và tác dụng của lực',
      strand: 'Năng lượng và sự biến đổi',
      periods: 3,
      semester: 2,
      content: 'Khái niệm lực; biểu diễn lực bằng mũi tên; tác dụng của lực làm biến đổi chuyển động hoặc biến dạng',
      equipment: 'Lò xo lá tròn, xe lăn, nam châm, thanh sắt, lực kế lò xo, quả nặng',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Thực hành thí nghiệm ảo PhET Forces and Motion: Basics khảo sát lực và chuyển động',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu cách AI mô phỏng tương tác lực trong đồ họa game 3D và vật lý thực tế',
      method: 'blended',
      onlineContent: 'Giao bài tập trước trên Google Classroom: Làm quen với mô phỏng lực PhET',
      onlinePlatform: 'PhET Interactive / Google Classroom',
    },
    {
      title: 'Bài 38: Lực tiếp xúc và lực không tiếp xúc',
      strand: 'Năng lượng và sự biến đổi',
      periods: 2,
      semester: 2,
      content: 'Phân biệt lực tiếp xúc (lực đẩy, lực kéo) và lực không tiếp xúc (lực hút nam châm, trọng lực)',
      equipment: 'Nam châm thẳng, kẹp giấy kim loại, hai xe lăn có gắn nam châm cùng cực/khác cực',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.1]'],
      nlsDetail: 'Tra cứu video mô phỏng từ trường và lực hấp dẫn của Trái Đất trên YouTube Giáo dục',
      aiCodes: ['[AI.2]'],
      aiDetail: 'Yêu cầu AI giải thích hiện tượng tàu đệm từ trường (Maglev) vận hành không ma sát',
    },
    {
      title: 'Bài 39: Biến dạng của lò xo. Phép đo lực',
      strand: 'Năng lượng và sự biến đổi',
      periods: 3,
      semester: 2,
      content: 'Đặc tính biến dạng của lò xo; độ dãn tỉ lệ thuận với khối lượng; cấu tạo và cách dùng lực kế',
      equipment: 'Giá thí nghiệm, lò xo xoắn ốc, quả nặng 50g, thước thẳng milimet, lực kế ống',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.3]'],
      nlsDetail: 'Nhập bảng số liệu độ dãn lò xo vào Excel, vẽ đồ thị quan hệ giữa độ dãn và lực kéo',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Khám phá cách thuật toán phân tích đường thẳng hồi quy xác định độ cứng lò xo',
    },
    {
      title: 'Bài 40: Lực ma sát',
      strand: 'Năng lượng và sự biến đổi',
      periods: 3,
      semester: 2,
      content: 'Lực ma sát trượt, ma sát nghỉ, lực cản của nước và không khí; tác hại và ứng dụng của ma sát',
      equipment: 'Khối gỗ hình hộp, lực kế, mặt bàn gỗ, mặt giấy nhám, các con lăn hình trụ',
      location: 'Phòng học bộ môn KHTN',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Thao tác mô phỏng ma sát PhET Friction quan sát hiện tượng sinh nhiệt ở mức phân tử',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu hệ thống phanh ABS thông minh trên ô tô được điều khiển bởi AI chống bó cứng',
    },
    {
      title: 'Bài 41: Năng lượng',
      strand: 'Năng lượng và sự biến đổi',
      periods: 3,
      semester: 2,
      content: 'Khái niệm năng lượng; các dạng năng lượng (cơ năng, nhiệt năng, quang năng, điện năng, hóa năng)',
      equipment: 'Đèn pin, quạt mini chạy pin, chuông điện, tranh ảnh các nhà máy phong điện, thủy điện',
      location: 'Lớp học',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Thực hành mô phỏng PhET Energy Forms and Changes khảo sát chuyển hóa năng lượng',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu cách mạng lưới điện thông minh (Smart Grid) sử dụng AI phân phối năng lượng',
    },
    {
      title: 'Bài 42: Bảo toàn năng lượng và sử dụng năng lượng',
      strand: 'Năng lượng và sự biến đổi',
      periods: 3,
      semester: 2,
      content: 'Định luật bảo toàn năng lượng; năng lượng hao phí; năng lượng tái tạo và sử dụng tiết kiệm',
      equipment: 'Mô hình con lắc đơn, xe đồ chơi chạy bằng thế năng dây cót, pin năng lượng mặt trời',
      location: 'Lớp học',
      nlsCodes: ['[NLS.4]'],
      nlsDetail: 'Thiết kế poster số tuyên truyền "Sử dụng năng lượng xanh và bền vững" trên Canva',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Mô phỏng AI tính toán lượng phát thải carbon khi chuyển đổi sang năng lượng tái tạo',
    },
    {
      title: 'Bài 43: Trái Đất trong hệ Mặt Trời',
      strand: 'Trái Đất và bầu trời',
      periods: 2,
      semester: 2,
      content: 'Cấu trúc Hệ Mặt Trời; vị trí của Trái Đất; chuyển động tự quay và quay quanh Mặt Trời',
      equipment: 'Mô hình Hệ Mặt Trời 3D, quả địa cầu có trục nghiêng, đèn chiếu giả lập Mặt Trời',
      location: 'Lớp học',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Sử dụng phần mềm thiên văn mô phỏng Stellarium / Solar System Scope ngắm các hành tinh',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Tìm hiểu cách kính viễn vọng không gian James Webb dùng AI xử lý ảnh các hành tinh',
    },
    {
      title: 'Bài 44: Chuyển động nhìn thấy của Mặt Trời và Mặt Trăng',
      strand: 'Trái Đất và bầu trời',
      periods: 3,
      semester: 2,
      content: 'Hiện tượng ngày và đêm; chuyển động biểu kiến của Mặt Trời; các pha của Mặt Trăng',
      equipment: 'Mô hình quan hệ Mặt Trời - Trái Đất - Mặt Trăng, quả bóng bàn sơn 2 nửa đen trắng',
      location: 'Lớp học',
      nlsCodes: ['[NLS.2]'],
      nlsDetail: 'Tương tác trực quan quan sát các pha Trái Đất - Mặt Trăng trên Solar System Simulator',
      aiCodes: ['[AI.3]'],
      aiDetail: 'Khám phá cách AI tính toán chính xác lịch triều cường và chu kì các pha Trăng',
    },
    {
      title: 'Ôn tập cuối học kì II',
      strand: 'Trái Đất và bầu trời',
      periods: 2,
      semester: 2,
      content: 'Hệ thống hóa kiến thức toàn bộ Học kì II: Đa dạng sinh vật, Lực và năng lượng, Trái Đất và bầu trời',
      equipment: 'Sơ đồ tư duy tổng hợp cả năm, bộ đề ôn tập trắc nghiệm số trên nền tảng trực tuyến',
      location: 'Lớp học / Trực tuyến',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Làm đề thi thử tổng hợp học kì II trên LMS có phân tích phổ điểm chi tiết',
      aiCodes: ['[AI.2]', '[AI.4]'],
      aiDetail: 'Trợ lý AI hướng dẫn chiến thuật phân bổ thời gian làm bài thi trắc nghiệm và tự luận',
      method: 'blended',
      onlineContent: 'Học sinh ôn tập trực tuyến trên LMS; hoàn thành bài tập tổng hợp trước kì thi chính thức',
      onlinePlatform: 'LMS K12Online / Azota',
    },
    {
      title: 'Kiểm tra, đánh giá cuối học kì II',
      strand: 'Trái Đất và bầu trời',
      periods: 2,
      semester: 2,
      content: 'Kiểm tra tổng kết cuối năm học môn Khoa học tự nhiên 6 theo chuẩn Công văn 7991',
      equipment: 'Đề kiểm tra in sẵn chuẩn ma trận 4 mức độ theo đúng quy định của Sở GD&ĐT',
      location: 'Phòng thi trực tiếp',
      nlsCodes: ['[NLS.5]'],
      nlsDetail: 'Số hóa kết quả học tập năm học, đồng bộ dữ liệu vào hệ thống quản lý học bạ số',
      aiCodes: ['[AI.4]'],
      aiDetail: 'Thực hiện kiểm tra nghiêm túc, đảm bảo công bằng, khách quan và minh bạch',
    },
  ],
  '7': [],
  '8': [],
  '9': [],
};

// Khởi tạo nhanh danh mục bài học SGK cho KHTN 7, 8, 9 (chuẩn hóa đầy đủ 140 tiết)
function buildGradeLessons(grade: Grade): StandardLessonBlueprint[] {
  if (OFFICIAL_KHTN_LESSONS[grade] && OFFICIAL_KHTN_LESSONS[grade].length > 0) {
    return OFFICIAL_KHTN_LESSONS[grade];
  }
  // Fallback cấu trúc bài học chuẩn cho lớp 7, 8, 9 dựa trên mạch GDPT 2018
  const currMap: Record<Grade, Array<{
    t: string;
    s: 'Chất và sự biến đổi của chất' | 'Năng lượng và sự biến đổi' | 'Vật sống' | 'Trái Đất và bầu trời' | 'Mở đầu & Đo lường';
    p: number;
    sem: 1 | 2;
  }>> = {
    '6': [],
    '7': [
      { t: 'Bài 1: Phương pháp và kĩ năng học tập môn Khoa học tự nhiên', s: 'Mở đầu & Đo lường' as const, p: 4, sem: 1 as const },
      { t: 'Bài 2: Nguyên tử', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 3: Nguyên tố hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 4: Sơ lược về bảng tuần hoàn các nguyên tố hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 5, sem: 1 as const },
      { t: 'Bài 5: Phân tử - Đơn chất - Hợp chất', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 6: Hóa trị và công thức hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 7: Tốc độ chuyển động', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 8: Đồ thị quãng đường - thời gian', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 9: Đo tốc độ', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Ôn tập giữa học kì I', s: 'Mở đầu & Đo lường' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì I', s: 'Mở đầu & Đo lường' as const, p: 2, sem: 1 as const },
      { t: 'Bài 10: Khái quát về trao đổi chất và chuyển hóa năng lượng', s: 'Vật sống' as const, p: 2, sem: 1 as const },
      { t: 'Bài 11: Quang hợp ở thực vật', s: 'Vật sống' as const, p: 4, sem: 1 as const },
      { t: 'Bài 12: Thực hành: Chứng minh quang hợp ở cây xanh', s: 'Vật sống' as const, p: 3, sem: 1 as const },
      { t: 'Bài 13: Hô hấp tế bào', s: 'Vật sống' as const, p: 3, sem: 1 as const },
      { t: 'Bài 14: Thực hành: Hô hấp ở thực vật', s: 'Vật sống' as const, p: 3, sem: 1 as const },
      { t: 'Bài 15: Trao đổi nước và chất dinh dưỡng ở thực vật', s: 'Vật sống' as const, p: 4, sem: 1 as const },
      { t: 'Bài 16: Trao đổi nước và chất dinh dưỡng ở động vật', s: 'Vật sống' as const, p: 4, sem: 1 as const },
      { t: 'Bài 17: Thực hành: Vận chuyển các chất trong cây', s: 'Vật sống' as const, p: 2, sem: 1 as const },
      { t: 'Bài 18: Cảm ứng ở sinh vật', s: 'Vật sống' as const, p: 2, sem: 1 as const },
      { t: 'Ôn tập cuối học kì I', s: 'Vật sống' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì I', s: 'Vật sống' as const, p: 2, sem: 1 as const },
      // Học kì 2 (68 tiết)
      { t: 'Bài 19: Tập tính ở động vật', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 20: Thực hành: Tập tính ở động vật', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 21: Sinh trưởng và phát triển ở sinh vật', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 22: Các yếu tố ảnh hưởng đến sinh trưởng và phát triển', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 23: Sinh sản vô tính ở sinh vật', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 24: Sinh sản hữu tính ở sinh vật', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 25: Các yếu tố ảnh hưởng đến sinh sản ở sinh vật', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 26: Sóng âm', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 27: Độ to và độ cao của âm', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 28: Ánh sáng, tia sáng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Ôn tập giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Bài 29: Sự phản xạ ánh sáng', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 2 as const },
      { t: 'Bài 30: Định luật phản xạ ánh sáng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 31: Ảnh của vật tạo bởi gương phẳng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 32: Nam châm', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 33: Từ trường', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 34: Từ trường Trái Đất', s: 'Trái Đất và bầu trời' as const, p: 2, sem: 2 as const },
      { t: 'Bài 35: Dùng la bàn tìm hướng', s: 'Trái Đất và bầu trời' as const, p: 2, sem: 2 as const },
      { t: 'Bài 36: Nam châm điện', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 37: Thực hành: Chế tạo nam châm điện đơn giản', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Ôn tập cuối học kì II', s: 'Trái Đất và bầu trời' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì II', s: 'Trái Đất và bầu trời' as const, p: 2, sem: 2 as const },
    ],
    '8': [
      { t: 'Bài 1: Sử dụng một số hóa chất, thiết bị cơ bản trong phòng thí nghiệm', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 2: Phản ứng hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 3: Mol và tỉ khối của chất khí', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 4: Dung dịch và nồng độ', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 5: Định luật bảo toàn khối lượng và phương trình hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 6: Tính theo phương trình hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 7: Tốc độ phản ứng và chất xúc tác', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 8: Acid', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 9: Base - Thang pH', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Ôn tập giữa học kì I', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì I', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      { t: 'Bài 10: Oxide', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 11: Muối', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 12: Phân bón hóa học', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 13: Khối lượng riêng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 14: Thực hành xác định khối lượng riêng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 15: Tác dụng của chất lỏng lên vật đặt trong nó', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 16: Áp suất', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 17: Áp suất chất lỏng và chất khí', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 18: Lực đẩy Archimedes', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Ôn tập cuối học kì I', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì I', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 1 as const },
      // Học kì 2
      { t: 'Bài 19: Đòn bẩy', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 20: Hiện tượng nhiễm điện do cọ xát', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 21: Dòng điện, nguồn điện', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 22: Mạch điện đơn giản', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 23: Tác dụng của dòng điện', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 24: Cường độ dòng điện và hiệu điện thế', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 2 as const },
      { t: 'Bài 25: Năng lượng nhiệt và nội năng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 26: Sự truyền nhiệt', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Ôn tập giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Bài 27: Khái quát về cơ thể người', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 28: Hệ vận động ở người', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 29: Dinh dưỡng và tiêu hóa ở người', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 30: Máu và hệ tuần hoàn của cơ thể người', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 31: Hệ hô hấp ở người', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 32: Hệ bài tiết ở người', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 33: Điều hòa môi trường trong của cơ thể', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 34: Hệ thần kinh và các giác quan ở người', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 35: Hệ nội tiết ở người', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 36: Da và điều hòa thân nhiệt', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Bài 37: Sinh sản ở người', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 38: Môi trường và các nhân tố sinh thái', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Ôn tập cuối học kì II', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì II', s: 'Vật sống' as const, p: 2, sem: 2 as const },
    ],
    '9': [
      { t: 'Bài 1: Nhận biết một số dụng cụ và hóa chất. Thuyết trình một vấn đề khoa học', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      { t: 'Bài 2: Động năng. Thế năng', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 3: Cơ năng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 4: Công và công suất', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 5: Khúc xạ ánh sáng', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 6: Phản xạ toàn phần', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 7: Thấu kính', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 8: Kính lúp. Bài tập thấu kính', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 1 as const },
      { t: 'Bài 9: Ánh sáng trắng và ánh sáng màu', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 1 as const },
      { t: 'Bài 10: Sự tán sắc ánh sáng', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 1 as const },
      { t: 'Ôn tập giữa học kì I', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì I', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 1 as const },
      { t: 'Bài 11: Tính chất chung của kim loại', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 12: Dãy hoạt động hóa học của kim loại', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 13: Tách kim loại và việc sử dụng hợp kim', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 14: Sự khác nhau giữa phi kim và kim loại', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 15: Giới thiệu về hợp chất hữu cơ', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 16: Alkane', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 17: Alkene', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 1 as const },
      { t: 'Bài 18: Nguồn nhiên liệu', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      { t: 'Bài 19: Ethylic alcohol', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Bài 20: Acetic acid', s: 'Chất và sự biến đổi của chất' as const, p: 4, sem: 1 as const },
      { t: 'Ôn tập cuối học kì I', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì I', s: 'Chất và sự biến đổi của chất' as const, p: 2, sem: 1 as const },
      // Học kì 2
      { t: 'Bài 21: Lipid và chất béo', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 2 as const },
      { t: 'Bài 22: Glucose và saccharose', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 2 as const },
      { t: 'Bài 23: Tinh bột và cellulose', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 2 as const },
      { t: 'Bài 24: Protein', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 2 as const },
      { t: 'Bài 25: Polymer', s: 'Chất và sự biến đổi của chất' as const, p: 3, sem: 2 as const },
      { t: 'Bài 26: Sơ lược về hóa học vỏ Trái Đất và khai thác tài nguyên', s: 'Trái Đất và bầu trời' as const, p: 3, sem: 2 as const },
      { t: 'Bài 27: Khai thác tài nguyên từ vỏ Trái Đất', s: 'Trái Đất và bầu trời' as const, p: 2, sem: 2 as const },
      { t: 'Bài 28: Đoạn mạch nối tiếp và song song', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 2 as const },
      { t: 'Bài 29: Năng lượng điện. Công suất điện', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 2 as const },
      { t: 'Ôn tập giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá giữa học kì II', s: 'Năng lượng và sự biến đổi' as const, p: 2, sem: 2 as const },
      { t: 'Bài 30: Cảm ứng điện từ. Nguyên tắc tạo ra dòng điện xoay chiều', s: 'Năng lượng và sự biến đổi' as const, p: 4, sem: 2 as const },
      { t: 'Bài 31: Tác dụng của dòng điện xoay chiều', s: 'Năng lượng và sự biến đổi' as const, p: 3, sem: 2 as const },
      { t: 'Bài 32: Khái quát về di truyền học. Các thí nghiệm của Mendel', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 33: Nhiễm sắc thể và nguyên phân', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 34: Giảm phân và thụ tinh', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 35: DNA và RNA', s: 'Vật sống' as const, p: 4, sem: 2 as const },
      { t: 'Bài 36: Đột biến gene', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 37: Di truyền học với con người', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Bài 38: Tiến hóa của sinh giới', s: 'Vật sống' as const, p: 3, sem: 2 as const },
      { t: 'Ôn tập cuối học kì II', s: 'Vật sống' as const, p: 2, sem: 2 as const },
      { t: 'Kiểm tra, đánh giá cuối học kì II', s: 'Vật sống' as const, p: 2, sem: 2 as const },
    ],
  };

  const curr = currMap[grade]?.length ? currMap[grade] : currMap['7'];

  return curr.map((c) => ({
    title: c.t,
    strand: c.s,
    periods: c.p,
    semester: c.sem,
    content: `Yêu cầu cần đạt và kiến thức trọng tâm bài học "${c.t}" theo Chương trình GDPT 2018`,
    equipment: c.s === 'Chất và sự biến đổi của chất'
      ? 'Hóa chất thí nghiệm, ống nghiệm, giá để ống nghiệm, đèn cồn, cốc thủy tinh, tranh ảnh mô phỏng'
      : c.s === 'Năng lượng và sự biến đổi'
      ? 'Dụng cụ thí nghiệm đo đạc, cảm biến, nguồn điện/pin, lực kế, phần mềm mô phỏng PhET'
      : c.s === 'Vật sống'
      ? 'Mẫu vật sinh học, kính hiển vi, lam kính, lamen, tranh giải phẫu 3D, phần mềm mô phỏng'
      : 'Quả địa cầu, tranh thiên văn, phần mềm vũ trụ Stellarium, mô hình 3D',
    location: c.t.includes('Thực hành') || c.s === 'Chất và sự biến đổi của chất' || c.t.includes('Đo')
      ? 'Phòng học bộ môn KHTN'
      : 'Lớp học',
    nlsCodes: ['[NLS.2]', '[NLS.3]'],
    nlsDetail: 'Thực hành thí nghiệm ảo PhET và nhập số liệu vào bảng tính Excel xử lý tự động',
    aiCodes: ['[AI.2]'],
    aiDetail: 'Đặt câu hỏi phản biện khoa học cho trợ lý AI tra cứu và kiểm chứng kiến thức',
  }));
}

/**
 * Generate a complete, Department of Education compliant PPCT
 */
export async function generatePPCTWithAI(
  grade: Grade,
  schoolYear: string,
  totalPeriodsRequired: number = 140,
  additionalRequirements: string = '',
  sourceDocs: SourceDocument[] = [],
  settings: SourceLockSettings = {
    sourceLock: true,
    allowExternalKnowledge: false,
    curriculumPreset: 'ket-noi-tri-thuc',
  },
  guidancePreset: string = 'so-gd-5512',
  textbookSeries: string = 'kntt'
): Promise<PPCTData> {
  const items: PPCTItem[] = [];
  let allocatedPeriods = 0;
  let currentPeriodCounter = 1;

  // 1. Kiểm tra tài liệu nguồn do người dùng tải lên (Source Lock = ON)
  const hasUploadedAnalysis =
    sourceDocs.some((d) => d.extractedAnalysis && d.extractedAnalysis.lessons.length > 0);

  let rawLessons: {
    title: string;
    strand: string;
    periods: number;
    content: string;
    equipment: string;
    location: string;
    nlsCodes: string[];
    nlsDetail: string;
    aiCodes: string[];
    aiDetail: string;
    method?: TeachingMethod;
    onlineContent?: string;
    onlinePlatform?: string;
    sourceDocName?: string;
  }[] = [];

  if (hasUploadedAnalysis && settings.sourceLock) {
    sourceDocs.forEach((doc) => {
      const a = doc.extractedAnalysis;
      if (a && a.lessons.length > 0) {
        a.lessons.forEach((lName, idx) => {
          rawLessons.push({
            title: lName,
            strand: a.topics[idx % (a.topics.length || 1)] || 'Khoa học tự nhiên',
            periods: a.periods && a.periods > 0 ? Math.round(a.periods / a.lessons.length) || 2 : 2,
            content: a.requirements[idx % (a.requirements.length || 1)] || a.knowledgeUnits.join(', ') || 'Kiến thức bài học theo tài liệu nguồn',
            equipment: 'Thiết bị thực hành theo tài liệu nguồn và phòng bộ môn KHTN',
            location: lName.toLowerCase().includes('thực hành') ? 'Phòng học bộ môn KHTN' : 'Lớp học',
            nlsCodes: ['[NLS.1]', '[NLS.2]'],
            nlsDetail: 'Khai thác tài nguyên số và phần mềm bổ trợ theo hướng dẫn tài liệu nguồn',
            aiCodes: ['[AI.2]'],
            aiDetail: 'Sử dụng AI tra cứu kiến thức và kiểm chứng dữ liệu học tập',
            sourceDocName: doc.name,
          });
        });
      }
    });
  }

  // 2. Nếu không có hoặc ít hơn 10 bài, dùng danh mục chuẩn SGK & Sở GD&ĐT
  if (rawLessons.length < 10) {
    const std = buildGradeLessons(grade);
    rawLessons = std.map((s) => ({
      title: s.title,
      strand: s.strand,
      periods: s.periods,
      content: s.content,
      equipment: s.equipment,
      location: s.location,
      nlsCodes: s.nlsCodes,
      nlsDetail: s.nlsDetail,
      aiCodes: s.aiCodes,
      aiDetail: s.aiDetail,
      method: s.method,
      onlineContent: s.onlineContent,
      onlinePlatform: s.onlinePlatform,
      sourceDocName: `SGK Kết nối tri thức - GDPT 2018 (KHTN ${grade})`,
    }));
  }

  // Cân đối tổng số tiết để đạt chính xác `totalPeriodsRequired` (mặc định 140)
  const currentSum = rawLessons.reduce((sum, it) => sum + it.periods, 0);
  if (currentSum !== totalPeriodsRequired && currentSum > 0) {
    const diff = totalPeriodsRequired - currentSum;
    // Điều chỉnh nhẹ vào các bài lớn hoặc tiết ôn tập
    if (diff !== 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        const targetIdx = (i * 3) % rawLessons.length;
        if (diff > 0) {
          rawLessons[targetIdx].periods += 1;
        } else if (rawLessons[targetIdx].periods > 1) {
          rawLessons[targetIdx].periods -= 1;
        }
      }
    }
  }

  // 3. Xây dựng PPCTItem với Tiết thứ liên tục và Tuần học chuẩn theo hướng dẫn của Sở
  rawLessons.forEach((l, idx) => {
    const startPeriod = currentPeriodCounter;
    const endPeriod = currentPeriodCounter + l.periods - 1;
    currentPeriodCounter = endPeriod + 1;
    allocatedPeriods += l.periods;

    const periodIndexStr =
      startPeriod === endPeriod ? `${startPeriod}` : `${startPeriod} - ${endPeriod}`;

    // Tính tuần học (4 tiết/tuần): 1..72 là Học kì I (Tuần 1..18), 73..140 là Học kì II (Tuần 19..35)
    const weekNum = Math.ceil(startPeriod / 4);
    const semesterStr = startPeriod <= 72 ? 'Học kì I' : 'Học kì II';
    const timelineStr = `${semesterStr} (Tuần ${weekNum})`;

    // Xác định hình thức dạy học trực tuyến hoặc kết hợp theo Thông tư 09/2021
    const isExamOrReview =
      l.title.toLowerCase().includes('kiểm tra') ||
      l.title.toLowerCase().includes('đánh giá') ||
      l.title.toLowerCase().includes('ôn tập');

    let method: TeachingMethod = l.method || 'direct';
    let onlineDetail = l.onlineContent || 'Dạy học trực tiếp tại phòng học bộ môn KHTN hoặc lớp học; sử dụng dụng cụ thí nghiệm thực hành trực quan.';
    let platform = l.onlinePlatform || 'Phòng học bộ môn KHTN';

    if (l.title.toLowerCase().includes('ôn tập')) {
      method = 'online';
      onlineDetail = 'Học sinh tham gia phiên ôn tập trực tuyến trên LMS K12Online/Teams: ôn tập hệ thống hóa kiến thức chủ đề qua bài giảng tương tác; làm bài tập trắc nghiệm số trên Azota có phản hồi tự động.';
      platform = 'LMS K12Online / Azota';
    } else if (idx % 4 === 1 && !isExamOrReview) {
      method = 'blended';
      onlineDetail = 'Nhiệm vụ trực tuyến giao trước trên LMS: xem video thí nghiệm số và tài liệu đa phương tiện; trả lời câu hỏi định hướng trước khi học trực tiếp tại lớp.';
      platform = 'Google Classroom / PhET Simulations';
    } else if (idx % 5 === 2 && !isExamOrReview) {
      method = 'blended';
      onlineDetail = 'Thực hành thí nghiệm ảo trên PhET Interactive Simulations, ghi nhận bảng số liệu và nộp báo cáo chuẩn bị qua Padlet/LMS.';
      platform = 'PhET Interactive / Padlet';
    }

    items.push({
      stt: idx + 1,
      lessonCode: `[PPCT-KHTN${grade}-B${String(idx + 1).padStart(2, '0')}]`,
      topicOrLesson: l.title,
      content: l.content,
      periods: l.periods,
      periodIndex: periodIndexStr,
      timeline: timelineStr,
      equipmentAndMaterials: l.equipment,
      location: l.location,
      departmentGuidanceRef: 'Công văn 5512/BGDĐT-GDTrH (Phụ lục 1) & Hướng dẫn Sở GD&ĐT',
      digitalCompetenceCodes: l.nlsCodes,
      digitalCompetenceDetail: l.nlsDetail,
      aiEducationCodes: l.aiCodes,
      aiEducationDetail: l.aiDetail,
      teachingMethod: method,
      onlineContentDetail: onlineDetail,
      onlinePlatform: platform,
      notes: isExamOrReview
        ? 'Kiểm tra đánh giá định kỳ chuẩn Công văn 7991'
        : `Mạch kiến thức: ${l.strand}`,
      sourceRef: l.sourceDocName || 'Chương trình GDPT 2018',
    });
  });

  // Tính toán các chỉ số Thông tư 09/2021/TT-BGDĐT
  const totalOnlinePeriods = items
    .filter((it) => it.teachingMethod === 'online' || it.teachingMethod === 'blended')
    .reduce((sum, it) => sum + it.periods, 0);

  const onlineRatioPercent =
    allocatedPeriods > 0
      ? Number(((totalOnlinePeriods / allocatedPeriods) * 100).toFixed(1))
      : 0;

  const isOnlineRatioValid = onlineRatioPercent <= 35; // Tối đa 35% cấp THCS

  // Thống kê NLS
  const nlsMap: Record<string, { label: string; count: number }> = {};
  items.forEach((it) => {
    (it.digitalCompetenceCodes || []).forEach((c) => {
      if (!nlsMap[c]) {
        nlsMap[c] = { label: it.digitalCompetenceDetail || 'Năng lực số', count: 0 };
      }
      nlsMap[c].count++;
    });
  });
  const digitalCompetenceSummary = Object.keys(nlsMap).map((k) => ({
    code: k,
    label: nlsMap[k].label,
    count: nlsMap[k].count,
  }));

  // Thống kê AI
  const aiMap: Record<string, { label: string; count: number }> = {};
  items.forEach((it) => {
    (it.aiEducationCodes || []).forEach((c) => {
      if (!aiMap[c]) {
        aiMap[c] = { label: it.aiEducationDetail || 'Dạy học AI', count: 0 };
      }
      aiMap[c].count++;
    });
  });
  const aiEducationSummary = Object.keys(aiMap).map((k) => ({
    code: k,
    label: aiMap[k].label,
    count: aiMap[k].count,
  }));

  return {
    grade,
    schoolYear,
    guidancePreset:
      guidancePreset === 'so-gd-140'
        ? 'Hướng dẫn Sở GD&ĐT: Khung 140 tiết (HK I: 72 tiết/18 tuần - HK II: 68 tiết/17 tuần)'
        : guidancePreset === 'so-gd-parallel'
        ? 'Hướng dẫn Sở GD&ĐT: Dạy học song hành các phân môn Vật lí - Hóa học - Sinh học'
        : guidancePreset === 'so-gd-source'
        ? 'Hướng dẫn Sở GD&ĐT: Bám sát tài liệu nguồn trích xuất (Source Lock = ON)'
        : 'Hướng dẫn Sở GD&ĐT: Kế hoạch dạy học theo Công văn 5512/BGDĐT & Chuẩn SGK GDPT 2018',
    textbookSeries:
      textbookSeries === 'canh-dieu'
        ? 'Cánh diều (NXB ĐH Sư phạm)'
        : textbookSeries === 'chan-troi'
        ? 'Chân trời sáng tạo (NXB Giáo dục Việt Nam)'
        : 'Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam)',
    totalPeriodsRequired,
    totalPeriodsAllocated: allocatedPeriods,
    isBalanced: allocatedPeriods === totalPeriodsRequired,
    totalOnlinePeriods,
    onlineRatioPercent,
    maxOnlineRatioPercent: 35,
    isOnlineRatioValid,
    digitalCompetenceSummary,
    aiEducationSummary,
    additionalRequirements,
    items,
  };
}
