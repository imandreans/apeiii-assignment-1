import { Pipeline } from "@anvia/core/pipeline";
import z from "zod";
import { convertPDFtoText } from "./convertPDFtoText";
import { askAI, compareCVtoJobDesc } from "./shared";

const pipelineInputSchema = z.object({
  cvFilePath: z.string().min(1),
  jobDesc: z.string().min(1),
});

const JOBDESC = `
Qualifications

Must have at least 1 years experience in Python programming
Preferably those who have experience in using one or several Python-based frameworks such as Django, Flask or others
Have experience in using and creating REST APIs
Have experience using one or more databases such as Postgresql, MongoDB, MySQL or others
Strong knowledge of SQL query
Have experience using front end technologies such as HTML, CSS and others
Have experience using source control such as GIT
Experience with agile development methodologies
Bachelor's or Diploma degree in Computer Engineering or related field
Strong problem-solving skills and attention to detail
Ability to work collaboratively in a team environment

Responsibilities

Involved in the process of developing software or systems using the Python programming language according to the specified specifications
Collaborate with tech team to design, develop, and maintain applications using Python
Troubleshoot applications, find bugs and offer timely solutions
Conducting developer testing and bug fixing`;

const myPipeline = new Pipeline({
  id: "my-pipeline",
  inputSchema: pipelineInputSchema,
})
  .step({
    id: "convert-PDF->Text",
    run: async (ctx) => {
      const result = await convertPDFtoText(ctx.input.cvFilePath);
      return {
        cv: result,
        jobDesc: ctx.input.jobDesc,
      };
    },
  })
  .step({
    id: "calculate-requirement-percentages",
    run: async (ctx) => {
      const prompt = `
<task>
  Help me to get the suitability percentage between my CV and the job description.
</task>
<scoring>
  - Fulfilled requirements [(%), (Min 80% to pass)]
- Overall Match [(%), (Min 80% to pass)] (Calculate the percentages from the fulfilled requirements)
</scoring>
<output-schema>
  - fitAssessment: Explain in detail with table format each requirements in Job Description with its own match percentages
- matchPercentage: Overall match percentage.
</output-schema>
<data>
  <job-description>
    ${ctx.input.jobDesc}
  </job-description>
  <cv>
    ${ctx.input.cv}
  </cv>
</data>`;
      const result = await compareCVtoJobDesc(prompt);
      return result;
    },
  })
  .step({
    id: "summary-feedback",
    run: async (ctx) => {
      const prompt = `
      <task>
      Based on the CV fit assessment below, provide summary of gaps, strength, and improvement that can be added to the CV.
      Make it in paragraph format or concise bullet points, not table. 
      </task>
      <match-percentage>
      ${ctx.input.output.matchPercentage}
      </match-percentage>
      <fit-assessment>
       ${ctx.input.output.fitAssessment}
      </fit-assessment>
       `;
      const result = await askAI(prompt);
      return {
        feedback: result,
      };
    },
  });

const result = await myPipeline.run({
  input: {
    cvFilePath: "src/dummy-cv.pdf",
    jobDesc: JOBDESC,
  },
});
console.log(result.output.feedback.output);
