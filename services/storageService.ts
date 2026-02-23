import { Session } from '../types';

const SESSIONS_KEY = 'obsidian_chat_sessions';

export const saveSessions = (sessions: Session[]): void => {
  try {
    const data = JSON.stringify(sessions);
    localStorage.setItem(SESSIONS_KEY, data);
  } catch (error) {
    console.error("Failed to save sessions to localStorage", error);
  }
};

export const loadSessions = (): Session[] => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (data) {
      // Add basic validation if needed in the future
      return JSON.parse(data) as Session[];
    }
  } catch (error) {
    console.error("Failed to load sessions from localStorage", error);
  }
  return [];
};
