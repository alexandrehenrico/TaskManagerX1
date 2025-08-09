import { useState, useEffect, useCallback } from 'react';
import { Empresa, Pessoa, Atividade, NotificationConfig } from '@/types';
import { StorageService } from '@/utils/storage';
import { NotificationService } from '@/utils/notifications';
import { DateUtils } from '@/utils/dateUtils';

export const useTaskManager = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    enabled: true,
    resumoDiario: true,
    horarioResumoDiario: '09:00',
    lembreteIndividual: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Check for overdue tasks
  useEffect(() => {
    if (atividades.length > 0) {
      checkOverdueTasks();
    }
  }, [atividades]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empresaData, pessoasData, atividadesData, notifConfig] = await Promise.all([
        StorageService.getEmpresa(),
        StorageService.getPessoas(),
        StorageService.getAtividades(),
        StorageService.getNotificationConfig(),
      ]);

      setEmpresa(empresaData);
      setPessoas(pessoasData);
      setAtividades(atividadesData);
      setNotificationConfig(notifConfig);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOverdueTasks = async () => {
    const overdueTasks = await NotificationService.checkOverdueTasks(atividades);
    
    if (overdueTasks.length > 0) {
      const updatedAtividades = atividades.map(atividade => {
        const isOverdue = overdueTasks.find(t => t.id === atividade.id);
        if (isOverdue && atividade.status !== 'atrasada' && atividade.status !== 'concluida') {
          return {
            ...atividade,
            status: 'atrasada' as const,
            historico: [
              ...atividade.historico,
              {
                data: new Date().toISOString(),
                acao: 'Status alterado automaticamente para "Atrasada"',
                observacao: 'Prazo ultrapassado',
              },
            ],
            atualizadoEm: new Date().toISOString(),
          };
        }
        return atividade;
      });

      setAtividades(updatedAtividades);
      await StorageService.saveAtividades(updatedAtividades);
    }
  };

  const saveEmpresa = async (empresaData: Empresa) => {
    try {
      await StorageService.saveEmpresa(empresaData);
      setEmpresa(empresaData);
    } catch (error) {
      console.error('Error saving empresa:', error);
      throw error;
    }
  };

  const addPessoa = async (pessoa: Pessoa) => {
    try {
      await StorageService.addPessoa(pessoa);
      setPessoas(prev => [...prev, pessoa]);
    } catch (error) {
      console.error('Error adding pessoa:', error);
      throw error;
    }
  };

  const updatePessoa = async (pessoaId: string, updates: Partial<Pessoa>) => {
    try {
      await StorageService.updatePessoa(pessoaId, updates);
      setPessoas(prev => prev.map(p => p.id === pessoaId ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating pessoa:', error);
      throw error;
    }
  };

  const deletePessoa = async (pessoaId: string) => {
    try {
      await StorageService.deletePessoa(pessoaId);
      setPessoas(prev => prev.filter(p => p.id !== pessoaId));
      
      // Remove atividades da pessoa deletada
      const atividadesFiltradas = atividades.filter(a => a.pessoaId !== pessoaId);
      setAtividades(atividadesFiltradas);
      await StorageService.saveAtividades(atividadesFiltradas);
    } catch (error) {
      console.error('Error deleting pessoa:', error);
      throw error;
    }
  };

  const addAtividade = async (atividade: Atividade) => {
    try {
      await StorageService.addAtividade(atividade);
      setAtividades(prev => [...prev, atividade]);
      
      // Schedule notifications if enabled
      if (atividade.lembreteNotificacao && notificationConfig.lembreteIndividual) {
        await NotificationService.scheduleTaskReminder(atividade);
      }

      // Update pessoa's histórico
      const pessoa = pessoas.find(p => p.id === atividade.pessoaId);
      if (pessoa) {
        await updatePessoa(pessoa.id, {
          historicoAtividades: [...pessoa.historicoAtividades, atividade.id],
        });
      }
    } catch (error) {
      console.error('Error adding atividade:', error);
      throw error;
    }
  };

  const updateAtividade = async (atividadeId: string, updates: Partial<Atividade>) => {
    try {
      await StorageService.updateAtividade(atividadeId, updates);
      setAtividades(prev => prev.map(a => a.id === atividadeId ? { ...a, ...updates } : a));
      
      // Update notifications if needed
      const atividade = atividades.find(a => a.id === atividadeId);
      if (atividade) {
        await NotificationService.cancelTaskNotifications(atividadeId);
        
        if (updates.lembreteNotificacao && notificationConfig.lembreteIndividual) {
          await NotificationService.scheduleTaskReminder({ ...atividade, ...updates } as Atividade);
        }
      }
    } catch (error) {
      console.error('Error updating atividade:', error);
      throw error;
    }
  };

  const deleteAtividade = async (atividadeId: string) => {
    try {
      await StorageService.deleteAtividade(atividadeId);
      setAtividades(prev => prev.filter(a => a.id !== atividadeId));
      
      // Cancel notifications
      await NotificationService.cancelTaskNotifications(atividadeId);
      
      // Update pessoa's histórico
      const atividade = atividades.find(a => a.id === atividadeId);
      if (atividade) {
        const pessoa = pessoas.find(p => p.id === atividade.pessoaId);
        if (pessoa) {
          await updatePessoa(pessoa.id, {
            historicoAtividades: pessoa.historicoAtividades.filter(id => id !== atividadeId),
          });
        }
      }
    } catch (error) {
      console.error('Error deleting atividade:', error);
      throw error;
    }
  };

  const updateNotificationConfig = async (config: NotificationConfig) => {
    try {
      await StorageService.saveNotificationConfig(config);
      setNotificationConfig(config);
      
      // Update daily summary schedule
      if (config.resumoDiario && config.enabled) {
        await NotificationService.scheduleDailySummary(config.horarioResumoDiario);
      }
    } catch (error) {
      console.error('Error updating notification config:', error);
      throw error;
    }
  };

  const getTaskSummary = useCallback(() => {
    return NotificationService.generateTaskSummary(atividades);
  }, [atividades]);

  return {
    // Data
    empresa,
    pessoas,
    atividades,
    notificationConfig,
    isLoading,
    
    // Actions
    saveEmpresa,
    addPessoa,
    updatePessoa,
    deletePessoa,
    addAtividade,
    updateAtividade,
    deleteAtividade,
    updateNotificationConfig,
    loadData,
    
    // Utils
    getTaskSummary,
  };
};