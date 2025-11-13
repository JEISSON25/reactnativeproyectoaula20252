// src/screens/AlertasMenu.js
import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Alert,RefreshControl,} from 'react-native';
import { db } from '../../firebaseConfig';
import {collection,query,where,getDocs,} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const parametrosClima = [
  { label: 'Temperatura', value: 'temperature_2m' },
  { label: 'Sensación térmica', value: 'apparent_temperature' },
  { label: 'Humedad relativa', value: 'relative_humidity_2m' },
  { label: 'Velocidad del viento', value: 'wind_speed_10m' },
  { label: 'Precipitación', value: 'precipitation' },
  { label: 'Índice UV', value: 'uv_index' },
];

export default function AlertasMenu({ navigation }) {
  const [alertas, setAlertas] = useState([]);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Detectar usuario autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      console.log('Usuario autenticado:', usuario?.uid || 'ninguno');
    });
    return unsubscribe;
  }, []);

  // Cargar alertas del usuario
  const cargarAlertas = async () => {
    if (!user) {
      console.log('No hay usuario autenticado');
      setAlertas([]);
      return;
    }

    try {
      console.log('Cargando alertas para UID:', user.uid);

  
      const q = query(
        collection(db, 'alertasClima'),
        where('uid', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      console.log(`Documentos encontrados: ${snapshot.docs.length}`);

      let lista = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          _fechaOrden: data.fecha?.seconds || (typeof data.fecha === 'string' ? new Date(data.fecha).getTime() : 0),
        };
      });

        // Ordenar por fecha descendente
      lista.sort((a, b) => (b._fechaOrden || 0) - (a._fechaOrden || 0));
      lista = lista.map(({ _fechaOrden, ...item }) => item);

      setAlertas(lista);
      console.log('Alertas cargadas:', lista.length);
    } catch (e) {
      console.error('Error al cargar alertas:', e);
      Alert.alert('Error', 'No se pudieron cargar las alertas: ' + e.message);
    }
  };

  // Cargar al cambiar usuario
  useEffect(() => {
    cargarAlertas();
  }, [user]);

  // Recargar al enfocar pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Pantalla enfocada: recargando alertas');
      cargarAlertas();
    });
    return unsubscribe;
  }, [navigation]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarAlertas().finally(() => setRefreshing(false));
  };

  // Renderizar cada alerta
  const renderAlerta = ({ item }) => {
    const paramLabel =
      parametrosClima.find((p) => p.value === item.parametro)?.label ||
      item.parametro;

    const condicionTexto =
      item.condicion === 'mayor' ? '> ': item.condicion === 'menor' ? '< ' : '= ';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          Alert.alert(
            item.titulo,
            `${paramLabel} ${condicionTexto}${item.valor}\n` +
            `Ciudad: ${item.ciudad}\n` +
            `Frecuencia: cada ${item.numero} ${item.unidad}`
          )
        }
      >
        <Icon name="alert-circle" size={32} color="#D32F2F" />
        <View style={styles.info}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.detalle}>
            {paramLabel} {condicionTexto}
            <Text style={{ fontWeight: 'bold' }}>{item.valor}</Text> en{' '}
            <Text style={{ fontWeight: 'bold' }}>{item.ciudad}</Text>
          </Text>
          <Text style={styles.frecuencia}>
            Cada {item.numero} {item.unidad}
          </Text>
        </View>
        <Icon name="chevron-forward" size={24} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Alertas Climáticas</Text>

      <TouchableOpacity
        style={styles.botonNueva}
        onPress={() => navigation.navigate('RegistrarAlerta')}
      >
        <Icon name="add-circle-outline" size={28} color="#fff" />
        <Text style={styles.botonTexto}>Nueva Alerta</Text>
      </TouchableOpacity>

      {alertas.length === 0 ? (
        <View style={styles.vacio}>
          <Icon name="cloud-outline" size={80} color="#ddd" />
          <Text style={styles.textoVacio}>No tienes alertas aún</Text>
          <Text style={styles.subtexto}>Crea una para empezar</Text>
        </View>
      ) : (
        <FlatList
          data={alertas}
          renderItem={renderAlerta}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 20,
  },
  botonNueva: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 5,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detalle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 5,
  },
  frecuencia: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoVacio: {
    fontSize: 20,
    color: '#94a3b8',
    marginTop: 20,
  },
  subtexto: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 8,
  },
});