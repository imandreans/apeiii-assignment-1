import { Pipeline } from "@anvia/core/pipeline";
import z from "zod";
import { generateCompletion } from "@anvia/core";
import { askAIMathTutor, askAIProgrammingTutor, getModel } from "./shared";

const Intent = z.object({
  intent: z.enum(["programming", "mathematics", "others"]),
});
const Message = z.object({ message: z.string() });

const router = new Pipeline({
  id: "tutor-router",
  inputSchema: Message,
})
  .step({
    id: "classify",
    run: async ({ input }) => {
      const result = await generateCompletion({
        instructions:
          "Given available intents (programming, mathematics, and others), classify the intent",
        prompt: input.message,
        model: getModel(),
        outputSchema: Intent,
      });
      return { message: input.message, intent: result.output.intent };
    },
  })
  .step({
    id: "reply",
    run: async ({ input }) => {
      console.log("The intention is ", input.intent);
      let reply;
      if (input.intent == "mathematics") {
        reply = await askAIMathTutor(input.message);
      } else if (input.intent == "programming") {
        reply = await askAIProgrammingTutor(input.message);
      } else {
        reply = "No tutor for that question or topic";
      }
      return reply;
    },
  });

const result = await router.run({
  input: {
    message: "What's your mom's name?",
  },
  //   observer: {
  //     onEvent: (event) => console.log(event.type, event.node.id),
  //   },
});

console.log(result.output);
// console.log(router.graph().nodes.map((node) => node.id));
