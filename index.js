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

// Bun Server
if (import.meta.main) {
  const server = Bun.serve({
    port: 3000,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/") {
        return new Response(Bun.file("index.html"), {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (url.pathname === "/api/generate" && req.method === "POST") {
        try {
          const { prompt } = await req.json();
          const outputPath = `output-${Date.now()}.png`;

          let imageData;
          const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
          const model = genAI.getGenerativeModel({
            model: "nano-banana-pro-preview",
          });

          const response = await model.generateContent(prompt);
          for (const part of response.response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageData = part.inlineData.data;
            }
          }

          if (imageData) {
            return new Response(JSON.stringify({ image: imageData }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ error: "No image generated" }), {
            status: 500,
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
          });
        }
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`Server running at http://localhost:${server.port}`);
}
