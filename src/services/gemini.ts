import { supabase } from './supabase';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface UserPreferences {
  age?: number;
  gender?: string;
  interests?: string[];
  budget_range?: string;
  preferred_cuisines?: string[];
  activity_types?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

interface ProgramSuggestion {
  title: string;
  description: string;
  activities: {
    type: string;
    title: string;
    description: string;
    estimated_duration: string;
    estimated_cost: number;
    time_of_day: string;
  }[];
  total_estimated_cost: number;
  total_duration: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  best_time: string;
  season: string;
  tags: string[];
}

interface RecommendationRequest {
  type: 'restaurant' | 'activity' | 'product' | 'event' | 'program';
  user_preferences: UserPreferences;
  context?: string;
  location?: string;
  budget?: number;
  time_preference?: string;
  occasion?: string;
}

export class GeminiService {
  private static instance: GeminiService;
  
  private constructor() {}
  
  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not found');
    }

    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  async generatePersonalizedRecommendations(request: RecommendationRequest): Promise<any[]> {
    const { type, user_preferences, context, location, budget, time_preference, occasion } = request;
    
    const prompt = `
      Sen bir AI kişisel asistan ve öneri uzmanısın. Kullanıcının tercihlerine göre ${type} önerileri oluştur.
      
      Kullanıcı Profili:
      - Yaş: ${user_preferences.age || 'Belirtilmemiş'}
      - Cinsiyet: ${user_preferences.gender || 'Belirtilmemiş'}
      - İlgi Alanları: ${user_preferences.interests?.join(', ') || 'Belirtilmemiş'}
      - Bütçe Aralığı: ${user_preferences.budget_range || budget || 'Belirtilmemiş'}
      - Tercih Edilen Mutfaklar: ${user_preferences.preferred_cuisines?.join(', ') || 'Belirtilmemiş'}
      - Aktivite Türleri: ${user_preferences.activity_types?.join(', ') || 'Belirtilmemiş'}
      - Lokasyon: ${location || 'Belirtilmemiş'}
      - Zaman Tercihi: ${time_preference || 'Belirtilmemiş'}
      - Özel Durum: ${occasion || 'Belirtilmemiş'}
      ${context ? `- Ek Bilgi: ${context}` : ''}
      
      Lütfen bu bilgilere göre 5 adet ${type} önerisi oluştur. Her öneri için:
      1. Başlık
      2. Açıklama
      3. Neden önerildiği
      4. Tahmini fiyat (₺)
      5. 1-100 arası uyumluluk skoru
      6. Kategori/tür
      7. Öne çıkan özellikler
      
      Yanıtını JSON formatında ver:
      {
        "recommendations": [
          {
            "title": "Öneri Başlığı",
            "description": "Detaylı açıklama",
            "reason": "Bu öneri neden uygun",
            "estimated_price": 150,
            "match_score": 85,
            "category": "kategori",
            "highlights": ["özellik1", "özellik2"],
            "type": "${type}"
          }
        ]
      }
    `;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const parsed = JSON.parse(response);
      return parsed.recommendations || [];
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  async generateDailyProgram(request: {
    user_preferences: UserPreferences;
    date: string;
    location: string;
    budget: number;
    duration: string;
    occasion?: string;
    group_size?: number;
  }): Promise<ProgramSuggestion | null> {
    const { user_preferences, date, location, budget, duration, occasion, group_size } = request;
    
    const prompt = `
      Sen bir AI seyahat ve etkinlik planlama uzmanısın. Kullanıcının tercihlerine göre günlük program önerisi oluştur.
      
      Kullanıcı Bilgileri:
      - Yaş: ${user_preferences.age || 'Belirtilmemiş'}
      - Cinsiyet: ${user_preferences.gender || 'Belirtilmemiş'}
      - İlgi Alanları: ${user_preferences.interests?.join(', ') || 'Belirtilmemiş'}
      - Tercih Edilen Mutfaklar: ${user_preferences.preferred_cuisines?.join(', ') || 'Belirtilmemiş'}
      - Aktivite Türleri: ${user_preferences.activity_types?.join(', ') || 'Belirtilmemiş'}
      
      Program Detayları:
      - Tarih: ${date}
      - Lokasyon: ${location}
      - Bütçe: ₺${budget}
      - Süre: ${duration}
      - Özel Durum: ${occasion || 'Normal gün'}
      - Grup Büyüklüğü: ${group_size || 1} kişi
      
      Lütfen bu bilgilere göre kapsamlı bir günlük program oluştur. Program şunları içermeli:
      1. Sabah aktivitesi
      2. Öğle yemeği
      3. Öğleden sonra aktivitesi
      4. Akşam yemeği
      5. Akşam eğlencesi (isteğe bağlı)
      
      Yanıtını JSON formatında ver:
      {
        "title": "Program Başlığı",
        "description": "Program açıklaması",
        "activities": [
          {
            "type": "restaurant/activity/entertainment",
            "title": "Aktivite Adı",
            "description": "Detaylı açıklama",
            "estimated_duration": "2 saat",
            "estimated_cost": 100,
            "time_of_day": "morning/afternoon/evening"
          }
        ],
        "total_estimated_cost": 500,
        "total_duration": "8 saat",
        "difficulty_level": "easy",
        "best_time": "Weekend",
        "season": "Any",
        "tags": ["romantic", "food", "culture"]
      }
    `;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Failed to generate daily program:', error);
      return null;
    }
  }

  async generateBusinessInsights(businessData: {
    name: string;
    category: string;
    location: string;
    target_audience: string;
    current_campaigns: any[];
    analytics_data: any;
  }): Promise<{
    insights: string[];
    recommendations: string[];
    target_keywords: string[];
    optimal_times: string[];
    competitor_analysis: string;
  } | null> {
    const { name, category, location, target_audience, current_campaigns, analytics_data } = businessData;
    
    const prompt = `
      Sen bir AI pazarlama ve iş analizi uzmanısın. Aşağıdaki işletme verileriyle analiz yap.
      
      İşletme Bilgileri:
      - İsim: ${name}
      - Kategori: ${category}
      - Lokasyon: ${location}
      - Hedef Kitle: ${target_audience}
      - Aktif Kampanyalar: ${current_campaigns.length} adet
      - Analitik Veriler: ${JSON.stringify(analytics_data)}
      
      Lütfen aşağıdaki konularda analiz ve öneriler sun:
      1. İş performansı analizi
      2. Pazarlama önerileri
      3. Hedef anahtar kelimeler
      4. Optimal tanıtım zamanları
      5. Rekabet analizi
      
      Yanıtını JSON formatında ver:
      {
        "insights": ["insight1", "insight2"],
        "recommendations": ["recommendation1", "recommendation2"],
        "target_keywords": ["keyword1", "keyword2"],
        "optimal_times": ["time1", "time2"],
        "competitor_analysis": "Detaylı rekabet analizi"
      }
    `;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Failed to generate business insights:', error);
      return null;
    }
  }

  async generateSocialMediaContent(request: {
    program_data: any;
    user_preferences: UserPreferences;
    platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok';
    content_type: 'post' | 'story' | 'reel';
  }): Promise<{
    caption: string;
    hashtags: string[];
    suggestions: string[];
  } | null> {
    const { program_data, user_preferences, platform, content_type } = request;
    
    const prompt = `
      Sen bir AI sosyal medya içerik uzmanısın. Kullanıcının programına göre ${platform} için ${content_type} içeriği oluştur.
      
      Program Bilgileri:
      ${JSON.stringify(program_data)}
      
      Kullanıcı Profili:
      - Yaş: ${user_preferences.age || 'Belirtilmemiş'}
      - İlgi Alanları: ${user_preferences.interests?.join(', ') || 'Belirtilmemiş'}
      
      Platform: ${platform}
      İçerik Türü: ${content_type}
      
      Lütfen bu bilgilere göre etkileyici sosyal medya içeriği oluştur:
      1. Çekici başlık/açıklama
      2. Relevant hashtag'ler
      3. İçerik önerileri
      
      Yanıtını JSON formatında ver:
      {
        "caption": "İçerik açıklaması",
        "hashtags": ["#hashtag1", "#hashtag2"],
        "suggestions": ["öneri1", "öneri2"]
      }
    `;

    try {
      const response = await this.makeGeminiRequest(prompt);
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Failed to generate social media content:', error);
      return null;
    }
  }

  async saveRecommendationsToDatabase(userId: string, recommendations: any[]): Promise<void> {
    if (!recommendations || recommendations.length === 0) return;

    const recommendationData = recommendations.map(rec => ({
      user_id: userId,
      recommendation_type: rec.type,
      title: rec.title,
      description: rec.description,
      score: rec.match_score / 100,
      reason: rec.reason,
      metadata: {
        estimated_price: rec.estimated_price,
        category: rec.category,
        highlights: rec.highlights,
      },
      created_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase
        .from('recommendations')
        .insert(recommendationData);

      if (error) {
        console.error('Failed to save recommendations:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences, date_of_birth, gender')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to get user preferences:', error);
        return {};
      }

      const preferences = data?.preferences || {};
      const age = data?.date_of_birth ? 
        new Date().getFullYear() - new Date(data.date_of_birth).getFullYear() : 
        undefined;

      return {
        age,
        gender: data?.gender,
        interests: preferences.interests || [],
        budget_range: preferences.budget_range,
        preferred_cuisines: preferences.preferred_cuisines || [],
        activity_types: preferences.activity_types || [],
        location: preferences.location,
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }

  async generateAndSaveRecommendations(userId: string, type: string = 'restaurant'): Promise<void> {
    try {
      const userPreferences = await this.getUserPreferences(userId);
      
      const recommendations = await this.generatePersonalizedRecommendations({
        type: type as any,
        user_preferences: userPreferences,
        context: 'Daily recommendations for AdVantage app',
      });

      if (recommendations.length > 0) {
        await this.saveRecommendationsToDatabase(userId, recommendations);
      }
    } catch (error) {
      console.error('Failed to generate and save recommendations:', error);
    }
  }
}

export const geminiService = GeminiService.getInstance(); 