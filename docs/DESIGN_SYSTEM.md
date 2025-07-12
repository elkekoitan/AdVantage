# AdVantage Design System 2025 🎨

## Genel Bakış

AdVantage uygulaması için modern, kullanıcı dostu ve 2025 trendlerine uygun kapsamlı tasarım sistemi. Bu tasarım dili, kolay adaptasyon, erişilebilirlik ve görsel tutarlılık prensipleri üzerine kurulmuştur.

## 🎯 Tasarım Prensipleri

### 1. Kullanıcı Merkezli Tasarım
- **Basitlik**: Karmaşıklığı minimize et, temel işlevleri öne çıkar
- **Tutarlılık**: Tüm ekranlarda aynı tasarım dilini kullan
- **Erişilebilirlik**: Tüm kullanıcılar için kapsayıcı tasarım
- **Performans**: Hızlı yükleme ve akıcı animasyonlar

### 2. Modern Estetik
- **Minimalizm**: Gereksiz öğeleri kaldır, içeriği öne çıkar
- **Yumuşak Kenarlar**: Dostane ve modern görünüm
- **Dinamik Renkler**: Canlı ama dengeli renk paleti
- **Mikro Etkileşimler**: Kullanıcı deneyimini zenginleştiren animasyonlar

## 🌈 Renk Paleti

### Ana Renkler (Primary)
```css
--primary-50: #f0f9ff
--primary-100: #e0f2fe
--primary-200: #bae6fd
--primary-300: #7dd3fc
--primary-400: #38bdf8
--primary-500: #0ea5e9  /* Ana mavi */
--primary-600: #0284c7
--primary-700: #0369a1
--primary-800: #075985
--primary-900: #0c4a6e
```

### İkincil Renkler (Secondary)
```css
--secondary-50: #fdf4ff
--secondary-100: #fae8ff
--secondary-200: #f5d0fe
--secondary-300: #f0abfc
--secondary-400: #e879f9
--secondary-500: #d946ef  /* Ana mor */
--secondary-600: #c026d3
--secondary-700: #a21caf
--secondary-800: #86198f
--secondary-900: #701a75
```

### Nötr Renkler
```css
/* Light Theme */
--neutral-50: #fafafa
--neutral-100: #f5f5f5
--neutral-200: #e5e5e5
--neutral-300: #d4d4d4
--neutral-400: #a3a3a3
--neutral-500: #737373
--neutral-600: #525252
--neutral-700: #404040
--neutral-800: #262626
--neutral-900: #171717

/* Dark Theme */
--dark-50: #18181b
--dark-100: #27272a
--dark-200: #3f3f46
--dark-300: #52525b
--dark-400: #71717a
--dark-500: #a1a1aa
--dark-600: #d4d4d8
--dark-700: #e4e4e7
--dark-800: #f4f4f5
--dark-900: #fafafa
```

### Sistem Renkleri
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

## 🌓 Tema Sistemi

### Light Theme
```css
:root {
  --bg-primary: #ffffff
  --bg-secondary: #f8fafc
  --bg-tertiary: #f1f5f9
  --text-primary: #0f172a
  --text-secondary: #475569
  --text-tertiary: #94a3b8
  --border-primary: #e2e8f0
  --border-secondary: #cbd5e1
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --bg-primary: #0f172a
  --bg-secondary: #1e293b
  --bg-tertiary: #334155
  --text-primary: #f8fafc
  --text-secondary: #cbd5e1
  --text-tertiary: #64748b
  --border-primary: #334155
  --border-secondary: #475569
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3)
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4)
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5)
}
```

## 📝 Tipografi

### Font Ailesi
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

### Font Boyutları
```css
--text-xs: 12px    /* Küçük etiketler */
--text-sm: 14px    /* Yardımcı metinler */
--text-base: 16px  /* Ana metin */
--text-lg: 18px    /* Alt başlıklar */
--text-xl: 20px    /* Başlıklar */
--text-2xl: 24px   /* Büyük başlıklar */
--text-3xl: 30px   /* Ana başlıklar */
--text-4xl: 36px   /* Hero başlıklar */
```

### Font Ağırlıkları
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Satır Yükseklikleri
```css
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

## 📐 Spacing & Layout

### Spacing Scale
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

### Border Radius
```css
--radius-none: 0px
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-full: 9999px
```

### Container Boyutları
```css
--container-sm: 640px
--container-md: 768px
--container-lg: 1024px
--container-xl: 1280px
```

## 🎛️ Bileşenler

### Butonlar

#### Primary Button
```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--primary-500);
  border: 2px solid var(--primary-500);
  padding: 10px 22px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--primary-50);
  transform: translateY(-1px);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: rgba(var(--primary-500), 0.1);
  color: var(--primary-500);
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(var(--primary-500), 0.15);
}
```

### Input Alanları
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(var(--primary-500), 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Kartlar
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Modal/Overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
```

## 🎭 Animasyonlar & Geçişler

### Temel Geçişler
```css
--transition-fast: 0.15s ease
--transition-normal: 0.2s ease
--transition-slow: 0.3s ease
```

### Mikro Etkileşimler
```css
/* Hover efektleri */
.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform var(--transition-normal);
}

/* Tıklama efektleri */
.press-effect:active {
  transform: scale(0.98);
  transition: transform var(--transition-fast);
}

/* Fade animasyonları */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide animasyonları */
.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

## 📱 Responsive Tasarım

### Breakpoints
```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

### Mobile-First Yaklaşım
```css
/* Mobile (default) */
.container {
  padding: var(--space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
  }
}
```

## 🎨 Glassmorphism Efektleri

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
}

[data-theme="dark"] .glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 🔧 Utility Classes

### Spacing Utilities
```css
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }
```

### Text Utilities
```css
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-light { font-weight: var(--font-light); }
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }
```

### Flex Utilities
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
```

## 🎯 Kullanım Örnekleri

### Login Ekranı Tasarımı
```jsx
<View style={styles.container}>
  <View style={styles.header}>
    <Text style={styles.title}>AdVantage'a Hoş Geldiniz</Text>
    <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
  </View>
  
  <View style={styles.form}>
    <TextInput 
      style={styles.input}
      placeholder="E-posta adresiniz"
      placeholderTextColor={colors.textTertiary}
    />
    <TextInput 
      style={styles.input}
      placeholder="Şifreniz"
      secureTextEntry
      placeholderTextColor={colors.textTertiary}
    />
    
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.buttonText}>Giriş Yap</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
    </TouchableOpacity>
  </View>
</View>
```

### Kart Bileşeni
```jsx
<TouchableOpacity style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Program Adı</Text>
    <Text style={styles.cardBadge}>Aktif</Text>
  </View>
  
  <Text style={styles.cardDescription}>
    Program açıklaması burada yer alacak...
  </Text>
  
  <View style={styles.cardFooter}>
    <Text style={styles.cardPrice}>₺1,250</Text>
    <Text style={styles.cardDate}>15 Ocak 2025</Text>
  </View>
</TouchableOpacity>
```

## 🎨 İkon Sistemi

### İkon Boyutları
```css
--icon-xs: 12px
--icon-sm: 16px
--icon-md: 20px
--icon-lg: 24px
--icon-xl: 32px
--icon-2xl: 48px
```

### İkon Stilleri
- **Outline**: Çizgi tabanlı, modern görünüm
- **Filled**: Dolu, vurgu gerektiren durumlar için
- **Duotone**: İki renkli, özel durumlar için

## 🌟 2025 Trend Uygulamaları

### 1. AI Destekli Kişiselleştirme
- Kullanıcı davranışlarına göre dinamik tema değişimi
- Kişiselleştirilmiş renk paletleri
- Akıllı içerik önerileri

### 2. Gelişmiş Dark Mode
- Otomatik ortam ışığına göre ayarlama
- Yumuşak geçişler
- Göz yorgunluğunu azaltan renk paletleri

### 3. Mikro Etkileşimler
- Haptic feedback entegrasyonu
- Contextual animasyonlar
- Duygusal bağlantı kuran etkileşimler

### 4. Glassmorphism & Neumorphism
- Şeffaf overlay'ler
- Yumuşak gölgeler
- Derinlik hissi yaratan tasarımlar

### 5. Gesture-Based Navigation
- Swipe navigasyonu
- Pinch-to-zoom
- Long press menüleri

## 📋 Uygulama Checklist

### ✅ Temel Gereksinimler
- [ ] Renk paletini uygula
- [ ] Tipografi sistemini kur
- [ ] Spacing değerlerini ayarla
- [ ] Temel bileşenleri oluştur

### ✅ Tema Sistemi
- [ ] Light theme uygula
- [ ] Dark theme uygula
- [ ] Tema geçiş animasyonları
- [ ] Sistem tercihi algılama

### ✅ Responsive Tasarım
- [ ] Mobile-first yaklaşım
- [ ] Tablet optimizasyonu
- [ ] Desktop uyumluluğu
- [ ] Orientation değişiklikleri

### ✅ Erişilebilirlik
- [ ] Renk kontrastı kontrolü
- [ ] Screen reader uyumluluğu
- [ ] Keyboard navigasyonu
- [ ] Font boyutu ölçeklendirme

### ✅ Performans
- [ ] Animasyon optimizasyonu
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size kontrolü

## 🔄 Güncelleme Süreci

Bu tasarım sistemi canlı bir dokümandır ve düzenli olarak güncellenmelidir:

1. **Aylık İnceleme**: Kullanıcı geri bildirimlerini değerlendir
2. **Çeyreklik Güncelleme**: Yeni trendleri entegre et
3. **Yıllık Revizyon**: Büyük değişiklikleri planla

## 📞 İletişim

Tasarım sistemi hakkında sorularınız için:
- Design Team: design@advantage.com
- Documentation: docs@advantage.com

---

**Son Güncelleme**: Ocak 2025  
**Versiyon**: 1.0.0  
**Durum**: Aktif Geliştirme