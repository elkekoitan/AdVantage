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

## 11. Yeni Öğrenilen Dersler ve Gelişmiş Stratejiler (2025)

### A. AI Entegrasyonu ve Gemini API Optimizasyonu

#### AI Servis Geliştirme Stratejileri
```typescript
// ✅ Doğru: Structured AI responses için tip güvenliği
interface AIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: {
    confidence: number;
    processingTime: number;
  };
}

// AI fonksiyonlarında hata yönetimi
const generateAIContent = async <T>(prompt: string): Promise<AIResponse<T>> => {
  try {
    const response = await geminiModel.generateContent(prompt);
    const text = response.response.text();
    
    // JSON parsing güvenliği
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedText) as T;
    
    return {
      success: true,
      data: parsedData,
      metadata: {
        confidence: 0.95,
        processingTime: Date.now()
      }
    };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
```

#### AI Prompt Engineering Best Practices
```typescript
// ✅ Doğru: Structured prompt with clear instructions
const createStructuredPrompt = (userInput: any) => `
Sen bir uzman program planlayıcısısın. Aşağıdaki bilgilere göre detaylı bir program oluştur:

Kullanıcı Bilgileri:
- İlgi Alanları: ${userInput.interests}
- Bütçe: ${userInput.budget} TL
- Süre: ${userInput.duration}
- Program Türü: ${userInput.programType}

Lütfen yanıtını SADECE aşağıdaki JSON formatında ver:
{
  "title": "Program başlığı",
  "description": "Detaylı açıklama",
  "activities": [
    {
      "name": "Aktivite adı",
      "cost": 0,
      "duration": "2 saat",
      "priority": "high|medium|low"
    }
  ],
  "totalCost": 0,
  "budgetAnalysis": {
    "breakdown": {},
    "savingTips": []
  }
}
`;
```

### B. React Native ve NativeBase İleri Düzey Optimizasyonlar

#### Modal ve UI State Yönetimi
```typescript
// ✅ Doğru: Modal state management with proper cleanup
const useModalState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  
  const openModal = useCallback((modalData?: any) => {
    setData(modalData);
    setIsOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Cleanup after animation
    setTimeout(() => setData(null), 300);
  }, []);
  
  return { isOpen, data, openModal, closeModal };
};

// Kullanım
const MyComponent = () => {
  const aiModal = useModalState();
  
  return (
    <>
      <Button onPress={() => aiModal.openModal(someData)}>Open AI Modal</Button>
      <Modal isOpen={aiModal.isOpen} onClose={aiModal.closeModal}>
        {/* Modal content */}
      </Modal>
    </>
  );
};
```

#### Performance Optimized Components
```typescript
// ✅ Doğru: Memoized components with proper dependencies
const ActivityCard = memo(({ activity, onPress }: ActivityCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const handlePress = useCallback(() => {
    onPress(activity.id);
  }, [activity.id, onPress]);
  
  return (
    <Pressable onPress={handlePress}>
      <Box bg={bgColor} p={4} borderRadius="lg">
        <Text>{activity.name}</Text>
      </Box>
    </Pressable>
  );
});

// Display name for debugging
ActivityCard.displayName = 'ActivityCard';
```

### C. Gelişmiş Hata Yönetimi ve Debugging

#### Comprehensive Error Handling
```typescript
// ✅ Doğru: Centralized error handling
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' = 'medium'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const errorHandler = {
  handle: (error: unknown, context: string) => {
    if (error instanceof AppError) {
      console.error(`[${context}] ${error.code}: ${error.message}`);
      // Log to analytics based on severity
      if (error.severity === 'high') {
        // Send to error tracking service
      }
    } else {
      console.error(`[${context}] Unexpected error:`, error);
    }
  },
  
  wrap: <T extends (...args: any[]) => any>(fn: T, context: string): T => {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch((error) => {
            errorHandler.handle(error, context);
            throw error;
          });
        }
        return result;
      } catch (error) {
        errorHandler.handle(error, context);
        throw error;
      }
    }) as T;
  }
};
```

#### Advanced TypeScript Debugging
```typescript
// ✅ Doğru: Type-safe debugging utilities
const debugLog = <T>(data: T, label?: string): T => {
  if (__DEV__) {
    console.log(`🐛 ${label || 'Debug'}:`, JSON.stringify(data, null, 2));
  }
  return data;
};

// Type assertion with runtime validation
const assertType = <T>(value: unknown, validator: (v: unknown) => v is T, errorMsg: string): T => {
  if (!validator(value)) {
    throw new AppError(errorMsg, 'TYPE_ASSERTION_FAILED', 'high');
  }
  return value;
};
```

### D. Git ve Proje Yönetimi İleri Stratejileri

#### Smart Commit Strategies
```bash
# Feature branch workflow
git checkout -b feature/ai-program-creator
git add src/services/geminiService.ts
git commit -m "feat(ai): add generateBudgetProgram function"
git add src/screens/program/CreateProgramScreen.tsx
git commit -m "feat(ui): enhance AI modal with budget analysis"
git push origin feature/ai-program-creator

# Squash commits before merge
git rebase -i HEAD~3
```

#### Automated Quality Checks
```json
// package.json scripts
{
  "scripts": {
    "lint:check": "eslint 'src/**/*.{ts,tsx}' --max-warnings 0",
    "type:check": "tsc --noEmit",
    "test:unit": "jest",
    "quality:check": "npm run lint:check && npm run type:check && npm run test:unit",
    "pre-commit": "npm run quality:check"
  }
}
```

### E. Proje Ölçeklendirme Stratejileri

#### Modular Architecture
```typescript
// ✅ Doğru: Feature-based folder structure
// src/features/ai-program-creator/
//   ├── components/
//   │   ├── AIModal.tsx
//   │   └── BudgetAnalysis.tsx
//   ├── hooks/
//   │   └── useAIProgram.ts
//   ├── services/
//   │   └── aiProgramService.ts
//   ├── types/
//   │   └── index.ts
//   └── index.ts

// Feature barrel exports
export { AIModal } from './components/AIModal';
export { useAIProgram } from './hooks/useAIProgram';
export type { AIProgramRequest, AIProgramResponse } from './types';
```

#### Performance Monitoring
```typescript
// ✅ Doğru: Performance tracking
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`🐌 Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};
```

### F. Yeni Öğrenilen Kritik Dersler

1. **AI Entegrasyonu**: JSON parsing güvenliği kritik, her zaman try-catch kullan
2. **Modal State**: Cleanup işlemlerini animation süresine göre ayarla
3. **Performance**: memo() ve useCallback() kullanımında dependency array'leri dikkatli kontrol et
4. **Error Handling**: Centralized error handling sistemi kur
5. **TypeScript**: Generic types ve type guards kullanarak runtime güvenliği sağla
6. **Git Workflow**: Feature branch'ler kullan, küçük commit'ler yap
7. **Code Quality**: Pre-commit hooks ile otomatik kalite kontrolü
8. **Architecture**: Feature-based modular yapı kullan
9. **Debugging**: Type-safe debugging utilities geliştir
10. **Monitoring**: Performance ve error tracking sistemleri kur

### G. TypeScript Hata Düzeltme Vakası (Ocak 2025)

#### Karşılaşılan Sorunlar ve Çözümler

**1. POIResponse Interface Eksiklikleri**
```typescript
// ❌ Hatalı: Eksik özellikler
export interface POIResponse {
  features: Array<{
    properties: {
      id: string;
      name: string;
      category: string;
      // distance ve type eksik!
    };
  }>;
}

// ✅ Doğru: Tüm gerekli özellikler eklendi
export interface POIResponse {
  type?: string;  // Eklendi
  features: Array<{
    geometry: {
      coordinates: number[];
      type: string;
    };
    properties: {
      id: string;
      name: string;
      category: string;
      osm_id?: string;
      osm_type?: string;
      distance?: number;  // Eklendi
    };
  }>;
  bbox?: string;  // calculateBoundingBox dönüş tipine uygun
}
```

**2. Navigation Props Tanımlama Sorunu**
```typescript
// ❌ Hatalı: Navigation prop tanımlanmamış
const ExploreScreen = () => {
  // navigation.navigate() hata veriyor
};

// ✅ Doğru: Proper navigation typing
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ExploreScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Explore'>;

const ExploreScreen = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  // Artık navigation.navigate() tip güvenli
};
```

**3. EnhancedPOIResponse Kullanım Hatası**
```typescript
// ❌ Hatalı: Dizi beklenen yerde obje kullanımı
const results = await openRouteService.searchPlaces(query, location);
if (results.length > 0) { // results bir obje, length özelliği yok!
  // ...
}

// ✅ Doğru: Obje yapısına uygun kullanım
const searchResult = await openRouteService.searchPlaces(query, location);
if (searchResult.places && searchResult.places.length > 0) {
  Alert.alert(
    'Arama Sonuçları',
    `${searchResult.totalCount} sonuç bulundu`
  );
}
```

**4. Return Type Uyumsuzluğu**
```typescript
// ❌ Hatalı: string döndüren fonksiyon, number[] bekleyen property
private calculateBoundingBox(location: Coordinates, radius: number): string {
  return `${south},${west},${north},${east}`;
}

interface POIResponse {
  bbox?: number[]; // Type mismatch!
}

// ✅ Doğru: Consistent typing
interface POIResponse {
  bbox?: string; // calculateBoundingBox dönüş tipine uygun
}
```

#### Öğrenilen Kritik Dersler

1. **Interface Completeness**: API response interface'lerini tam tanımla
2. **Navigation Typing**: React Navigation için proper typing kullan
3. **API Response Handling**: Dönüş tiplerini doğru şekilde handle et
4. **Type Consistency**: Fonksiyon dönüş tipleri ile interface'ler uyumlu olmalı
5. **Incremental Fixing**: Hataları tek tek, sistematik olarak çöz
6. **Testing After Fix**: Her düzeltmeden sonra `tsc --noEmit` ile kontrol et

#### Hata Düzeltme Süreci

```bash
# 1. TypeScript hatalarını tespit et
npx tsc --noEmit

# 2. Hataları kategorize et (interface, navigation, type mismatch)
# 3. En basit hatalardan başlayarak çöz
# 4. Her düzeltmeden sonra tekrar kontrol et
# 5. Tüm hatalar çözüldükten sonra commit et

git add .
git commit -m "Fix TypeScript errors and update project documentation

- Fixed POIResponse interface by adding type and distance properties
- Fixed EnhancedPOIResponse usage in ExploreScreen and LocationBasedSuggestions
- Fixed navigation prop definitions in ExploreScreen
- Fixed calculateBoundingBox return type compatibility
- All TypeScript compilation errors resolved"
```

### H. Gelecek İçin Stratejik Öneriler

1. **Automated Testing**: Unit, integration ve E2E testler ekle
2. **CI/CD Pipeline**: GitHub Actions ile otomatik deployment
3. **Code Review**: Pull request template'leri ve review checklist'leri
4. **Documentation**: API documentation ve component storybook
5. **Monitoring**: Real-time error tracking ve performance analytics
6. **Security**: Input validation ve sanitization
7. **Accessibility**: Screen reader support ve keyboard navigation
8. **Internationalization**: Multi-language support hazırlığı
9. **Offline Support**: Offline-first architecture
10. **Analytics**: User behavior tracking ve A/B testing
11. **TypeScript Strict Mode**: Daha katı tip kontrolü için strict mode aktif et
12. **Pre-commit Hooks**: TypeScript hatalarını commit öncesi yakala

## 12. Hatalı Kod Yazımını Engelleyen Proaktif Stratejiler

### A. Kod Yazma Öncesi Kontrol Listesi

#### 1. TypeScript Interface ve Tip Tanımlamaları
```typescript
// ✅ ÖNCE: Interface'i tam tanımla
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ✅ SONRA: Fonksiyonu yaz
const updateUserProfile = (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  // Implementation
};

// ❌ YANLIŞ: Interface eksik, sonra hata çıkar
const updateUser = (id, data) => {
  // Bu kod TypeScript hatası verecek
};
```

#### 2. React Component Prop Tanımlamaları
```typescript
// ✅ ÖNCE: Props interface'ini tanımla
interface ActivityCardProps {
  activity: Activity;
  onPress: (activityId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

// ✅ SONRA: Component'i yaz
const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onPress, 
  isSelected = false, 
  showActions = true 
}) => {
  // Implementation
};

// ❌ YANLIŞ: Props tanımlanmadan component yazmak
const ActivityCard = ({ activity, onPress }) => {
  // Bu kod tip güvenliği sağlamaz
};
```

#### 3. API Response Tiplerini Önceden Tanımlama
```typescript
// ✅ ÖNCE: API response tiplerini tanımla
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface ProgramResponse {
  id: string;
  title: string;
  description: string;
  activities: Activity[];
  totalCost: number;
  createdAt: string;
}

// ✅ SONRA: Service fonksiyonunu yaz
const createProgram = async (programData: CreateProgramRequest): Promise<APIResponse<ProgramResponse>> => {
  // Implementation
};
```

### B. Hata Önleme Kod Şablonları

#### 1. React Hook Kullanımı Şablonu
```typescript
// ✅ DOĞRU ŞABLON: Hook'ları en üstte topla
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Tüm Hook'ları en üstte tanımla
  const navigation = useNavigation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');
  
  // 2. State'leri grupla
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 3. Callback'leri memoize et
  const handlePress = useCallback(() => {
    // Implementation
  }, []);
  
  // 4. Effect'leri en son tanımla
  useEffect(() => {
    // Implementation
  }, []);
  
  // 5. Early return'ler
  if (loading) return <Spinner />;
  if (error) return <ErrorComponent message={error} />;
  
  // 6. Ana render
  return (
    <Box bg={bgColor}>
      <Text color={textColor}>Content</Text>
    </Box>
  );
};
```

#### 2. API Service Fonksiyon Şablonu
```typescript
// ✅ DOĞRU ŞABLON: Hata yönetimi ile API fonksiyonu
const apiServiceTemplate = async <T, R>(
  endpoint: string,
  data: T,
  options?: RequestOptions
): Promise<APIResponse<R>> => {
  try {
    // 1. Input validation
    if (!endpoint) {
      throw new AppError('Endpoint is required', 'INVALID_ENDPOINT');
    }
    
    // 2. Request preparation
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(data)
    };
    
    // 3. API call
    const response = await fetch(endpoint, config);
    
    // 4. Response validation
    if (!response.ok) {
      throw new AppError(
        `API Error: ${response.status}`,
        'API_ERROR',
        'high'
      );
    }
    
    // 5. Data parsing
    const result = await response.json() as APIResponse<R>;
    
    // 6. Success return
    return result;
    
  } catch (error) {
    // 7. Error handling
    console.error('API Service Error:', error);
    return {
      success: false,
      data: {} as R,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
```

### C. Linter Hatalarını Önleme Stratejileri

#### 1. ESLint Kurallarına Uygun Kod Yazma
```typescript
// ✅ DOĞRU: ESLint kurallarına uygun
interface ComponentProps {
  title: string;
  onPress: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onPress }) => {
  // Kullanılan tüm değişkenler tanımlanmış
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  
  return (
    <Button onPress={handlePress}>
      {title}
    </Button>
  );
};

// ❌ YANLIŞ: ESLint hataları
const BadComponent = ({ title, onPress, unusedProp }) => {
  const unusedVariable = 'not used'; // ESLint hatası!
  const handlePress = () => {
    onPress();
  }; // useCallback eksik, dependency array yok
  
  return <Button onPress={handlePress}>{title}</Button>;
};
```

#### 2. Import/Export Optimizasyonu
```typescript
// ✅ DOĞRU: Sadece kullanılan import'lar
import React, { useState, useCallback } from 'react';
import { Box, Text, Button } from 'native-base';
import { useNavigation } from '@react-navigation/native';

// ❌ YANLIŞ: Kullanılmayan import'lar
import React, { useState, useCallback, useEffect, useMemo } from 'react'; // useEffect, useMemo kullanılmıyor
import { Box, Text, Button, Modal, VStack, HStack } from 'native-base'; // Modal, VStack, HStack kullanılmıyor
```

### D. Kod Kalitesi Kontrol Araçları

#### 1. Pre-commit Hook Kurulumu
```bash
# package.json'a ekle
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run quality:check"
    }
  },
  "scripts": {
    "quality:check": "npm run lint:check && npm run type:check",
    "lint:check": "eslint 'src/**/*.{ts,tsx}' --max-warnings 0",
    "lint:fix": "eslint 'src/**/*.{ts,tsx}' --fix",
    "type:check": "tsc --noEmit",
    "format:check": "prettier --check 'src/**/*.{ts,tsx}'",
    "format:fix": "prettier --write 'src/**/*.{ts,tsx}'"
  }
}
```

#### 2. VSCode Ayarları
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### E. Hata Önleme Checklist'i

#### Kod Yazma Öncesi (5 dakika)
- [ ] Interface/tip tanımlamaları yapıldı mı?
- [ ] Component props tanımlandı mı?
- [ ] API response tipleri hazır mı?
- [ ] Hook kullanım sırası planlandı mı?
- [ ] Error handling stratejisi belirlendi mi?

#### Kod Yazma Sırası (Her 15 dakikada)
- [ ] TypeScript kontrolü: `npx tsc --noEmit`
- [ ] ESLint kontrolü: `npx eslint src/path/to/file.tsx`
- [ ] Kullanılmayan import'lar temizlendi mi?
- [ ] Hook dependency array'leri doğru mu?
- [ ] Console.log'lar temizlendi mi?

#### Kod Tamamlama Sonrası (Commit öncesi)
- [ ] Tüm TypeScript hataları çözüldü mü?
- [ ] ESLint uyarıları giderildi mi?
- [ ] Prettier formatlaması yapıldı mı?
- [ ] Fonksiyonalite test edildi mi?
- [ ] Commit mesajı anlamlı mı?

### F. Yaygın Hataları Önleme Kılavuzu

#### 1. React Native Specific Hatalar
```typescript
// ✅ DOĞRU: Platform kontrolü
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  }
});

// ✅ DOĞRU: Safe area kullanımı
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyComponent = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Box pt={insets.top}>
      {/* Content */}
    </Box>
  );
};
```

#### 2. NativeBase Specific Hatalar
```typescript
// ✅ DOĞRU: NativeBase prop kullanımı
<Checkbox 
  value="option1" 
  onChange={(isChecked: boolean) => handleChange(isChecked)}
>
  Option 1
</Checkbox>

// ❌ YANLIŞ: React Native Checkbox prop'u kullanmak
<Checkbox 
  value={true} 
  onValueChange={(value) => handleChange(value)} // NativeBase'de yok!
/>
```

#### 3. Navigation Hatalarını Önleme
```typescript
// ✅ DOĞRU: Tip güvenli navigation
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../types/navigation';

type ScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'ScreenName'>;

const MyScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  
  const handleNavigate = () => {
    navigation.navigate('OtherScreen', { param: 'value' });
  };
};
```

### G. Performans Odaklı Kod Yazma

#### 1. Gereksiz Re-render'ları Önleme
```typescript
// ✅ DOĞRU: Memoization kullanımı
const ExpensiveComponent = memo(({ data, onPress }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);
  
  const handlePress = useCallback((id: string) => {
    onPress(id);
  }, [onPress]);
  
  return (
    <VStack>
      {processedData.map(item => (
        <TouchableOpacity key={item.id} onPress={() => handlePress(item.id)}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </VStack>
  );
});
```

#### 2. Bundle Size Optimizasyonu
```typescript
// ✅ DOĞRU: Tree-shaking friendly import'lar
import { debounce } from 'lodash/debounce';
import { format } from 'date-fns/format';

// ❌ YANLIŞ: Tüm library'yi import etmek
import _ from 'lodash';
import * as dateFns from 'date-fns';
```

### H. Debugging ve Monitoring Stratejileri

#### 1. Structured Logging
```typescript
// ✅ DOĞRU: Structured logging sistemi
const logger = {
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.log(`ℹ️ [INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [ERROR] ${message}`, error);
    // Send to crash reporting service
  }
};

// Kullanım
logger.debug('User action', { userId, action: 'button_press' });
logger.error('API call failed', error);
```

#### 2. Performance Monitoring
```typescript
// ✅ DOĞRU: Performance tracking
const usePerformanceTracker = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) {
        logger.warn(`Slow render detected`, {
          component: componentName,
          renderTime: `${renderTime.toFixed(2)}ms`
        });
      }
    };
  }, [componentName]);
};
```

## 13. Kritik Hatalar ve Çözümleri Database

### A. En Sık Karşılaşılan TypeScript Hataları

1. **Property does not exist on type**
   - **Neden**: Interface eksik veya yanlış tanımlanmış
   - **Çözüm**: Interface'i güncelleyerek eksik property'leri ekle

2. **Cannot find module**
   - **Neden**: Import path yanlış veya dosya mevcut değil
   - **Çözüm**: Path'i kontrol et, dosyanın varlığını doğrula

3. **Type 'undefined' is not assignable**
   - **Neden**: Optional property'ler için null check eksik
   - **Çözüm**: Optional chaining (?.) veya null check kullan

4. **React Hook useEffect has missing dependencies**
   - **Neden**: Dependency array eksik veya yanlış
   - **Çözüm**: ESLint önerisini takip et, tüm dependencies'i ekle

### B. En Sık Karşılaşılan ESLint Hataları

1. **'variable' is assigned a value but never used**
   - **Çözüm**: Kullanılmayan değişkeni sil veya kullan

2. **React Hook "useCallback" has missing dependencies**
   - **Çözüm**: Dependency array'e eksik değişkenleri ekle

3. **'Component' is not defined**
   - **Çözüm**: Import statement'ı ekle

4. **Expected '===' and instead saw '=='**
   - **Çözüm**: Strict equality (===) kullan

### C. Hızlı Çözüm Komutları

```bash
# Tüm TypeScript hatalarını kontrol et
npx tsc --noEmit

# ESLint hatalarını otomatik düzelt
npx eslint "src/**/*.{ts,tsx}" --fix

# Prettier ile formatla
npx prettier --write "src/**/*.{ts,tsx}"

# Kullanılmayan import'ları temizle
npx eslint "src/**/*.{ts,tsx}" --fix --rule "unused-imports/no-unused-imports: error"

# Tüm kalite kontrolleri
npm run quality:check
```

---

*Bu doküman AdVantage projesi geliştirme sürecinde edinilen deneyimlerden oluşturulmuştur.*
*Son Güncelleme: Ocak 2025 - Hatalı Kod Yazımını Engelleyen Proaktif Stratejiler Eklendi*