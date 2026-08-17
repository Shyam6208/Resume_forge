import { create } from "zustand";
import type { 
  InterviewPrepResult, 
  InterviewQuestion, 
  AnswerEvaluation, 
  InterviewAnswer, 
  ReadinessReportResult 
} from "@/lib/ai/types";

export type InterviewPhase =
  | "setup"
  | "generating_prep"
  | "reviewing_prep"
  | "mock_active"
  | "evaluating_answer"
  | "feedback"
  | "next_question"
  | "mock_complete"
  | "readiness_report";

interface InterviewState {
  phase: InterviewPhase;
  prepResult: InterviewPrepResult | null;
  questions: InterviewQuestion[];
  answers: Record<string, InterviewAnswer>;
  selectedQuestion: InterviewQuestion | null;
  currentQuestionIndex: number;
  currentUserAnswer: string;
  currentEvaluation: AnswerEvaluation | null;
  readinessReport: ReadinessReportResult | null;
  isGenerating: boolean;
  error: string | null;
  selectedCategories: string[];

  setPhase: (phase: InterviewPhase) => void;
  setPrepResult: (result: InterviewPrepResult | null) => void;
  setQuestions: (questions: InterviewQuestion[]) => void;
  setAnswer: (questionId: string, answer: InterviewAnswer) => void;
  setSelectedQuestion: (question: InterviewQuestion | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentUserAnswer: (answer: string) => void;
  setCurrentEvaluation: (evaluation: AnswerEvaluation | null) => void;
  setReadinessReport: (report: ReadinessReportResult | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedCategories: (categories: string[]) => void;
  skipCurrentQuestion: (questionId: string) => void;
  resetInterview: () => void;
}

const initialState = {
  phase: "setup" as InterviewPhase,
  prepResult: null,
  questions: [],
  answers: {},
  selectedQuestion: null,
  currentQuestionIndex: 0,
  currentUserAnswer: "",
  currentEvaluation: null,
  readinessReport: null,
  isGenerating: false,
  error: null,
  selectedCategories: ["Technical", "Resume", "JobDescription", "ProjectDeepDive"],
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setPrepResult: (prepResult) => set({ prepResult }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (questionId, answer) => 
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  setSelectedQuestion: (selectedQuestion) => set({ selectedQuestion }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setCurrentUserAnswer: (currentUserAnswer) => set({ currentUserAnswer }),
  setCurrentEvaluation: (currentEvaluation) => set({ currentEvaluation }),
  setReadinessReport: (readinessReport) => set({ readinessReport }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
  skipCurrentQuestion: (questionId) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          questionId,
          userAnswer: "",
          evaluation: null,
          skipped: true,
        },
      },
    }));
  },
  resetInterview: () => set(initialState),
}));
