import { expect, test, mock, spyOn } from "bun:test";
import { generateImage } from "./index";
import * as fs from "node:fs";

// Mock @google/genai
mock.module("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      apiKey: string;
      constructor(apiKey: string) {
        this.apiKey = apiKey;
      }
      getGenerativeModel() {
        return {
          generateContent: async (_prompt: string) => {
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
  const [path, buffer] = writeFileSyncSpy.mock.calls[0] as [string, Buffer];
  expect(path).toBe(outputPath);
  expect(buffer.toString("base64")).toBe("YXplcnR5dWlvcA==");

  writeFileSyncSpy.mockRestore();
});

test("generateImage throws error without API key", async () => {
  await expect(generateImage("prompt", "out.png", "")).rejects.toThrow(
    "Missing Google API Key",
  );
});
