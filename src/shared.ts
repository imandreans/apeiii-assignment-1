import { OpenAIClient } from "@anvia/openai";
import { env } from "./env";
import { generateCompletion } from "@anvia/core";
import {
  HR_INSTRUCTION,
  MATH_TUTOR_INSTRUCTIONS,
  PROGRAMMING_TUTOR_INSTRUCTIONS,
} from "./instructions";
import z from "zod";

const client = new OpenAIClient({
  baseUrl: env.BASE_URL,
  apiKey: env.API_KEY,
});

const cvJobdescComparisonSchema = z.object({
  fitAssessment: z.string().min(1),
  matchPercentage: z.string().min(1),
});

// export function getModel(modelId?: string) {
//   return client.completionModel({});
// }

export async function askAI(prompt: string, modelId?: string) {
  const model = client.completionModel({
    modelId: modelId || "openai-gpt-oss-120b",
    api: "chat",
  });

  return await generateCompletion({
    model: model,
    instructions: HR_INSTRUCTION,
    prompt: prompt,
  });
}

export function getModel(modelId?: string) {
  return client.completionModel({
    modelId: modelId || "openai-gpt-oss-120b",
    api: "chat",
  });
}

export async function askAIMathTutor(inputPrompt: string, modelId?: string) {
  const model = client.completionModel({
    modelId: modelId || "openai-gpt-oss-120b",
    api: "chat",
  });

  return await generateCompletion({
    model: model,
    instructions: MATH_TUTOR_INSTRUCTIONS,
    prompt: inputPrompt,
  });
}

export async function askAIProgrammingTutor(
  inputPrompt: string,
  modelId?: string,
) {
  const model = client.completionModel({
    modelId: modelId || "openai-gpt-oss-120b",
    api: "chat",
  });

  return await generateCompletion({
    model: model,
    instructions: PROGRAMMING_TUTOR_INSTRUCTIONS,
    prompt: inputPrompt,
  });
}

export async function compareCVtoJobDesc(prompt: string, modelId?: string) {
  const model = client.completionModel({
    modelId: modelId || "openai-gpt-oss-120b",
    api: "chat",
  });

  return await generateCompletion({
    model: model,
    instructions: HR_INSTRUCTION,
    prompt: prompt,
    outputSchema: cvJobdescComparisonSchema,
  });
}
