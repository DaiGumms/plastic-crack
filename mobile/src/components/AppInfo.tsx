import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface AppInfoProps {
  title?: string;
  version?: string;
}

export const AppInfo: React.FC<AppInfoProps> = ({ 
  title = 'Plastic Crack', 
  version = '1.0.0' 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.version}>Version {version}</Text>
      <Text style={styles.subtitle}>Miniature Collection Manager</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
