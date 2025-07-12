# Hata Düzeltme ve Kod Yazma Stratejileri

## Genel Yaklaşım

### 1. Sistematik Hata Analizi
- **TypeScript Kontrolü**: Her değişiklik sonrası `npx tsc --noEmit` ile tip kontrolü
- **Hata Kategorileri**: Import hataları, tip uyumsuzlukları, kullanılmayan değişkenler
- **Öncelik Sırası**: Kritik hatalar → Tip hataları → Uyarılar

### 2. Kod Yazma Stratejileri

#### A. Import Yönetimi
```typescript
// ✅ Doğru: Sadece kullanılan bileşenleri import et
import { Box, VStack, Text } from 'native-base';

// ❌ Yanlış: Kullanılmayan import'lar
import { Box, VStack, Text, Button, Modal } from 'native-base';
```

#### B. Tip Güvenliği
```typescript
// ✅ Doğru: Açık tip tanımları
const handleChange = (value: string) => {
  setState(value);
};

// ❌ Yanlış: Implicit any tipi
const handleChange = (value) => {
  setState(value);
};
```

#### C. Bileşen Prop'ları
```typescript
// ✅ Doğru: NativeBase Checkbox için onChange
<Checkbox onChange={(isChecked: boolean) => handleCheck(isChecked)} />

// ❌ Yanlış: Var olmayan onValueChange prop'u
<Checkbox onValueChange={(isChecked) => handleCheck(isChecked)} />
```

### 3. Hata Düzeltme Süreci

#### Adım 1: Hata Tespiti
1. TypeScript kontrolü çalıştır
2. Hataları kategorilere ayır
3. En kritik hatalardan başla

#### Adım 2: Analiz
1. Hata mesajını dikkatlice oku
2. Dosya ve satır numarasını belirle
3. Kök nedeni tespit et

#### Adım 3: Çözüm
1. Minimal değişiklik yap
2. Yan etkileri kontrol et
3. Test et

#### Adım 4: Doğrulama
1. TypeScript kontrolü tekrar çalıştır
2. Yeni hata oluşmadığını kontrol et
3. Fonksiyonaliteyi test et

### 4. Git Workflow

#### Commit Stratejisi
```bash
# Küçük, anlamlı commit'ler
git add .
git commit -m "fix: TypeScript import hatalarını düzelt"
git commit -m "feat: CollageView bileşenini ekle"
git commit -m "refactor: kullanılmayan import'ları kaldır"
```

#### Commit Mesaj Formatı
- `fix:` - Hata düzeltmeleri
- `feat:` - Yeni özellikler
- `refactor:` - Kod iyileştirmeleri
- `docs:` - Dokümantasyon
- `style:` - Kod formatı

### 5. Proje Yönetimi

#### Geliştirme Döngüsü
1. **Analiz**: Mevcut durumu değerlendir
2. **Planlama**: Yapılacakları listele
3. **Uygulama**: Kod yaz/düzelt
4. **Test**: Fonksiyonaliteyi kontrol et
5. **Dokümantasyon**: İlerlemeyi kaydet
6. **Commit**: Değişiklikleri kaydet

#### Kalite Kontrol
- Her commit öncesi TypeScript kontrolü
- Kod review (mümkünse)
- Fonksiyonel test
- Dokümantasyon güncellemesi

### 6. Özel Durumlar

#### React Native & NativeBase
- Bileşen prop'larını dokümantasyondan kontrol et
- Platform-specific kodları ayır
- Performance optimizasyonlarını unutma

#### TypeScript
- `any` tipini mümkün olduğunca kullanma
- Interface'leri doğru tanımla
- Generic tipler kullan

### 7. Debugging Teknikleri

#### Console Logging
```typescript
console.log('Debug:', { variable, state, props });
```

#### Error Boundaries
```typescript
try {
  // Risky operation
} catch (error) {
  console.error('Error:', error);
  // Handle gracefully
}
```

### 8. Best Practices

1. **Küçük Adımlar**: Her seferinde küçük değişiklikler yap
2. **Test Driven**: Önce test et, sonra düzelt
3. **Dokümantasyon**: Her değişikliği kaydet
4. **Backup**: Önemli değişiklikler öncesi backup al
5. **Review**: Kodu gözden geçir

### 9. Gelecek Nesillere Tavsiyeler

- **Sabırlı ol**: Hata düzeltme zaman alır
- **Sistematik yaklaş**: Rastgele değişiklik yapma
- **Öğrenmeye devam et**: Her hata bir öğrenme fırsatı
- **Dokümante et**: Çözümlerini kaydet
- **Paylaş**: Bilgini başkalarıyla paylaş

---

*Bu doküman AdVantage projesi geliştirme sürecinde edinilen deneyimlerden oluşturulmuştur.*