

const example_object = {
  overview:
    "The code snippet initializes the OpenAI client correctly but has a hardcoded API key which is a security risk. The prompt for the LLM is basic and could be more detailed.",
  line_reviews: [
    {
      line: 4,
      review:
        "Hardcoding API keys is insecure. Consider using environment variables or a secrets management solution.",
      review_type: "issue",
      reviewed_line: "const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });",
    },
    {
      line: 16,
      review:
        "The code to be reviewed should be included directly in the prompt content for the LLM.",
      review_type: "suggestion",
      reviewed_line: "const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });",
    },
  ],
  udiff: "SOME_UDIFF",
};


export function buildFinalPrompt(prompt, code) {
    return `
  Following this request "${prompt}",
Respond with valid JSON only. Do NOT wrap your response in markdown code blocks.

Use the following structure as a reference:
\`\`\`json
${JSON.stringify(example_object, null, 2)}
\`\`\`

Now, apply your review to the following user prompt:
"${code}"
`;
}


export function buildFinalPromptCompare(prompt, oldCode, newCode) {
    return `
  Following this request "${prompt}",
Respond with valid JSON only. Do NOT wrap your response in markdown code blocks.

Use the following structure as a reference:
\`\`\`json
${JSON.stringify(example_object, null, 2)}
\`\`\`

Now, apply your review to the following user prompts:
Old Code: "${oldCode}"
New Code: "${newCode}"
`;
}
