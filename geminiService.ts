import { GoogleGenAI } from "@google/genai";

const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyDTDtjvXQ0c143oLuq5Y-T_AsBbd2MORRE"; // Replace with actual key or env var

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface MenuItem {
  title: string;
  ingredients: string[];
}

export const generateMenuImage = async (
  menuItem: MenuItem
): Promise<string | null> => {
  try {
    const prompt = `Generate a high-quality, appetizing photograph of ${
      menuItem.title
    } made with the following ingredients: ${menuItem.ingredients.join(
      ", "
    )}. The image should look professional and delicious, suitable for a restaurant menu.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    // Assuming the response contains image data
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (imagePart?.inlineData) {
      const base64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${base64}`;
    }

    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
