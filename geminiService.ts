import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface MenuItem {
  title: string;
  ingredients: string[];
}

export const generateMenuImage = async (
  menuItem: MenuItem
): Promise<string | null> => {
  try {
    const prompt = `Generate a high-quality, appetizing photograph of ${menuItem.title}", "
    )}. The image should look professional and delicious, suitable for a restaurant menu.`;

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "4:3",
      },
    });

    if (response?.generatedImages?.[0]?.image?.imageBytes) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
