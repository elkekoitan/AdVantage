# TypeScript Geliştirme ve Hata Azaltma Rehberi

## Hızlı Hata Kontrolü ve Düzeltme

### 1. Temel Kontrol Komutları
```bash
# Hızlı tip kontrolü (hata varsa gösterir)
npm run type-check

# Sürekli tip kontrolü (dosya değişikliklerini izler)
npm run type-check:watch

# Artımlı tip kontrolü (sadece değişen dosyalar)
npm run type-check:incremental

# Lint + Format + Tip kontrolü (hepsini birden)
npm run dev:check
```

### 2. Otomatik Düzeltme
```bash
# ESLint hatalarını otomatik düzelt
npm run lint:fix

# Kod formatını otomatik düzelt
npm run format

# Commit öncesi tüm düzeltmeleri yap
npm run pre-commit
```

### 3. Gelişmiş Debug Araçları
```bash
# TypeScript konfigürasyonunu göster
npm run ts:config

# Derlemeye dahil edilen dosyaları listele
npm run ts:files

# Modül çözünürlük problemlerini debug et
npm run ts:trace

# Dosyaların neden dahil edildiğini açıkla
npm run ts:explain
```

### 4. Kod Kalitesi Analizi
```bash
# Tip coverage analizi (ne kadar tip güvenli)
npx type-coverage --detail

# Kullanılmayan export'ları bul
npx ts-prune

# Dead code ve kullanılmayan bağımlılıkları bul
npx knip
```

## Hata Azaltma Stratejisi

### Geliştirme Sırasında
1. **Sürekli İzleme**: `npm run type-check:watch` çalıştır
2. **Hızlı Düzeltme**: Her değişiklikten sonra `npm run dev:check`
3. **Otomatik Format**: IDE'de save-on-format aktif et

### Commit Öncesi
```bash
# Tüm kontrolleri yap ve düzelt
npm run pre-commit
```

### CI/CD İçin
```bash
# Production ready kontrol
npm run ci
```

## Yaygın Hata Türleri ve Çözümleri

### 1. Import/Export Hataları
```bash
# Modül çözünürlük problemlerini debug et
npm run ts:trace

# Hangi dosyaların dahil edildiğini kontrol et
npm run ts:files
```

### 2. Tip Uyumsuzlukları
```bash
# Detaylı hata raporu için
npx tsc --noEmit --pretty

# Tip coverage kontrolü
npx type-coverage --detail --at-least 95
```

### 3. Kullanılmayan Kod
```bash
# Kullanılmayan export'ları temizle
npx ts-prune

# Dead code analizi
npx knip
```

## IDE Entegrasyonu

### VS Code Ayarları (.vscode/settings.json)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.validate.enable": true,
  "typescript.format.enable": true
}
```

## Performans Optimizasyonu

### 1. Artımlı Derleme
```bash
# .tsbuildinfo dosyası oluşturur, sonraki derlemeler hızlanır
npm run type-check:incremental
```

### 2. Paralel İşlemler
```bash
# Birden fazla görevi paralel çalıştır
npx run-p type-check lint format:check
```

### 3. Cache Temizleme
```bash
# TypeScript cache'ini temizle
npm run clean
```

## Günlük Workflow

### Geliştirme Başlangıcı
```bash
# Terminal 1: Expo dev server
npm start

# Terminal 2: Sürekli tip kontrolü
npm run type-check:watch
```

### Kod Yazarken
1. IDE'de otomatik format ve lint aktif
2. Her büyük değişiklikten sonra: `npm run dev:check`
3. Hata varsa: `npm run lint:fix && npm run format`

### Commit Öncesi
```bash
# Tüm kontrolleri yap
npm run pre-commit

# Eğer hata varsa, düzelt ve tekrar dene
git add .
git commit -m "feat: yeni özellik"
```

## Hata Önleme İpuçları

1. **Strict Mode**: tsconfig.json'da strict: true kullan
2. **Path Mapping**: Uzun import yolları yerine @ alias kullan
3. **Type-Only Imports**: Sadece tip için import edilen modüllerde `import type` kullan
4. **Barrel Exports**: index.ts dosyalarında tüm export'ları topla
5. **Interface vs Type**: Genişletilebilir yapılar için interface, union/intersection için type kullan

## Acil Durum Komutları

```bash
# Tüm cache'leri temizle ve yeniden başlat
npm run clean && npm install && npm start

# Sadece TypeScript hatalarını göster (diğer araçlar olmadan)
npx tsc --noEmit --pretty

# Hızlı lint düzeltmesi
npx eslint . --ext .ts,.tsx --fix

# Hızlı format düzeltmesi
npx prettier --write "src/**/*.{ts,tsx}"
```

Bu rehberi takip ederek TypeScript hatalarını minimize edebilir ve geliştirme verimliliğinizi artırabilirsiniz.