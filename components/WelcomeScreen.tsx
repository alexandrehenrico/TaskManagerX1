import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Building2, ArrowRight, Database } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

interface WelcomeScreenProps {
  onStartSetup: () => void;
  onLoadExistingData: () => void;
}

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ onStartSetup, onLoadExistingData }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Building2 size={60} color={Colors.primary} strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>Bem-vindo ao{'\n'}TaskManagerX</Text>
        
        <Text style={styles.description}>
          Organize suas tarefas, gerencie sua equipe e nunca perca um prazo. 
          O aplicativo funciona 100% offline e envia alertas automáticos para seus prazos.
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="✓" 
            text="Gestão completa de pessoas e atividades" 
          />
          <FeatureItem 
            icon="⚡" 
            text="Funcionamento 100% offline" 
          />
          <FeatureItem 
            icon="🔔" 
            text="Alertas automáticos de prazos" 
          />
          <FeatureItem 
            icon="📊" 
            text="Relatórios e estatísticas detalhadas" 
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onStartSetup}>
            <Text style={styles.primaryButtonText}>Começar</Text>
            <ArrowRight size={20} color={Colors.white} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onLoadExistingData}>
            <Database size={20} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Já tenho dados salvos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginRight: 8,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginLeft: 8,
  },
});