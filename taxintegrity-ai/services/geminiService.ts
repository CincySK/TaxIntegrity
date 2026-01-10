
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Source } from "../types";

const MODEL_NAME = 'gemini-2.0-flash';

// API key is injected at build time by Vite
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Internal database derived from provided GAO Report
export const INTERNAL_KNOWLEDGE_BASE: Source[] = [
  {
    id: "gao-24-106449",
    fileName: "GAO-IRS-Tax-Gap-AI-Report.txt",
    content: `
      TITLE: Artificial Intelligence May Help IRS Close the Tax Gap (June 06, 2024)
      SUMMARY: Hundreds of billions of dollars (the "tax gap") are missing each year. The tax gap is the difference between what is owed and what is paid.
      STATS: 2014-2016 estimate: $496 billion/year. 2021 Projection: $688 billion.
      AI APPLICATIONS:
      1. Annual Audits: AI helps select representative samples and identify returns likely to have errors or additional taxes owed.
      2. Refundable Credits: New AI models identify risky taxpayers claiming credits like the Earned Income Tax Credit more effectively than previous models.
      3. Partnership Audits: Large partnerships increased by 600% (2002-2019). IRS uses two AI models to prioritize these complex returns for audit.
      RECOMMENDATIONS: GAO recommends better documentation for transparency and addressing design weaknesses in partnership models to objectively identify high-risk returns.
    `,
    relevanceScore: 1.0
  }
];

export class GeminiService {
  private constructPrompt(query: string): string {
    const sourceContext = `\nVERIFIED ARTICLES:\n${INTERNAL_KNOWLEDGE_BASE.map(s => `[SOURCE: ${s.fileName}] ${s.content}`).join('\n---\n')}`;

    return `
      You are the "TaxIntegrity Internal Auditor AI".
      
      STRICT OPERATING RULE: You ONLY provide responses based on the "VERIFIED ARTICLES" provided below. 
      If a user asks a question that cannot be answered using ONLY the provided text, respond with: 
      "I am restricted to verified integrity documents. The provided evidence does not contain information to answer this query."

      VERIFIED ARTICLES:
      ${sourceContext}

      USER QUERY:
      "${query}"

      RESPONSE PROTOCOL:
      1. Reference specific statistics (e.g., the $688 billion projection for 2021).
      2. Mention specific AI applications (Audits, Credits, Partnerships).
      3. Maintain a formal, analytical tone.
      4. Use Markdown formatting.
    `;
  }

  async getChatResponse(query: string, history: Message[]): Promise<GenerateContentResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured. Please set VITE_GEMINI_API_KEY in .env file.');
    }
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = this.constructPrompt(query);
    
    const contents = history
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }]
      }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        temperature: 0.1, // Near-zero temperature for maximum factual consistency
        systemInstruction: "You are a restricted RAG AI. Never hallucinate. Only use provided document context. If the answer isn't in the context, say you don't know."
      }
    });

    return response;
  }
}

export const geminiService = new GeminiService();
