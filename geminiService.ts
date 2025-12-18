
import { GoogleGenAI, Type } from "@google/genai";

// Initialize GoogleGenAI with the API key from process.env as per mandatory guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateGameImage = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Generate a clear, high-quality educational image of: ${prompt}. The image should be centered and easy to identify once revealed.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through response parts to locate the inlineData for the generated image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const getHint = async (imageB64: string, revealedPercentage: number): Promise<string> => {
  const ai = getAI();
  const base64Data = imageB64.split(',')[1];
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/png' } },
          { text: `The user is playing a reveal game. Only ${revealedPercentage}% of this image is visible. Provide a subtle, cryptic hint that encourages them to guess what it is without explicitly naming it. Keep it under 20 words.` }
        ]
      }
    });
    // Use the .text property to extract the generated string output directly
    return response.text || "Keep looking closely at the revealed patterns!";
  } catch (error) {
    console.error("Error getting hint:", error);
    return "The secret is hidden beneath the tiles...";
  }
};
