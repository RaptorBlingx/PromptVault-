// ============================================
// PromptVault Shared - Variable Utilities
// ============================================

import { PromptVariable } from './types';

/**
 * Extract variables from prompt content.
 * Matches {{variableName}} or {{variableName:defaultValue}}
 */
export function extractVariables(content: string): PromptVariable[] {
  const regex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g;
  const variables: PromptVariable[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        defaultValue: match[2]?.trim(),
      });
    }
  }

  return variables;
}

/**
 * Replace variables in content with provided values.
 */
export function replaceVariables(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(/\{\{([^}:]+)(?::[^}]*)?\}\}/g, (_, name) => {
    const trimmedName = name.trim();
    return values[trimmedName] ?? `{{${trimmedName}}}`;
  });
}

/**
 * Check if content contains any variables.
 */
export function hasVariables(content: string): boolean {
  return /\{\{[^}]+\}\}/.test(content);
}
