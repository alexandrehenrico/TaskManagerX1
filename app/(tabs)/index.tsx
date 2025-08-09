import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import SplashScreen from '@/components/SplashScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import CompanySetup from '@/components/CompanySetup';
import Dashboard from '@/components/Dashboard';
import { useTaskManager } from '@/hooks/useTaskManager';
import { StorageService } from '@/utils/storage';
import { NotificationService } from '@/utils/notifications';

type AppState = 'splash' | 'welcome' | 'setup' | 'dashboard';

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState>('splash');
  const router = useRouter();
  const taskManager = useTaskManager();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Request notification permissions
    await NotificationService.requestPermissions();
  };

  const handleSplashComplete = async () => {
    const isFirstTime = await StorageService.isFirstTime();
    
    if (isFirstTime || !taskManager.empresa) {
      setAppState('welcome');
    } else {
      setAppState('dashboard');
    }
  };

  const handleWelcomeStart = () => {
    setAppState('setup');
  };

  const handleWelcomeLoadData = () => {
    if (taskManager.empresa) {
      setAppState('dashboard');
    } else {
      setAppState('setup');
    }
  };

  const handleCompanySetupComplete = async (empresa: any) => {
    await taskManager.saveEmpresa(empresa);
    await StorageService.setFirstTime(false);
    setAppState('dashboard');
  };

  const handleNavigateToPersons = () => {
    router.push('/pessoas');
  };

  const handleNavigateToTasks = () => {
    router.push('/atividades');
  };

  const handleNavigateToSettings = () => {
    router.push('/configuracoes');
  };

  const handleAddPerson = () => {
    router.push('/pessoas');
  };

  const handleAddTask = () => {
    router.push('/atividades');
  };

  if (taskManager.isLoading && appState !== 'splash') {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      {appState === 'splash' && (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      )}
      
      {appState === 'welcome' && (
        <WelcomeScreen
          onStartSetup={handleWelcomeStart}
          onLoadExistingData={handleWelcomeLoadData}
        />
      )}
      
      {appState === 'setup' && (
        <CompanySetup
          onComplete={handleCompanySetupComplete}
          empresaExistente={taskManager.empresa || undefined}
        />
      )}
      
      {appState === 'dashboard' && taskManager.empresa && (
        <Dashboard
          empresa={taskManager.empresa}
          pessoas={taskManager.pessoas}
          atividades={taskManager.atividades}
          onNavigateToPersons={handleNavigateToPersons}
          onNavigateToTasks={handleNavigateToTasks}
          onNavigateToSettings={handleNavigateToSettings}
          onAddPerson={handleAddPerson}
          onAddTask={handleAddTask}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});