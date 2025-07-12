import { supabase } from './supabase';
import { Share } from 'react-native';
import { Alert, Linking, Platform } from 'react-native';

export interface SocialShareData {
  program: any;
  platforms: string[];
  title: string;
  description: string;
  hashtags: string[];
  imageUri?: string;
}

export interface SocialShareRecord {
  id?: string;
  user_id: string;
  program_id: string;
  platforms: string[];
  title: string;
  description: string;
  hashtags: string[];
  media_urls: string[];
  engagement_metrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  created_at?: string;
  updated_at?: string;
}

class SocialShareService {
  // Sosyal medya paylaşımını kaydet
  async saveSocialShare(shareData: SocialShareData, userId: string): Promise<SocialShareRecord | null> {
    try {
      const shareRecord: Omit<SocialShareRecord, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        program_id: shareData.program.id,
        platforms: shareData.platforms,
        title: shareData.title,
        description: shareData.description,
        hashtags: shareData.hashtags,
        media_urls: shareData.imageUri ? [shareData.imageUri] : [],
        engagement_metrics: {
          likes: 0,
          shares: 0,
          comments: 0
        }
      };

      const { data, error } = await supabase
        .from('social_shares')
        .insert([shareRecord])
        .select()
        .single();

      if (error) {
        console.error('Sosyal paylaşım kaydedilemedi:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Sosyal paylaşım kaydetme hatası:', error);
      return null;
    }
  }

  // Kullanıcının sosyal paylaşımlarını getir
  async getUserSocialShares(userId: string): Promise<SocialShareRecord[]> {
    try {
      const { data, error } = await supabase
        .from('social_shares')
        .select(`
          *,
          programs!inner(
            id,
            title,
            description,
            date
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Sosyal paylaşımlar getirilemedi:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Sosyal paylaşımlar getirme hatası:', error);
      return [];
    }
  }

  // Platform bazında paylaşım istatistikleri
  async getPlatformStats(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('platform_share_stats')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Platform istatistikleri getirilemedi:', error);
        return {};
      }

      const stats: Record<string, number> = {};
      data?.forEach(item => {
        stats[item.platform] = item.share_count;
      });

      return stats;
    } catch (error) {
      console.error('Platform istatistikleri getirme hatası:', error);
      return {};
    }
  }

  // Native paylaşım
  async shareToNative(shareData: SocialShareData): Promise<boolean> {
    try {
      const shareContent = {
        title: shareData.title,
        message: `${shareData.description}\n\n${shareData.hashtags.map(tag => `#${tag}`).join(' ')}`,
        url: shareData.imageUri
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Native paylaşım hatası:', error);
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
      return false;
    }
  }

  // Instagram'a yönlendir
  async shareToInstagram(_shareData: SocialShareData): Promise<boolean> {
    try {
      const instagramUrl = Platform.select({
        ios: 'instagram://app',
        android: 'intent://instagram.com/#Intent;package=com.instagram.android;scheme=https;end'
      });

      if (instagramUrl) {
        const canOpen = await Linking.canOpenURL(instagramUrl);
        if (canOpen) {
          await Linking.openURL(instagramUrl);
          return true;
        } else {
          // Instagram yüklü değilse web'e yönlendir
          await Linking.openURL('https://www.instagram.com/');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Instagram paylaşım hatası:', error);
      return false;
    }
  }

  // Facebook'a yönlendir
  async shareToFacebook(_shareData: SocialShareData): Promise<boolean> {
    try {
      const facebookUrl = Platform.select({
        ios: 'fb://profile',
        android: 'intent://facebook.com/#Intent;package=com.facebook.katana;scheme=https;end'
      });

      if (facebookUrl) {
        const canOpen = await Linking.canOpenURL(facebookUrl);
        if (canOpen) {
          await Linking.openURL(facebookUrl);
          return true;
        } else {
          // Facebook yüklü değilse web'e yönlendir
          await Linking.openURL('https://www.facebook.com/');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Facebook paylaşım hatası:', error);
      return false;
    }
  }

  // Twitter/X'e yönlendir
  async shareToTwitter(shareData: SocialShareData): Promise<boolean> {
    try {
      const tweetText = encodeURIComponent(
        `${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags.map(tag => `#${tag}`).join(' ')}`
      );
      
      const twitterUrl = Platform.select({
        ios: `twitter://post?message=${tweetText}`,
        android: `intent://twitter.com/intent/tweet?text=${tweetText}#Intent;package=com.twitter.android;scheme=https;end`
      });

      if (twitterUrl) {
        const canOpen = await Linking.canOpenURL(twitterUrl);
        if (canOpen) {
          await Linking.openURL(twitterUrl);
          return true;
        } else {
          // Twitter yüklü değilse web'e yönlendir
          await Linking.openURL(`https://twitter.com/intent/tweet?text=${tweetText}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Twitter paylaşım hatası:', error);
      return false;
    }
  }

  // WhatsApp'a yönlendir
  async shareToWhatsApp(shareData: SocialShareData): Promise<boolean> {
    try {
      const message = encodeURIComponent(
        `${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags.map(tag => `#${tag}`).join(' ')}`
      );
      
      const whatsappUrl = `whatsapp://send?text=${message}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert('Hata', 'WhatsApp yüklü değil.');
        return false;
      }
    } catch (error) {
      console.error('WhatsApp paylaşım hatası:', error);
      return false;
    }
  }

  // TikTok'a yönlendir
  async shareToTikTok(_shareData: SocialShareData): Promise<boolean> {
    try {
      const tiktokUrl = Platform.select({
        ios: 'tiktok://app',
        android: 'intent://tiktok.com/#Intent;package=com.zhiliaoapp.musically;scheme=https;end'
      });

      if (tiktokUrl) {
        const canOpen = await Linking.canOpenURL(tiktokUrl);
        if (canOpen) {
          await Linking.openURL(tiktokUrl);
          return true;
        } else {
          // TikTok yüklü değilse web'e yönlendir
          await Linking.openURL('https://www.tiktok.com/');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('TikTok paylaşım hatası:', error);
      return false;
    }
  }

  // Platform'a göre paylaşım
  async shareToPlatform(platform: string, shareData: SocialShareData): Promise<boolean> {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return await this.shareToInstagram(shareData);
      case 'facebook':
        return await this.shareToFacebook(shareData);
      case 'twitter':
      case 'x':
        return await this.shareToTwitter(shareData);
      case 'whatsapp':
        return await this.shareToWhatsApp(shareData);
      case 'tiktok':
        return await this.shareToTikTok(shareData);
      case 'native':
        return await this.shareToNative(shareData);
      default:
        return await this.shareToNative(shareData);
    }
  }

  // Etkileşim metriklerini güncelle
  async updateEngagementMetrics(
    shareId: string, 
    metrics: { likes?: number; shares?: number; comments?: number }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_shares')
        .update({ 
          engagement_metrics: metrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', shareId);

      if (error) {
        console.error('Etkileşim metrikleri güncellenemedi:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Etkileşim metrikleri güncelleme hatası:', error);
      return false;
    }
  }
}

export const socialShareService = new SocialShareService();
export default socialShareService;