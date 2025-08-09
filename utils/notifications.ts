import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Atividade } from '@/types';
import { isToday, isTomorrow, isAfter } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    }
    
    return false;
  },

  async scheduleTaskReminder(atividade: Atividade): Promise<void> {
    if (!atividade.lembreteNotificacao || Platform.OS === 'web') return;
    
    const prazoDate = new Date(atividade.prazoFinal);
    const now = new Date();

    // Lembrete 1 dia antes
    const oneDayBefore = new Date(prazoDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0);

    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Tarefa',
          body: `A tarefa "${atividade.titulo}" vence amanhã!`,
          data: { atividadeId: atividade.id, type: 'day_before' },
        },
        trigger: oneDayBefore,
      });
    }

    // Lembrete no dia do prazo
    const onDeadlineDay = new Date(prazoDate);
    onDeadlineDay.setHours(9, 0, 0, 0);

    if (onDeadlineDay > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Prazo Hoje!',
          body: `A tarefa "${atividade.titulo}" vence hoje!`,
          data: { atividadeId: atividade.id, type: 'deadline_day' },
        },
        trigger: onDeadlineDay,
      });
    }
  },

  async scheduleDailySummary(horario: string): Promise<void> {
    if (Platform.OS === 'web') return;

    // Cancel existing daily summaries
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const dailySummaryNotifications = existingNotifications.filter(
      n => n.content.data?.type === 'daily_summary'
    );
    
    for (const notification of dailySummaryNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    // Schedule new daily summary
    const [hours, minutes] = horario.split(':');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Resumo Diário - TaskManagerX',
        body: 'Confira suas tarefas de hoje e pendências',
        data: { type: 'daily_summary' },
      },
      trigger: {
        hour: parseInt(hours),
        minute: parseInt(minutes),
        repeats: true,
      },
    });
  },

  async cancelTaskNotifications(atividadeId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = existingNotifications.filter(
      n => n.content.data?.atividadeId === atividadeId
    );
    
    for (const notification of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  },

  async checkOverdueTasks(atividades: Atividade[]): Promise<Atividade[]> {
    const now = new Date();
    const overdueTasks: Atividade[] = [];

    for (const atividade of atividades) {
      const prazoDate = new Date(atividade.prazoFinal);
      
      if (isAfter(now, prazoDate) && atividade.status !== 'concluida' && atividade.status !== 'atrasada') {
        overdueTasks.push(atividade);
      }
    }

    return overdueTasks;
  },

  generateTaskSummary(atividades: Atividade[]): { today: number; overdue: number; pending: number } {
    const now = new Date();
    
    return {
      today: atividades.filter(a => isToday(new Date(a.prazoFinal)) && a.status !== 'concluida').length,
      overdue: atividades.filter(a => a.status === 'atrasada').length,
      pending: atividades.filter(a => a.status === 'pendente').length,
    };
  },
};