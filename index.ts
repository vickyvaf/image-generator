import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";

/**
 * Generates an image based on a prompt and saves it to a file.
 * @param prompt - The text prompt for image generation.
 * @param outputPath - The file path to save the generated image.
 * @param apiKey - Optional API key. Defaults to process.env.GOOGLE_API_KEY.
 */
export async function generateImage(
  prompt: string,
  outputPath: string = "output-image.png",
  apiKey: string | undefined = process.env.GOOGLE_API_KEY,
): Promise<void> {
  if (!apiKey) {
    throw new Error(
      "Missing Google API Key. Please set GOOGLE_API_KEY in your environment.",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "nano-banana-pro-preview" }); // Correct model for image generation in this API

  const response = await model.generateContent(prompt);

  const candidates = response.response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No candidates returned from generative model.");
  }

  const content = candidates[0]?.content;
  if (!content || !content.parts) {
    throw new Error("No content parts found in candidate.");
  }

  for (const part of content.parts) {
    if ("text" in part && part.text) {
      console.log("Text response:", part.text);
    } else if ("inlineData" in part && part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image saved as ${outputPath}`);
    }
  }
}

// Bun Server
if (import.meta.main) {
  const apiKey = process.env.GOOGLE_API_KEY;

  const server = Bun.serve({
    port: 3000,
    async fetch(req: Request) {
      const url = new URL(req.url);

      if (url.pathname === "/") {
        return new Response(Bun.file("index.html"), {
          headers: { "Content-Type": "text/html" },
        });
      }

      if (url.pathname === "/style.css") {
        return new Response(Bun.file("style.css"), {
          headers: { "Content-Type": "text/css" },
        });
      }

      if (url.pathname === "/api/generate" && req.method === "POST") {
        try {
          const body = (await req.json()) as { prompt?: string };
          const prompt = body.prompt;

          if (!prompt) {
            return new Response(
              JSON.stringify({ error: "Prompt is required" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          if (!apiKey) {
            return new Response(JSON.stringify({ error: "API Key missing" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          let imageData: string | undefined;
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "nano-banana-pro-preview",
          });

          const response = await model.generateContent(prompt);
          const candidates = response.response.candidates;

          if (candidates && candidates.length > 0) {
            const parts = candidates[0]?.content.parts;
            if (parts) {
              for (const part of parts) {
                if ("inlineData" in part && part.inlineData) {
                  imageData = part.inlineData.data;
                }
              }
            }
          }

          if (imageData) {
            return new Response(JSON.stringify({ image: imageData }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ error: "No image generated" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`Server running at http://localhost:${server.port}`);
}
