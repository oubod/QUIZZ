// Supabase Edge Function: Gemini AI Proxy
// This function proxies requests to Google's Gemini API to keep API keys secure

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "npm:@google/generative-ai@0.1.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface GenerateQuestionsRequest {
  category: string;
  count: number;
}

interface GenerateExplanationRequest {
  question: string;
  correctAnswer: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // Get API key from environment
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Parse request body
    const requestData = await req.json();
    
    // Handle different endpoints
    let result;
    
    if (path === "generate-questions") {
      const { category, count } = requestData as GenerateQuestionsRequest;
      
      const prompt = `Generate ${count} medical quiz questions about ${category} for medical students. 
      Each question should have 4 possible answers with only one correct option.
      For each question, provide:
      1. The question text
      2. Four possible answers
      3. The index of the correct answer (0-3)
      4. A detailed explanation of why the answer is correct
      
      Format the response as a JSON array of objects with the following structure:
      [
        {
          "text": "Question text here",
          "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 2,
          "explanation": "Detailed explanation here",
          "category": "${category}",
          "level": "Intermediate"
        }
      ]
      
      Make the questions challenging but factually accurate. Include a mix of diagnostic, treatment, and pathophysiology questions.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI-generated questions");
      }
      
      const jsonString = jsonMatch[0];
      const questions = JSON.parse(jsonString);
      
      // Add IDs to questions
      result = questions.map((q: any, index: number) => ({
        ...q,
        id: `ai-${Date.now()}-${index}`,
        isAIGenerated: true
      }));
      
    } else if (path === "generate-explanation") {
      const { question, correctAnswer } = requestData as GenerateExplanationRequest;
      
      const prompt = `For the medical question: "${question}"
      
      The correct answer is: "${correctAnswer}"
      
      Please provide a detailed explanation of why this answer is correct. Include relevant medical information, pathophysiology, clinical guidelines, or other details that would help a medical student understand the concept. Keep the explanation concise but informative.`;

      const response = await model.generateContent(prompt);
      result = { explanation: response.response.text() };
    } else {
      throw new Error(`Unknown endpoint: ${path}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});