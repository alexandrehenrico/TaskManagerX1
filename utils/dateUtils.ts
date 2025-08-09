import { format, isToday, isTomorrow, isYesterday, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DateUtils = {
  format(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  },

  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  },

  formatRelative(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) return 'Hoje';
    if (isTomorrow(dateObj)) return 'Amanhã';
    if (isYesterday(dateObj)) return 'Ontem';
    
    return this.format(dateObj);
  },

  isOverdue(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(new Date(), dateObj);
  },

  isDueToday(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  },

  isDueTomorrow(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isTomorrow(dateObj);
  },

  getDaysUntilDeadline(date: string | Date): number {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffTime = dateObj.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};