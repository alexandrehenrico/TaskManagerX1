import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { ClipboardList, Plus, Filter, Calendar, User, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Play, Bell, BellOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useTaskManager } from '@/hooks/useTaskManager';
import { Atividade } from '@/types';
import { DateUtils } from '@/utils/dateUtils';
import TaskForm from '@/components/TaskForm';

type ViewMode = 'list' | 'form' | 'edit';
type FilterType = 'all' | 'pendente' | 'iniciada' | 'concluida' | 'atrasada';

export default function AtividadesScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<Atividade | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const taskManager = useTaskManager();

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return taskManager.atividades;
    return taskManager.atividades.filter(a => a.status === filter);
  }, [taskManager.atividades, filter]);

  const handleAddTask = () => {
    if (taskManager.pessoas.length === 0) {
      Alert.alert(
        'Nenhuma pessoa cadastrada',
        'Você precisa cadastrar pelo menos uma pessoa antes de criar atividades.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedTask(null);
    setViewMode('form');
  };

  const handleEditTask = (atividade: Atividade) => {
    setSelectedTask(atividade);
    setViewMode('edit');
  };

  const handleFormComplete = async (taskData: any) => {
    try {
      if (selectedTask) {
        const updates = {
          ...taskData,
          historico: [
            ...selectedTask.historico,
            {
              data: new Date().toISOString(),
              acao: 'Atividade editada',
              observacao: 'Dados atualizados',
            },
          ],
        };
        await taskManager.updateAtividade(selectedTask.id, updates);
      } else {
        const novaAtividade: Atividade = {
          id: Date.now().toString(),
          ...taskData,
          status: 'pendente' as const,
          historico: [
            {
              data: new Date().toISOString(),
              acao: 'Atividade criada',
              observacao: 'Nova atividade cadastrada',
            },
          ],
          anexos: [],
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        };
        await taskManager.addAtividade(novaAtividade);
      }
      setViewMode('list');
      setSelectedTask(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a atividade');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock size={20} color={Colors.warning} strokeWidth={2} />;
      case 'iniciada':
        return <Play size={20} color={Colors.secondary} strokeWidth={2} />;
      case 'concluida':
        return <CheckCircle size={20} color={Colors.success} strokeWidth={2} />;
      case 'atrasada':
        return <AlertTriangle size={20} color={Colors.error} strokeWidth={2} />;
      default:
        return <Clock size={20} color={Colors.textMuted} strokeWidth={2} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return Colors.warning;
      case 'iniciada':
        return Colors.secondary;
      case 'concluida':
        return Colors.success;
      case 'atrasada':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const renderTaskItem = ({ item }: { item: Atividade }) => {
    const pessoa = taskManager.pessoas.find(p => p.id === item.pessoaId);
    const isOverdue = DateUtils.isOverdue(item.prazoFinal) && item.status !== 'concluida';
    const isDueToday = DateUtils.isDueToday(item.prazoFinal);

    return (
      <TouchableOpacity style={styles.taskCard} onPress={() => handleEditTask(item)}>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.titulo}</Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.descricao}
            </Text>
          </View>
          
          <View style={styles.taskMeta}>
            {getStatusIcon(item.status)}
            {item.lembreteNotificacao ? (
              <Bell size={16} color={Colors.primary} strokeWidth={2} />
            ) : (
              <BellOff size={16} color={Colors.textMuted} strokeWidth={2} />
            )}
          </View>
        </View>

        <View style={styles.taskDetails}>
          {pessoa && (
            <View style={styles.assigneeContainer}>
              {pessoa.fotoPerfil ? (
                <Image source={{ uri: pessoa.fotoPerfil }} style={styles.assigneeAvatar} />
              ) : (
                <View style={styles.assigneeAvatarPlaceholder}>
                  <User size={16} color={Colors.textMuted} strokeWidth={2} />
                </View>
              )}
              <Text style={styles.assigneeName}>{pessoa.nome}</Text>
            </View>
          )}

          <View style={styles.dateContainer}>
            <Calendar size={16} color={Colors.textMuted} strokeWidth={2} />
            <Text style={[
              styles.dateText,
              isOverdue && styles.overdueText,
              isDueToday && styles.dueTodayText
            ]}>
              {DateUtils.formatRelative(item.prazoFinal)}
            </Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (viewMode === 'form' || viewMode === 'edit') {
    return (
      <TaskForm
        atividade={selectedTask}
        pessoas={taskManager.pessoas}
        onComplete={handleFormComplete}
        onCancel={() => {
          setViewMode('list');
          setSelectedTask(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Atividades</Text>
          <Text style={styles.subtitle}>
            {filteredTasks.length} atividade{filteredTasks.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Plus size={24} color={Colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {[
              { key: 'all', label: 'Todas' },
              { key: 'pendente', label: 'Pendentes' },
              { key: 'iniciada', label: 'Em Andamento' },
              { key: 'concluida', label: 'Concluídas' },
              { key: 'atrasada', label: 'Atrasadas' },
            ].map((filterOption) => (
              <TouchableOpacity
                key={filterOption.key}
                style={[
                  styles.filterButton,
                  filter === filterOption.key && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(filterOption.key as FilterType)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === filterOption.key && styles.filterButtonTextActive,
                  ]}
                >
                  {filterOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <ClipboardList size={64} color={Colors.textMuted} strokeWidth={1} />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'Nenhuma atividade criada' : `Nenhuma atividade ${filter}`}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'Crie sua primeira atividade para começar a organizar as tarefas'
              : `Não há atividades com status "${filter}" no momento`
            }
          </Text>
          {filter === 'all' && (
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddTask}>
              <Plus size={20} color={Colors.white} strokeWidth={2} />
              <Text style={styles.emptyButtonText}>Criar Primeira Atividade</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  assigneeAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  assigneeName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  overdueText: {
    color: Colors.error,
    fontFamily: Fonts.medium,
  },
  dueTodayText: {
    color: Colors.warning,
    fontFamily: Fonts.medium,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginLeft: 8,
  },
});