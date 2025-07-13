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
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

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

  async generateStructuredResponse(prompt: string, schema?: Record<string, unknown>): Promise<Record<string, unknown>> {
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
      
      return { response: text };
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

  async generateDailyProgram(request: Record<string, unknown>): Promise<DailyProgram | null> {
    try {
      const prompt = `
Sen bir AI program asistanısın. Kullanıcının tercihlerine göre günlük program oluştur.

Kullanıcı Bilgileri:
- İlgi Alanları: ${Array.isArray((request.user_preferences as Record<string, unknown>)?.interests) ? ((request.user_preferences as Record<string, unknown>).interests as string[]).join(', ') : 'Genel'}
        - Aktivite Türleri: ${Array.isArray((request.user_preferences as Record<string, unknown>)?.preferredActivities) ? ((request.user_preferences as Record<string, unknown>).preferredActivities as string[]).join(', ') : 'Çeşitli'}
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

  async generateRecommendations(userId: string, category: string, location: string, budget: number): Promise<Record<string, unknown>[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      
      const prompt = `
Kullanıcı için ${category} kategorisinde öneriler oluştur.

Kullanıcı Profili:
- İlgi Alanları: ${Array.isArray(userPrefs.interests) ? userPrefs.interests.join(', ') : 'Genel'}
- Tercih Edilen Aktiviteler: ${Array.isArray(userPrefs.preferredActivities) ? userPrefs.preferredActivities.join(', ') : 'Çeşitli'}
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

  async generateBudgetProgram(preferences: Record<string, unknown>, budget: number, duration: number, location: string): Promise<Record<string, unknown> | null> {
    try {
      const prompt = `
Sen bir AI program asistanısın. Kullanıcının tercihlerine ve bütçesine göre detaylı bir program oluştur.

Kullanıcı Tercihleri:
- İlgi Alanları: ${Array.isArray(preferences.interests) ? (preferences.interests as string[]).join(', ') : 'Genel'}
- Tercih Edilen Aktiviteler: ${Array.isArray(preferences.preferredActivities) ? (preferences.preferredActivities as string[]).join(', ') : 'Çeşitli'}
- Bütçe: ${budget} TL
- Süre: ${duration} saat
- Konum: ${location}
- Sosyal Tercih: ${preferences.socialPreference || 'ambivert'}
- Fitness Seviyesi: ${preferences.fitnessLevel || 'intermediate'}

Lütfen aşağıdaki JSON formatında detaylı bir program oluştur:

{
  "title": "Program başlığı",
  "description": "Program detaylı açıklaması",
  "total_budget": ${budget},
  "estimated_cost": tahmini_toplam_maliyet,
  "duration_hours": ${duration},
  "budget_breakdown": {
    "food": yemek_bütçesi,
    "entertainment": eğlence_bütçesi,
    "transport": ulaşım_bütçesi,
    "shopping": alışveriş_bütçesi,
    "other": diğer_bütçesi
  },
  "activities": [
    {
      "title": "Aktivite adı",
      "description": "Detaylı açıklama",
      "category": "kategori",
      "estimated_cost": maliyet,
      "duration": süre_saat,
      "priority": 1-5_arası,
      "location": "konum",
      "time_slot": "önerilen_zaman",
      "tips": "kullanıcı_ipuçları"
    }
  ],
  "budget_tips": [
    "Bütçe tasarrufu ipucu 1",
    "Bütçe tasarrufu ipucu 2"
  ],
  "alternative_options": [
    {
      "title": "Alternatif seçenek",
      "description": "Açıklama",
      "cost_difference": fark_tutarı
    }
  ]
}

Sadece JSON formatında yanıt ver, başka açıklama ekleme.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const program = JSON.parse(cleanedText);
        return program;
      } catch (parseError) {
        console.error('JSON parse error for budget program:', parseError);
        console.log('Raw response:', text);
        return null;
      }
    } catch (error) {
      console.error('Error generating budget program:', error);
      return null;
    }
  }

  async optimizeProgramBudget(program: Record<string, unknown>, newBudget: number): Promise<Record<string, unknown>> {
    try {
      const prompt = `
Verilen programı ${newBudget} TL bütçeye göre optimize et.

Mevcut Program:
${JSON.stringify(program, null, 2)}

Optimizasyon yaparken:
1. Program kalitesini korumaya çalış
2. En önemli aktiviteleri koru
3. Daha uygun alternatifler öner
4. Bütçe dağılımını yeniden hesapla
5. Kullanıcıya değer katacak öneriler sun

Optimize edilmiş programı aynı JSON formatında döndür.
Sadece JSON formatında yanıt ver.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      try {
        const optimizedProgram = JSON.parse(cleanedText);
        return optimizedProgram;
      } catch (parseError) {
        console.error('JSON parse error for program optimization:', parseError);
        return program;
      }
    } catch (error) {
      console.error('Error optimizing program budget:', error);
      return program;
    }
  }
}

export const geminiService = new GeminiService();
export default GeminiService;