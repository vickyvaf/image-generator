import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";

/**
 * Generates an image based on a prompt and saves it to a file.
 * @param {string} prompt - The text prompt for image generation.
 * @param {string} outputPath - The file path to save the generated image.
 * @param {string} apiKey - Optional API key. Defaults to process.env.GOOGLE_API_KEY.
 * @returns {Promise<void>}
 */
export async function generateImage(
  prompt,
  outputPath = "output-image.png",
  apiKey = process.env.GOOGLE_API_KEY,
) {
  if (!apiKey) {
    throw new Error(
      "Missing Google API Key. Please set GOOGLE_API_KEY in your environment.",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" }); // Correct model for image generation in this API

  const response = await model.generateContent(prompt);

  for (const part of response.response.candidates[0].content.parts) {
    if (part.text) {
      console.log("Text response:", part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image saved as ${outputPath}`);
    }
  }
}

if (import.meta.main) {
  const prompt =
    process.argv[2] ||
    "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";
  generateImage(prompt).catch(console.error);
}
