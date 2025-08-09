import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { ArrowLeft, Check, X, Calendar, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Atividade, Pessoa } from '@/types';
import { DateUtils } from '@/utils/dateUtils';

interface TaskFormProps {
  atividade?: Atividade | null;
  pessoas: Pessoa[];
  onComplete: (taskData: any) => void;
  onCancel: () => void;
}

export default function TaskForm({ atividade, pessoas, onComplete, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    pessoaId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    prazoFinal: '',
    lembreteNotificacao: true,
  });

  const [selectedStatus, setSelectedStatus] = useState<'pendente' | 'iniciada' | 'concluida'>('pendente');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (atividade) {
      setFormData({
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        pessoaId: atividade.pessoaId,
        dataInicio: atividade.dataInicio.split('T')[0],
        prazoFinal: atividade.prazoFinal.split('T')[0],
        lembreteNotificacao: atividade.lembreteNotificacao,
      });
      setSelectedStatus(atividade.status === 'atrasada' ? 'pendente' : atividade.status);
    }
  }, [atividade]);

  const validateForm = (): boolean => {
    if (!formData.titulo.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return false;
    }
    if (!formData.descricao.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!formData.pessoaId) {
      Alert.alert('Erro', 'Selecione uma pessoa para atribuir a atividade');
      return false;
    }
    if (!formData.prazoFinal) {
      Alert.alert('Erro', 'Prazo final é obrigatório');
      return false;
    }
    if (new Date(formData.prazoFinal) <= new Date(formData.dataInicio)) {
      Alert.alert('Erro', 'O prazo final deve ser posterior à data de início');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const taskData = {
        ...formData,
        status: selectedStatus,
        dataInicio: formData.dataInicio + 'T00:00:00.000Z',
        prazoFinal: formData.prazoFinal + 'T23:59:59.000Z',
      };
      
      onComplete(taskData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a atividade');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPerson = pessoas.find(p => p.id === formData.pessoaId);

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
          {atividade ? 'Editar Atividade' : 'Nova Atividade'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={formData.titulo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
              placeholder="Ex: Desenvolver nova funcionalidade"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descricao}
              onChangeText={(text) => setFormData(prev => ({ ...prev, descricao: text }))}
              placeholder="Descreva detalhadamente a atividade..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pessoa Atribuída *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.peopleSelector}>
                {pessoas.map((pessoa) => (
                  <TouchableOpacity
                    key={pessoa.id}
                    style={[
                      styles.personOption,
                      formData.pessoaId === pessoa.id && styles.personOptionSelected,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, pessoaId: pessoa.id }))}
                  >
                    {pessoa.fotoPerfil ? (
                      <img 
                        src={pessoa.fotoPerfil} 
                        style={styles.personAvatar}
                        alt={pessoa.nome}
                      />
                    ) : (
                      <View style={styles.personAvatarPlaceholder}>
                        <User size={20} color={Colors.textMuted} strokeWidth={2} />
                      </View>
                    )}
                    <Text style={[
                      styles.personName,
                      formData.pessoaId === pessoa.id && styles.personNameSelected,
                    ]}>
                      {pessoa.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, styles.dateInput]}>
              <Text style={styles.label}>Data de Início</Text>
              <TextInput
                style={styles.input}
                value={formData.dataInicio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dataInicio: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={[styles.inputGroup, styles.dateInput]}>
              <Text style={styles.label}>Prazo Final *</Text>
              <TextInput
                style={styles.input}
                value={formData.prazoFinal}
                onChangeText={(text) => setFormData(prev => ({ ...prev, prazoFinal: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {atividade && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusSelector}>
                {[
                  { key: 'pendente', label: 'Pendente', color: Colors.warning },
                  { key: 'iniciada', label: 'Em Andamento', color: Colors.secondary },
                  { key: 'concluida', label: 'Concluída', color: Colors.success },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.statusOption,
                      selectedStatus === status.key && { backgroundColor: status.color + '20' },
                    ]}
                    onPress={() => setSelectedStatus(status.key as any)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      selectedStatus === status.key && { color: status.color },
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Ativar Lembretes</Text>
            <Switch
              value={formData.lembreteNotificacao}
              onValueChange={(value) => setFormData(prev => ({ ...prev, lembreteNotificacao: value }))}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={formData.lembreteNotificacao ? Colors.primary : Colors.textMuted}
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
    height: 100,
    textAlignVertical: 'top',
  },
  peopleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  personOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
  },
  personOptionSelected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  personAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  personName: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  personNameSelected: {
    color: Colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flex: 1,
  },
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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