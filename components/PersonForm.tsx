import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Camera, User, Check, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Pessoa } from '@/types';
import { ImageUtils } from '@/utils/imageUtils';

interface PersonFormProps {
  pessoa?: Pessoa | null;
  onComplete: (pessoaData: Omit<Pessoa, 'id' | 'criadoEm'>) => void;
  onCancel: () => void;
}

export default function PersonForm({ pessoa, onComplete, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    fotoPerfil: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pessoa) {
      setFormData({
        nome: pessoa.nome,
        cargo: pessoa.cargo,
        email: pessoa.email || '',
        telefone: pessoa.telefone || '',
        fotoPerfil: pessoa.fotoPerfil || '',
      });
    }
  }, [pessoa]);

  const handleImagePicker = () => {
    Alert.alert(
      'Foto do Perfil',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickFromGallery },
        { text: 'Câmera', onPress: takePhoto },
        ...(formData.fotoPerfil ? [{ text: 'Remover Foto', onPress: removePhoto, style: 'destructive' }] : []),
      ]
    );
  };

  const pickFromGallery = async () => {
    const uri = await ImageUtils.pickImage();
    if (uri) {
      const savedUri = await ImageUtils.saveImageToLocal(uri);
      if (savedUri) {
        setFormData(prev => ({ ...prev, fotoPerfil: savedUri }));
      }
    }
  };

  const takePhoto = async () => {
    const uri = await ImageUtils.takePhoto();
    if (uri) {
      const savedUri = await ImageUtils.saveImageToLocal(uri);
      if (savedUri) {
        setFormData(prev => ({ ...prev, fotoPerfil: savedUri }));
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, fotoPerfil: '' }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return false;
    }
    if (!formData.cargo.trim()) {
      Alert.alert('Erro', 'Cargo é obrigatório');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      onComplete({
        ...formData,
        historicoAtividades: pessoa?.historicoAtividades || [],
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {pessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
            {formData.fotoPerfil ? (
              <Image source={{ uri: formData.fotoPerfil }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <User size={40} color={Colors.textMuted} strokeWidth={1.5} />
                <Camera size={20} color={Colors.primary} strokeWidth={2} style={styles.cameraIcon} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>Toque para adicionar foto</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
              placeholder="Ex: João Silva"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo/Função *</Text>
            <TextInput
              style={styles.input}
              value={formData.cargo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cargo: text }))}
              placeholder="Ex: Desenvolvedor Senior"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="joao@empresa.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={formData.telefone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, telefone: text }))}
              placeholder="(11) 99999-9999"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <X size={20} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <Check size={20} color={Colors.white} strokeWidth={2} />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 32,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
  },
  photoLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginLeft: 8,
  },
});