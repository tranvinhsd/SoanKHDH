import { SourceDocument, SourceLockSettings, WorkspaceItem, Grade } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'khtn_thcs_source_documents',
  SETTINGS: 'khtn_thcs_settings',
  GRADE: 'khtn_thcs_active_grade',
  WORKSPACES: 'khtn_thcs_workspaces',
  CURRENT_WORKSPACE_ID: 'khtn_thcs_current_ws_id',
  CLEARED_INITIAL_V2: 'khtn_thcs_cleared_initial_v2',
  LAST_SYNC: 'khtn_thcs_last_cache_sync',
};

export const DEFAULT_SETTINGS: SourceLockSettings & {
  teacherName: string;
  schoolName: string;
  defaultGrade: Grade;
} = {
  sourceLock: true,
  allowExternalKnowledge: false,
  curriculumPreset: 'ket-noi-tri-thuc',
  teacherName: 'Thầy/Cô giáo KHTN',
  schoolName: 'Trường THCS',
  defaultGrade: '7',
};

// Optional sample documents only loaded when the teacher explicitly clicks "Nạp mẫu KHTN SGK"
export const SAMPLE_SOURCE_DOCUMENTS: SourceDocument[] = [
  {
    id: 'sample-doc-khtn7-tocdo',
    name: 'SGK_KHTN7_Bai8_Bai9_TocDoChuyenDong.pdf',
    type: 'pdf',
    size: 2450000,
    uploadDate: new Date().toLocaleDateString('vi-VN'),
    status: 'ready',
    content: `BÀI 8: TỐC ĐỘ CHUYỂN ĐỘNG
I. Khái niệm tốc độ
Tốc độ là đại lượng cho biết mức độ nhanh hay chậm của chuyển động, được tính bằng quãng đường đi được trong một đơn vị thời gian.
Công thức tính tốc độ: v = s / t
Trong đó:
- s là quãng đường vật đi được (m, km).
- t là thời gian vật đi hết quãng đường đó (s, h).
- v là tốc độ chuyển động (m/s, km/h).
Đơn vị đo tốc độ: Trong hệ đơn vị đo lường chính thức của nước ta, đơn vị đo tốc độ là mét trên giây (m/s) và kilômét trên giờ (km/h).
Cách đổi đơn vị: 1 m/s = 3,6 km/h; 1 km/h = 1/3,6 m/s ≈ 0,28 m/s.

II. Đo tốc độ
Để đo tốc độ, ta cần đo quãng đường và thời gian.
1. Dùng đồng hồ bấm giây: Đo quãng đường bằng thước dây, đo thời gian bằng đồng hồ bấm giây.
2. Dùng cổng quang điện và đồng hồ đo thời gian hiện số: Tự động ngắt mở tín hiệu khi xe lăn chắn cổng quang, kết quả chính xác cao, loại bỏ sai số chủ quan của con người.

BÀI 9: ĐỒ THỊ QUÃNG ĐƯỜNG - THỜI GIAN
Đồ thị quãng đường - thời gian (s - t) mô tả sự biến đổi của quãng đường theo thời gian.
- Nếu đường đồ thị là đoạn thẳng dốc lên: Vật chuyển động với tốc độ không đổi.
- Nếu đường đồ thị là đoạn thẳng nằm ngang song song với trục Ot: Vật đang đứng yên (quãng đường không tăng theo thời gian).
Khoảng cách an toàn giữa hai phương tiện khi chạy với tốc độ 60 - 80 km/h tối thiểu là 55m.`,
    extractedAnalysis: {
      topics: ['Năng lượng và sự biến đổi', 'Tốc độ chuyển động'],
      lessons: ['Bài 8: Tốc độ chuyển động', 'Bài 9: Đo tốc độ', 'Bài 10: Đồ thị quãng đường - thời gian'],
      knowledgeUnits: ['Định nghĩa tốc độ', 'Công thức v = s / t', 'Đổi đơn vị m/s và km/h', 'Cổng quang điện', 'Đồ thị s - t', 'Khoảng cách an toàn'],
      requirements: [
        'Nêu được ý nghĩa của tốc độ, công thức v = s/t và đơn vị đo hợp pháp',
        'Vẽ và đọc được đồ thị quãng đường - thời gian của chuyển động',
        'Giải thích được quy định an toàn giao thông về tốc độ và khoảng cách tối thiểu',
      ],
      periods: 4,
      sampleQuestions: [
        'Công thức tính tốc độ là gì?',
        'Một ô tô đi được 120 km trong 2,5 giờ, tính tốc độ ô tô?',
        'Nêu ưu điểm của cổng quang điện so với bấm giây bằng tay?',
      ],
      tablesAndFigures: ['Bảng đổi đơn vị tốc độ', 'Hình vẽ cổng quang điện', 'Đồ thị quãng đường - thời gian'],
      digitalCompetencies: [
        '[NLS.2] Mô phỏng chuyển động trên phần mềm thí nghiệm ảo PhET',
        '[NLS.3] Bảng tính Excel và cổng quang điện đo thời gian hiện số xử lý số liệu',
        '[NLS.4] Vẽ và phân tích đồ thị quãng đường - thời gian (s - t) trên phần mềm số',
      ],
      aiEducationTopics: [
        '[AI.3] Ứng dụng AI phân tích dạng đồ thị s - t và dự báo khoảng cách an toàn phanh',
        '[AI.2] Trợ lý AI đối chiếu quy định an toàn giao thông và phân tích tình huống tốc độ',
      ],
      onlineTeachingItems: [
        'Tiết 16 (Đồ thị s - t): Học sinh nghiên cứu trước video hướng dẫn trên LMS K12Online, nộp bảng số liệu qua Google Classroom',
        'Tiết 17 (Luyện tập): Bài tập tương tác trực tuyến trên Azota tự động chấm điểm và phản hồi sai số',
      ],
      designatedCodes: ['[PPCT-KHTN7-CD2-B08]', '[PPCT-KHTN7-CD2-B09]', '[PPCT-KHTN7-CD2-B10]', '[NLS.2]', '[NLS.3]', '[AI.3]', '[ONLINE]', '[KẾT HỢP]'],
    },
  },
  {
    id: 'sample-doc-khtn7-nguyentu',
    name: 'TaiLieu_ChuDe_NguyenTu_BangTuanHoan_KHTN7.docx',
    type: 'docx',
    size: 1850000,
    uploadDate: new Date().toLocaleDateString('vi-VN'),
    status: 'ready',
    content: `CHỦ ĐỀ: NGUYÊN TỬ - NGUYÊN TỐ HÓA HỌC - BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC
1. Nguyên tử:
- Theo mô hình Rutherford - Bohr, nguyên tử gồm hạt nhân mang điện tích dương nằm ở tâm và các electron mang điện tích âm chuyển động xung quanh như các hành tinh quay quanh Mặt Trời.
- Hạt nhân gồm proton (mang điện tích +1) và neutron (không mang điện).
- Electron (kí hiệu e) mang điện tích -1.
- Trong nguyên tử, số proton luôn bằng số electron, nên nguyên tử trung hòa về điện.

2. Nguyên tố hóa học:
- Tập hợp những nguyên tử cùng loại có cùng số proton trong hạt nhân được gọi là nguyên tố hóa học.
- Kí hiệu hóa học được viết bằng 1 hoặc 2 chữ cái (chữ cái đầu viết hoa, chữ thứ hai viết thường). Ví dụ: H (Hydrogen), He (Helium), C (Carbon), N (Nitrogen), O (Oxygen), Na (Sodium), Mg (Magnesium), Al (Aluminium), Fe (Iron), Cu (Copper).

3. Bảng tuần hoàn các nguyên tố hóa học:
- Xếp theo chiều tăng dần của điện tích hạt nhân nguyên tử.
- Cấu tạo:
  + Ô nguyên tố: Số hiệu nguyên tử (= số proton = số electron), Kí hiệu hóa học, Tên nguyên tố, Khối lượng nguyên tử.
  + Chu kì: Dãy các nguyên tố có cùng số lớp electron trong nguyên tử. Gồm 7 chu kì (1, 2, 3 là chu kì nhỏ; 4, 5, 6, 7 là chu kì lớn).
  + Nhóm: Cột các nguyên tố có tính chất hóa học tương tự nhau, có số electron hóa trị bằng nhau. Gồm 8 nhóm A (IA đến VIIIA) và 8 nhóm B.`,
    extractedAnalysis: {
      topics: ['Chất và sự biến đổi của chất', 'Nguyên tử và Bảng tuần hoàn'],
      lessons: ['Bài 2: Nguyên tử', 'Bài 3: Nguyên tố hóa học', 'Bài 4: Bảng tuần hoàn các nguyên tố hóa học'],
      knowledgeUnits: ['Mô hình Rutherford - Bohr', 'Hạt proton, electron, neutron', 'Kí hiệu hóa học', 'Ô nguyên tố', 'Chu kì', 'Nhóm A'],
      requirements: [
        'Mô tả được cấu tạo nguyên tử theo mô hình Rutherford - Bohr',
        'Xác định được vị trí của nguyên tố trong bảng tuần hoàn từ số hiệu nguyên tử',
        'Phân biệt được kim loại, phi kim và khí hiếm dựa trên bảng tuần hoàn',
      ],
      periods: 6,
      sampleQuestions: [
        'Hạt nhân nguyên tử gồm những loại hạt nào?',
        'Số thứ tự chu kì cho biết điều gì?',
        'Nguyên tử X có 11 electron, hãy xác định vị trí của X trong bảng tuần hoàn?',
      ],
      tablesAndFigures: ['Bảng tuần hoàn 20 nguyên tố đầu', 'Mô hình nguyên tử Bohr'],
      digitalCompetencies: [
        '[NLS.2] Mô hình 3D tương tác cấu tạo nguyên tử Rutherford - Bohr trên phần mềm mô phỏng',
        '[NLS.1] Khai thác Bảng tuần hoàn hóa học số tương tác trên Internet',
        '[NLS.5] Hoạt động nhóm thảo luận tìm hiểu 20 nguyên tố đầu trên Padlet',
      ],
      aiEducationTopics: [
        '[AI.1] Ứng dụng AI nhận diện phổ phát xạ và nhận dạng mẫu khoáng vật',
        '[AI.4] Giáo dục sử dụng AI an toàn, liêm chính học thuật khi tra cứu tính chất hóa học',
      ],
      onlineTeachingItems: [
        'Tiết 8 (Bảng tuần hoàn): Tự học trực tuyến có hướng dẫn về cấu tạo bảng tuần hoàn trên LMS K12Online',
        'Tiết 10 (Luyện tập liên kết hóa học): Trò chơi tương tác trực tuyến trên Quizizz kiểm tra nhận thức',
      ],
      designatedCodes: ['[PPCT-KHTN7-CD1-B02]', '[PPCT-KHTN7-CD1-B03]', '[PPCT-KHTN7-CD1-B04]', '[NLS.1]', '[NLS.2]', '[AI.1]', '[ONLINE]', '[KẾT HỢP]'],
    },
  },
];

export const StorageService = {
  /**
   * One-time check to ensure all legacy sample documents are cleared from browser cache
   */
  ensureCleanInitialSource(): void {
    try {
      const hasCleaned = localStorage.getItem(STORAGE_KEYS.CLEARED_INITIAL_V2);
      if (!hasCleaned) {
        // Clear documents from cache so initial state is 100% clean
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CLEARED_INITIAL_V2, 'true');
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
    } catch (e) {
      console.warn('LocalStorage not available or error in ensureCleanInitialSource', e);
    }
  },

  /**
   * Load source documents from browser cache (localStorage)
   * Defaults to empty array [] - NO mock documents!
   */
  getDocuments(): SourceDocument[] {
    try {
      this.ensureCleanInitialSource();
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Save source documents to computer cache (localStorage) for persistent reuse
   */
  saveDocuments(docs: SourceDocument[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (err) {
      console.error('Lỗi lưu tài liệu vào cache máy tính (có thể đầy bộ nhớ):', err);
      // Fallback: If quota exceeded, strip large raw content preview to preserve document index
      try {
        const lightweightDocs = docs.map((d) => ({
          ...d,
          content: d.content.slice(0, 5000) + '... [Nội dung đã được tối ưu lưu trữ]',
        }));
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(lightweightDocs));
        return true;
      } catch (innerErr) {
        console.error('Không thể lưu tài liệu sau khi nén:', innerErr);
        return false;
      }
    }
  },

  addDocument(doc: SourceDocument): void {
    const docs = this.getDocuments();
    const updated = [doc, ...docs.filter((d) => d.id !== doc.id)];
    this.saveDocuments(updated);
  },

  removeDocument(id: string): void {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    this.saveDocuments(docs);
  },

  clearAllDocuments(): void {
    this.saveDocuments([]);
  },

  /**
   * Get application settings from computer cache
   */
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save settings to computer cache
   */
  saveSettings(settings: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Lỗi lưu cài đặt vào cache:', e);
    }
  },

  /**
   * Get active Grade from computer cache
   */
  getGrade(): Grade {
    try {
      const g = localStorage.getItem(STORAGE_KEYS.GRADE);
      if (g && ['6', '7', '8', '9'].includes(g)) {
        return g as Grade;
      }
      return '7';
    } catch {
      return '7';
    }
  },

  /**
   * Save active Grade to computer cache
   */
  saveGrade(grade: Grade): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GRADE, grade);
    } catch (e) {
      console.error('Lỗi lưu khối lớp vào cache:', e);
    }
  },

  /**
   * Retrieve workspace history
   */
  getWorkspaces(): WorkspaceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveWorkspace(ws: WorkspaceItem): void {
    try {
      const list = this.getWorkspaces().filter((w) => w.id !== ws.id);
      list.unshift(ws);
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi lưu workspace:', e);
    }
  },

  deleteWorkspace(id: string): void {
    try {
      const list = this.getWorkspaces().filter((w) => w.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi xóa workspace:', e);
    }
  },

  /**
   * Get statistics about current computer cache
   */
  getCacheStats(): {
    documentCount: number;
    approximateSizeBytes: number;
    lastSyncFormatted: string;
    isSupported: boolean;
  } {
    try {
      const docsJson = localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]';
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}';
      const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      const docs = JSON.parse(docsJson);

      const totalBytes =
        (docsJson.length + settingsJson.length) * 2; // UTF-16 character estimation

      return {
        documentCount: Array.isArray(docs) ? docs.length : 0,
        approximateSizeBytes: totalBytes,
        lastSyncFormatted: lastSync
          ? new Date(lastSync).toLocaleTimeString('vi-VN') + ' ' + new Date(lastSync).toLocaleDateString('vi-VN')
          : 'Chưa đồng bộ',
        isSupported: true,
      };
    } catch {
      return {
        documentCount: 0,
        approximateSizeBytes: 0,
        lastSyncFormatted: 'Không xác định',
        isSupported: false,
      };
    }
  },

  /**
   * Export all documents and settings to a downloadable JSON file for easy backup/transfer
   */
  exportFullBackup(): string {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      documents: this.getDocuments(),
      settings: this.getSettings(),
      grade: this.getGrade(),
      workspaces: this.getWorkspaces(),
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Restore documents and settings from a backup JSON string
   */
  importFullBackup(jsonStr: string): boolean {
    try {
      const payload = JSON.parse(jsonStr);
      if (payload.documents && Array.isArray(payload.documents)) {
        this.saveDocuments(payload.documents);
      }
      if (payload.settings) {
        this.saveSettings(payload.settings);
      }
      if (payload.grade) {
        this.saveGrade(payload.grade);
      }
      if (payload.workspaces && Array.isArray(payload.workspaces)) {
        localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(payload.workspaces));
      }
      return true;
    } catch (e) {
      console.error('Lỗi khôi phục sao lưu cache:', e);
      return false;
    }
  },
};

// Standalone exports for components
export const loadDocuments = (): SourceDocument[] => StorageService.getDocuments();
export const saveDocuments = (docs: SourceDocument[]): boolean => StorageService.saveDocuments(docs);
export const clearAllDocuments = (): void => StorageService.clearAllDocuments();

export const loadSettings = () => StorageService.getSettings();
export const saveSettings = (s: any) => StorageService.saveSettings(s);

export const getSavedGrade = (): Grade => StorageService.getGrade();
export const saveGrade = (g: Grade): void => StorageService.saveGrade(g);

export const getWorkspaceList = () => {
  return StorageService.getWorkspaces().map((w) => ({
    id: w.id,
    title: w.name,
    type: w.module,
    grade: w.grade,
    updatedAt: w.updatedAt,
  }));
};
export const deleteWorkspace = (id: string) => StorageService.deleteWorkspace(id);
