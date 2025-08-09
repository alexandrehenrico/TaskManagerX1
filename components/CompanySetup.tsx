import React, { useState } from 'react';
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
import { Building2, Camera, Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Empresa } from '@/types';
import { ImageUtils } from '@/utils/imageUtils';

interface CompanySetupProps {
  onComplete: (empresa: Empresa) => void;
  empresaExistente?: Empresa;
}

export default function CompanySetup({ onComplete, empresaExistente }: CompanySetupProps) {
  const [formData, setFormData] = useState({
    nome: empresaExistente?.nome || '',
    cnpj: empresaExistente?.cnpj || '',
    endereco: empresaExistente?.endereco || '',
    email: empresaExistente?.email || '',
    telefone: empresaExistente?.telefone || '',
    fotoPerfil: empresaExistente?.fotoPerfil || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleImagePicker = () => {
    Alert.alert(
      'Foto da Empresa',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickFromGallery },
        { text: 'Câmera', onPress: takePhoto },
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

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome da empresa é obrigatório');
      return false;
    }
    if (!formData.cnpj.trim()) {
      Alert.alert('Erro', 'CNPJ é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const empresa: Empresa = {
        id: empresaExistente?.id || Date.now().toString(),
        ...formData,
        criadoEm: empresaExistente?.criadoEm || new Date().toISOString(),
      };

      onComplete(empresa);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {empresaExistente ? 'Editar Empresa' : 'Configure sua Empresa'}
          </Text>
          <Text style={styles.subtitle}>
            Vamos começar configurando os dados da sua empresa
          </Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity style={styles.photoContainer} onPress={handleImagePicker}>
            {formData.fotoPerfil ? (
              <Image source={{ uri: formData.fotoPerfil }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Building2 size={40} color={Colors.textMuted} strokeWidth={1.5} />
                <Camera size={20} color={Colors.primary} strokeWidth={2} style={styles.cameraIcon} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>Toque para adicionar logo</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Empresa *</Text>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nome: text }))}
              placeholder="Ex: Minha Empresa Ltda"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CNPJ *</Text>
            <TextInput
              style={styles.input}
              value={formData.cnpj}
              onChangeText={(text) => setFormData(prev => ({ ...prev, cnpj: text }))}
              placeholder="00.000.000/0000-00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.endereco}
              onChangeText={(text) => setFormData(prev => ({ ...prev, endereco: text }))}
              placeholder="Endereço completo da empresa"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="contato@empresa.com"
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

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Check size={20} color={Colors.white} strokeWidth={2} />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
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
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginLeft: 8,
  },
});