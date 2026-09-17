import { TranslationHistoryItem, TranslationMode } from '../types';

const STORAGE_KEY = 'isyaratkita_translation_history';
const MAX_HISTORY_ITEMS = 30;

export function getSavedHistory(): TranslationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse translation history:', err);
    return [];
  }
}

export function saveHistoryItem(
  sourceText: string,
  translatedResult: string,
  mode: TranslationMode
): TranslationHistoryItem[] {
  if (!sourceText.trim() && !translatedResult.trim()) {
    return getSavedHistory();
  }

  const newItem: TranslationHistoryItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    sourceText: sourceText.trim(),
    translatedResult: translatedResult.trim(),
    mode
  };

  try {
    const current = getSavedHistory();
    // Avoid duplicate adjacent logs
    if (current.length > 0 && current[0].sourceText === newItem.sourceText && current[0].mode === mode) {
      return current;
    }
    const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save translation history:', err);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
