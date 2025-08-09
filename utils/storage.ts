import AsyncStorage from '@react-native-async-storage/async-storage';
import { Empresa, Pessoa, Atividade, NotificationConfig } from '@/types';

const STORAGE_KEYS = {
  EMPRESA: '@taskmanagerx_empresa',
  PESSOAS: '@taskmanagerx_pessoas',
  ATIVIDADES: '@taskmanagerx_atividades',
  NOTIFICATIONS: '@taskmanagerx_notifications',
  FIRST_TIME: '@taskmanagerx_first_time',
};

export const StorageService = {
  // Empresa
  async saveEmpresa(empresa: Empresa): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.EMPRESA, JSON.stringify(empresa));
  },

  async getEmpresa(): Promise<Empresa | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMPRESA);
    return data ? JSON.parse(data) : null;
  },

  // Pessoas
  async savePessoas(pessoas: Pessoa[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PESSOAS, JSON.stringify(pessoas));
  },

  async getPessoas(): Promise<Pessoa[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PESSOAS);
    return data ? JSON.parse(data) : [];
  },

  async addPessoa(pessoa: Pessoa): Promise<void> {
    const pessoas = await this.getPessoas();
    pessoas.push(pessoa);
    await this.savePessoas(pessoas);
  },

  async updatePessoa(pessoaId: string, updates: Partial<Pessoa>): Promise<void> {
    const pessoas = await this.getPessoas();
    const index = pessoas.findIndex(p => p.id === pessoaId);
    if (index !== -1) {
      pessoas[index] = { ...pessoas[index], ...updates };
      await this.savePessoas(pessoas);
    }
  },

  async deletePessoa(pessoaId: string): Promise<void> {
    const pessoas = await this.getPessoas();
    const filtered = pessoas.filter(p => p.id !== pessoaId);
    await this.savePessoas(filtered);
  },

  // Atividades
  async saveAtividades(atividades: Atividade[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ATIVIDADES, JSON.stringify(atividades));
  },

  async getAtividades(): Promise<Atividade[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ATIVIDADES);
    return data ? JSON.parse(data) : [];
  },

  async addAtividade(atividade: Atividade): Promise<void> {
    const atividades = await this.getAtividades();
    atividades.push(atividade);
    await this.saveAtividades(atividades);
  },

  async updateAtividade(atividadeId: string, updates: Partial<Atividade>): Promise<void> {
    const atividades = await this.getAtividades();
    const index = atividades.findIndex(a => a.id === atividadeId);
    if (index !== -1) {
      atividades[index] = { ...atividades[index], ...updates, atualizadoEm: new Date().toISOString() };
      await this.saveAtividades(atividades);
    }
  },

  async deleteAtividade(atividadeId: string): Promise<void> {
    const atividades = await this.getAtividades();
    const filtered = atividades.filter(a => a.id !== atividadeId);
    await this.saveAtividades(filtered);
  },

  // Notificações
  async saveNotificationConfig(config: NotificationConfig): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(config));
  },

  async getNotificationConfig(): Promise<NotificationConfig> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : {
      enabled: true,
      resumoDiario: true,
      horarioResumoDiario: '09:00',
      lembreteIndividual: true,
    };
  },

  // First Time
  async setFirstTime(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_TIME, JSON.stringify(value));
  },

  async isFirstTime(): Promise<boolean> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_TIME);
    return data ? JSON.parse(data) : true;
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  },
};