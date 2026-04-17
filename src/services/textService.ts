import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function enhanceText(text: string, mode: 'emoji' | 'random'): Promise<string> {
  try {
    const prompt = mode === 'emoji' 
      ? `Add relevant emojis to this text while keeping the original meaning. Return ONLY the enhanced text: "${text}"`
      : `Rewrite this text in a random creative style (e.g., pirate, futuristic, formal, poetic, etc.). Return ONLY the rewritten text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
}

export function repeatText(text: string, count: number): string {
  if (count <= 0) return "";
  if (count === 1) return text;
  
  // Use chunking for very large counts to avoid memory issues
  // Though for simple string repetition, (text + '\n').repeat(count) is usually fine up to a point.
  // But for 1,000,000 repeats, we need to be careful.
  
  const line = text + '\n';
  
  // Safety check for total string size (approx 500MB limit for browser strings)
  const estimatedSize = line.length * count;
  if (estimatedSize > 500 * 1024 * 1024) {
    throw new Error("Output too large for browser memory. Try a smaller count.");
  }

  return line.repeat(count);
}
