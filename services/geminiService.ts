const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return origin.replace(':2528', ':2529');
  }
  return 'http://localhost:2529';
};

export const optimizePromptContent = async (currentContent: string): Promise<string> => {
  if (!currentContent.trim()) return "";

  const response = await fetch(`${getApiBaseUrl()}/api/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: currentContent }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Failed to optimize prompt');
  }

  const data = await response.json();
  return data.optimized;
};
