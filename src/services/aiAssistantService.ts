import { geminiService } from './geminiService';
import { supabase } from './supabase';

export interface TimelineActivity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'breakfast' | 'sport' | 'shopping' | 'entertainment' | 'work' | 'social' | 'other';
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  discount?: {
    percentage: number;
    description: string;
    validUntil: string;
  };
  mood?: 'energetic' | 'relaxed' | 'social' | 'productive' | 'creative';
  alternatives?: TimelineActivity[];
}

export interface DailyTimeline {
  date: string;
  activities: TimelineActivity[];
  totalBudget: number;
  estimatedSavings: number;
  moodAnalysis: {
    primary: string;
    secondary: string;
    recommendations: string[];
  };
}

export interface UserPreferences {
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

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  price: number;
  discount?: number;
  location: string;
  image?: string;
  tags: string[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentTopic?: string;
  userMood?: string;
  preferences?: UserPreferences;
}

class AIAssistantService {
  private conversationHistory: Map<string, ConversationContext> = new Map();

  async processUserMessage(
    userId: string,
    message: string,
    context?: Partial<ConversationContext>
  ): Promise<{
    response: string;
    timeline?: DailyTimeline;
    recommendations?: Record<string, unknown>[];
    actions?: string[];
  }> {
    try {
      // Get or create conversation context
      const sessionId = context?.sessionId || this.generateSessionId();
      const conversation = this.conversationHistory.get(sessionId) || {
        userId,
        sessionId,
        messages: [],
        preferences: await this.getUserPreferences(userId),
      };

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      // Analyze user intent and mood
      const intent = await this.analyzeIntent(message);
      const mood = await this.analyzeMood(message);
      conversation.userMood = mood;

      let response = '';
      let timeline: DailyTimeline | undefined;
      let recommendations: Record<string, unknown>[] = [];
      const actions: string[] = [];

      // Process based on intent
      switch (intent.type) {
        case 'timeline_request':
          timeline = await this.generateDailyTimeline(userId, conversation.preferences!, mood);
          response = this.generateTimelineResponse(timeline);
          actions.push('show_timeline');
          break;

        case 'recommendation_request':
          recommendations = await this.generateRecommendations(userId, intent.category || 'genel', mood);
          response = this.generateRecommendationResponse(recommendations, intent.category || 'genel');
          actions.push('show_recommendations');
          break;


        case 'discount_inquiry': {
          const discounts = await this.getActiveDiscounts(userId, intent.category);
          response = this.generateDiscountResponse(discounts);
          actions.push('show_discounts');
          break;
        }

        case 'mood_support':
          response = await this.generateMoodSupportResponse(mood);
          recommendations = await this.getMoodBasedRecommendations(mood, userId);
          actions.push('show_mood_support');
          break;

        case 'general_chat':
        default:
          response = await this.generateGeneralResponse(message, conversation);
          break;
      }

      // Add assistant response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      // Update conversation history
      this.conversationHistory.set(sessionId, conversation);

      return {
        response,
        timeline,
        recommendations,
        actions,
      };
    } catch (error) {
      console.error('AI Assistant processing error:', error);
      return {
        response: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
      };
    }
  }

  private async analyzeIntent(message: string): Promise<{
    type: string;
    category?: string;
    confidence: number;
  }> {
    const prompt = `
      Kullanıcı mesajını analiz et ve intent'i belirle:
      Mesaj: "${message}"
      
      Olası intent'ler:
      - timeline_request: Günlük program/timeline istegi
      - recommendation_request: Öneri istegi (restoran, aktivite, müzik, film, oyun)
      - discount_inquiry: İndirim/kampanya sorgusu
      - mood_support: Ruh hali desteği
      - general_chat: Genel sohbet
      
      JSON formatında döndür: {"type": "intent_type", "category": "kategori", "confidence": 0.9}
    `;

    try {
      const result = await geminiService.generateResponse(prompt);
      return JSON.parse(result);
    } catch (error) {
      return { type: 'general_chat', confidence: 0.5 };
    }
  }

  private async analyzeMood(message: string): Promise<string> {
    const prompt = `
      Kullanıcının ruh halini analiz et:
      Mesaj: "${message}"
      
      Olası ruh halleri: energetic, relaxed, social, productive, creative, stressed, happy, sad, excited, tired
      
      Sadece ruh halini döndür (tek kelime):
    `;

    try {
      const result = await geminiService.generateResponse(prompt);
      return result.trim().toLowerCase();
    } catch (error) {
      return 'neutral';
    }
  }

  async generateDailyTimeline(
    userId: string,
    preferences: UserPreferences,
    mood: string
  ): Promise<DailyTimeline> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const aiRequest = {
        user_preferences: {
          interests: preferences.interests,
          activity_types: ['breakfast', 'sport', 'shopping', 'entertainment', 'work', 'social'],
          wakeUpTime: preferences.wakeUpTime || '08:00',
          sleepTime: preferences.sleepTime || '23:00',
          budgetRange: preferences.budgetRange,
          location: {
            latitude: preferences.location.latitude,
            longitude: preferences.location.longitude,
            city: preferences.location.city
          },
          fitnessLevel: preferences.fitnessLevel,
          socialPreference: preferences.socialPreference,
          dietaryRestrictions: preferences.dietaryRestrictions
        },
        date: today,
        location: preferences.location.city,
        budget: preferences.budgetRange.max,
        duration: '1 gün',
        group_size: 1,
        mood: mood
      };

      const program = await geminiService.generateDailyProgram(aiRequest);
      
      if (program) {
        interface ProgramActivity {
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          type?: string;
          location?: string | {
            name?: string;
            address?: string;
            latitude?: number;
            longitude?: number;
          };
          estimated_cost?: number;
          discount?: {
            percentage?: number;
            description?: string;
            validUntil?: string;
          };
        }

        const timeline: DailyTimeline = {
          date: today,
          activities: program.activities.map((activity: ProgramActivity, index: number): TimelineActivity => {
            const estimatedCost = Number(activity.estimated_cost || 0);
            let locationObj: { name: string; address: string; latitude: number; longitude: number; } | undefined;
            
            if (activity.location) {
              if (typeof activity.location === 'string') {
                locationObj = {
                  name: activity.location,
                  address: activity.location,
                  latitude: 0,
                  longitude: 0
                };
              } else {
                locationObj = {
                  name: String(activity.location.name || ''),
                  address: String(activity.location.address || ''),
                  latitude: Number(activity.location.latitude || 0),
                  longitude: Number(activity.location.longitude || 0)
                };
              }
            }
            
            let discountObj: { percentage: number; description: string; validUntil: string; } | undefined;
            if (activity.discount && 
                typeof activity.discount.percentage === 'number' &&
                typeof activity.discount.description === 'string' &&
                typeof activity.discount.validUntil === 'string') {
              discountObj = {
                percentage: activity.discount.percentage,
                description: activity.discount.description,
                validUntil: activity.discount.validUntil
              };
            }
            
            return {
              id: (index + 1).toString(),
              title: String(activity.title || ''),
              description: String(activity.description || ''),
              startTime: String(activity.start_time || ''),
              endTime: String(activity.end_time || ''),
              type: (activity.type || 'other') as 'breakfast' | 'sport' | 'shopping' | 'entertainment' | 'work' | 'social' | 'other',
              location: locationObj,
              budget: {
                min: estimatedCost * 0.8,
                max: estimatedCost,
                currency: 'TL'
              },
              discount: discountObj,
              mood: mood as 'energetic' | 'relaxed' | 'social' | 'productive' | 'creative'
            };
          }),
          totalBudget: Number(program.total_estimated_cost || 0),
          estimatedSavings: Number((program as unknown as Record<string, unknown>).estimated_savings || 0),
          moodAnalysis: {
            primary: mood,
            secondary: 'productive',
            recommendations: Array.isArray((program as unknown as Record<string, unknown>).recommendations) ? (program as unknown as Record<string, unknown>).recommendations as string[] : ['Güne pozitif başlayın']
          }
        };
        
        // Save timeline to database
        await this.saveTimelineToDatabase(userId, timeline);
        
        return timeline;
      }
      
      // Fallback to prompt-based generation
      const prompt = `
        Kullanıcı için günlük timeline oluştur:
        
        Kullanıcı Tercihleri:
        - Uyanma saati: ${preferences.wakeUpTime}
        - Uyku saati: ${preferences.sleepTime}
        - Bütçe aralığı: ${preferences.budgetRange.min}-${preferences.budgetRange.max} TL
        - İlgi alanları: ${preferences.interests.join(', ')}
        - Fitness seviyesi: ${preferences.fitnessLevel}
        - Sosyal tercih: ${preferences.socialPreference}
        - Şehir: ${preferences.location.city}
        
        Mevcut ruh hali: ${mood}
        
        Günlük timeline JSON formatında döndür:
        {
          "date": "${today}",
          "activities": [
            {
              "id": "unique_id",
              "title": "Sabah Sporu",
              "description": "Açıklama",
              "startTime": "07:00",
              "endTime": "08:00",
              "type": "sport",
              "location": {
                "name": "Mekan adı",
                "address": "Adres",
                "latitude": 41.0082,
                "longitude": 28.9784
              },
              "budget": {"min": 0, "max": 50, "currency": "TL"},
              "discount": {"percentage": 20, "description": "İndirim açıklaması", "validUntil": "2024-12-31"}
            }
          ],
          "totalBudget": 200,
          "estimatedSavings": 50,
          "moodAnalysis": {
            "primary": "${mood}",
            "secondary": "productive",
            "recommendations": ["Öneri 1", "Öneri 2"]
          }
        }
      `;

      const result = await geminiService.generateResponse(prompt);
      const timeline = JSON.parse(result);
      
      // Save timeline to database
      await this.saveTimelineToDatabase(userId, timeline);
      
      return timeline;
    } catch (error) {
      console.error('Timeline generation error:', error);
      return this.getDefaultTimeline(today);
    }
  }

  async generateRecommendations(
    userId: string,
    category: string,
    mood: string
  ): Promise<Record<string, unknown>[]> {
    // Get user preferences and location
    const preferences = await this.getUserPreferences(userId);
    
    try {
      const recommendations = await geminiService.generateRecommendations(
        userId,
        category,
        preferences?.location.city || 'İstanbul',
        preferences?.budgetRange.max || 500
      );
      
      return recommendations.map((rec: Record<string, unknown>) => ({
        id: String(rec.id || Math.random().toString(36).substr(2, 9)),
        title: String(rec.title || ''),
        description: String(rec.description || ''),
        category: String(rec.category || ''),
        rating: Number(rec.rating || 4.0),
        price: Number(rec.price || 0),
        location: String(rec.location || ''),
        discount: Number(rec.discount || 0),
        tags: Array.isArray(rec.tags) ? rec.tags.map(tag => String(tag)) : []
      }));
    } catch (error) {
      console.error('Recommendation generation error:', error);
      // Fallback to prompt-based generation
      const prompt = `
        ${category} kategorisinde ${mood} ruh haline uygun öneriler oluştur.
        
        Kullanıcı konumu: ${preferences?.location.city}
        İlgi alanları: ${preferences?.interests.join(', ')}
        Bütçe: ${preferences?.budgetRange.min}-${preferences?.budgetRange.max} TL
        
        JSON array formatında 5 öneri döndür:
        [
          {
            "id": "unique_id",
            "title": "Öneri başlığı",
            "description": "Açıklama",
            "category": "${category}",
            "rating": 4.5,
            "price": 100,
            "discount": 15,
            "location": "Konum",
            "image": "image_url",
            "tags": ["tag1", "tag2"]
          }
        ]
      `;

      try {
        const result = await geminiService.generateResponse(prompt);
        return JSON.parse(result);
      } catch (fallbackError) {
        console.error('Fallback recommendation generation error:', fallbackError);
        return [];
      }
    }
  }

  private generateTimelineResponse(timeline: DailyTimeline): string {
    const activitiesCount = timeline.activities.length;
    const savings = timeline.estimatedSavings;
    
    return `🌟 Harika! Sizin için ${activitiesCount} aktiviteli bir günlük program hazırladım. 

💰 Toplam bütçe: ${timeline.totalBudget} TL
💸 Tahmini tasarruf: ${savings} TL

🎯 Ruh halinize göre özel olarak seçilmiş aktiviteler var. Timeline'ı görmek ister misiniz?`;
  }

  private generateRecommendationResponse(recommendations: Record<string, unknown>[], category: string): string {
    const count = recommendations.length;
    return `🎉 ${category} kategorisinde sizin için ${count} harika öneri buldum! Ruh halinize ve tercihlerinize göre özel olarak seçtim. İncelemek ister misiniz?`;
  }

  private generateDiscountResponse(discounts: Record<string, unknown>[]): string {
    if (discounts.length === 0) {
      return '😔 Şu anda aktif bir indirim bulamadım, ama yakında yeni kampanyalar gelecek!';
    }
    return `🔥 Harika! ${discounts.length} aktif indirim fırsatı buldum. En yüksek indirim %${Math.max(...discounts.map(d => Number(d.percentage || 0)))}! Detayları görmek ister misiniz?`;
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return undefined;
    }
  }

  private async saveTimelineToDatabase(userId: string, timeline: DailyTimeline): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_timelines')
        .upsert({
          user_id: userId,
          date: timeline.date,
          activities: timeline.activities,
          total_budget: timeline.totalBudget,
          estimated_savings: timeline.estimatedSavings,
          mood_analysis: timeline.moodAnalysis,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  }

  private async getActiveDiscounts(_userId: string, category?: string): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('active_discounts')
        .select('*')
        .gte('valid_until', new Date().toISOString());

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching discounts:', error);
      return [];
    }
  }

  private async getMoodBasedRecommendations(mood: string, userId: string): Promise<Record<string, unknown>[]> {
    // Generate mood-specific recommendations
    return this.generateRecommendations(userId, 'mood_support', mood);
  }

  private async generateMoodSupportResponse(mood: string): Promise<string> {
    const moodResponses = {
      energetic: '⚡ Enerjinizi hissediyorum! Size aktif aktiviteler önerebilirim.',
      relaxed: '😌 Rahat bir gün geçirmek istiyorsunuz. Sakin aktiviteler buldum.',
      social: '👥 Sosyal aktiviteler için harika önerilerim var!',
      productive: '💪 Verimli bir gün için motivasyon verici aktiviteler hazırladım.',
      stressed: '🧘‍♀️ Stresli görünüyorsunuz. Rahatlatıcı aktiviteler önerebilirim.',
      happy: '😊 Mutluluğunuzu hissediyorum! Bu enerjiyi değerlendirelim.',
      tired: '😴 Yorgun görünüyorsunuz. Dinlendirici aktiviteler buldum.',
    };

    return moodResponses[mood as keyof typeof moodResponses] || '🌟 Size uygun aktiviteler buldum!';
  }

  private async generateGeneralResponse(message: string, conversation: ConversationContext): Promise<string> {
    const prompt = `
      Kullanıcıyla doğal bir sohbet yürüt. Sen bir AI asistanısın ve kullanıcının günlük aktivitelerini planlama konusunda yardımcı oluyorsun.
      
      Kullanıcı mesajı: "${message}"
      
      Sohbet geçmişi: ${conversation.messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
      
      Samimi, yardımsever ve Türkçe bir yanıt ver. Emoji kullan.
    `;

    try {
      return await geminiService.generateResponse(prompt);
    } catch (error) {
      return '😊 Merhaba! Size nasıl yardımcı olabilirim? Günlük programınızı planlamak, öneriler almak veya sohbet etmek için buradayım!';
    }
  }

  private getDefaultTimeline(date: string): DailyTimeline {
    return {
      date,
      activities: [
        {
          id: 'default-1',
          title: 'Günaydın Kahvesi',
          description: 'Güne enerjik başlamak için kahve molası',
          startTime: '08:00',
          endTime: '08:30',
          type: 'breakfast',
          budget: { min: 15, max: 30, currency: 'TL' },
        },
        {
          id: 'default-2',
          title: 'Öğle Yemeği',
          description: 'Lezzetli ve sağlıklı öğle yemeği',
          startTime: '12:00',
          endTime: '13:00',
          type: 'other',
          budget: { min: 40, max: 80, currency: 'TL' },
        },
      ],
      totalBudget: 110,
      estimatedSavings: 20,
      moodAnalysis: {
        primary: 'neutral',
        secondary: 'productive',
        recommendations: ['Güne pozitif başlayın', 'Hedeflerinizi belirleyin'],
      },
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const aiAssistantService = new AIAssistantService();
export default AIAssistantService;