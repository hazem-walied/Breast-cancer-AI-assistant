import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Create specialized chains for different types of breast cancer queries
export const createSpecializedChain = (type: 'diagnosis' | 'treatment' | 'prevention') => {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    maxOutputTokens: 2048,
  });

  const templates = {
    diagnosis: PromptTemplate.fromTemplate(`
      Focus on breast cancer diagnosis information:
      - Early detection signs
      - Diagnostic procedures
      - What to expect during screening
      
      Query: {query}
    `),
    treatment: PromptTemplate.fromTemplate(`
      Focus on breast cancer treatment information:
      - Treatment options
      - Side effects
      - Recovery process
      
      Query: {query}
    `),
    prevention: PromptTemplate.fromTemplate(`
      Focus on breast cancer prevention information:
      - Risk factors
      - Lifestyle changes
      - Preventive measures
      
      Query: {query}
    `),
  };

  return RunnableSequence.from([
    {
      query: (input: string) => input,
    },
    templates[type],
    model,
    new StringOutputParser(),
  ]);
};