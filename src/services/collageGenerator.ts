// ViewShot import removed as it's not used in this file
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface CollageTemplate {
  id: string;
  name: string;
  layout: 'single' | 'grid' | 'story' | 'banner';
  aspectRatio: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export interface CollageData {
  program: Record<string, unknown>;
  template: CollageTemplate;
  customText?: string;
  showStats?: boolean;
  showDate?: boolean;
  showLocation?: boolean;
}

class CollageGeneratorService {
  // Önceden tanımlanmış şablonlar
  private templates: CollageTemplate[] = [
    {
      id: 'modern',
      name: 'Modern',
      layout: 'single',
      aspectRatio: 1, // 1:1 (Instagram post)
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#3b82f6'
    },
    {
      id: 'vibrant',
      name: 'Canlı',
      layout: 'single',
      aspectRatio: 1,
      backgroundColor: '#f59e0b',
      textColor: '#1a1a1a',
      accentColor: '#ffffff'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      layout: 'single',
      aspectRatio: 1,
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#6366f1'
    },
    {
      id: 'story',
      name: 'Hikaye',
      layout: 'story',
      aspectRatio: 9/16, // 9:16 (Instagram story)
      backgroundColor: '#ec4899',
      textColor: '#ffffff',
      accentColor: '#fbbf24'
    },
    {
      id: 'banner',
      name: 'Banner',
      layout: 'banner',
      aspectRatio: 16/9, // 16:9 (Facebook cover)
      backgroundColor: '#059669',
      textColor: '#ffffff',
      accentColor: '#34d399'
    },
    {
      id: 'gradient',
      name: 'Gradyan',
      layout: 'single',
      aspectRatio: 1,
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      accentColor: '#fbbf24'
    }
  ];

  // Şablonları getir
  getTemplates(): CollageTemplate[] {
    return this.templates;
  }

  // Belirli bir şablonu getir
  getTemplate(templateId: string): CollageTemplate | null {
    return this.templates.find(t => t.id === templateId) || null;
  }

  // Kolaj boyutlarını hesapla
  calculateDimensions(template: CollageTemplate): { width: number; height: number } {
    const maxWidth = screenWidth - 40; // Padding için
    const width = Math.min(maxWidth, 400);
    const height = width / template.aspectRatio;
    
    return { width, height };
  }

  // Program verilerinden kolaj metni oluştur
  generateCollageText(program: Record<string, unknown>, customText?: string): string {
    if (customText) {
      return customText;
    }

    const title = String(program.title || 'Yeni Program');
    const date = program.date ? new Date(String(program.date)).toLocaleDateString('tr-TR') : '';
    const budget = program.total_budget ? `₺${Number(program.total_budget).toLocaleString()}` : '';
    const activities = program.activities_count ? `${Number(program.activities_count)} aktivite` : '';

    let text = title;
    if (date) text += `\n📅 ${date}`;
    if (budget) text += `\n💰 ${budget} bütçe`;
    if (activities) text += `\n🎯 ${activities}`;

    return text;
  }

  // Program istatistiklerini formatla
  formatProgramStats(program: Record<string, unknown>): string[] {
    const stats: string[] = [];
    
    if (program.total_budget) {
      stats.push(`₺${Number(program.total_budget).toLocaleString()} bütçe`);
    }
    
    if (program.activities_count) {
      stats.push(`${Number(program.activities_count)} aktivite`);
    }
    
    if (program.spent_amount !== undefined) {
      const totalBudget = Number(program.total_budget || 0);
      const spentAmount = Number(program.spent_amount || 0);
      const percentage = totalBudget > 0 
        ? Math.round((spentAmount / totalBudget) * 100)
        : 0;
      stats.push(`%${percentage} tamamlandı`);
    }
    
    if (program.location) {
      stats.push(`📍 ${String(program.location)}`);
    }

    return stats;
  }

  // Kolaj arka plan rengini hesapla
  getBackgroundStyle(template: CollageTemplate): Record<string, unknown> {
    if (template.backgroundColor.startsWith('linear-gradient')) {
      // Gradyan için basit bir renk döndür (React Native gradyan desteği için ayrı kütüphane gerekir)
      return { backgroundColor: '#667eea' };
    }
    
    return { backgroundColor: template.backgroundColor };
  }

  // Kolaj önizleme verilerini oluştur
  generatePreviewData(program: Record<string, unknown>, templateId: string): CollageData | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      program,
      template,
      customText: this.generateCollageText(program),
      showStats: true,
      showDate: true,
      showLocation: !!program.location
    };
  }

  // ViewShot ile kolajı görüntü olarak yakala
  async captureCollage(viewShotRef: { current: { capture: (options?: Record<string, unknown>) => Promise<string> } | null }, options?: Record<string, unknown>): Promise<string | null> {
    try {
      if (!viewShotRef?.current) {
        console.error('ViewShot ref bulunamadı');
        return null;
      }

      const defaultOptions = {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile'
      };

      const uri = await viewShotRef.current.capture({
        ...defaultOptions,
        ...options
      });

      return uri;
    } catch (error) {
      console.error('Kolaj yakalama hatası:', error);
      return null;
    }
  }

  // Platform özel boyutları
  getPlatformDimensions(platform: string): { width: number; height: number } {
    const baseDimensions = {
      instagram: { width: 1080, height: 1080 }, // 1:1
      'instagram-story': { width: 1080, height: 1920 }, // 9:16
      facebook: { width: 1200, height: 630 }, // ~1.9:1
      twitter: { width: 1200, height: 675 }, // 16:9
      whatsapp: { width: 1080, height: 1080 }, // 1:1
      tiktok: { width: 1080, height: 1920 } // 9:16
    };

    return baseDimensions[platform as keyof typeof baseDimensions] || baseDimensions.instagram;
  }

  // Platform için en uygun şablonu öner
  suggestTemplateForPlatform(platform: string): CollageTemplate {
    switch (platform.toLowerCase()) {
      case 'instagram-story':
      case 'tiktok':
        return this.templates.find(t => t.layout === 'story') || this.templates[0];
      case 'facebook':
      case 'twitter':
        return this.templates.find(t => t.layout === 'banner') || this.templates[0];
      default:
        return this.templates.find(t => t.layout === 'single') || this.templates[0];
    }
  }

  // Renk paletini oluştur
  generateColorPalette(baseColor: string): { primary: string; secondary: string; accent: string; text: string } {
    // Basit renk paleti oluşturma (gerçek uygulamada daha gelişmiş algoritma kullanılabilir)
    return {
      primary: baseColor,
      secondary: this.lightenColor(baseColor),
      accent: this.complementaryColor(),
      text: this.getContrastColor(baseColor)
    };
  }

  // Rengi açma
  private lightenColor(color: string): string {
    // Basit renk açma algoritması
    return color; // Gerçek implementasyon için color manipulation kütüphanesi gerekir
  }

  // Tamamlayıcı renk
  private complementaryColor(): string {
    // Basit tamamlayıcı renk algoritması
    return '#fbbf24'; // Varsayılan accent rengi
  }

  // Kontrast rengi
  private getContrastColor(backgroundColor: string): string {
    // Basit kontrast hesaplama
    return backgroundColor.includes('#f') || backgroundColor.includes('light') ? '#000000' : '#ffffff';
  }
}

export const collageGenerator = new CollageGeneratorService();
export default collageGenerator;