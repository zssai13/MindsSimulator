'use client';

import { DataType } from '@/store/buildStore';
import { RagType } from '@/lib/vectorstore/chunk';
import { RagStatus } from '@/store/ragStore';
import { ChatMessage } from '@/store/chatStore';

// Storage key for saves list
const SAVES_LIST_KEY = 'repsimulator_saves';

// Schema for saved state
export interface SavedState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  // Build store state (Tab 1)
  build: {
    cleanedData: Record<DataType, string | null>;
    templateRules: string;
    userRules: string;
    extractedSections: Record<string, string>;
    systemPrompt: string;
  };

  // RAG store state (Tab 2 - vector status)
  rag: {
    files: Record<RagType, string | null>;
    status: Record<RagType, RagStatus>;
    chunkCounts: Record<RagType, number>;
  };

  // Chat store state (Tab 2 - chat)
  chat: {
    systemPrompt: string;
    pageUrl: string;
    additionalContext: string;
    initialEmail: string;
    messages: ChatMessage[];
  };
}

// Metadata for save list (without full state data)
export interface SaveMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Generate unique ID for saves
const generateSaveId = () => `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get list of all saves (metadata only)
export function getSavesList(): SaveMetadata[] {
  if (typeof window === 'undefined') return [];

  try {
    const list = localStorage.getItem(SAVES_LIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error reading saves list:', error);
    return [];
  }
}

// Save state to localStorage
export function saveState(name: string, state: Omit<SavedState, 'id' | 'name' | 'createdAt' | 'updatedAt'>): SavedState {
  const id = generateSaveId();
  const now = Date.now();

  const savedState: SavedState = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    ...state,
  };

  // Save the full state
  localStorage.setItem(`repsimulator_state_${id}`, JSON.stringify(savedState));

  // Update saves list
  const list = getSavesList();
  list.unshift({ id, name, createdAt: now, updatedAt: now });
  localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(list));

  return savedState;
}

// Load state from localStorage
export function loadState(id: string): SavedState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stateStr = localStorage.getItem(`repsimulator_state_${id}`);
    return stateStr ? JSON.parse(stateStr) : null;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
}

// Delete a saved state
export function deleteState(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Remove the state data
    localStorage.removeItem(`repsimulator_state_${id}`);

    // Update saves list
    const list = getSavesList();
    const filtered = list.filter((s) => s.id !== id);
    localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(filtered));

    return true;
  } catch (error) {
    console.error('Error deleting state:', error);
    return false;
  }
}

// Update an existing save
export function updateState(id: string, name: string, state: Omit<SavedState, 'id' | 'name' | 'createdAt' | 'updatedAt'>): SavedState | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = loadState(id);
    if (!existing) return null;

    const now = Date.now();
    const updatedState: SavedState = {
      id,
      name,
      createdAt: existing.createdAt,
      updatedAt: now,
      ...state,
    };

    // Save updated state
    localStorage.setItem(`repsimulator_state_${id}`, JSON.stringify(updatedState));

    // Update saves list
    const list = getSavesList();
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx] = { id, name, createdAt: existing.createdAt, updatedAt: now };
      localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(list));
    }

    return updatedState;
  } catch (error) {
    console.error('Error updating state:', error);
    return null;
  }
}

// Format date for display
export function formatSaveDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
