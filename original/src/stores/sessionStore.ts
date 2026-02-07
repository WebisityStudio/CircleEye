import { create } from 'zustand';
import type {
  LiveSessionState,
  SessionFinding,
  SessionLocation,
} from '../types/session';

interface SessionStore extends LiveSessionState {
  // Actions
  startSession: (sessionId: string, siteName: string, location: SessionLocation) => void;
  endSession: () => void;
  setConnectedToAI: (connected: boolean) => void;
  addFinding: (finding: SessionFinding) => void;
  setLastAIMessage: (message: string) => void;
  setError: (error: string | null) => void;
  updateElapsedTime: (seconds: number) => void;
  reset: () => void;
}

const initialState: LiveSessionState = {
  isActive: false,
  sessionId: null,
  siteName: null,
  location: null,
  startTime: null,
  elapsedSeconds: 0,
  findings: [],
  isConnectedToAI: false,
  lastAIMessage: null,
  error: null,
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  startSession: (sessionId, siteName, location) =>
    set({
      isActive: true,
      sessionId,
      siteName,
      location,
      startTime: new Date(),
      elapsedSeconds: 0,
      findings: [],
      error: null,
    }),

  endSession: () =>
    set({
      isActive: false,
    }),

  setConnectedToAI: (connected) =>
    set({
      isConnectedToAI: connected,
    }),

  addFinding: (finding) =>
    set((state) => ({
      findings: [...state.findings, finding],
    })),

  setLastAIMessage: (message) =>
    set({
      lastAIMessage: message,
    }),

  setError: (error) =>
    set({
      error,
    }),

  updateElapsedTime: (seconds) =>
    set({
      elapsedSeconds: seconds,
    }),

  reset: () => set(initialState),
}));
