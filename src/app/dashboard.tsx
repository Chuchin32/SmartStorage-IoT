import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { database } from '../../firebaseConfig';

interface RegistroItem {
  id: string;
  tipo: 'clima' | 'acceso';
  temperatura?: number;
  humedad?: number;
  estado?: 'CONCEDIDO' | 'DENEGADO';
  uid?: string;
}

export default function SmartStorageScreen() {
  const [registros, setRegistros] = useState<RegistroItem[]>([]);
  const [ultimoClima, setUltimoClima] = useState<{ temperatura: number; humedad: number }>({ temperatura: 0, humedad: 0 });
  const [filtro, setFiltro] = useState<string>('todos');
  const [estadisticas, setEstadisticas] = useState<{ totalAccesos: number; denegados: number }>({ totalAccesos: 0, denegados: 0 });

  useEffect(() => {
    const registrosRef = ref(database, 'registros');
    
    const unsubscribe = onValue(registrosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaRegistros: RegistroItem[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();

        setRegistros(listaRegistros);

        const climaReciente = listaRegistros.find(item => item.tipo === 'clima');
        if (climaReciente) {
          setUltimoClima({
            temperatura: climaReciente.temperatura || 0,
            humedad: climaReciente.humedad || 0
          });
        }

        const accesos = listaRegistros.filter(item => item.tipo === 'acceso');
        const denegados = accesos.filter(item => item.estado === 'DENEGADO');
        setEstadisticas({
          totalAccesos: accesos.length,
          denegados: denegados.length
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const registrosFiltrados = registros.filter(item => {
    if (filtro === 'clima') return item.tipo === 'clima';
    if (filtro === 'accesos') return item.tipo === 'acceso';
    return true;
  });

  const temperaturaAlta = Number(ultimoClima.temperatura) > 28;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>SmartStorage IoT</Text>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Firebase En Vivo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {temperaturaAlta && (
          <View style={styles.alertaContainer}>
            <Text style={styles.alertaText}>⚠️ ALERTA TÉRMICA: {ultimoClima.temperatura}°C (Supera el umbral de 28°C)</Text>
          </View>
        )}

        <View style={[styles.dashboardCard, temperaturaAlta && styles.cardAlertaFondo]}>
          <Text style={styles.cardTitle}>Monitoreo Ambiental en Tiempo Real</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{ultimoClima.temperatura}°C</Text>
              <Text style={styles.metricLabel}>Temperatura</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{ultimoClima.humedad}%</Text>
              <Text style={styles.metricLabel}>Humedad Relativa</Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiNumber}>{estadisticas.totalAccesos}</Text>
            <Text style={styles.kpiLabel}>Intentos RFID</Text>
          </View>
          <View style={[styles.kpiCard, estadisticas.denegados > 0 && styles.kpiCardAlerta]}>
            <Text style={[styles.kpiNumber, estadisticas.denegados > 0 && {color: '#dc2626'}]}>{estadisticas.denegados}</Text>
            <Text style={styles.kpiLabel}>Accesos Denegados</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, filtro === 'todos' && styles.filterActive]} 
            onPress={() => setFiltro('todos')}
          >
            <Text style={[styles.filterText, filtro === 'todos' && styles.filterTextActive]}>Todo el Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, filtro === 'clima' && styles.filterActive]} 
            onPress={() => setFiltro('clima')}
          >
            <Text style={[styles.filterText, filtro === 'clima' && styles.filterTextActive]}>Sensores</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterButton, filtro === 'accesos' && styles.filterActive]} 
            onPress={() => setFiltro('accesos')}
          >
            <Text style={[styles.filterText, filtro === 'accesos' && styles.filterTextActive]}>Seguridad RFID</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeader}>Registro de Transacciones ({registrosFiltrados.length})</Text>

        {registrosFiltrados.map((item) => (
          <View key={item.id} style={[
            styles.itemCard, 
            item.estado === 'DENEGADO' && styles.cardDenegado
          ]}>
            {item.tipo === 'clima' ? (
              <View style={styles.rowItemContent}>
                <Text style={styles.itemEmoji}>🌡️</Text>
                <View>
                  <Text style={styles.itemTitleBold}>Lectura de Clima</Text>
                  <Text style={styles.itemSubtitle}>Temp: {item.temperatura}°C  |  Humedad: {item.humedad}%</Text>
                </View>
              </View>
            ) : (
              <View style={styles.rowItemContent}>
                <Text style={styles.itemEmoji}>{item.estado === 'CONCEDIDO' ? '🔓' : '🔒'}</Text>
                <View>
                  <Text style={[styles.itemTitleBold, item.estado === 'DENEGADO' && {color: '#dc2626'}]}>
                    {item.estado === 'CONCEDIDO' ? 'Acceso Autorizado' : 'Intrusión / Denegado'}
                  </Text>
                  <Text style={styles.itemSubtitle}>UID: {item.uid}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', letterSpacing: 0.5 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#064e3b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399', marginRight: 6 },
  onlineText: { color: '#6ee7b7', fontSize: 12, fontWeight: '600' },
  scrollContent: { padding: 20 },
  alertaContainer: { backgroundColor: '#7f1d1d', borderColor: '#ef4444', borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 15 },
  alertaText: { color: '#fca5a5', fontWeight: 'bold', textAlign: 'center', fontSize: 13 },
  dashboardCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  cardAlertaFondo: { backgroundColor: '#450a0a', borderColor: '#dc2626' },
  cardTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  metricBox: { alignItems: 'center' },
  metricValue: { color: '#f8fafc', fontSize: 28, fontWeight: 'bold' },
  metricLabel: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  metricDivider: { width: 1, height: 40, backgroundColor: '#334155' },
  kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  kpiCard: { flex: 1, backgroundColor: '#1e293b', padding: 14, borderRadius: 12, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  kpiCardAlerta: { borderColor: '#ef4444', backgroundColor: '#2a1212' },
  kpiNumber: { fontSize: 20, fontWeight: 'bold', color: '#38bdf8' },
  kpiLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  filterRow: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 10, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  filterButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  filterActive: { backgroundColor: '#2563eb' },
  filterText: { color: '#94a3b8', fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: '#ffffff' },
  subHeader: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#f8fafc' },
  itemCard: { backgroundColor: '#1e293b', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  cardDenegado: { borderColor: '#ef4444', backgroundColor: '#2a1212' },
  rowItemContent: { flexDirection: 'row', alignItems: 'center' },
  itemEmoji: { fontSize: 24, marginRight: 14 },
  itemTitleBold: { fontSize: 14, fontWeight: 'bold', color: '#f8fafc' },
  itemSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 }
});