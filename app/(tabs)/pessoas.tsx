import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Users, Plus, User, Mail, Phone, Briefcase, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useTaskManager } from '@/hooks/useTaskManager';
import { Pessoa } from '@/types';
import PersonForm from '@/components/PersonForm';

type ViewMode = 'list' | 'form' | 'edit';

export default function PessoasScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPerson, setSelectedPerson] = useState<Pessoa | null>(null);
  const taskManager = useTaskManager();

  const handleAddPerson = () => {
    setSelectedPerson(null);
    setViewMode('form');
  };

  const handleEditPerson = (pessoa: Pessoa) => {
    setSelectedPerson(pessoa);
    setViewMode('edit');
  };

  const handleDeletePerson = (pessoa: Pessoa) => {
    const atividadesDaPessoa = taskManager.atividades.filter(a => a.pessoaId === pessoa.id);
    
    if (atividadesDaPessoa.length > 0) {
      Alert.alert(
        'Não é possível excluir',
        `Esta pessoa possui ${atividadesDaPessoa.length} atividade${atividadesDaPessoa.length > 1 ? 's' : ''} atribuída${atividadesDaPessoa.length > 1 ? 's' : ''}. Remove as atividades primeiro.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir ${pessoa.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await taskManager.deletePessoa(pessoa.id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a pessoa');
            }
          }
        },
      ]
    );
  };

  const handleFormComplete = async (pessoaData: Omit<Pessoa, 'id' | 'criadoEm'>) => {
    try {
      if (selectedPerson) {
        await taskManager.updatePessoa(selectedPerson.id, pessoaData);
      } else {
        const novaPessoa: Pessoa = {
          id: Date.now().toString(),
          ...pessoaData,
          historicoAtividades: [],
          criadoEm: new Date().toISOString(),
        };
        await taskManager.addPessoa(novaPessoa);
      }
      setViewMode('list');
      setSelectedPerson(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados da pessoa');
    }
  };

  const renderPersonItem = ({ item }: { item: Pessoa }) => {
    const atividadesDaPessoa = taskManager.atividades.filter(a => a.pessoaId === item.id);
    const atividadesAtrasadas = atividadesDaPessoa.filter(a => a.status === 'atrasada').length;

    return (
      <View style={styles.personCard}>
        <View style={styles.personHeader}>
          <View style={styles.personInfo}>
            {item.fotoPerfil ? (
              <Image source={{ uri: item.fotoPerfil }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={24} color={Colors.textMuted} strokeWidth={2} />
              </View>
            )}
            
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{item.nome}</Text>
              <Text style={styles.personRole}>{item.cargo}</Text>
              
              {item.email && (
                <View style={styles.contactItem}>
                  <Mail size={14} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.contactText}>{item.email}</Text>
                </View>
              )}
              
              {item.telefone && (
                <View style={styles.contactItem}>
                  <Phone size={14} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.contactText}>{item.telefone}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.personActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleEditPerson(item)}
            >
              <Edit size={18} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleDeletePerson(item)}
            >
              <Trash2 size={18} color={Colors.error} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.personStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{atividadesDaPessoa.length}</Text>
            <Text style={styles.statLabel}>Atividade{atividadesDaPessoa.length !== 1 ? 's' : ''}</Text>
          </View>
          
          {atividadesAtrasadas > 0 && (
            <View style={[styles.statItem, styles.overdueStatItem]}>
              <Text style={styles.overdueStatNumber}>{atividadesAtrasadas}</Text>
              <Text style={styles.overdueStatLabel}>Atrasada{atividadesAtrasadas > 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (viewMode === 'form' || viewMode === 'edit') {
    return (
      <PersonForm
        pessoa={selectedPerson}
        onComplete={handleFormComplete}
        onCancel={() => {
          setViewMode('list');
          setSelectedPerson(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pessoas</Text>
          <Text style={styles.subtitle}>
            {taskManager.pessoas.length} pessoa{taskManager.pessoas.length !== 1 ? 's' : ''} cadastrada{taskManager.pessoas.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddPerson}>
          <Plus size={24} color={Colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {taskManager.pessoas.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={64} color={Colors.textMuted} strokeWidth={1} />
          <Text style={styles.emptyTitle}>Nenhuma pessoa cadastrada</Text>
          <Text style={styles.emptySubtitle}>
            Adicione pessoas à sua equipe para começar a atribuir atividades
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddPerson}>
            <Plus size={20} color={Colors.white} strokeWidth={2} />
            <Text style={styles.emptyButtonText}>Adicionar Primeira Pessoa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={taskManager.pessoas}
          renderItem={renderPersonItem}
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
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  personCard: {
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
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  personInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  personRole: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  personActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overdueStatItem: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overdueStatNumber: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.error,
  },
  overdueStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.error,
    marginTop: 2,
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