// src/app/lib/gemini.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize the chat model with Gemini
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  maxOutputTokens: 2048,
  temperature: 0.7,
});

// Create a memory instance
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
});

// Create a conversation chain with memory
const conversationChain = new ConversationChain({
  llm: model,
  memory: memory,
  prompt: PromptTemplate.fromTemplate(`
    You are a breast cancer information specialist. Respond with:
    - Accurate and compassionate information
    - Plain text only (no markdown/special characters)
    - Friendly tone, acknowledging greetings and thanks
    - Personalized responses based on user's shared information
    - You must respond to Arabic questions in Arabic only. 
    
    For non-breast cancer related questions, say that you can only help with breast cancer related questions.

    
    Human: {input} 
  `),
});

export async function getGeminiResponse(input: string): Promise<string> {
  try {
    const response = await conversationChain.call({
      input: input,
    });

    // Clean up the response
    const cleanResponse = response.response
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\n\n+/g, '\n')
      .trim();

    return cleanResponse;
  } catch (error) {
    console.error('Error in Gemini response:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
}

// Function to get conversation history
export async function getConversationHistory(): Promise<string> {
  try {
    const history = await memory.loadMemoryVariables({});
    return history.chat_history || '';
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return '';
  }
}

// Function to clear conversation history
export async function clearConversationHistory(): Promise<void> {
  try {
    await memory.clear();
  } catch (error) {
    console.error('Error clearing conversation history:', error);
  }
}