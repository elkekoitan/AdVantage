# AdVantage: Ürün Gereksinimleri Dokümanı (PRD)

**Proje Adı:** AdVantage  
**Versiyon:** 1.0  
**Tarih:** 10 Ocak 2025  
**Yazar:** Manus AI Team

## 🎯 Yönetici Özeti

AdVantage, kullanıcıların kişiselleştirilmiş günlük programlar oluşturmasını, şirketlerin hedefli pazarlama yapmasını ve influencer'ların gelir elde etmesini sağlayan yapay zeka destekli bir sosyal ticaret platformudur. Platform, ücretsiz bulut servisleri ve açık kaynak teknolojileri kullanarak minimum maliyetle maksimum değer yaratmayı hedeflemektedir.

## 📱 Temel Özellikler

### 1. Kişiselleştirilmiş Program Oluşturma
- AI destekli günlük aktivite önerileri
- Mekan, restoran, etkinlik tavsiyeleri
- Gerçek zamanlı program düzenleme
- Ulaşım entegrasyonu (taksi çağırma)

### 2. Sosyal Paylaşım ve Gelir Modeli
- Otomatik kolaj oluşturma
- Sosyal medya entegrasyonu
- Referans linkli paylaşım sistemi
- Kullanıcıdan kullanıcıya kazanç modeli

### 3. Şirket Dashboard'u
- Trafik analitikleri
- Dinamik indirim yönetimi
- Influencer ortaklık sistemi
- Multi-platform reklam yönetimi

### 4. Kapsamlı Tavsiye Motoru
- Ürün, yemek, etkinlik önerileri
- Oyun ve oyun içi içerik tavsiyeleri
- Müzik, film ve albüm önerileri
- Sanatçı/müzisyen tanıtım platformu

## 🏗️ Teknik Mimari

### Ücretsiz Teknoloji Stack'i

#### Backend (Coolify Deployment)
- **Supabase** (PostgreSQL, Auth, Realtime) - Ücretsiz tier
- **Deno Deploy** - Edge Functions için ücretsiz
- **Railway/Render** - Ücretsiz backend hosting

#### Frontend
- **React Native** - Mobil uygulama
- **Expo** - Cross-platform geliştirme
- **Vercel** - Web deployment (ücretsiz tier)

#### AI & ML
- **Google Gemini API** - Ücretsiz tier
- **Hugging Face** - Açık kaynak modeller
- **TensorFlow.js** - Client-side AI

#### Diğer Servisler
- **GitHub Actions** - CI/CD
- **Cloudflare** - CDN ve güvenlik
- **Google Maps API** - Ücretsiz kotalar

## 🚀 Geliştirme Yol Haritası

### Faz 1: MVP (0-2 Ay)
1. Temel kullanıcı kimlik doğrulama
2. Program oluşturma arayüzü
3. Basit AI öneri sistemi
4. Sosyal paylaşım özellikleri

### Faz 2: Şirket Entegrasyonu (2-4 Ay)
1. Şirket dashboard'u
2. Kampanya yönetimi
3. Trafik analitikleri
4. Dinamik indirim sistemi

### Faz 3: Gelişmiş Özellikler (4-6 Ay)
1. Influencer ortaklık platformu
2. Gelişmiş AI tavsiye motoru
3. Multi-platform entegrasyonlar
4. Ödeme sistemleri

## 💰 Gelir Modeli

1. **Komisyon Bazlı**: Şirket reklamlarından %5-15 komisyon
2. **Referans Gelirleri**: Kullanıcıdan kullanıcıya kazanç paylaşımı
3. **Premium Özellikler**: Gelişmiş analitik ve AI özellikleri
4. **API Erişimi**: Kurumsal entegrasyonlar

## 📊 Başarı Metrikleri

- Aylık Aktif Kullanıcı (MAU): 10K (6. ay)
- Şirket Sayısı: 100+ (6. ay)
- Ortalama Program Oluşturma: 3/kullanıcı/hafta
- Sosyal Paylaşım Oranı: %30+
- Platform Üzerinden Gelir: $50K/ay (6. ay)

## 🔧 Coolify Deployment Stratejisi

1. **Oracle Cloud Free Tier** veya **Google Cloud Free Tier** üzerinde Coolify kurulumu
2. Docker container'ları ile mikroservis mimarisi
3. GitHub Actions ile otomatik deployment
4. Cloudflare tünelleri ile güvenli erişim

## 🛡️ Güvenlik ve Uyumluluk

- KVKK/GDPR uyumluluğu
- SSL/TLS şifreleme
- API rate limiting
- Veri maskeleme ve anonimleştirme

## 📈 Büyüme Stratejisi

1. **Viral Büyüme**: Referans sistemi ile organik kullanıcı kazanımı
2. **İçerik Pazarlama**: SEO optimizeli blog ve rehberler
3. **Influencer İşbirlikleri**: Platform üzerinden kendi sistemimizi kullanarak
4. **Yerel İşletme Ortaklıkları**: Pilot bölgede yoğun B2B satış

## 🎯 İlk Sprint Hedefleri

1. React Native mobil uygulama iskeleti
2. Supabase backend kurulumu
3. Temel kullanıcı arayüzü
4. AI öneri sistemi prototipi
5. Coolify deployment pipeline'ı 