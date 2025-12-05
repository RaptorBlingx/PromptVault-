import { Prompt } from '../types';

const STORAGE_KEY = 'promptvault_data_v1';

export const savePrompts = (prompts: Prompt[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Failed to save prompts', error);
  }
};

export const loadPrompts = (): Prompt[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load prompts', error);
    return [];
  }
};
