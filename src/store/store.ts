import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProgressMetric = {
  date: string;
  tone: number;
  confidence: number;
  fluency: number;
};

export type Recording = {
  id: string;
  prompt: string;
  audioUrl: string;
  isPublic: boolean;
  date: string;
  reflection?: string;
  metrics?: {
    tone: number;
    confidence: number;
    fluency: number;
  };
  feedback?: Array<{
    id: string;
    userId: string;
    username: string;
    content: string;
    tips?: string;
    createdAt: string;
  }>;
};

export type User = {
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
  type: 'default' | 'success' | 'error';
};

type State = {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  
  // App data
  recordings: Recording[];
  dailyPrompt: string;
  progressData: ProgressMetric[];
  activityData: { date: string; count: number }[];
  
  // UI state
  toasts: Toast[];
  isRecording: boolean;
  currentAudioBlob: Blob | null;
  
  // Actions
  login: (email: string, password: string) => void;
  logout: () => void;
  addRecording: (recording: Omit<Recording, 'id'>) => void;
  updateRecording: (id: string, data: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentAudioBlob: (blob: Blob | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
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
  "Describe a challenge you've overcome and how it changed you."
];

// Get random prompt from the array
const getRandomPrompt = () => mockPrompts[Math.floor(Math.random() * mockPrompts.length)];

export const useStore = create<State>()(
  persist(
    (set) => ({
      // Auth state
      isAuthenticated: false,
      user: null,
      
      // App data
      recordings: [],
      dailyPrompt: getRandomPrompt(),
      progressData: [],
      activityData: [],
      
      // UI state
      toasts: [],
      isRecording: false,
      currentAudioBlob: null,
      
      // Actions
      login: (email, password) => {
        // Mock login functionality
        set({
          isAuthenticated: true,
          user: {
            id: '1',
            username: email.split('@')[0],
            email,
            joinedDate: new Date().toISOString(),
            streakCount: 0,
            lastActive: new Date().toISOString(),
          },
        });
      },
      
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
      
      addRecording: (recording) => {
        const newRecording = {
          ...recording,
          id: crypto.randomUUID(),
        };
        
        set((state) => ({
          recordings: [...state.recordings, newRecording],
          dailyPrompt: getRandomPrompt(),
          activityData: [
            ...state.activityData,
            { date: new Date().toISOString().split('T')[0], count: 1 }
          ]
        }));
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
          recordings: state.recordings.filter((recording) => recording.id !== id),
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
    }),
    {
      name: 'voicebloom-storage',
    }
  )
);