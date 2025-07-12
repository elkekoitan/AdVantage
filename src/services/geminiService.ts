import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

interface UserPreferences {
  wakeUpTime: string;
  sleepTime: string;
  budgetRange: { min: number; max: number };
  interests: string[];
  dietaryRestrictions: string[];
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  socialPreference: 'introvert' | 'extrovert' | 'ambivert';
  preferredActivities: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

interface AIActivity {
  title: string;
  description: string;
  type: string;
  estimated_cost: number;
  duration: number;
  location: string;
  start_time: string;
  end_time: string;
  priority: number;
}

interface DailyProgram {
  title: string;
  description: string;
  total_estimated_cost: number;
  duration_hours: number;
  activities: AIActivity[];
  tags: string[];
  mood_analysis: {
    primary: string;
    secondary: string;
    recommendations: string[];
  };
}

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

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default preferences if none found
        return {
          wakeUpTime: '08:00',
          sleepTime: '23:00',
          budgetRange: { min: 100, max: 500 },
          interests: ['yemek', 'spor', 'eğlence'],
          dietaryRestrictions: [],
          fitnessLevel: 'intermediate',
          socialPreference: 'ambivert',
          preferredActivities: ['restoran', 'sinema', 'alışveriş'],
          location: {
            latitude: 41.0082,
            longitude: 28.9784,
            city: 'İstanbul'
          }
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  async generateDailyProgram(request: any): Promise<DailyProgram | null> {
    try {
      const prompt = `
Sen bir AI program asistanısın. Kullanıcının tercihlerine göre günlük program oluştur.

Kullanıcı Bilgileri:
- İlgi Alanları: ${request.user_preferences.interests?.join(', ') || 'Genel'}
- Aktivite Türleri: ${request.user_preferences.activity_types?.join(', ') || 'Çeşitli'}
- Bütçe: ${request.budget} TL
- Süre: ${request.duration} saat
- Konum: ${request.location}
- Tarih: ${request.date}
- Grup Büyüklüğü: ${request.group_size} kişi
- Özel Durum: ${request.occasion || 'Normal gün'}

Lütfen aşağıdaki JSON formatında bir günlük program oluştur:

{
  "title": "Program başlığı",
  "description": "Program açıklaması",
  "total_estimated_cost": toplam_maliyet_sayı,
  "duration_hours": toplam_süre_saat,
  "activities": [
    {
      "title": "Aktivite adı",
      "description": "Aktivite açıklaması",
      "type": "restoran/eğlence/spor/alışveriş/kültür",
      "estimated_cost": maliyet_sayı,
      "duration": süre_saat,
      "location": "Konum bilgisi",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "priority": 1-5_arası_sayı
    }
  ],
  "tags": ["etiket1", "etiket2"],
  "mood_analysis": {
    "primary": "Ana ruh hali",
    "secondary": "İkincil ruh hali",
    "recommendations": ["Öneri 1", "Öneri 2"]
  }
}

Sadece JSON formatında yanıt ver, başka açıklama ekleme.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response and try to parse JSON
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const program = JSON.parse(cleanedText);
        return program;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', text);
        return null;
      }
    } catch (error) {
      console.error('Error generating daily program:', error);
      return null;
    }
  }

  async generateRecommendations(userId: string, category: string, location: string, budget: number): Promise<any[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      
      const prompt = `
Kullanıcı için ${category} kategorisinde öneriler oluştur.

Kullanıcı Profili:
- İlgi Alanları: ${userPrefs.interests.join(', ')}
- Tercih Edilen Aktiviteler: ${userPrefs.preferredActivities.join(', ')}
- Bütçe Aralığı: ${budget} TL
- Konum: ${location}
- Sosyal Tercih: ${userPrefs.socialPreference}
- Fitness Seviyesi: ${userPrefs.fitnessLevel}

Lütfen aşağıdaki JSON formatında 5 öneri oluştur:

[
  {
    "id": "unique_id",
    "title": "Öneri başlığı",
    "description": "Detaylı açıklama",
    "category": "${category}",
    "rating": 4.5,
    "price": fiyat_sayı,
    "discount": indirim_yüzdesi,
    "location": "Konum",
    "image": "image_url_placeholder",
    "tags": ["etiket1", "etiket2"],
    "reason": "Neden önerildiği"
  }
]

Sadece JSON formatında yanıt ver.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const recommendations = JSON.parse(cleanedText);
        return Array.isArray(recommendations) ? recommendations : [];
      } catch (parseError) {
        console.error('JSON parse error for recommendations:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  async optimizeBudget(activities: AIActivity[], totalBudget: number): Promise<AIActivity[]> {
    try {
      const prompt = `
Verilen aktiviteleri ${totalBudget} TL bütçeye göre optimize et.

Mevcut Aktiviteler:
${JSON.stringify(activities, null, 2)}

Bütçe optimizasyonu yaparken:
1. En önemli aktiviteleri koru
2. Alternatif daha uygun seçenekler öner
3. Toplam maliyeti bütçe içinde tut
4. Aktivite kalitesini düşürme

Optimize edilmiş aktivite listesini JSON formatında döndür:

[
  {
    "title": "Aktivite adı",
    "description": "Açıklama",
    "type": "tür",
    "estimated_cost": maliyet,
    "duration": süre,
    "location": "konum",
    "start_time": "başlangıç",
    "end_time": "bitiş",
    "priority": öncelik,
    "optimization_note": "Optimizasyon notu"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const optimizedActivities = JSON.parse(cleanedText);
        return Array.isArray(optimizedActivities) ? optimizedActivities : activities;
      } catch (parseError) {
        console.error('JSON parse error for budget optimization:', parseError);
        return activities;
      }
    } catch (error) {
      console.error('Error optimizing budget:', error);
      return activities;
    }
  }
}

export const geminiService = new GeminiService();
export default GeminiService;