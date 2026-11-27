import { create } from "zustand";
import type { ContentMode } from "@/types/curriculum";

interface LessonState {
  unitId: string | null;
  contentMode: ContentMode;
  setUnit: (unitId: string) => void;
  setContentMode: (mode: ContentMode) => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  unitId: null,
  contentMode: "visual",
  setUnit: (unitId) => set({ unitId }),
  setContentMode: (contentMode) => set({ contentMode }),
}));

interface QuizState {
  selectedOptionId: string | null;
  confidence: "guessing" | "fairly_sure" | "certain" | null;
  questionStartedAt: number | null;
  setSelection: (optionId: string | null) => void;
  setConfidence: (confidence: "guessing" | "fairly_sure" | "certain" | null) => void;
  markQuestionShown: () => void;
  resetQuestion: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  selectedOptionId: null,
  confidence: null,
  questionStartedAt: null,
  setSelection: (selectedOptionId) => set({ selectedOptionId }),
  setConfidence: (confidence) => set({ confidence }),
  markQuestionShown: () => set({ questionStartedAt: Date.now() }),
  resetQuestion: () =>
    set({ selectedOptionId: null, confidence: null, questionStartedAt: Date.now() }),
}));

interface PdfState {
  currentPage: number;
  zoom: number;
  sidebarVisible: boolean;
  setPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  toggleSidebar: () => void;
}

export const usePdfStore = create<PdfState>((set) => ({
  currentPage: 1,
  zoom: 1,
  sidebarVisible: true,
  setPage: (currentPage) => set({ currentPage }),
  setZoom: (zoom) => set({ zoom }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
}));
