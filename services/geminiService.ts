import { GoogleGenAI, Modality, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Models ---
// Corrected model names based on official availability to fix 404 errors
const MODEL_FAST = "gemini-2.5-flash"; // Reliable fast model for basic tasks
const MODEL_THINKING = "gemini-3-pro-preview"; // For complex reasoning
const MODEL_TTS = "gemini-2.5-flash-preview-tts"; // For speech generation

// --- Audio Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- Service Functions ---

/**
 * Uses Flash for low-latency generation of invoice items from natural language.
 */
export const generateSmartInvoiceItems = async (promptText: string) => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: promptText,
      config: {
        systemInstruction: "You are a high-speed data processor for RING. Convert the description into a JSON array of invoice line items (description, quantity, unitPrice). No markdown. JSON only.",
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Fast AI Generation Error:", error);
    throw error;
  }
};

/**
 * Uses Gemini 3 Pro with Thinking Mode to analyze financial data deeply.
 */
export const generateFinancialAnalysis = async (dashboardData: any) => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: `Analyze this dashboard data and provide 3 strategic, actionable insights for the business owner. Focus on cash flow gaps, overdue trends, and profitability. Data: ${JSON.stringify(dashboardData)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for deep reasoning
      },
    });

    return response.text;
  } catch (error) {
    console.error("Thinking AI Error:", error);
    // Fallback to fast model if thinking model isn't available/whitelisted for the key
    try {
        const fallbackResponse = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: `Analyze this dashboard data and provide 3 strategic, actionable insights. Data: ${JSON.stringify(dashboardData)}`,
        });
        return fallbackResponse.text;
    } catch (fallbackError) {
        throw error;
    }
  }
};

/**
 * Creates a chat session using Gemini 3 Pro (Thinking) for complex client queries.
 */
export const createClientChat = (contextData: any): Chat => {
  if (!apiKey) throw new Error("API Key is missing");

  return ai.chats.create({
    model: MODEL_THINKING,
    config: {
      thinkingConfig: { thinkingBudget: 16384 }, // Balanced thinking for chat
      systemInstruction: `You are the AI Liaison for RING. You have access to client and invoice data. 
      Use deep reasoning to answer questions about revenue, overdue payments, and client relationships.
      Context: ${JSON.stringify(contextData)}`,
    },
  });
};

/**
 * Generates speech from text using Gemini TTS.
 * Returns an AudioBuffer.
 */
export const generateSpeechFromText = async (text: string): Promise<AudioBuffer> => {
  if (!apiKey) throw new Error("API Key is missing");

  const response = await ai.models.generateContent({
    model: MODEL_TTS,
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data generated");
  }

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(decode(base64Audio).buffer);
  
  return audioBuffer;
};

export const playAudioBuffer = (buffer: AudioBuffer) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};