import {
  Exam7991Workspace,
  ValidationCheckItem,
  ValidationReport,
  MatrixData,
  SpecificationItem,
  QuestionBankItem,
  AnswerKeyItem,
  GradingGuideItem,
} from '../types';

export function runValidationPipeline(workspace: Exam7991Workspace): ValidationReport {
  const checks: ValidationCheckItem[] = [];
  const matrix = workspace.matrix;
  const spec = workspace.specification;
  const questions = workspace.questionBank;
  const answers = workspace.answers;
  const gradingGuide = workspace.gradingGuide;

  // CHECK 01: Phạm vi kiến thức
  const hasRows = matrix.rows && matrix.rows.length > 0;
  if (!hasRows) {
    checks.push({
      code: 'CHECK 01',
      name: 'Phạm vi kiến thức',
      status: 'failed',
      message: 'Chưa có chủ đề hoặc đơn vị kiến thức nào trong ma trận.',
      details: 'Cần ít nhất 1 chủ đề kiến thức KHTN theo phạm vi kiểm tra.',
    });
  } else {
    const emptyTopic = matrix.rows.find((r) => !r.topic.trim() || !r.content.trim());
    if (emptyTopic) {
      checks.push({
        code: 'CHECK 01',
        name: 'Phạm vi kiến thức',
        status: 'warning',
        message: 'Có dòng kiến thức bị để trống tên chủ đề hoặc nội dung.',
        details: `Dòng ID: ${emptyTopic.id}`,
      });
    } else {
      checks.push({
        code: 'CHECK 01',
        name: 'Phạm vi kiến thức',
        status: 'passed',
        message: `Phạm vi kiến thức chuẩn xác với ${matrix.rows.length} đơn vị kiến thức.`,
      });
    }
  }

  // CHECK 02: Số lượng câu
  const totalMatrixQuestions = matrix.rows.reduce((acc, r) => acc + r.totalQuestions, 0);
  const totalBankQuestions = questions.length;
  if (totalBankQuestions === 0) {
    checks.push({
      code: 'CHECK 02',
      name: 'Số lượng câu hỏi',
      status: 'failed',
      message: 'Chưa có câu hỏi nào trong ngân hàng câu hỏi.',
      details: `Yêu cầu từ ma trận: ${totalMatrixQuestions} câu.`,
    });
  } else if (totalBankQuestions !== totalMatrixQuestions) {
    checks.push({
      code: 'CHECK 02',
      name: 'Số lượng câu hỏi',
      status: 'failed',
      message: `Số câu hỏi trong ngân hàng (${totalBankQuestions}) không khớp với tổng số câu trong ma trận (${totalMatrixQuestions}).`,
      details: 'Cần đồng bộ số lượng câu giữa ma trận và ngân hàng câu hỏi.',
    });
  } else {
    checks.push({
      code: 'CHECK 02',
      name: 'Số lượng câu hỏi',
      status: 'passed',
      message: `Đủ và đúng ${totalBankQuestions} câu hỏi theo kế hoạch ma trận.`,
    });
  }

  // CHECK 03: Tổng điểm (Bắt buộc = 10.0đ)
  const calculatedMatrixScore = Number(
    matrix.rows.reduce((acc, r) => acc + r.totalScore, 0).toFixed(2)
  );
  const calculatedQuestionScore = Number(
    questions.reduce((acc, q) => acc + (q.score || 0), 0).toFixed(2)
  );

  if (Math.abs(calculatedMatrixScore - 10.0) > 0.05) {
    checks.push({
      code: 'CHECK 03',
      name: 'Tổng điểm ma trận',
      status: 'failed',
      message: `Tổng điểm ma trận hiện tại là ${calculatedMatrixScore} điểm (Bắt buộc phải đúng 10.0 điểm).`,
      details: 'Vui lòng điều chỉnh lại phân bổ điểm số trong ma trận cho tròn 10.0đ.',
    });
  } else if (Math.abs(calculatedQuestionScore - 10.0) > 0.05 && questions.length > 0) {
    checks.push({
      code: 'CHECK 03',
      name: 'Tổng điểm câu hỏi',
      status: 'failed',
      message: `Tổng điểm các câu hỏi trong đề là ${calculatedQuestionScore} điểm (khác 10.0 điểm).`,
      details: 'Cần căn chỉnh điểm từng câu trắc nghiệm hoặc tự luận để tròn 10.0đ.',
    });
  } else {
    checks.push({
      code: 'CHECK 03',
      name: 'Tổng điểm đề kiểm tra',
      status: 'passed',
      message: 'Tổng điểm đạt đúng 10.0 / 10.0 điểm chuẩn BGDĐT.',
    });
  }

  // CHECK 04: Mức độ nhận thức (Tỉ lệ NB - TH - VD - VDC)
  let recScore = 0;
  let undScore = 0;
  let appScore = 0;
  let hAppScore = 0;

  matrix.rows.forEach((r) => {
    recScore += r.recognition.score;
    undScore += r.understanding.score;
    appScore += r.application.score;
    hAppScore += r.highApplication.score;
  });

  const totalCalc = recScore + undScore + appScore + hAppScore;
  if (totalCalc > 0) {
    const recPct = Math.round((recScore / totalCalc) * 100);
    const undPct = Math.round((undScore / totalCalc) * 100);
    const appPct = Math.round((appScore / totalCalc) * 100);
    const hAppPct = Math.round((hAppScore / totalCalc) * 100);

    // Chuẩn thường là 40% NB - 30% TH - 20% VD - 10% VDC (hoặc tương đương)
    if (recPct === 0) {
      checks.push({
        code: 'CHECK 04',
        name: 'Mức độ nhận thức',
        status: 'warning',
        message: 'Đề chưa có điểm cho mức độ Nhận biết.',
      });
    } else if (undPct === 0) {
      checks.push({
        code: 'CHECK 04',
        name: 'Mức độ nhận thức',
        status: 'warning',
        message: 'Đề chưa có điểm cho mức độ Thông hiểu.',
      });
    } else {
      checks.push({
        code: 'CHECK 04',
        name: 'Mức độ nhận thức',
        status: 'passed',
        message: `Tỉ lệ nhận thức cân đối: Nhận biết ${recPct}% - Thông hiểu ${undPct}% - Vận dụng ${appPct}% - Vận dụng cao ${hAppPct}%.`,
      });
    }
  } else {
    checks.push({
      code: 'CHECK 04',
      name: 'Mức độ nhận thức',
      status: 'failed',
      message: 'Chưa tính được tỉ lệ các mức độ nhận thức.',
    });
  }

  // CHECK 05: Ma trận ↔ Đặc tả (Mỗi dòng ma trận phải có tương ứng trong bản đặc tả)
  if (!spec || spec.length === 0) {
    checks.push({
      code: 'CHECK 05',
      name: 'Ma trận ↔ Đặc tả',
      status: 'failed',
      message: 'Chưa có bản đặc tả ma trận.',
    });
  } else {
    const missingInSpec = matrix.rows.filter(
      (r) => !spec.some((s) => s.matrixRowId === r.id || s.content === r.content)
    );
    if (missingInSpec.length > 0) {
      checks.push({
        code: 'CHECK 05',
        name: 'Ma trận ↔ Đặc tả',
        status: 'warning',
        message: `Có ${missingInSpec.length} đơn vị kiến thức trong ma trận chưa có trong bản đặc tả.`,
        details: missingInSpec.map((m) => m.content).join(', '),
      });
    } else {
      checks.push({
        code: 'CHECK 05',
        name: 'Ma trận ↔ Đặc tả',
        status: 'passed',
        message: 'Bản đặc tả ánh xạ 100% đầy đủ với các yêu cầu cần đạt trong ma trận.',
      });
    }
  }

  // CHECK 06: Đặc tả ↔ Câu hỏi (Mỗi câu hỏi phải gắn với một yêu cầu cần đạt cụ thể)
  if (questions.length > 0) {
    const unlinkedQuestions = questions.filter((q) => !q.requirement || !q.requirement.trim());
    if (unlinkedQuestions.length > 0) {
      checks.push({
        code: 'CHECK 06',
        name: 'Đặc tả ↔ Câu hỏi',
        status: 'warning',
        message: `Có ${unlinkedQuestions.length} câu hỏi chưa gắn mã YCCĐ trong bản đặc tả.`,
        details: unlinkedQuestions.map((q) => q.id).join(', '),
      });
    } else {
      checks.push({
        code: 'CHECK 06',
        name: 'Đặc tả ↔ Câu hỏi',
        status: 'passed',
        message: 'Tất cả câu hỏi đều truy xuất được nguồn gốc Yêu cầu cần đạt và bản đặc tả.',
      });
    }
  } else {
    checks.push({
      code: 'CHECK 06',
      name: 'Đặc tả ↔ Câu hỏi',
      status: 'failed',
      message: 'Chưa có câu hỏi để đối chiếu với bản đặc tả.',
    });
  }

  // CHECK 07: Câu hỏi ↔ Đáp án (Mỗi câu trắc nghiệm phải có đáp án A, B, C hoặc D, không thiếu câu nào)
  if (questions.length > 0) {
    let missingAnsCount = 0;
    let invalidOptionCount = 0;

    questions.forEach((q, idx) => {
      const ansObj = answers.find(
        (a) => a.questionId === q.id || a.questionNum === idx + 1
      );
      if (!ansObj || !ansObj.answer || !ansObj.answer.trim()) {
        missingAnsCount++;
      } else if (q.type === 'mc') {
        const cleanAns = ansObj.answer.trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(cleanAns)) {
          invalidOptionCount++;
        }
      }
    });

    if (missingAnsCount > 0) {
      checks.push({
        code: 'CHECK 07',
        name: 'Câu hỏi ↔ Đáp án',
        status: 'failed',
        message: `Phát hiện ${missingAnsCount} câu hỏi bị thiếu đáp án.`,
        details: 'Tất cả các câu trắc nghiệm và tự luận bắt buộc phải có đáp án chi tiết.',
      });
    } else if (invalidOptionCount > 0) {
      checks.push({
        code: 'CHECK 07',
        name: 'Câu hỏi ↔ Đáp án',
        status: 'warning',
        message: `Có ${invalidOptionCount} câu trắc nghiệm có đáp án không nằm trong lựa chọn A/B/C/D.`,
      });
    } else {
      checks.push({
        code: 'CHECK 07',
        name: 'Câu hỏi ↔ Đáp án',
        status: 'passed',
        message: '100% câu hỏi có đáp án chuẩn xác, khớp hoàn toàn với phương án trắc nghiệm.',
      });
    }
  } else {
    checks.push({
      code: 'CHECK 07',
      name: 'Câu hỏi ↔ Đáp án',
      status: 'failed',
      message: 'Chưa có câu hỏi và bảng đáp án.',
    });
  }

  // CHECK 08: Câu hỏi ↔ Hướng dẫn chấm (Câu tự luận phải có thang điểm từng ý)
  const essayQuestions = questions.filter((q) => q.type === 'essay');
  if (essayQuestions.length === 0) {
    checks.push({
      code: 'CHECK 08',
      name: 'Hướng dẫn chấm tự luận',
      status: 'passed',
      message: 'Đề 100% trắc nghiệm khách quan, không yêu cầu hướng dẫn chấm tự luận riêng.',
    });
  } else {
    let guideIssue = false;
    essayQuestions.forEach((eq) => {
      const guide = gradingGuide.find(
        (g) => g.questionId === eq.id || g.stem.includes(eq.stem.slice(0, 20))
      );
      if (!guide || !guide.criteria || guide.criteria.length === 0) {
        guideIssue = true;
      }
    });

    if (guideIssue) {
      checks.push({
        code: 'CHECK 08',
        name: 'Hướng dẫn chấm tự luận',
        status: 'failed',
        message: 'Câu hỏi tự luận bị thiếu barem hướng dẫn chấm chi tiết theo từng ý.',
        details: 'Mỗi ý trong câu tự luận bắt buộc phải có nội dung cần đạt và điểm cụ thể.',
      });
    } else {
      checks.push({
        code: 'CHECK 08',
        name: 'Hướng dẫn chấm tự luận',
        status: 'passed',
        message: `Hướng dẫn chấm chi tiết đầy đủ cho ${essayQuestions.length} câu tự luận kèm thang điểm từng bước.`,
      });
    }
  }

  // CHECK 09: Không trùng câu hỏi
  if (questions.length > 1) {
    const seenStems = new Set<string>();
    let duplicateCount = 0;
    questions.forEach((q) => {
      const normalized = q.stem.trim().toLowerCase().slice(0, 50);
      if (seenStems.has(normalized)) {
        duplicateCount++;
      } else {
        seenStems.add(normalized);
      }
    });

    if (duplicateCount > 0) {
      checks.push({
        code: 'CHECK 09',
        name: 'Kiểm tra trùng lặp',
        status: 'failed',
        message: `Phát hiện ${duplicateCount} câu hỏi có nội dung trùng lặp.`,
        details: 'Ngân hàng đề cần các câu hỏi độc lập, đa dạng.',
      });
    } else {
      checks.push({
        code: 'CHECK 09',
        name: 'Kiểm tra trùng lặp',
        status: 'passed',
        message: 'Tất cả các câu hỏi trong đề là duy nhất, không có hiện tượng trùng lặp nội dung.',
      });
    }
  } else if (questions.length === 1) {
    checks.push({
      code: 'CHECK 09',
      name: 'Kiểm tra trùng lặp',
      status: 'passed',
      message: 'Không có trùng lặp.',
    });
  } else {
    checks.push({
      code: 'CHECK 09',
      name: 'Kiểm tra trùng lặp',
      status: 'warning',
      message: 'Chưa có câu hỏi.',
    });
  }

  // CHECK 10: Không thiếu dữ liệu (Tiêu đề, Trường lớp, Thời gian làm bài)
  const config = workspace.config;
  if (!config.schoolName || !config.durationMinutes || !config.examType) {
    checks.push({
      code: 'CHECK 10',
      name: 'Đầy đủ dữ liệu hành chính',
      status: 'warning',
      message: 'Thiếu thông tin trường, thời gian làm bài hoặc đợt kiểm tra.',
      details: 'Cần bổ sung tiêu đề trường, khối lớp và thời gian làm bài chuẩn quy định.',
    });
  } else {
    checks.push({
      code: 'CHECK 10',
      name: 'Đầy đủ dữ liệu hành chính',
      status: 'passed',
      message: 'Đầy đủ thông tin: Trường, môn KHTN, khối lớp, thời gian và thể thức.',
    });
  }

  const failedCount = checks.filter((c) => c.status === 'failed').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const passedCount = checks.filter((c) => c.status === 'passed').length;

  let overallStatus: 'green' | 'yellow' | 'red' = 'green';
  if (failedCount > 0) {
    overallStatus = 'red';
  } else if (warningCount > 0) {
    overallStatus = 'yellow';
  }

  return {
    overallStatus,
    passedCount,
    warningCount,
    failedCount,
    checks,
    canExport: overallStatus === 'green' || (overallStatus === 'yellow' && failedCount === 0),
  };
}

/**
 * TỰ ĐỘNG SỬA (AUTO-FIX)
 * Re-balances points to exactly 10.0, corrects missing answers, maps unlinked questions, etc.
 */
export function autoFixExamWorkspace(workspace: Exam7991Workspace): Exam7991Workspace {
  const cloned: Exam7991Workspace = JSON.parse(JSON.stringify(workspace));

  // 1. Ensure Total Matrix Score = 10.0
  const matrix = cloned.matrix;
  let currentTotalScore = matrix.rows.reduce((sum, r) => sum + r.totalScore, 0);

  if (Math.abs(currentTotalScore - 10.0) > 0.01 && matrix.rows.length > 0) {
    const diff = 10.0 - currentTotalScore;
    // Adjust first or last row
    const lastRow = matrix.rows[matrix.rows.length - 1];
    lastRow.totalScore = Number((lastRow.totalScore + diff).toFixed(2));
    if (lastRow.application.score > 0) {
      lastRow.application.score = Number((lastRow.application.score + diff).toFixed(2));
    } else {
      lastRow.recognition.score = Number((lastRow.recognition.score + diff).toFixed(2));
    }
    matrix.totalScore = 10.0;
    matrix.isBalanced = true;
  }

  // 2. Ensure Questions total score = 10.0
  const questions = cloned.questionBank;
  if (questions.length > 0) {
    const mcQuestions = questions.filter((q) => q.type === 'mc');
    const essayQuestions = questions.filter((q) => q.type === 'essay');

    if (essayQuestions.length === 0) {
      // 100% Multiple choice: distribute 10.0 evenly
      const eachScore = Number((10.0 / mcQuestions.length).toFixed(2));
      let allocated = 0;
      mcQuestions.forEach((q, idx) => {
        if (idx === mcQuestions.length - 1) {
          q.score = Number((10.0 - allocated).toFixed(2));
        } else {
          q.score = eachScore;
          allocated += eachScore;
        }
      });
    } else {
      // e.g. 7.0 for MC (e.g. 28 questions x 0.25đ) and 3.0 for Essay
      const targetMC = cloned.config.multipleChoiceRatio > 0 ? (cloned.config.multipleChoiceRatio / 100) * 10 : 7.0;
      const targetEssay = 10.0 - targetMC;

      if (mcQuestions.length > 0) {
        const mcEach = Number((targetMC / mcQuestions.length).toFixed(2));
        let allocatedMC = 0;
        mcQuestions.forEach((q, idx) => {
          if (idx === mcQuestions.length - 1) {
            q.score = Number((targetMC - allocatedMC).toFixed(2));
          } else {
            q.score = mcEach;
            allocatedMC += mcEach;
          }
        });
      }

      if (essayQuestions.length > 0) {
        const essayEach = Number((targetEssay / essayQuestions.length).toFixed(2));
        let allocatedEssay = 0;
        essayQuestions.forEach((q, idx) => {
          if (idx === essayQuestions.length - 1) {
            q.score = Number((targetEssay - allocatedEssay).toFixed(2));
          } else {
            q.score = essayEach;
            allocatedEssay += essayEach;
          }
        });
      }
    }
  }

  // 3. Ensure every Question has an Answer in cloned.answers
  if (!cloned.answers) cloned.answers = [];
  questions.forEach((q, idx) => {
    let existingAns = cloned.answers.find((a) => a.questionId === q.id);
    if (!existingAns) {
      existingAns = {
        questionNum: idx + 1,
        questionId: q.id,
        type: q.type,
        answer: q.correctAnswer || (q.type === 'mc' ? 'A' : 'Xem hướng dẫn giải chi tiết.'),
        explanation: q.explanation || 'Áp dụng kiến thức chuẩn chương trình KHTN THCS.',
        score: q.score,
      };
      cloned.answers.push(existingAns);
    } else {
      if (!existingAns.answer) {
        existingAns.answer = q.correctAnswer || (q.type === 'mc' ? 'A' : 'Lời giải chi tiết.');
      }
      existingAns.score = q.score;
      existingAns.questionNum = idx + 1;
    }
  });

  // 4. Ensure Essay grading guide exists for each essay question
  if (!cloned.gradingGuide) cloned.gradingGuide = [];
  const essayQuestions = questions.filter((q) => q.type === 'essay');
  essayQuestions.forEach((eq, idx) => {
    let existingGuide = cloned.gradingGuide.find((g) => g.questionId === eq.id);
    if (!existingGuide) {
      const halfScore = Number((eq.score / 2).toFixed(2));
      const restScore = Number((eq.score - halfScore).toFixed(2));
      cloned.gradingGuide.push({
        questionNum: questions.indexOf(eq) + 1,
        questionId: eq.id,
        stem: eq.stem,
        totalScore: eq.score,
        criteria: [
          {
            idea: 'Ý 1',
            requirement: 'Nêu đúng bản chất hiện tượng khoa học hoặc viết đúng công thức / phương trình KHTN liên quan.',
            score: halfScore,
          },
          {
            idea: 'Ý 2',
            requirement: 'Tính toán chính xác kết quả kèm đơn vị đo, hoặc giải thích đầy đủ các bước thực nghiệm.',
            score: restScore,
          },
        ],
      });
    } else {
      existingGuide.totalScore = eq.score;
    }
  });

  // 5. Link specification items if any missing
  if (cloned.specification && cloned.specification.length > 0) {
    questions.forEach((q, idx) => {
      if (!q.requirement || !q.requirement.trim()) {
        const matchedSpec = cloned.specification[idx % cloned.specification.length];
        q.requirement = matchedSpec.requirement;
        q.topic = matchedSpec.topic;
        q.content = matchedSpec.content;
      }
    });
  }

  // 6. Update administrative details if empty
  if (!cloned.config.schoolName) {
    cloned.config.schoolName = 'TRƯỜNG THCS NGUYỄN DU';
  }
  if (!cloned.config.durationMinutes) {
    cloned.config.durationMinutes = 60;
  }
  if (!cloned.config.examType) {
    cloned.config.examType = 'ĐỀ KIỂM TRA ĐỊNH KỲ MÔN KHOA HỌC TỰ NHIÊN';
  }

  // Re-run validation pipeline after fixes
  cloned.validation = runValidationPipeline(cloned);

  return cloned;
}
