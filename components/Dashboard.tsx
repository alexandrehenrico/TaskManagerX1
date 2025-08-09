import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Users, Plus, ClipboardList, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Atividade, Pessoa, Empresa } from '@/types';

interface DashboardProps {
  empresa: Empresa;
  pessoas: Pessoa[];
  atividades: Atividade[];
  onNavigateToPersons: () => void;
  onNavigateToTasks: () => void;
  onNavigateToSettings: () => void;
  onAddPerson: () => void;
  onAddTask: () => void;
}

export default function Dashboard({
  empresa,
  pessoas,
  atividades,
  onNavigateToPersons,
  onNavigateToTasks,
  onNavigateToSettings,
  onAddPerson,
  onAddTask,
}: DashboardProps) {
  const getTaskStats = () => {
    const total = atividades.length;
    const pendentes = atividades.filter(a => a.status === 'pendente').length;
    const iniciadas = atividades.filter(a => a.status === 'iniciada').length;
    const concluidas = atividades.filter(a => a.status === 'concluida').length;
    const atrasadas = atividades.filter(a => a.status === 'atrasada').length;

    return { total, pendentes, iniciadas, concluidas, atrasadas };
  };

  const stats = getTaskStats();
  const activeNotifications = atividades.filter(a => a.lembreteNotificacao).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá!</Text>
          <Text style={styles.companyName}>{empresa.nome}</Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton} onPress={onNavigateToSettings}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumo das Atividades</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total"
            value={stats.total}
            icon={<ClipboardList size={24} color={Colors.primary} strokeWidth={2} />}
            color={Colors.primary}
          />
          <StatCard
            title="Pendentes"
            value={stats.pendentes}
            icon={<Clock size={24} color={Colors.warning} strokeWidth={2} />}
            color={Colors.warning}
          />
          <StatCard
            title="Em Andamento"
            value={stats.iniciadas}
            icon={<ClipboardList size={24} color={Colors.secondary} strokeWidth={2} />}
            color={Colors.secondary}
          />
          <StatCard
            title="Concluídas"
            value={stats.concluidas}
            icon={<CheckCircle size={24} color={Colors.success} strokeWidth={2} />}
            color={Colors.success}
          />
        </View>

        {stats.atrasadas > 0 && (
          <TouchableOpacity style={styles.overdueAlert} onPress={onNavigateToTasks}>
            <AlertTriangle size={20} color={Colors.error} strokeWidth={2} />
            <Text style={styles.overdueText}>
              {stats.atrasadas} tarefa{stats.atrasadas > 1 ? 's' : ''} atrasada{stats.atrasadas > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <ActionCard
            title="Nova Pessoa"
            subtitle={`${pessoas.length} cadastrada${pessoas.length !== 1 ? 's' : ''}`}
            icon={<Users size={28} color={Colors.primary} strokeWidth={2} />}
            onPress={onAddPerson}
          />
          <ActionCard
            title="Nova Atividade"
            subtitle="Criar tarefa"
            icon={<Plus size={28} color={Colors.success} strokeWidth={2} />}
            onPress={onAddTask}
          />
        </View>
      </View>

      <View style={styles.navigationSection}>
        <NavigationCard
          title="Gerenciar Pessoas"
          subtitle={`${pessoas.length} pessoa${pessoas.length !== 1 ? 's' : ''} cadastrada${pessoas.length !== 1 ? 's' : ''}`}
          icon={<Users size={24} color={Colors.primary} strokeWidth={2} />}
          onPress={onNavigateToPersons}
        />
        
        <NavigationCard
          title="Ver Todas as Atividades"
          subtitle={`${stats.total} atividade${stats.total !== 1 ? 's' : ''} no total`}
          icon={<ClipboardList size={24} color={Colors.secondary} strokeWidth={2} />}
          onPress={onNavigateToTasks}
        />
      </View>

      {activeNotifications > 0 && (
        <View style={styles.notificationIndicator}>
          <Bell size={16} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.notificationText}>
            {activeNotifications} lembrete{activeNotifications > 1 ? 's' : ''} ativo{activeNotifications > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ActionCard({ title, subtitle, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        {icon}
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function NavigationCard({ title, subtitle, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navigationCard} onPress={onPress}>
      <View style={styles.navigationIcon}>
        {icon}
      </View>
      <View style={styles.navigationContent}>
        <Text style={styles.navigationTitle}>{title}</Text>
        <Text style={styles.navigationSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
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
  welcomeText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  companyName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 20,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  overdueAlert: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overdueText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.error,
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
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
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  navigationSection: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  navigationCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
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
  navigationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  navigationContent: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  navigationSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  notificationIndicator: {
    marginHorizontal: 24,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  notificationText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.primary,
  },
});