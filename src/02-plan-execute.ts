import { Pipeline } from "@anvia/core/pipeline";
import z from "zod";
import { askAIMathTutor, getModel } from "./shared";
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
    run: async ({ input }) =>
      input.passed
        ? input
        : (
            await generateCompletion({
              prompt: `Revise the translated text below:
                        translated text: ${input.input.translatedText}
                        Based on this feedback:
                        ${input.feedback}`,
              model: getModel(),
            })
          ).text,
  });

const result = await translationPipeline.run({
  input: {
    text: "I love your unhinged smell",
  },
});

console.log(result.output);
