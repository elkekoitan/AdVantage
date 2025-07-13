# Hata Düzeltme ve Kod Yazma Stratejileri

## Genel Yaklaşım

### 1. Sistematik Hata Analizi
- **TypeScript Kontrolü**: Her değişiklik sonrası `npx tsc --noEmit` ile tip kontrolü
- **ESLint Kontrolü**: `npx eslint "src/**/*.{ts,tsx}"` ile kod kalitesi kontrolü
- **Hata Kategorileri**: Import hataları, tip uyumsuzlukları, kullanılmayan değişkenler, Hook kuralları
- **Öncelik Sırası**: Kritik hatalar → Hook kuralları → Tip hataları → Uyarılar
- **React Hooks Kuralları**: Koşullu Hook çağrılarını önle, bağımlılık dizilerini kontrol et

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

#### D. React Hooks Kuralları
```typescript
// ✅ Doğru: Hook'ları bileşenin en üstünde çağır
const MyComponent = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    return <Spinner />;
  }
  
  return <Box bg={bgColor}>Content</Box>;
};

// ❌ Yanlış: Koşullu Hook çağrısı
const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  
  if (loading) {
    const bgColor = useColorModeValue('white', 'gray.800'); // HATA!
    return <Spinner />;
  }
  
  return <Box>Content</Box>;
};
```

#### E. Kullanılmayan Değişkenler
```typescript
// ✅ Doğru: Sadece kullanılan değişkenleri tanımla
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <Button onPress={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
};

// ❌ Yanlış: Kullanılmayan değişken
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const unusedVariable = 'not used'; // ESLint hatası!
  
  return <Text>Count: {count}</Text>;
};
```

### 3. Hata Düzeltme Süreci

#### Adım 1: Hata Tespiti
1. TypeScript kontrolü çalıştır: `npx tsc --noEmit`
2. ESLint kontrolü çalıştır: `npx eslint "src/**/*.{ts,tsx}"`
3. Hataları kategorilere ayır (Hook kuralları, tip hataları, kullanılmayan değişkenler)
4. En kritik hatalardan başla (Hook kuralları öncelikli)

#### Adım 2: Analiz
1. Hata mesajını dikkatlice oku
2. Dosya ve satır numarasını belirle
3. Kök nedeni tespit et

#### Adım 3: Çözüm
1. Minimal değişiklik yap
2. Yan etkileri kontrol et
3. Test et

#### Adım 4: Doğrulama
1. TypeScript kontrolü tekrar çalıştır: `npx tsc --noEmit`
2. ESLint kontrolü tekrar çalıştır: `npx eslint "src/**/*.{ts,tsx}"`
3. Yeni hata oluşmadığını kontrol et
4. Fonksiyonaliteyi test et

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
- Her commit öncesi TypeScript kontrolü: `npx tsc --noEmit`
- Her commit öncesi ESLint kontrolü: `npx eslint "src/**/*.{ts,tsx}"`
- Hook kuralları ve kullanılmayan değişken kontrolü
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

### 8. ESLint ve Hook Optimizasyonları

#### A. React Hooks Kuralları (rules-of-hooks)
```typescript
// ✅ Doğru: Tüm Hook'ları bileşenin başında tanımla
const MyComponent = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');
  const [loading, setLoading] = useState(false);
  
  // Koşullu render
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <Box bg={bgColor}>
      <Text color={textColor}>Content</Text>
    </Box>
  );
};
```

#### B. Kullanılmayan Değişken Temizliği
```typescript
// ✅ Doğru: Sadece kullanılan import'ları dahil et
import { Box, Text } from 'native-base';

// ❌ Yanlış: Kullanılmayan import'lar
import { Box, Text, Button, Modal, VStack } from 'native-base';
```

#### C. useEffect Bağımlılık Dizileri
```typescript
// ✅ Doğru: Tüm bağımlılıkları dahil et
useEffect(() => {
  loadData(userId, filter);
}, [userId, filter]);

// ❌ Yanlış: Eksik bağımlılık
useEffect(() => {
  loadData(userId, filter);
}, [userId]); // filter eksik!
```

#### D. Performans Optimizasyonu
```typescript
// ✅ Doğru: Hook'ları optimize et
const MyComponent = () => {
  // Renk değişkenlerini en üstte tanımla
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');
  
  // State'leri grupla
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  // Callback'leri memoize et
  const handlePress = useCallback(() => {
    // Handle press
  }, []);
  
  return (
    <Box bg={bgColor}>
      <Text color={textColor}>Content</Text>
    </Box>
  );
};
```

### 9. Best Practices

1. **Küçük Adımlar**: Her seferinde küçük değişiklikler yap
2. **Test Driven**: Önce test et, sonra düzelt
3. **Dokümantasyon**: Her değişikliği kaydet
4. **Backup**: Önemli değişiklikler öncesi backup al
5. **Review**: Kodu gözden geçir
6. **ESLint First**: Her değişiklik sonrası ESLint çalıştır
7. **Hook Optimization**: Hook'ları bileşenin başında topla

### 10. Gelecek Nesillere Tavsiyeler

- **Sabırlı ol**: Hata düzeltme zaman alır
- **Sistematik yaklaş**: Rastgele değişiklik yapma
- **ESLint'i arkadaşın yap**: Her değişiklik sonrası çalıştır
- **Hook kurallarını öğren**: React'in temel kurallarını anla
- **Temiz kod yaz**: Kullanılmayan değişkenleri hemen temizle
- **Öğrenmeye devam et**: Her hata bir öğrenme fırsatı
- **Dokümante et**: Çözümlerini kaydet
- **Paylaş**: Bilgini başkalarıyla paylaş
- **Performansı unutma**: Hook optimizasyonları önemli
- **Kod kalitesi öncelik**: Çalışan kod yeterli değil, kaliteli olmalı

---

*Bu doküman AdVantage projesi geliştirme sürecinde edinilen deneyimlerden oluşturulmuştur.*