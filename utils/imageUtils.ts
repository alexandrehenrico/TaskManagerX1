import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const ImageUtils = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },

  async pickImage(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  },

  async takePhoto(): Promise<string | null> {
    if (Platform.OS === 'web') return this.pickImage();
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  },

  async saveImageToLocal(uri: string): Promise<string | null> {
    if (Platform.OS === 'web') return uri;
    
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const directory = `${FileSystem.documentDirectory}images/`;
      
      // Create directory if it doesn't exist
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      
      const localUri = `${directory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: localUri });
      
      return localUri;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  },

  async deleteImage(uri: string): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },
};