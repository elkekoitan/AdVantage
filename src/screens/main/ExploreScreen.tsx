import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LocationBasedSuggestions from '../../components/LocationBasedSuggestions';
import { openRouteService } from '../../services/openRouteService';
import * as Location from 'expo-location';
import type { MainStackParamList } from '../../types/navigation';

// Design system
const colors = {
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  secondary: '#FF6B35',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  subtitle: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
};

interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

type ExploreScreenNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('gym');

  const categories: ExploreCategory[] = [
    { id: 'gym', name: 'Spor Salonu', icon: 'fitness', color: colors.primary },
    { id: 'restaurant', name: 'Restoran', icon: 'restaurant', color: colors.success },
    { id: 'cafe', name: 'Kafe', icon: 'cafe', color: colors.warning },
    { id: 'park', name: 'Park', icon: 'leaf', color: colors.success },
    { id: 'hospital', name: 'Hastane', icon: 'medical', color: colors.error },
    { id: 'shopping_mall', name: 'AVM', icon: 'storefront', color: colors.info },
    { id: 'gas_station', name: 'Benzin', icon: 'car', color: colors.secondary },
    { id: 'bank', name: 'Banka', icon: 'card', color: colors.primary },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'map',
      title: 'Harita',
      icon: 'map',
      action: () => handleNavigateToMap(),
    },
    {
      id: 'nearby',
      title: 'Yakınımda',
      icon: 'location',
      action: () => handleNearbySearch(),
    },
    {
      id: 'directions',
      title: 'Yol Tarifi',
      icon: 'navigate',
      action: () => handleDirections(),
    },
    {
      id: 'favorites',
      title: 'Favoriler',
      icon: 'heart',
      action: () => handleFavorites(),
    },
  ];

  const initializeLocation = useCallback(async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli',
          'Yakındaki yerleri görmek için konum izni gereklidir.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      if (location) {
        const { latitude, longitude } = location.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Konum Hatası',
        'Konum alınırken bir hata oluştu. Lütfen konum izinlerini kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeLocation();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      
      // Enhanced search with filters
      const searchFilters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        radius: 5000, // 5km radius
        maxResults: 20,
        sortBy: 'distance' as const
      };
      
      // Use enhanced search function
      const searchResult = await openRouteService.searchPlaces(
        userLocation || { lat: 41.0082, lng: 28.9784 }, // Default to Istanbul
        searchQuery,
        searchFilters
      );
      
      if (searchResult && searchResult.places && searchResult.places.length > 0) {
        // Show search results in a more detailed way
        const resultText = searchResult.places.slice(0, 3).map((place, index) => 
          `${index + 1}. ${place.name}\n   ${place.address || 'Adres bilgisi yok'}\n   Mesafe: ${place.coordinates ? 'Yakın' : 'Bilinmiyor'}`
        ).join('\n\n');
        
        Alert.alert(
          `${searchResult.totalCount} Sonuç Bulundu`,
          resultText + (searchResult.totalCount > 3 ? `\n\n...ve ${searchResult.totalCount - 3} sonuç daha` : ''),
          [
            { text: 'Tamam' },
            { text: 'Haritada Göster', onPress: () => handleNavigateToMap() },
          ]
        );
      } else {
        // Try alternative search if no results
        const alternativeResults = await openRouteService.findNearbyPOIs(
          userLocation || { lat: 41.0082, lng: 28.9784 },
          searchQuery,
          10000 // Expand search radius
        );
        
        if (alternativeResults.features && alternativeResults.features.length > 0) {
          Alert.alert(
            'Yakın Sonuçlar',
            `${alternativeResults.features.length} sonuç daha geniş alanda bulundu.`,
            [
              { text: 'Tamam' },
              { text: 'Haritada Göster', onPress: () => handleNavigateToMap() },
            ]
          );
        } else {
          Alert.alert(
            'Sonuç Bulunamadı', 
            'Arama kriterlerinize uygun yer bulunamadı. Farklı anahtar kelimeler deneyin.'
          );
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Arama Hatası', 
        'Arama yapılırken bir hata oluştu. İnternet bağlantınızı kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNearbySearch = async () => {
    if (!userLocation) {
      Alert.alert(
        'Konum Gerekli',
        'Yakındaki yerleri görmek için konum izni gereklidir.'
      );
      return;
    }
    
    try {
      setLoading(true);
      
      // Search for nearby places based on selected category
      const category = selectedCategory !== 'all' ? selectedCategory : 'restaurant';
      const results = await openRouteService.findNearbyPOIs(
        userLocation,
        category,
        2000 // 2km radius for nearby search
      );
      
      if (results.features && results.features.length > 0) {
        const nearbyPlaces = results.features.slice(0, 5).map((place, index) => {
          const name = place.properties.name || 'İsimsiz Yer';
          const category = place.properties.category || 'Kategori Yok';
          const distance = place.properties.distance 
            ? (place.properties.distance / 1000).toFixed(1) + ' km'
            : 'Mesafe bilinmiyor';
          return `${index + 1}. ${name}\n   ${category} - ${distance}`;
        }).join('\n\n');
        
        Alert.alert(
          `Yakınımda ${results.features.length} Yer Bulundu`,
          nearbyPlaces + (results.features.length > 5 ? `\n\n...ve ${results.features.length - 5} yer daha` : ''),
          [
            { text: 'Tamam' },
            { text: 'Haritada Göster', onPress: () => handleNavigateToMap() },
            { text: 'Detayları Gör', onPress: () => {
              // Show first place details
              if (results.features[0]) {
                handlePlaceSelect(results.features[0]);
              }
            }}
          ]
        );
      } else {
        Alert.alert(
          'Yakında Yer Bulunamadı',
          `${category} kategorisinde yakınınızda yer bulunamadı. Farklı bir kategori deneyin.`
        );
      }
    } catch (error) {
      console.error('Nearby search error:', error);
      Alert.alert(
        'Arama Hatası',
        'Yakındaki yerler aranırken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = () => {
    Alert.alert(
      'Yol Tarifi',
      'Nereye gitmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Haritada Seç',
          onPress: () => {
            handleNavigateToMap(undefined, searchQuery);
          },
        },
      ]
    );
  };

  const handleFavorites = () => {
    Alert.alert('Yakında', 'Favoriler özelliği yakında eklenecek!');
  };

  const handleGetDirections = async (place: any) => {
    if (!userLocation) {
      Alert.alert('Hata', 'Konum bilgisi alınamadı');
      return;
    }

    try {
      // Use OpenRouteService for directions
      const route = await openRouteService.getDirections(
        { lat: userLocation.lat, lng: userLocation.lng },
        { lat: place.geometry.coordinates[1], lng: place.geometry.coordinates[0] },
        'driving-car'
      );
      
      if (route && route.features && route.features.length > 0) {
        const properties = route.features[0].properties;
        const distance = (properties.summary.distance / 1000).toFixed(1) + ' km';
        const duration = Math.round(properties.summary.duration / 60) + ' dakika';
        
        Alert.alert(
          'Yol Tarifi',
          `Mesafe: ${distance}\nSüre: ${duration}`,
          [
            { text: 'Tamam' },
            { text: 'Haritada Göster', onPress: () => handleNavigateToMap(place) },
          ]
        );
      } else {
        throw new Error('Route not found');
      }
    } catch (error) {
      console.error('OpenRouteService error:', error);
      Alert.alert('Hata', 'Yol tarifi alınamadı');
    }
  };

  const handleAddToFavorites = (place: any) => {
    // TODO: Implement favorites functionality
    Alert.alert('Başarılı', `${place.properties.name} favorilere eklendi!`);
  };

  const handlePlaceSelect = (place: any) => {
    Alert.alert(
      place.properties.name,
      `Kategori: ${place.properties.category || 'Bilinmiyor'}`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Yol Tarifi', onPress: () => handleGetDirections(place) },
        { text: 'Favorilere Ekle', onPress: () => handleAddToFavorites(place) },
        { text: 'Haritada Göster', onPress: () => handleNavigateToMap(place) },
      ]
    );
  };

  const handleNavigateToMap = (place?: any, searchQuery?: string) => {
    const params: any = {};
    
    if (place) {
      params.initialLocation = {
        latitude: place.geometry.coordinates[1],
        longitude: place.geometry.coordinates[0],
      };
      params.places = [place];
    }
    
    if (searchQuery) {
      params.searchQuery = searchQuery;
    }
    
    if (userLocation && !place) {
      params.initialLocation = {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      };
    }
    
    navigation.navigate('Map', params);
  };

  const renderCategoryButton = (category: ExploreCategory) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryButton,
          isSelected && { backgroundColor: category.color },
        ]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <Ionicons
          name={category.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={isSelected ? colors.surface : category.color}
        />
        <Text
          style={[
            styles.categoryText,
            { color: isSelected ? colors.surface : category.color },
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={action.action}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionText}>{action.title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Konum alınıyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Keşfet</Text>
          <Text style={styles.headerSubtitle}>
            Yakındaki yerleri keşfedin ve aktivitelerinizi planlayın
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Konum, işletme veya aktivite ara..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* Location Based Suggestions */}
        <View style={styles.section}>
          <LocationBasedSuggestions
            userLocation={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : null}
            activityType={selectedCategory}
            onPlaceSelect={handlePlaceSelect}
            onNavigateToMap={handleNavigateToMap}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    ...typography.body,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 28,
    color: colors.text,
    marginBottom: 8,
    ...typography.heading,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    ...typography.body,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    ...typography.body,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
    ...typography.subtitle,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  categoryText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    ...typography.caption,
  },
});

export default ExploreScreen;