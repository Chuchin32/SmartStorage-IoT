import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logotipo o Icono del Sistema */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🛡️</Text>
        </View>

        <Text style={styles.title}>SmartStorage IoT</Text>
        <Text style={styles.subtitle}>
          Sistema Inteligente de Monitoreo Ambiental y Seguridad de Accesos RFID en Tiempo Real.
        </Text>

        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>UAEMéx • Ingeniería en Computación</Text>
        </View>

        {/* Botón para entrar al panel */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.buttonText}>Ingresar al Panel en Vivo ➔</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Nevería Estrada & SmartStorage Project</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'space-between', padding: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 90, height: 90, backgroundColor: '#1e293b', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  logoEmoji: { fontSize: 45 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 25, lineHeight: 20, paddingHorizontal: 10 },
  badgeBox: { backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 40, borderWidth: 1, borderColor: '#334155' },
  badgeText: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  button: { backgroundColor: '#2563eb', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { textAlign: 'center', color: '#64748b', fontSize: 12, marginBottom: 10 }
});