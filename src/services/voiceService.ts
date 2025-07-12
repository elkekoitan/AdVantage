import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export interface VoiceMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  audioUri?: string;
}

export interface VoiceServiceConfig {
  language: string;
  voice?: string;
  rate: number;
  pitch: number;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private config: VoiceServiceConfig = {
    language: 'tr-TR',
    rate: 0.8,
    pitch: 1.0,
  };

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }

  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 128000,
        },
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        console.warn('No active recording');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    try {
      const options = {
        language: this.config.language,
        pitch: this.config.pitch,
        rate: this.config.rate,
      };

      await Speech.speak(text, options);
    } catch (error) {
      console.error('Failed to speak:', error);
      throw error;
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  }

  async isSpeaking(): Promise<boolean> {
    return await Speech.isSpeakingAsync();
  }

  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  updateConfig(newConfig: Partial<VoiceServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Mock speech-to-text conversion (would integrate with actual service)
  async convertSpeechToText(_audioUri: string): Promise<string> {
    // This would integrate with Google Speech-to-Text, Azure Speech, or similar
    // For now, return a mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Merhaba, bugün için bir program önerisi alabilir miyim?');
      }, 1000);
    });
  }
}

export const voiceService = new VoiceService();
export default VoiceService;