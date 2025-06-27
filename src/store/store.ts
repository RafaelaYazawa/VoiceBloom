import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../utils/supabaseClient";

export type ProgressMetric = {
  date: string;
  tone: number;
  confidence: number;
  fluency: number;
};

export enum Visibility {
  PRIVATE = "private",
  PUBLIC = "public",
  ANONYMOUS = "anonymous",
}

export type Metrics = {
  confidence: number;
  fluency: number;
  tone: number;
};
export type RecordingsUpdateData = {
  title: string;
  reflection?: string;
  metrics?: Metrics;
};

export type CommentTypeString = "general" | "encouragement" | "tips";

export type Feedback = {
  id: string;
  user_id: string;
  comment_type: CommentTypeString;
  comment: string;
  created_at: string;
  profile?: {
    email: string;
    username: string;
  } | null;
};

export type Recording = {
  id: string;
  user_id: string;
  email?: string;
  username?: string;
  prompt: string;
  audio_url: string;
  visibility: Visibility;
  created_at: string;
  reflection?: string;
  title: string;
  metrics?: Metrics;
  feedback?: Feedback[];
  audioUrl?: string | null;
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  joinedDate: string;
  streakCount: number;
  lastActive: string;
};

type Toast = {
  id: string;
  title: string;
  description?: string;
  type: "default" | "success" | "error" | "info";
};

type State = {
  // App data
  recordings: Recording[];
  dailyPrompt: string;
  lastPromptDate: string;
  progressData: ProgressMetric[];
  activityData: { date: string; count: number }[];

  // UI state
  toasts: Toast[];
  isRecording: boolean;
  currentAudioBlob: Blob | null;

  // Actions
  updateRecording: (id: string, data: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentAudioBlob: (blob: Blob | null) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setRecordings: (recordings: Recording[]) => void;
  setDailyPrompt: (prompt: string, date: string) => void;
  refreshDailyPrompt: () => void;
};

// Mock data for demo purposes
const mockPrompts = [
  "What's your favorite place you've ever visited and why?",
  "If you could have dinner with anyone, living or dead, who would it be and why?",
  "Describe the most beautiful thing you've ever seen.",
  "What's a skill you'd like to learn and why?",
  "Describe a perfect day from morning to night.",
  "What's a book or movie that changed your perspective?",
  "If you could live anywhere in the world, where would it be?",
  "What's a small everyday thing that brings you joy?",
  "What advice would you give to your younger self?",
  "Describe a challenge you've overcome and how it changed you.",
];

// Get random prompt from the array
const getRandomPrompt = () =>
  mockPrompts[Math.floor(Math.random() * mockPrompts.length)];

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const useStore = create<State>()(
  persist(
    (set) => ({
      // App data
      recordings: [],
      dailyPrompt: getRandomPrompt(),
      lastPromptDate: getTodayDate(),
      progressData: [],
      activityData: [],

      // UI state
      toasts: [],
      isRecording: false,
      currentAudioBlob: null,

      // Actions
      setRecordings: (recordings) => {
        set({ recordings });
      },

      updateRecording: (id, data) => {
        set((state) => ({
          recordings: state.recordings.map((recording) =>
            recording.id === id ? { ...recording, ...data } : recording
          ),
        }));
      },

      deleteRecording: (id) => {
        set((state) => ({
          recordings: state.recordings.filter(
            (recording) => recording.id !== id
          ),
        }));
      },

      setIsRecording: (isRecording) => {
        set({ isRecording });
      },

      setCurrentAudioBlob: (blob) => {
        set({ currentAudioBlob: blob });
      },

      addToast: (toast) => {
        const id = crypto.randomUUID();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto remove toast after 5 seconds
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      setDailyPrompt: (prompt, date) => {
        set({ dailyPrompt: prompt, lastPromptDate: date });
      },

      refreshDailyPrompt: () => {
        const today = getTodayDate();
        set((state) => {
          if (state.lastPromptDate !== today) {
            return {
              dailyPrompt: getRandomPrompt(),
              lastPromptDate: today,
            };
          }
          return {};
        });
      },
    }),
    {
      name: "voicebloom-storage",
    }
  )
);
