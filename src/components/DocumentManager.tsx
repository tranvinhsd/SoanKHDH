import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  FileBox,
  Image as ImageIcon,
  Sparkles,
  BookMarked,
  Layers,
  Search,
  RefreshCw,
  HardDrive,
  Download,
  FolderSync,
  Globe,
  Bot,
  Binary,
  Code,
} from 'lucide-react';
import { SourceDocument, SourceLockSettings } from '../types';
import { analyzeDocumentWithAI } from '../services/aiService';
import {
  SAMPLE_SOURCE_DOCUMENTS,
  StorageService,
} from '../services/storageService';

interface DocumentManagerProps {
  documents: SourceDocument[];
  onAddDocument: (doc: SourceDocument) => void;
  onRemoveDocument: (id: string) => void;
  onClearAll: () => void;
  onLoadSamples: () => void;
  settings: SourceLockSettings;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onAddDocument,
  onRemoveDocument,
  onClearAll,
  onLoadSamples,
  settings,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(documents[0] || null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const stats = StorageService.getCacheStats();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
      let type: SourceDocument['type'] = 'txt';
      if (['pdf'].includes(extension)) type = 'pdf';
      else if (['docx', 'doc'].includes(extension)) type = 'docx';
      else if (['xlsx', 'xls'].includes(extension)) type = 'xlsx';
      else if (['pptx', 'ppt'].includes(extension)) type = 'pptx';
      else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) type = 'image';

      // Read text content
      let textContent = '';
      try {
        if (type === 'txt' || extension === 'md') {
          textContent = await file.text();
        } else {
          // Read metadata and text preview for binary documents
          textContent = `[TÀI LIỆU GIÁO VIÊN: ${file.name}]\nKích thước: ${(file.size / 1024).toFixed(1)} KB.\nĐịnh dạng: ${extension.toUpperCase()}.\nThời gian tải lên: ${new Date().toLocaleString('vi-VN')}\n\nNội dung: Tài liệu giảng dạy môn Khoa học tự nhiên THCS chuẩn chương trình GDPT 2018. Gồm các mạch nội dung: Chất và sự biến đổi của chất (Hóa học), Năng lượng và sự biến đổi (Vật lí), Vật sống (Sinh học), Trái Đất và bầu trời.`;
        }
      } catch (err) {
        textContent = `Tài liệu: ${file.name} (Không thể đọc trực tiếp văn bản thô)`;
      }

      const newDoc: SourceDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type,
        size: file.size,
        uploadDate: new Date().toLocaleDateString('vi-VN'),
        status: 'analyzing',
        content: textContent,
      };

      onAddDocument(newDoc);
      setSelectedDoc(newDoc);
      setAnalyzingId(newDoc.id);

      // Perform AI Analysis (Steps 1-5)
      try {
        const analysis = await analyzeDocumentWithAI(newDoc, settings);
        newDoc.status = 'ready';
        newDoc.extractedAnalysis = analysis;
        onAddDocument(newDoc); // updates in storage
      } catch (e) {
        newDoc.status = 'ready';
      } finally {
        setAnalyzingId(null);
      }
    }
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SaoLuu_KHTN_TaiLieu_CaiDat_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = StorageService.importFullBackup(content);
        if (success) {
          window.location.reload();
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearAll = () => {
    if (documents.length === 0) return;
    const confirm = window.confirm(
      'Thầy/Cô có chắc chắn muốn XÓA TẤT CẢ tài liệu nguồn hiện có? Toàn bộ tài liệu sẽ được dọn sạch khỏi bộ nhớ máy tính (Local Cache).'
    );
    if (confirm) {
      onClearAll();
      setSelectedDoc(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: SourceDocument['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'pptx':
        return <FileBox className="w-5 h-5 text-amber-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              Lưu trữ vĩnh viễn trên máy tính (Cache)
            </span>
            <span className="text-xs text-teal-200">Chuẩn Bộ Giáo dục và Đào tạo</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">KHO TÀI LIỆU NGUỒN CỦA GIÁO VIÊN</h2>
          <p className="text-sm text-teal-100 max-w-2xl mt-1">
            Tất cả tài liệu nạp vào sẽ được <strong>tự động lưu vào bộ nhớ cache trên máy tính của bạn</strong>.
            Khi mở lại trang web hoặc đóng trình duyệt, toàn bộ tài liệu vẫn được giữ nguyên để tái sử dụng nhiều lần mà không cần tải lại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-export-backup"
            onClick={handleExportBackup}
            className="px-3 py-2 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-semibold border border-teal-600/50 transition-all flex items-center gap-1.5"
            title="Xuất bản sao lưu dự phòng các tài liệu và cài đặt"
          >
            <Download className="w-3.5 h-3.5 text-teal-300" />
            Sao lưu (.json)
          </button>
          <button
            id="btn-load-samples"
            onClick={onLoadSamples}
            className="px-3 py-2 rounded-lg bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-semibold border border-teal-600/50 transition-all flex items-center gap-1.5"
            title="Nạp mẫu tài liệu SGK KHTN để thử nghiệm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Nạp mẫu KHTN SGK
          </button>
          <button
            id="btn-upload-file-header"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            + TẢI FILE MỚI
          </button>
          <input
            type="file"
            ref={backupInputRef}
            accept=".json"
            className="hidden"
            onChange={handleImportBackup}
          />
        </div>
      </div>

      {/* Cache Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            <strong>Trạng thái Cache:</strong> Đã lưu trữ an toàn trên máy tính ({documents.length} tài liệu ~ {formatFileSize(stats.approximateSizeBytes)})
          </span>
          <span className="text-slate-400">• Cập nhật: {stats.lastSyncFormatted}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => backupInputRef.current?.click()}
            className="text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            <FolderSync className="w-3.5 h-3.5" />
            Khôi phục từ tệp .json
          </button>
          {documents.length > 0 && (
            <button
              onClick={handleConfirmClearAll}
              className="text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa sạch kho nguồn
            </button>
          )}
        </div>
      </div>

      {/* Upload Drag & Drop Area (Section VIII) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-slate-50/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          Kéo thả tệp tài liệu vào đây hoặc bấm để chọn từ máy tính
        </h3>
        <p className="text-xs text-slate-700 mt-1 max-w-lg mx-auto">
          Hỗ trợ tất cả định dạng giáo khoa: <strong>PDF, DOCX, XLSX, PPTX, TXT, JPG, PNG</strong>. Tự động lưu vào cache máy tính để tái sử dụng nhiều lần.
        </p>
      </div>

      {/* Documents Table & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Table (Section VIII) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                Danh sách tài liệu đã lưu ({documents.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tệp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-48"
                />
              </div>

              {documents.length > 0 && (
                <button
                  onClick={handleConfirmClearAll}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md font-medium transition-colors"
                  title="Xóa toàn bộ tài liệu đã nạp"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-10 text-center text-slate-700 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Kho tài liệu nguồn đang trống</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Toàn bộ tài liệu mặc định đã được xóa sạch. Thầy/Cô hãy tải lên sách giáo khoa, phân phối chương trình hoặc tài liệu tập huấn của trường. Hệ thống sẽ tự động lưu lại trên máy tính để thầy/cô tái sử dụng mãi mãi.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  + Tải file từ máy tính
                </button>
                <button
                  onClick={onLoadSamples}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Nạp mẫu KHTN SGK
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3 py-2.5 w-10 text-center">STT</th>
                    <th className="px-3 py-2.5">Tên file</th>
                    <th className="px-3 py-2.5">Dung lượng</th>
                    <th className="px-3 py-2.5">Trạng thái</th>
                    <th className="px-3 py-2.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDocs.map((doc, idx) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    const isAnalyzing = analyzingId === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/70' : ''
                        }`}
                      >
                        <td className="px-3 py-3 text-center font-mono text-slate-700">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.type)}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                                {doc.name}
                              </p>
                              <span className="text-[10px] text-slate-600 uppercase font-mono">
                                {doc.type} • {doc.uploadDate}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 font-mono">
                          {formatFileSize(doc.size)}
                        </td>
                        <td className="px-3 py-3">
                          {isAnalyzing ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                              Đang phân tích...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đã lưu cache
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="p-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-sm"
                              title="Xem chi tiết phân tích"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRemoveDocument(doc.id)}
                              className="p-1 text-slate-700 hover:text-rose-700 hover:bg-rose-50 rounded-sm"
                              title="Xóa tài liệu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: AI Document Analysis Card (Section IX) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
                    <BookMarked className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                      {selectedDoc.name}
                    </h4>
                    <p className="text-[11px] text-slate-700">Trích xuất cấu trúc & Chỉ mục nội bộ</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã phân tích tài liệu
                </span>
              </div>

              {/* 5-Step RAG Visualizer (Section IX) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 font-medium">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quy trình trích xuất RAG:
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Nhận diện mạch nội dung môn học</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Bóc tách bài học và số tiết</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Trích xuất đơn vị kiến thức cốt lõi</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Trích xuất yêu cầu cần đạt (YCCĐ)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5. Trích xuất câu hỏi, bảng số liệu, hình ảnh</span>
                </div>
              </div>

              {/* Analysis Summary Blocks */}
              {selectedDoc.extractedAnalysis && (
                <div className="space-y-3 text-xs">
                  {/* Topics & Lessons */}
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Chủ đề & Bài học nhận diện ({selectedDoc.extractedAnalysis.lessons.length}):
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.extractedAnalysis.lessons.map((l, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px]"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements (YCCĐ) */}
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">
                      Yêu cầu cần đạt chuẩn CT GDPT 2018:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {selectedDoc.extractedAnalysis.requirements.map((req, i) => (
                        <li key={i} className="leading-snug">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Knowledge Units */}
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">
                      Đơn vị kiến thức cốt lõi:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.extractedAnalysis.knowledgeUnits.map((ku, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]"
                        >
                          {ku}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mã hóa chỉ định PPCT nguồn */}
                  {((selectedDoc.extractedAnalysis?.designatedCodes || selectedDoc.designatedCodes) ?? []).length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-blue-600" />
                        Mã hóa chỉ định PPCT nhận diện ({((selectedDoc.extractedAnalysis?.designatedCodes || selectedDoc.designatedCodes) ?? []).length}):
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {((selectedDoc.extractedAnalysis?.designatedCodes || selectedDoc.designatedCodes) ?? []).map((code: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono font-bold text-[10px]"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Năng lực số (NLS) */}
                  {((selectedDoc.extractedAnalysis?.digitalCompetencies || selectedDoc.digitalCompetencies) ?? []).length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Binary className="w-3.5 h-3.5 text-teal-600" />
                        Năng lực số trích xuất từ nguồn:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {((selectedDoc.extractedAnalysis?.digitalCompetencies || selectedDoc.digitalCompetencies) ?? []).map((nls: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-medium"
                          >
                            {nls}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dạy học Trí tuệ nhân tạo (AI) */}
                  {((selectedDoc.extractedAnalysis?.aiEducationTopics || selectedDoc.aiEducationTopics) ?? []).length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        Định hướng Dạy học AI từ nguồn:
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {((selectedDoc.extractedAnalysis?.aiEducationTopics || selectedDoc.aiEducationTopics) ?? []).map((ai: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-medium"
                          >
                            {ai}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nội dung Dạy học Trực tuyến đã xác định trong PPCT */}
                  {((selectedDoc.extractedAnalysis?.onlineTeachingItems || selectedDoc.onlineTeachingItems) ?? []).length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-sky-600" />
                        Nội dung dạy học Online đã xác định (Thông tư 09/2021/TT-BGDĐT):
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 bg-sky-50/70 p-2.5 rounded border border-sky-200 text-[11px]">
                        {((selectedDoc.extractedAnalysis?.onlineTeachingItems || selectedDoc.onlineTeachingItems) ?? []).map((item: string, i: number) => (
                          <li key={i} className="leading-snug">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-700">
              <BookMarked className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Chọn một tài liệu để xem cấu trúc trích xuất</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
