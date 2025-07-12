import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.';
    }
  }

  async generateStructuredResponse(prompt: string, schema?: any): Promise<any> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON if schema is provided
      if (schema) {
        try {
          return JSON.parse(text);
        } catch {
          return { response: text };
        }
      }
      
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      return { error: 'API yanıt veremedi' };
    }
  }
}

export const geminiService = new GeminiService();
export default GeminiService;