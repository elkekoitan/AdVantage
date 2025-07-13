import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  TextArea,
  useColorModeValue,
  Modal,
  Switch,
  Spinner,
  useToast,
  Icon
} from 'native-base';
import { Badge } from '../../components/ui';
import { Dimensions, ScrollView, Pressable } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { geminiService } from '../../services/gemini';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { socialShareService, SocialShareData } from '../../services/socialShare';
import { collageGenerator, CollageTemplate, CollageData } from '../../services/collageGenerator';
import CollageView from '../../components/social/CollageView';

interface Program {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image_url?: string;
  category: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface SocialContent {
  caption: string;
  hashtags: string[];
  suggestions: string[];
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const SocialShareScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const toast = useToast();
  const viewShotRef = useRef<ViewShot>(null);
  const { program } = route.params as { program: Program };

  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');


  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [collageImage, setCollageImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>(collageGenerator.getTemplates()[0]);
  const [collageData, setCollageData] = useState<CollageData | null>(null);
  const [templates] = useState<CollageTemplate[]>(collageGenerator.getTemplates());
  const [socialContent, setSocialContent] = useState<SocialContent | null>(null);
  const [customCaption, setCustomCaption] = useState('');
  const [collageGenerated, setCollageGenerated] = useState(false);

  const platforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      enabled: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: '#1877F2',
      enabled: true
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      enabled: true
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'musical-notes',
      color: '#000000',
      enabled: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      enabled: true
    }
  ];

  useEffect(() => {
    generateSocialContent();
    initializeCollageData();
  }, []);

  useEffect(() => {
    initializeCollageData();
  }, [program]);

  const initializeCollageData = () => {
    try {
      const initialCollageData = collageGenerator.generatePreviewData(program as unknown as Record<string, unknown>, selectedTemplate.id);
      if (initialCollageData) {
        setCollageData(initialCollageData);
      }
    } catch (error) {
      console.error('Kolaj verisi oluşturulurken hata:', error);
    }
  };

  const generateSocialContent = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {

      
      // Kullanıcı tercihlerini al
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const content = await geminiService.generateSocialMediaContent({
        program_data: program as unknown as Record<string, unknown>,
        user_preferences: userPrefs || {},
        platform: 'instagram',
        content_type: 'post'
      });

      if (content) {
        setSocialContent(content);
        setCustomCaption(content.caption);
      }
    } catch (error) {
      console.error('Sosyal medya içeriği oluşturulurken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'İçerik oluşturulürken bir hata oluştu'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const generateCollage = async () => {
    if (!viewShotRef.current || !collageData) return;

    try {
      setIsGeneratingCollage(true);
      if (!viewShotRef.current?.capture) {
        throw new Error('ViewShot ref is not available');
      }
      const uri = await viewShotRef.current.capture();
      
      if (uri) {
        setCollageImage(uri);
        setCollageGenerated(true);
        
        toast.show({
          title: 'Kolaj Oluşturuldu',
          description: 'Program kolajınız hazır!'
        });
      } else {
        throw new Error('Kolaj oluşturulamadı');
      }
    } catch (error) {
      console.error('Kolaj oluşturulurken hata:', error);
      toast.show({
        title: 'Hata',
        description: 'Kolaj oluşturulurken bir hata oluştu'
      });
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  const shareToSocialMedia = async () => {
    if (selectedPlatforms.length === 0) {
      toast.show({
        title: 'Platform Seçin',
        description: 'Lütfen en az bir sosyal medya platformu seçin'
      });
      return;
    }

    if (!user) {
      toast.show({
        title: 'Hata',
        description: 'Paylaşım için giriş yapmanız gerekiyor'
      });
      return;
    }

    setIsSharing(true);
    try {
      // Kolaj görselini yakala
      let imageUri = null;
      if (viewShotRef.current && viewShotRef.current.capture && collageGenerated) {
        imageUri = await viewShotRef.current.capture();
      }

      // Paylaşım verilerini hazırla
      const shareData: SocialShareData = {
        program: program as unknown as Record<string, unknown>,
        platforms: selectedPlatforms,
        title: program.title,
        description: customCaption,
        hashtags: socialContent?.hashtags || [],
        imageUri: imageUri || undefined
      };

      // Platform bazında paylaşım
      let shareSuccess = false;
      for (const platform of selectedPlatforms) {
        const success = await socialShareService.shareToPlatform(platform, shareData);
        if (success) shareSuccess = true;
      }

      if (shareSuccess) {
        // Paylaşımı veritabanına kaydet
        await socialShareService.saveSocialShare(shareData, user.id);
        
        toast.show({
          title: 'Paylaşıldı!',
          description: 'İçeriğiniz başarıyla paylaşıldı'
        });
        
        // Ekranı kapat
        navigation.goBack();
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      toast.show({
        title: 'Hata',
        description: 'Paylaşım sırasında bir hata oluştu'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderTemplateSelector = () => (
    <Box bg={bgColor} borderRadius="xl" p={4} shadow={1}>
      <Text fontSize="md" fontWeight="semibold" color={textColor} mb={3}>
        Kolaj Şablonu
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space={3}>
          {templates.map((template) => (
            <Pressable
              key={template.id}
              onPress={() => {
                setSelectedTemplate(template);
                const newCollageData = collageGenerator.generatePreviewData(program as unknown as Record<string, unknown>, template.id);
                if (newCollageData) {
                  setCollageData(newCollageData);
                }
              }}
            >
              <VStack
                space={2}
                alignItems="center"
                p={3}
                borderRadius="lg"
                bg={selectedTemplate.id === template.id ? 'primary.100' : 'gray.100'}
                borderWidth={selectedTemplate.id === template.id ? 2 : 0}
                borderColor="primary.500"
                minW="80px"
              >
                <Box
                  w={12}
                  h={12}
                  bg={template.backgroundColor.startsWith('linear') ? 'primary.500' : template.backgroundColor}
                  borderRadius="md"
                />
                <Text fontSize="xs" color={textColor} textAlign="center">
                  {template.name}
                </Text>
              </VStack>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
    </Box>
  );

  const renderProgramCollage = () => (
    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
      {collageData ? (
        <CollageView data={collageData} />
      ) : (
        <Box
          bg="white"
          borderRadius="xl"
          p={4}
          shadow={3}
          width={screenWidth - 40}
          alignSelf="center"
          justifyContent="center"
          alignItems="center"
          height={200}
        >
          <Spinner size="lg" />
          <Text mt={2} color="gray.500">
            Kolaj hazırlanıyor...
          </Text>
        </Box>
      )}
    </ViewShot>
  );

  return (
    <Box flex={1} bg="gray.50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4} p={4}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable onPress={() => navigation.goBack()}>
              <Icon as={Ionicons} name="arrow-back" size="lg" color="gray.600" />
            </Pressable>
            <Text fontSize="lg" fontWeight="bold">
              Sosyal Medya Paylaşımı
            </Text>
            <Box width={6} />
          </HStack>

          {/* Şablon Seçimi */}
          {renderTemplateSelector()}
          
          {/* Program Kolajı */}
          <Box bg={bgColor} borderRadius="xl" p={4} shadow={1}>
            <HStack justifyContent="space-between" alignItems="center" mb={3}>
              <Text fontSize="md" fontWeight="semibold" color={textColor}>
                Kolaj Önizleme
              </Text>
              <Button
                size="sm"
                variant="outline"
                onPress={generateCollage}
                isLoading={isGeneratingCollage}
                leftIcon={<Icon as={MaterialIcons} name="photo-camera" size="sm" />}
              >
                Kolaj Oluştur
              </Button>
            </HStack>
            
            {renderProgramCollage()}
            
            {collageImage && (
              <Box mt={3} p={3} bg="green.50" borderRadius="lg">
                <HStack alignItems="center" space={2}>
                  <Icon as={MaterialIcons} name="check-circle" color="green.500" size="sm" />
                  <Text fontSize="sm" color="green.700">
                    Kolaj başarıyla oluşturuldu! Paylaşmaya hazır.
                  </Text>
                </HStack>
              </Box>
            )}
          </Box>

          {/* AI İçerik Önerileri */}
          <Box bg="white" borderRadius="xl" p={4} shadow={1}>
            <HStack justifyContent="space-between" alignItems="center" mb={3}>
              <Text fontSize="md" fontWeight="semibold">
                AI İçerik Önerileri
              </Text>
              {isGenerating ? (
                <Spinner size="sm" />
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={generateSocialContent}
                  leftIcon={<Icon as={Ionicons} name="refresh" size="sm" />}
                >
                  Yenile
                </Button>
              )}
            </HStack>

            {socialContent && (
              <VStack space={3}>
                {/* Caption */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Açıklama Metni:
                  </Text>
                  <TextArea
                    value={customCaption}
                    onChangeText={setCustomCaption}
                    placeholder="Paylaşım açıklamanızı yazın..."
                    autoCompleteType={undefined}
                    h={20}
                  />
                </Box>

                {/* Hashtags */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Önerilen Hashtag&apos;ler:
                  </Text>
                  <HStack flexWrap="wrap" space={1}>
                    {socialContent.hashtags.map((tag, index) => (
                      <Badge key={index} label={tag} colorScheme="primary" variant="subtle" mb={1} />
                    ))}
                  </HStack>
                </Box>

                {/* Suggestions */}
                {socialContent.suggestions.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      AI Önerileri:
                    </Text>
                    <VStack space={1}>
                      {socialContent.suggestions.map((suggestion, index) => (
                        <Text key={index} fontSize="xs" color="gray.600">
                          • {suggestion}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </Box>

          {/* Platform Seçimi */}
          <Box bg="white" borderRadius="xl" p={4} shadow={1}>
            <Text fontSize="md" fontWeight="semibold" mb={3}>
              Paylaşım Platformları
            </Text>
            
            <VStack space={3}>
              {platforms.map((platform) => (
                <Pressable
                  key={platform.id}
                  onPress={() => togglePlatform(platform.id)}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    p={3}
                    borderRadius="lg"
                    bg={selectedPlatforms.includes(platform.id) ? `${platform.color}10` : 'gray.50'}
                    borderWidth={selectedPlatforms.includes(platform.id) ? 1 : 0}
                    borderColor={platform.color}
                  >
                    <HStack alignItems="center" space={3}>
                      <Icon
                        as={Ionicons}
                        name={platform.icon as keyof typeof Ionicons.glyphMap}
                        size="lg"
                        color={platform.color}
                      />
                      <Text fontWeight="medium">
                        {platform.name}
                      </Text>
                    </HStack>
                    
                    <Switch
                      isChecked={selectedPlatforms.includes(platform.id)}
                      onToggle={() => togglePlatform(platform.id)}
                      colorScheme="blue"
                    />
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Box>

          {/* Paylaş Butonu */}
          <Button
            size="lg"
            colorScheme="blue"
            onPress={shareToSocialMedia}
            isLoading={isSharing}
            isLoadingText="Paylaşılıyor..."
            leftIcon={<Icon as={Ionicons} name="share-social" size="sm" />}
            _text={{ fontWeight: 'bold' }}
          >
            Sosyal Medyada Paylaş
          </Button>

          {/* Önizleme Butonu */}
          <Button
            variant="outline"
            onPress={() => setShowPreview(true)}
            leftIcon={<Icon as={Ionicons} name="eye" size="sm" />}
          >
            Önizleme
          </Button>
        </VStack>
      </ScrollView>

      {/* Önizleme Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} size="full">
        <Modal.Content maxWidth="95%" maxHeight="90%">
          <Modal.CloseButton />
          <Modal.Header>Paylaşım Önizlemesi</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <VStack space={4}>
                {renderProgramCollage()}
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Açıklama:
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {customCaption}
                  </Text>
                </Box>
                
                {socialContent && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Hashtag&apos;ler:
                    </Text>
                    <Text fontSize="sm" color="blue.500">
                      {socialContent.hashtags.join(' ')}
                    </Text>
                  </Box>
                )}
                
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Seçili Platformlar:
                  </Text>
                  <HStack space={2} flexWrap="wrap">
                    {selectedPlatforms.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId);
                      return platform ? (
                        <Badge key={platformId} label={platform.name} colorScheme="primary" />
                      ) : null;
                    })}
                  </HStack>
                </Box>
              </VStack>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default SocialShareScreen;