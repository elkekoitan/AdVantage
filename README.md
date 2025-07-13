# AdVantage - AI-Powered Travel & Budget Planning App

## 📱 Proje Hakkında

AdVantage, yapay zeka destekli seyahat ve bütçe planlama uygulamasıdır. Kullanıcıların kişiselleştirilmiş seyahat önerileri almasını, bütçe planlaması yapmasını ve sosyal medya içerikleri oluşturmasını sağlar.

## 🚀 Özellikler

### Ana Özellikler
- **AI Destekli Seyahat Planlaması**: Gemini AI ile kişiselleştirilmiş öneriler
- **Konum Bazlı Öneriler**: OpenRouteService entegrasyonu ile yakındaki yerler
- **Bütçe Yönetimi**: Akıllı harcama takibi ve önerileri
- **Sosyal Medya Entegrasyonu**: Otomatik kolaj ve içerik oluşturma
- **Sesli Asistan**: AI destekli sesli komutlar
- **Harita Entegrasyonu**: Detaylı rota planlama

### Teknik Özellikler
- **React Native & Expo**: Cross-platform mobil uygulama
- **TypeScript**: Tip güvenli geliştirme
- **Supabase**: Backend ve veritabanı
- **Google Gemini AI**: Yapay zeka entegrasyonu
- **OpenRouteService**: Harita ve rota servisleri

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- Android Studio (Android geliştirme için)
- Xcode (iOS geliştirme için)

### Kurulum Adımları

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd AdVantage
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın:**
`.env` dosyası oluşturun ve gerekli API anahtarlarını ekleyin:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_OPENROUTE_API_KEY=your_openroute_api_key
```

4. **Uygulamayı başlatın:**
```bash
npx expo start
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── business/        # İş mantığı bileşenleri
│   ├── social/          # Sosyal medya bileşenleri
│   └── ui/              # UI bileşenleri
├── screens/             # Ekran bileşenleri
├── services/            # API servisleri
│   ├── gemini.ts        # Gemini AI servisi
│   ├── openRouteService.ts # Harita servisleri
│   └── supabase.ts      # Veritabanı servisi
├── types/               # TypeScript tip tanımları
└── utils/               # Yardımcı fonksiyonlar
```

## 🔧 Son Güncellemeler

### TypeScript Hataları Düzeltildi (Son Güncelleme)
- `POIResponse` arayüzüne `type` ve `distance` özellikleri eklendi
- `EnhancedPOIResponse` tipinin doğru kullanımı sağlandı
- `ExploreScreen` ve `LocationBasedSuggestions` bileşenlerinde navigation hataları düzeltildi
- `calculateBoundingBox` fonksiyonunun dönüş tipi uyumluluğu sağlandı

### Çözülen Sorunlar
- ✅ TypeScript compilation hataları
- ✅ Navigation prop tanımlamaları
- ✅ API yanıt tiplerinin uyumluluğu
- ✅ Expo sunucusu başlatma sorunları

## 🚀 Geliştirme

### Mevcut Durum
- Expo sunucusu başarıyla çalışıyor (Port: 8081)
- TypeScript hataları tamamen düzeltildi
- Tüm ana özellikler çalışır durumda

### Gelecek Özellikler
- Offline mod desteği
- Gelişmiş AI önerileri
- Sosyal paylaşım özellikleri
- Premium abonelik sistemi

## 📱 Kullanım

1. **Hesap Oluşturma**: Supabase auth ile güvenli giriş
2. **Profil Ayarlama**: Kişisel tercihlerinizi belirleyin
3. **Seyahat Planlama**: AI destekli öneriler alın
4. **Bütçe Takibi**: Harcamalarınızı izleyin
5. **Sosyal Paylaşım**: Deneyimlerinizi paylaşın

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya doğrudan iletişime geçebilirsiniz.

---

**Son Güncelleme**: TypeScript hataları düzeltildi ve proje başarıyla çalışır duruma getirildi.