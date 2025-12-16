import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Invoice } from "../types";

// NOTE: In a real app, never expose API keys on the client side.
// This is a demo environment where process.env.API_KEY is assumed to be safe/injected.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

export const generateSmartInvoiceItems = async (promptText: string) => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Extract invoice line items from this description: "${promptText}". 
      Return a JSON array of objects with description, quantity, and unitPrice. 
      Guess reasonable market rates if not specified. Currency is generic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
            },
            required: ["description", "quantity", "unitPrice"],
          },
        },
      },
    });

    let text = response.text || "[]";
    // Strip markdown code blocks if the model includes them despite responseMimeType
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateBusinessInsights = async (invoices: Invoice[]) => {
  if (!apiKey) return "AI insights unavailable without API key.";

  try {
    // Simplify data for the prompt to save tokens
    const invoiceSummary = invoices.map(inv => ({
      date: inv.date,
      amount: inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      currency: inv.currency,
      status: inv.status
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Analyze this invoice data: ${JSON.stringify(invoiceSummary)}. 
      Provide a 2-sentence executive summary of the business health, focusing on cash flow and overdue payments. 
      Be professional and concise.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Could not generate insights at this time.";
  }
};

export const createClientChat = (contextData: any): Chat => {
  if (!apiKey) {
    throw new Error("API Key missing");
  }
  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: `You are an AI Client Liaison for 'Ring Invoicing'. 
      Your goal is to help the freelancer manage their clients.
      You have access to the following client and invoice data:
      ${JSON.stringify(contextData)}
      
      You can:
      1. Summarize client account status (total paid, overdue, etc).
      2. Draft emails (payment reminders, thank you notes, proposals).
      3. Suggest business actions based on payment history.
      
      Keep responses concise, professional, and friendly. 
      Use the provided data to be specific (e.g., mention actual amounts and invoice numbers).
      `,
    },
  });
};
