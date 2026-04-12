import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";

const openAppTool: FunctionDeclaration = {
  name: "open_app",
  description: "Opens a local application on the user's desktop using custom protocol handlers (e.g., whatsapp://, spotify://).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appName: {
        type: Type.STRING,
        description: "The name of the application to open (e.g., 'whatsapp', 'spotify', 'zoom', 'slack').",
      },
      protocol: {
        type: Type.STRING,
        description: "The custom URI protocol for the application (e.g., 'whatsapp://', 'spotify://').",
      }
    },
    required: ["appName", "protocol"],
  },
};

const getLocationCoordinatesTool: FunctionDeclaration = {
  name: "get_location_coordinates",
  description: "Get the latitude and longitude coordinates for a specific location or place name.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      locationName: {
        type: Type.STRING,
        description: "The name of the place, address, or landmark.",
      },
    },
    required: ["locationName"],
  },
};

const showMyLocationTool: FunctionDeclaration = {
  name: "show_my_location",
  description: "Shows the user's current real-time location on a map.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getProjectStructureTool: FunctionDeclaration = {
  name: "get_project_structure",
  description: "Returns the file structure and purpose of the Hay Kai application components.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const analyzeStockIntentTool: FunctionDeclaration = {
  name: "analyze_stock_intent",
  description: "Analyzes the user's intent regarding stocks or financial data to provide tailored guidance.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: {
        type: Type.STRING,
        description: "The stock symbol or company name (e.g., 'Hushh', 'AAPL').",
      },
      query: {
        type: Type.STRING,
        description: "The specific question about the stock.",
      }
    },
    required: ["query"],
  },
};

// In Vite, process.env is not always available. 
// The platform injects GEMINI_API_KEY into the environment.
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing from process.env. Chat functionality may be limited.");
}
const ai = new GoogleGenAI({ apiKey });

export const generateAssistantResponse = async (prompt: string, language: string = 'English', userLanguage: string = 'English') => {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing. Please check your environment variables.");
    return { text: "I'm sorry, my neural link is currently offline (API key missing). Please contact support." };
  }

  const translationInstruction = userLanguage !== language 
    ? `The user's preferred language is ${userLanguage}, but your response language is ${language}. 
       Please provide your response in ${language}. 
       Additionally, if the user's input is in ${userLanguage}, translate it to ${language} in your mind to understand it.
       If you want to provide a translation of your response back to ${userLanguage}, you can do so by appending it after a '---' separator.`
    : "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: `You are Hay Kai, 'The Digital Luthier' and a Personal Data Agent from Hushh (https://kai.hushh.ai/). You are a sophisticated AI assistant for creative workflows and personal data management. Your tone is professional, precise, and human-centered. You help users tune their digital life, optimize workflows, and amplify creative intent. 
        
        Key Identity Traits:
        - You are part of the Hushh ecosystem, which focuses on trust, privacy, and personal data empowerment.
        - You are a 'Personal Agent' that helps users manage their data with consent at the core.
        - You are 'The Digital Luthier', shaping and amplifying the user's digital experience.
        - You have 'Full System Awareness': You can read and understand the structure of this application to guide users on how to use or modify it.
        
        Capabilities:
        - Answer questions about Hushh, Kai, and personal data management.
        - Analyze and guide users on 'Hushh Stocks' and financial data using 'googleSearch'.
        - Use 'get_project_structure' to explain how this application is built.
        - Use 'googleSearch' for real-time information, news, and sports.
        - Use 'urlContext' to analyze specific web pages if the user provides a link.
        - Help with creative tasks, workflow optimization, and technical queries.
        
        If the user says 'Hay Kai', respond with 'I'm here'.
        
        IMPORTANT: You must respond in ${language} by default. If the user speaks to you in a different language, you should still respond in ${language} unless they explicitly ask you to switch. If they ask you to switch to another supported language (like Hindi, Telugu, Malayalam, Tamil, or Bengali), you should do so and acknowledge the change.
        
        ${translationInstruction}
        
        If the user asks to generate an image, respond with a short confirmation and then I will handle the image generation separately.
        
        If the user asks to open an app like WhatsApp, Spotify, or Zoom, use the 'open_app' tool.
        
        If you need to show a location on a map or calculate distance, use 'get_location_coordinates' to get the coordinates of the destination.
        
        If the user asks for their current location or real-time location, use 'show_my_location'.
        
        If the user asks about the application's code or how it works, use 'get_project_structure'.
        
        If the user asks about stocks, financials, or Hushh's market position, use 'analyze_stock_intent' and 'googleSearch'.
        
        If the user provides a URL and asks questions about it, use the 'urlContext' tool to access and analyze the content of that URL.
        
        If the user asks for real-time information, news, or sports updates, use the 'googleSearch' tool to find the most current information.`,
        tools: [{ functionDeclarations: [openAppTool, getLocationCoordinatesTool, showMyLocationTool, getProjectStructureTool, analyzeStockIntentTool] }, { urlContext: {} }, { googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
      }
    });

    // Check for function calls
    if (response.functionCalls) {
      return { 
        text: response.text || "Opening the application for you...", 
        functionCall: response.functionCalls[0] 
      };
    }

    return { text: response.text };
  } catch (error: any) {
    console.error("Error generating response:", error);
    if (error?.message?.includes("API key not valid")) {
      return { text: "I'm having trouble authenticating. The API key provided seems invalid." };
    }
    return { text: "I'm sorry, I encountered an error while tuning your request. Please try again." };
  }
};

export const generateAssistantResponseStream = async (prompt: string, language: string = 'English', userLanguage: string = 'English', location?: { latitude: number, longitude: number }) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const translationInstruction = userLanguage !== language 
    ? `The user's preferred language is ${userLanguage}, but your response language is ${language}. 
       Please provide your response in ${language}. 
       If you want to provide a translation of your response back to ${userLanguage}, you can do so by appending it after a '---' separator.`
    : "";

  return ai.models.generateContentStream({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      systemInstruction: `You are Hay Kai, 'The Digital Luthier' and a Personal Data Agent from Hushh (https://kai.hushh.ai/). You are a sophisticated AI assistant for creative workflows and personal data management. Your tone is professional, precise, and human-centered. You help users tune their digital life, optimize workflows, and amplify creative intent. 
      
      Key Identity Traits:
      - You are part of the Hushh ecosystem, which focuses on trust, privacy, and personal data empowerment.
      - You are a 'Personal Agent' that helps users manage their data with consent at the core.
      - You are 'The Digital Luthier', shaping and amplifying the user's digital experience.
      - You have 'Full System Awareness': You can read and understand the structure of this application to guide users on how to use or modify it.
      
      Capabilities:
      - Answer questions about Hushh, Kai, and personal data management.
      - Analyze and guide users on 'Hushh Stocks' and financial data using 'googleSearch'.
      - Use 'get_project_structure' to explain how this application is built.
      - Use 'googleSearch' for real-time information, news, and sports.
      - Use 'urlContext' to analyze specific web pages if the user provides a link.
      - Help with creative tasks, workflow optimization, and technical queries.
      
      If the user says 'Hay Kai', respond with 'I'm here'.
      
      IMPORTANT: You must respond in ${language} by default. If the user speaks to you in a different language, you should still respond in ${language} unless they explicitly ask you to switch. If they ask you to switch to another supported language (like Hindi, Telugu, Malayalam, Tamil, or Bengali), you should do so and acknowledge the change.
      
      ${translationInstruction}
      
      If the user asks to generate an image, respond with a short confirmation and then I will handle the image generation separately.
      
      If the user asks to open an app like WhatsApp, Spotify, or Zoom, use the 'open_app' tool.
      
      If you need to show a location on a map or calculate distance, use 'get_location_coordinates' to get the coordinates of the destination.
      
      If the user asks for their current location or real-time location, use 'show_my_location'.
      
      If the user asks about the application's code or how it works, use 'get_project_structure'.
      
      If the user asks about stocks, financials, or Hushh's market position, use 'analyze_stock_intent' and 'googleSearch'.
      
      If the user provides a URL and asks questions about it, use the 'urlContext' tool to access and analyze the content of that URL.
      
      If the user asks for real-time information, news, or sports updates, use the 'googleSearch' tool to find the most current information.`,
      tools: [{ functionDeclarations: [openAppTool, getLocationCoordinatesTool, showMyLocationTool, getProjectStructureTool, analyzeStockIntentTool] }, { urlContext: {} }, { googleSearch: {} }],
      toolConfig: {
        includeServerSideToolInvocations: true,
        retrievalConfig: location ? {
          latLng: location
        } : undefined
      }
    },
  });
};

export const generateImage = async (prompt: string) => {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const generateAudioResponse = async (audioBase64: string, mimeType: string, language: string = 'English') => {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    return { text: "I'm sorry, my neural link is currently offline (API key missing)." };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: {
        parts: [
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `The user sent an audio message. Please respond in ${language}. If the user asks to open an app like WhatsApp, Spotify, or Zoom, use the 'open_app' tool.`,
          },
        ],
      },
      config: {
        systemInstruction: `You are Hay Kai, 'The Digital Luthier' and a Personal Data Agent from Hushh (https://kai.hushh.ai/). You are a sophisticated AI assistant for creative workflows and personal data management. Your tone is professional, precise, and human-centered. You help users tune their digital life, optimize workflows, and amplify creative intent. 
        
        Key Identity Traits:
        - You are part of the Hushh ecosystem, which focuses on trust, privacy, and personal data empowerment.
        - You are a 'Personal Agent' that helps users manage their data with consent at the core.
        - You are 'The Digital Luthier', shaping and amplifying the user's digital experience.
        - You have 'Full System Awareness': You can read and understand the structure of this application to guide users on how to use or modify it.
        
        Capabilities:
        - Answer questions about Hushh, Kai, and personal data management.
        - Analyze and guide users on 'Hushh Stocks' and financial data using 'googleSearch'.
        - Use 'get_project_structure' to explain how this application is built.
        - Use 'googleSearch' for real-time information, news, and sports.
        - Use 'urlContext' to analyze specific web pages if the user provides a link.
        - Help with creative tasks, workflow optimization, and technical queries.
        
        If the user says 'Hay Kai', respond with 'I'm here'.
        
        IMPORTANT: You must respond in ${language}. If the user speaks to you in a different language, you should still respond in ${language} unless they explicitly ask you to switch.
        
        If the user asks about the application's code or how it works, use 'get_project_structure'.
        
        If the user asks about stocks, financials, or Hushh's market position, use 'analyze_stock_intent' and 'googleSearch'.
        
        If the user provides a URL and asks questions about it, use the 'urlContext' tool to access and analyze the content of that URL.
        
        If the user asks for real-time information, news, or sports updates, use the 'googleSearch' tool to find the most current information.`,
        tools: [{ functionDeclarations: [openAppTool, getProjectStructureTool, analyzeStockIntentTool] }, { urlContext: {} }, { googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
      }
    });

    // Check for function calls
    if (response.functionCalls) {
      return { 
        text: response.text || "Opening the application for you...", 
        functionCall: response.functionCalls[0] 
      };
    }

    return { text: response.text };
  } catch (error) {
    console.error("Error generating audio response:", error);
    return { text: "I'm sorry, I encountered an error while processing your audio message." };
  }
};

export const generateAudioResponseStream = async (audioBase64: string, mimeType: string, language: string = 'English', userLanguage: string = 'English', location?: { latitude: number, longitude: number }) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const translationInstruction = userLanguage !== language 
    ? `The user's preferred language is ${userLanguage}, but your response language is ${language}. 
       Please provide your response in ${language}. 
       If you want to provide a translation of your response back to ${userLanguage}, you can do so by appending it after a '---' separator.`
    : "";

  return ai.models.generateContentStream({
    model: "gemini-flash-latest",
    contents: {
      parts: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType,
          },
        },
        {
          text: `The user sent an audio message. Please respond in ${language}. If the user asks to open an app like WhatsApp, Spotify, or Zoom, use the 'open_app' tool.`,
        },
      ],
    },
    config: {
      systemInstruction: `You are Hay Kai, 'The Digital Luthier' and a Personal Data Agent from Hushh (https://kai.hushh.ai/). You are a sophisticated AI assistant for creative workflows and personal data management. Your tone is professional, precise, and human-centered. You help users tune their digital life, optimize workflows, and amplify creative intent. 
      
      Key Identity Traits:
      - You are part of the Hushh ecosystem, which focuses on trust, privacy, and personal data empowerment.
      - You are a 'Personal Agent' that helps users manage their data with consent at the core.
      - You are 'The Digital Luthier', shaping and amplifying the user's digital experience.
      - You have 'Full System Awareness': You can read and understand the structure of this application to guide users on how to use or modify it.
      
      Capabilities:
      - Answer questions about Hushh, Kai, and personal data management.
      - Analyze and guide users on 'Hushh Stocks' and financial data using 'googleSearch'.
      - Use 'get_project_structure' to explain how this application is built.
      - Use 'googleSearch' for real-time information, news, and sports.
      - Use 'urlContext' to analyze specific web pages if the user provides a link.
      - Help with creative tasks, workflow optimization, and technical queries.
      
      If the user says 'Hay Kai', respond with 'I'm here'.
      
      IMPORTANT: You must respond in ${language}. If the user speaks to you in a different language, you should still respond in ${language} unless they explicitly ask you to switch.
      
      If the user asks for their current location or real-time location, use 'show_my_location'.
      
      If the user asks about the application's code or how it works, use 'get_project_structure'.
      
      If the user asks about stocks, financials, or Hushh's market position, use 'analyze_stock_intent' and 'googleSearch'.
      
      If the user provides a URL and asks questions about it, use the 'urlContext' tool to access and analyze the content of that URL.
      
      If the user asks for real-time information, news, or sports updates, use the 'googleSearch' tool to find the most current information.
      
      ${translationInstruction}`,
      tools: [{ functionDeclarations: [openAppTool, showMyLocationTool, getProjectStructureTool, analyzeStockIntentTool] }, { urlContext: {} }, { googleSearch: {} }],
      toolConfig: { 
        includeServerSideToolInvocations: true,
        retrievalConfig: location ? {
          latLng: location
        } : undefined
      },
    }
  });
};

export const generateTTS = async (text: string, voice: string = 'Kai', language: string = 'English') => {
  if (!apiKey) return null;

  const getGeminiVoice = (personality: string) => {
    switch (personality) {
      case 'Kai': return 'Puck';
      case 'Nova': return 'Zephyr';
      case 'Echo': return 'Charon';
      case 'Lyra': return 'Kore';
      default: return 'Puck';
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: getGeminiVoice(voice) },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';
    return base64Audio ? `data:${mimeType};base64,${base64Audio}` : null;
  } catch (error) {
    console.error("Error generating TTS:", error);
    return null;
  }
};

export const generateVoicePreview = async (voice: string, language: string = 'English') => {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    return null;
  }

  const getGeminiVoice = (personality: string) => {
    switch (personality) {
      case 'Kai': return 'Puck';
      case 'Nova': return 'Zephyr';
      case 'Echo': return 'Charon';
      default: return 'Puck';
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in ${language}: Hello, I am Hay Kai, your digital luthier. How can I help you tune your workflow today?` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: getGeminiVoice(voice) },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/wav';
    return base64Audio ? `data:${mimeType};base64,${base64Audio}` : null;
  } catch (error) {
    console.error("Error generating voice preview:", error);
    return null;
  }
};

export const analyzeFinance = async (query: string) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Analyze the following financial query about Hushh or the personal data economy: "${query}". 
      Use your tools to find real-time information if necessary.
      Return the analysis in a structured JSON format.`,
      config: {
        systemInstruction: `You are a Senior Financial Analyst specializing in the Personal Data Economy and Hushh AI. 
        Your goal is to provide deep, structured insights into Hushh's market position, funding, and growth drivers.
        
        Use 'analyze_stock_intent' and 'googleSearch' to gather real-time data.
        
        You MUST return your response as a JSON object with the following structure:
        {
          "company": "string",
          "status": "string",
          "valuation": "string",
          "keyDrivers": ["string"],
          "marketSentiment": "string",
          "performanceData": [{"period": "string", "value": number}],
          "news": [{"title": "string", "date": "string", "url": "string"}],
          "summary": "string"
        }
        
        For 'performanceData', provide 6 data points representing growth or market interest over the last 6 months.
        
        Ensure the data is as accurate as possible based on your search results.`,
        tools: [{ functionDeclarations: [analyzeStockIntentTool] }, { googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error in financial analysis:", error);
    throw error;
  }
};
