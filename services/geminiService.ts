import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const optimizePromptContent = async (currentContent: string): Promise<string> => {
  if (!currentContent.trim()) return "";

  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Prompt Engineer. 
      Please rewrite and optimize the following prompt to be more effective, clear, and structured for LLMs. 
      Retain the original intent but improve clarity, context, and robustness.
      Do not add markdown backticks around the output, just return the raw improved text.
      
      Original Prompt:
      ${currentContent}`,
      config: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      }
    });

    return response.text?.trim() || currentContent;
  } catch (error) {
    console.error("Gemini optimization failed:", error);
    throw error;
  }
};
