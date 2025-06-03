import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;

export const initializeGeminiAI = async () => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key is not defined');
    }
    
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure the model
    geminiModel = genAI.getGenerativeModel({
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
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
};

export const generateQuestions = async (category: string, count: number = 5) => {
  if (!geminiModel) {
    throw new Error('Gemini AI not initialized');
  }
  
  try {
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

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI-generated questions');
    }
    
    const jsonString = jsonMatch[0];
    const questions = JSON.parse(jsonString);
    
    // Add IDs to questions
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai-${Date.now()}-${index}`,
      isAIGenerated: true
    }));
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
};

export const generateExplanation = async (question: string, correctAnswer: string) => {
  if (!geminiModel) {
    throw new Error('Gemini AI not initialized');
  }
  
  try {
    const prompt = `For the medical question: "${question}"
    
    The correct answer is: "${correctAnswer}"
    
    Please provide a detailed explanation of why this answer is correct. Include relevant medical information, pathophysiology, clinical guidelines, or other details that would help a medical student understand the concept. Keep the explanation concise but informative.`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating explanation with Gemini:', error);
    throw error;
  }
};