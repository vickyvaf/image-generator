import { expect, test, mock, spyOn } from "bun:test";
import { generateImage } from "./index.js";
import * as fs from "node:fs";

// Mock @google/genai
mock.module("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      constructor(apiKey) {
        this.apiKey = apiKey;
      }
      getGenerativeModel() {
        return {
          generateContent: async (prompt) => {
            return {
              response: {
                candidates: [
                  {
                    content: {
                      parts: [{ inlineData: { data: "YXplcnR5dWlvcA==" } }],
                    },
                  },
                ],
              },
            };
          },
        };
      }
    },
  };
});

test("generateImage saves an image file", async () => {
  const outputPath = "test-output.png";
  const writeFileSyncSpy = spyOn(fs, "writeFileSync").mockImplementation(
    () => {},
  );

  await generateImage("test prompt", outputPath, "fake-api-key");

  expect(writeFileSyncSpy).toHaveBeenCalled();
  const [path, buffer] = writeFileSyncSpy.mock.calls[0];
  expect(path).toBe(outputPath);
  expect(buffer.toString("base64")).toBe("YXplcnR5dWlvcA==");

  writeFileSyncSpy.mockRestore();
});

test("generateImage throws error without API key", async () => {
  await expect(generateImage("prompt", "out.png", null)).rejects.toThrow(
    "Missing Google API Key",
  );
});
