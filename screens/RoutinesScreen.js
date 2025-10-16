import { collection, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import { useOffline } from '../context/OfflineContext';

const RoutinesScreen = ({ navigation }) => {
  const { isAppOnline } = useOffline();
  const [routines, setRoutines] = useState([]);
  const [muscleRoutines, setMuscleRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);

    let firestoreRoutines = [];
    let offlineCustomRoutines = [];

    if (isAppOnline) {
      try {
        const routinesCollection = collection(db, 'routines');
        const routinesSnapshot = await getDocs(routinesCollection);
        firestoreRoutines = routinesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading routines from Firestore:', error);
        Alert.alert('Error', 'No se pudieron cargar las rutinas desde la base de datos');
      }
    } else {
      // Si está offline, intentar cargar las rutinas personalizadas guardadas localmente
      try {
        const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
        offlineCustomRoutines = storedRoutines ? JSON.parse(storedRoutines) : [];
        Alert.alert('Modo Offline', 'Cargando rutinas personalizadas guardadas localmente.');
      } catch (error) {
        console.error('Error loading offline routines:', error);
      }
    }

    // Combinar rutinas de Firestore y rutinas personalizadas offline (si no hay conexión)
    const combinedRoutines = [...firestoreRoutines, ...offlineCustomRoutines];

    let localRoutines = [];
    try {
      const localModule = require('../data/SampleRoutinesByMuscle');
      localRoutines = localModule.default ?? localModule.sampleRoutinesByMuscle ?? [];
    } catch (err) {
      console.warn('Módulo local sampleRoutinesByMuscle no encontrado o con error:', err.message);
    }

    setRoutines(combinedRoutines); // Usar las rutinas combinadas
    setMuscleRoutines(localRoutines);
    setLoading(false);
  };

  const renderRoutineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.routineCard}
      onPress={() => navigation.navigate('RoutineDetail', { routine: item })}
    >
      <Text style={styles.routineTitle}>{item.name}</Text>
      <Text style={styles.routineDescription}>{item.description}</Text>
      <Text style={styles.routineInfo}>
        ⏱️ {item.duration} min | ⭐ {item.level}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando rutinas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rutinas Disponibles</Text>

      {/* Sección 1: Rutinas de Firebase / Personalizadas Offline */}
      {routines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadRoutines}
          >
            <Text style={styles.refreshButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}

      {/* Separador visual */}
      <View style={styles.separator}>
        <Text style={styles.separatorText}>🔥 Rutinas por Grupo Muscular 🔥</Text>
      </View>

      {/* Sección 2: Rutinas por grupo muscular */}
      {muscleRoutines.length === 0 ? (
        <Text style={styles.emptyText}>No hay rutinas completas locales</Text>
      ) : (
        <FlatList
          data={muscleRoutines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FF9800",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    fontSize: 18,
    color: "#FF9800",
  },
  listContainer: {
    paddingBottom: 10,
  },
  routineCard: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#FF9800",
  },
  routineDescription: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 10,
  },
  routineInfo: {
    fontSize: 13,
    color: "#FFA726",
    fontWeight: "600",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#FF9800",
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  refreshButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#FF9800",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
  },
  separatorText: {
    textAlign: "center",
    color: "#FF9800",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RoutinesScreen;
