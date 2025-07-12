# 🚀 AdVantage - AI-Powered Social Commerce Platform

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
</div>

## 📱 Proje Hakkında

AdVantage, kullanıcıların AI destekli kişiselleştirilmiş günlük programlar oluşturmasını, şirketlerin hedefli pazarlama yapmasını ve influencer'ların gelir elde etmesini sağlayan yenilikçi bir sosyal ticaret platformudur.

## ✨ Temel Özellikler

- 🗓️ **Akıllı Program Planlama**: AI ile günlük aktivite önerileri
- 🏪 **Dinamik İndirimler**: Anlık kişiye özel kampanyalar
- 📊 **Şirket Dashboard**: Detaylı trafik analitikleri
- 🎨 **Sosyal Paylaşım**: Otomatik kolaj ve story oluşturma
- 💰 **Gelir Paylaşımı**: Referans sistemi ile kazanç
- 🎵 **Kapsamlı Tavsiyeler**: Yemek, etkinlik, müzik, film önerileri

## 🛠️ Teknoloji Stack

### Frontend
- React Native + TypeScript
- Expo (Cross-platform)
- React Navigation 6
- React Query (Data fetching)
- Zustand (State management)
- NativeBase UI

### Backend
- Supabase (Database, Auth, Realtime)
- Deno Deploy (Edge Functions)
- Google Gemini AI
- Cloudflare (CDN, Security)

### DevOps
- GitHub Actions (CI/CD)
- Coolify (Self-hosted PaaS)
- Docker
- Vercel (Web deployment)

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo CLI
- Git

### Kurulum

```bash
# Projeyi klonla
git clone https://github.com/yourusername/AdVantage.git
cd AdVantage

# Bağımlılıkları yükle
npm install

# Expo ile başlat
npx expo start

# iOS için
npx expo run:ios

# Android için
npx expo run:android
```

### Çevre Değişkenleri

`.env.local` dosyası oluşturun:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENROUTE_API_KEY=your_openroute_service_key
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

## 📁 Proje Yapısı

```
AdVantage/
├── src/
│   ├── components/     # Reusable components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation setup
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   ├── store/         # State management
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
├── assets/            # Images, fonts
├── __tests__/         # Test files
└── docs/              # Documentation
```

## 🧪 Test

```bash
# Unit testler
npm test

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

## 📦 Build & Deploy

### Mobil Uygulama

```bash
# Production build
npx expo build:ios
npx expo build:android

# EAS Build (Önerilen)
eas build --platform all
```

### Backend (Coolify)

```bash
# Docker image oluştur
docker build -t advantage-backend .

# Coolify'a deploy
coolify deploy --app advantage
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- Website: [advantage.app](https://advantage.app)
- Email: hello@advantage.app
- Twitter: [@advantageapp](https://twitter.com/advantageapp)

## 🙏 Teşekkürler

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)

---

<div align="center">
  Made with ❤️ by AdVantage Team
</div>