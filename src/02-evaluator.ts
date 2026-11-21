import { Pipeline } from "@anvia/core/pipeline";
import z from "zod";
import { askAI, getModel } from "./shared";
import { generateCompletion } from "@anvia/core";

const OriginalText = z.object({ text: z.string() });
const Evaluation = z.object({ passed: z.boolean(), feedback: z.string() });

const translationPipeline = new Pipeline({
  id: "translation",
  inputSchema: OriginalText,
})
  .step({
    id: "translate",
    run: async ({ input }) => {
      const result = await generateCompletion({
        instructions:
          "You are Indonesian people with English Interpreter experience in 10 years. Your job is to translate english text to Indonesia language. Reject any form of language besides English Text",
        prompt: input.text,
        model: getModel(),
      });
      return { originalText: input.text, translatedText: result.output };
    },
  })
  .step({
    id: "evaluate",
    run: async ({ input }) => {
      const result = await generateCompletion({
        instructions:
          "Review how accurate these translations with its orginal text in short",
        prompt: `Original Text: ${input.originalText} and the Translation: ${input.translatedText}`,
        model: getModel("gemma-4-31b"),
        outputSchema: Evaluation,
      });
      return { input, ...result.output };
    },
  })
  .step({
    id: "revise",
    run: async ({ input }) => {
      const prompt = `Revise the translated text below:
                      - translated text: ${input.input.translatedText}
                      - Based on this feedback: ${input.feedback}`;
      if (!input.passed) {
        return (await askAI(prompt, "gpt-5.6-luna")).output;
      }
      return input.input;
    },
  });

const result = await translationPipeline.run({
  input: {
    text: "How are you today",
  },
});

console.log(result.output);
