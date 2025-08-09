import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image
} from 'react-native';
import { Settings, Building2, Bell, Clock, Database, Trash2, CreditCard as Edit, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useTaskManager } from '@/hooks/useTaskManager';
import CompanySetup from '@/components/CompanySetup';

type ViewMode = 'settings' | 'editCompany';

export default function ConfiguracoesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('settings');
  const taskManager = useTaskManager();

  const handleUpdateNotifications = async (field: string, value: any) => {
    try {
      const updatedConfig = {
        ...taskManager.notificationConfig,
        [field]: value,
      };
      await taskManager.updateNotificationConfig(updatedConfig);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as configurações');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Esta ação irá remover TODOS os dados salvos: empresa, pessoas e atividades. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              // Reload app
              location.reload();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar os dados');
            }
          }
        },
      ]
    );
  };

  const handleCompanyEditComplete = async (empresa: any) => {
    try {
      await taskManager.saveEmpresa(empresa);
      setViewMode('settings');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados da empresa');
    }
  };

  if (viewMode === 'editCompany') {
    return (
      <CompanySetup
        empresaExistente={taskManager.empresa || undefined}
        onComplete={handleCompanyEditComplete}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Personalize seu TaskManagerX</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Empresa Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empresa</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => setViewMode('editCompany')}
          >
            <View style={styles.settingLeft}>
              {taskManager.empresa?.fotoPerfil ? (
                <Image source={{ uri: taskManager.empresa.fotoPerfil }} style={styles.companyLogo} />
              ) : (
                <View style={styles.settingIcon}>
                  <Building2 size={24} color={Colors.primary} strokeWidth={2} />
                </View>
              )}
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  {taskManager.empresa?.nome || 'Configurar Empresa'}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {taskManager.empresa?.cnpj || 'Clique para configurar'}
                </Text>
              </View>
            </View>
            <Edit size={20} color={Colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Notificações Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Bell size={24} color={Colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notificações Gerais</Text>
                <Text style={styles.settingSubtitle}>
                  Ativar/desativar todas as notificações
                </Text>
              </View>
            </View>
            <Switch
              value={taskManager.notificationConfig.enabled}
              onValueChange={(value) => handleUpdateNotifications('enabled', value)}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={taskManager.notificationConfig.enabled ? Colors.primary : Colors.textMuted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Clock size={24} color={Colors.secondary} strokeWidth={2} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Resumo Diário</Text>
                <Text style={styles.settingSubtitle}>
                  Receber resumo diário às {taskManager.notificationConfig.horarioResumoDiario}
                </Text>
              </View>
            </View>
            <Switch
              value={taskManager.notificationConfig.resumoDiario}
              onValueChange={(value) => handleUpdateNotifications('resumoDiario', value)}
              trackColor={{ false: Colors.border, true: Colors.secondary + '40' }}
              thumbColor={taskManager.notificationConfig.resumoDiario ? Colors.secondary : Colors.textMuted}
              disabled={!taskManager.notificationConfig.enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Bell size={24} color={Colors.warning} strokeWidth={2} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Lembretes Individuais</Text>
                <Text style={styles.settingSubtitle}>
                  Alertas 1 dia antes e no dia do prazo
                </Text>
              </View>
            </View>
            <Switch
              value={taskManager.notificationConfig.lembreteIndividual}
              onValueChange={(value) => handleUpdateNotifications('lembreteIndividual', value)}
              trackColor={{ false: Colors.border, true: Colors.warning + '40' }}
              thumbColor={taskManager.notificationConfig.lembreteIndividual ? Colors.warning : Colors.textMuted}
              disabled={!taskManager.notificationConfig.enabled}
            />
          </View>
        </View>

        {/* Estatísticas Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{taskManager.pessoas.length}</Text>
              <Text style={styles.statLabel}>Pessoa{taskManager.pessoas.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{taskManager.atividades.length}</Text>
              <Text style={styles.statLabel}>Atividade{taskManager.atividades.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {taskManager.atividades.filter(a => a.status === 'concluida').length}
              </Text>
              <Text style={styles.statLabel}>Concluída{taskManager.atividades.filter(a => a.status === 'concluida').length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.overdueNumber]}>
                {taskManager.atividades.filter(a => a.status === 'atrasada').length}
              </Text>
              <Text style={styles.statLabel}>Atrasada{taskManager.atividades.filter(a => a.status === 'atrasada').length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

        {/* Dados Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleClearAllData}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.dangerIcon]}>
                <Trash2 size={24} color={Colors.error} strokeWidth={2} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, styles.dangerText]}>
                  Limpar Todos os Dados
                </Text>
                <Text style={styles.settingSubtitle}>
                  Remove empresa, pessoas e atividades
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TaskManagerX v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Aplicativo de gestão offline com alertas de prazos
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  overdueNumber: {
    color: Colors.error,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dangerItem: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.errorLight,
  },
  dangerIcon: {
    backgroundColor: Colors.errorLight,
  },
  dangerText: {
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});