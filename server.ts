import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Primary and fallback models
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-3.8-flash",
];

// Helper to wait for exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithFallback(
  ai: GoogleGenAI,
  userPrompt: string,
  systemInstruction: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Attempt with retry on 503/429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.2, // low temperature for high fidelity and accuracy
          },
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED");

        console.warn(
          `[Gemini] Attempt ${attempt} with model ${model} failed (${isTransient ? "transient" : "fatal"}): ${errMsg.slice(0, 150)}`
        );

        if (isTransient && attempt < 2) {
          // Wait 1.5s before retrying this model
          await delay(1500);
          continue;
        }
        // Break inner loop to try next fallback model
        break;
      }
    }
  }

  throw lastError || new Error("Không thể kết nối đến các mô hình Gemini AI.");
}

// Generic Gemini generation endpoint with Source Lock support
app.post("/api/gemini/process", async (req, res) => {
  try {
    const {
      module,
      task,
      sourceDocuments,
      userInput,
      config,
      sourceLock = true,
      allowExternalKnowledge = false,
      previousStepsData,
    } = req.body;

    const ai = getGeminiAI();

    // Construct system instructions emphasizing 30-year teacher experience and Source Lock rules
    let systemInstruction = `Bạn là chuyên gia phát triển Web App AI giáo dục, đồng thời là GIÁO VIÊN KHOA HỌC TỰ NHIÊN THCS CÓ 30 NĂM KINH NGHIỆM tại Việt Nam.
Bạn am hiểu sâu sắc Chương trình GDPT 2018 môn Khoa học tự nhiên (Lớp 6, 7, 8, 9), Công văn 5512/BGDĐT về kế hoạch bài dạy, và Công văn 7991/BGDĐT về xây dựng ma trận, đặc tả, đề kiểm tra định kỳ và đánh giá học sinh.

QUY TẮC BẮT BUỘC:
1. Mỗi lần chỉ thực hiện DUY NHẤT một nhiệm vụ được yêu cầu (${task || module}). Không tự ý làm gộp sang nhiệm vụ khác.
2. NGUYÊN TẮC SOURCE LOCK:
`;

    if (sourceLock && !allowExternalKnowledge) {
      systemInstruction += `[CHẾ ĐỘ SOURCE LOCK = ĐANG BẬT (ON)]
- Bạn CHỈ ĐƯỢC PHÉP sử dụng thông tin có căn cứ từ: (1) Tài liệu giáo viên đã tải lên, (2) Văn bản giáo viên nhập trực tiếp, (3) Cấu hình đã chọn.
- TUYỆT ĐỐI KHÔNG tự bổ sung kiến thức ngoài nguồn dữ liệu được cung cấp.
- Nếu không tìm thấy thông tin cần thiết trong tài liệu hoặc văn bản nguồn, bạn PHẢI thông báo: "⚠️ Không tìm thấy thông tin cần thiết trong nguồn dữ liệu." Không được tự bịa hoặc suy đoán.
- Đánh dấu rõ nguồn trích dẫn tương ứng cho từng nội dung.
`;
    } else {
      systemInstruction += `[CHẾ ĐỘ KIẾN THỨC BỔ SUNG: BẬT]
- Được phép kết hợp kiến thức chuẩn từ Chương trình GDPT 2018 môn KHTN THCS và các bộ sách giáo khoa chuẩn (Kết nối tri thức, Cánh diều, Chân trời sáng tạo) để bổ trợ làm phong phú và chuẩn hóa nội dung. Vẫn ưu tiên cao nhất cho dữ liệu giáo viên nhập và tài liệu tải lên.
`;
    }

    systemInstruction += `
3. Toàn bộ ngôn ngữ xuất ra là TIẾNG VIỆT chuẩn sư phạm, trang trọng, chính xác thuật ngữ khoa học (KHTN: Vật lý, Hóa học, Sinh học, Trái Đất và bầu trời).
4. Luôn kiểm tra tính nhất quán, cân đối điểm số, đúng số câu, đúng mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).
`;

    const userPrompt = `
NHIỆM VỤ: ${task || module}

THÔNG TIN ĐẦU VÀO TỪ GIÁO VIÊN:
${JSON.stringify(userInput || {}, null, 2)}

CẤU HÌNH NHIỆM VỤ:
${JSON.stringify(config || {}, null, 2)}

DỮ LIỆU CÁC BƯỚC TRƯỚC ĐÓ (NẾU CÓ):
${JSON.stringify(previousStepsData || {}, null, 2)}

TÀI LIỆU NGUỒN CUNG CẤP:
${
  sourceDocuments && sourceDocuments.length > 0
    ? sourceDocuments
        .map(
          (doc: { name: string; content: string }, idx: number) =>
            `--- TÀI LIỆU ${idx + 1}: ${doc.name} ---\n${doc.content.slice(0, 15000)}`
        )
        .join("\n\n")
    : "Không có tài liệu file đính kèm riêng. Sử dụng dữ liệu văn bản do giáo viên nhập trực tiếp."
}

Hãy xử lý và trả về kết quả định dạng JSON chuẩn (hoặc cấu trúc chi tiết có cấu trúc rõ ràng) phù hợp nhất với nhiệm vụ.
`;

    if (ai) {
      try {
        const { text, modelUsed } = await generateWithFallback(ai, userPrompt, systemInstruction);

        return res.json({
          success: true,
          result: text,
          modelUsed,
          sourceLockActive: sourceLock && !allowExternalKnowledge,
        });
      } catch (genError: any) {
        console.warn("All Gemini candidate models were exhausted or busy:", genError?.message);
        return res.json({
          success: false,
          error: "Dịch vụ AI đang có lưu lượng truy cập cao. Hệ thống tự động chuyển sang bộ xử lý sư phạm nội bộ GDPT 2018.",
          useClientFallback: true,
          details: genError?.message,
        });
      }
    } else {
      // Fallback response if API key is not yet set
      return res.json({
        success: false,
        error: "GEMINI_API_KEY chưa được cấu hình trên server.",
        useClientFallback: true,
      });
    }
  } catch (error: any) {
    console.error("Gemini endpoint error:", error);
    return res.json({
      success: false,
      error: error.message || "Lỗi khi xử lý với Gemini AI",
      useClientFallback: true,
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Trợ lý AI KHTN THCS running on http://localhost:${PORT}`);
  });
}

startServer();
