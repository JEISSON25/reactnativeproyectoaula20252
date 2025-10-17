import { addDoc, collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Video } from 'expo-av'; // Asumiendo que expo-av ya está instalado o se instalará
import WebView from 'react-native-webview'; // Para videos de YouTube, si se usan URLs directas
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig'; 

const RoutineDetailScreen = ({ route }) => {
  const { routine } = route.params;
  const { user, loading: authLoading } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [lockedCompleted, setLockedCompleted] = useState(false);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    loadExercises();
    if (!authLoading) {
      loadUserProgress();
      if (!isOffline && user) {
        syncOfflineProgress();
      }
    }

    return () => {
      unsubscribeNetInfo();
    };
  }, [user, authLoading, isOffline]);

  const loadExercises = async () => {
    try {
      if (routine.exercises && routine.exercises.length > 0) {
        setExercises(routine.exercises);
      } else {
        const exampleExercises = [
          { id: '1', name: 'Flexiones', sets: 3, reps: 15, description: 'Flexiones de pecho tradicionales' },
          { id: '2', name: 'Sentadillas', sets: 3, reps: 20, description: 'Sentadillas con peso corporal' },
          { id: '3', name: 'Plancha', sets: 3, reps: '30 seg', description: 'Mantener posición de plancha' }
        ];
        setExercises(exampleExercises);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los ejercicios');
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      let completedIds = [];
      if (user && !isOffline) {
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', user.uid),
          where('routineId', '==', routine.id)
        );
        const progressSnapshot = await getDocs(progressQuery);
        completedIds = progressSnapshot.docs.map(doc => doc.data().exerciseId);
      }

      // Cargar progreso offline
      const storedProgress = await AsyncStorage.getItem(`offlineProgress_${routine.id}_${user ? user.uid : 'guest'}`);
      const offlineCompleted = storedProgress ? JSON.parse(storedProgress) : [];
      
      const combinedCompleted = [...new Set([...completedIds, ...offlineCompleted])];
      setCompletedExercises(combinedCompleted);

      if (combinedCompleted.length === exercises.length && exercises.length > 0) {
        setDayCompleted(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const syncOfflineProgress = async () => {
    try {
      const storedProgress = await AsyncStorage.getItem(`offlineProgress_${routine.id}_${user.uid}`);
      const offlineCompleted = storedProgress ? JSON.parse(storedProgress) : [];

      if (offlineCompleted.length > 0 && user) {
        const batch = writeBatch(db);
        for (const exId of offlineCompleted) {
          const newProgressRef = doc(collection(db, 'progress'));
          batch.set(newProgressRef, {
            userId: user.uid,
            routineId: routine.id,
            exerciseId: exId,
            completedAt: new Date(),
          });
        }
        await batch.commit();
        await AsyncStorage.removeItem(`offlineProgress_${routine.id}_${user.uid}`);
        loadUserProgress(); // Recargar el progreso después de la sincronización
        Alert.alert('Sincronización', 'Progreso offline sincronizado con Firebase.');
      }
    } catch (error) {
      console.error('Error sincronizando progreso offline:', error);
    }
  };

  const markExerciseCompleted = async (exerciseId) => {
    try {
      if (completedExercises.includes(exerciseId)) {
        Alert.alert('Info', 'Este ejercicio ya está marcado como completado');
        return;
      }

      const updated = [...completedExercises, exerciseId];
      setCompletedExercises(updated);

      if (isOffline || !user) {
        // Guardar progreso offline
        const storedProgress = await AsyncStorage.getItem(`offlineProgress_${routine.id}_${user ? user.uid : 'guest'}`);
        const offlineCompleted = storedProgress ? JSON.parse(storedProgress) : [];
        offlineCompleted.push(exerciseId);
        await AsyncStorage.setItem(`offlineProgress_${routine.id}_${user ? user.uid : 'guest'}`, JSON.stringify(offlineCompleted));
      } else {
        // Guardar progreso en Firebase
        await addDoc(collection(db, 'progress'), {
          userId: user.uid,
          routineId: routine.id,
          exerciseId,
          completedAt: new Date(),
        });
      }

      if (updated.length === exercises.length) {
        setDayCompleted(true);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el progreso");
      console.error("Error guardando el progreso:", error);
    }
  };




  const restartDay = () => {
    setCompletedExercises([]);
    setDayCompleted(false);
    setLockedCompleted(false);
  };

  const keepCompleted = () => {
    setLockedCompleted(true);
  };

  const renderExerciseItem = ({ item }) => {
    const isCompleted = completedExercises.includes(item.id);
    return (
      <View style={[styles.exerciseCard, isCompleted && styles.completedCard]}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, isCompleted && styles.completedText]}>
            {item.name}
          </Text>
          <Text style={styles.exerciseDescription}>{item.description}</Text>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.exerciseImage} />
          )}
          {item.videoUrl && (
            <View style={styles.videoContainer}>
              {/* Si es un video de YouTube, se puede usar WebView */}
              {item.videoUrl.includes('youtube.com') || item.videoUrl.includes('youtu.be') ? (
                <WebView
                  style={styles.videoPlayer}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  source={{ uri: item.videoUrl.replace("watch?v=", "embed/") }}
                />
              ) : (
                <Video
                  source={{ uri: item.videoUrl }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain"
                  shouldPlay
                  isLooping
                  useNativeControls
                  style={styles.videoPlayer}
                />
              )}
            </View>
          )}
          <Text style={styles.exerciseDetails}>
            {item.sets} series x {item.reps} repeticiones
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.completeButton, isCompleted && styles.completedButton]}
          onPress={() => markExerciseCompleted(item.id)}
          disabled={isCompleted}
        >
          <Text style={[styles.completeButtonText, isCompleted && styles.completedButtonText]}>
            {isCompleted ? '✓ Completado' : 'Marcar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando ejercicios...</Text>
      </View>
    );
  }

  const completedCount = completedExercises.length;
  const totalCount = exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isCreated = routine.createdBy ? true : false;
  const routineType = isCreated ? 'Rutina creada' : 'Rutina predefinida';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.routineType}>{routineType}</Text>
        <Text style={styles.routineTitle}>{routine.name}</Text>
        <Text style={styles.routineDescription}>{routine.description}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progreso: {completedCount}/{totalCount} ({Math.round(progressPercentage)}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      </View>

      {dayCompleted ? (
        <View style={styles.dayCompletedContainer}>
          <Text style={styles.dayCompletedText}>
            ¡Día completo de {routine.name} finalizado!
          </Text>

          {!lockedCompleted ? (
            <>
              <TouchableOpacity style={styles.restartButton} onPress={restartDay}>
                <Text style={styles.restartButtonText}>Reiniciar para otro día</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keepCompletedButton} onPress={keepCompleted}>
                <Text style={styles.keepCompletedButtonText}>Mantener como completado</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.lockedText}> Rutina guardada como completada</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={
            <TouchableOpacity style={styles.restartAnytimeButton} onPress={restartDay}>
              <Text style={styles.restartAnytimeText}> Reiniciar rutina</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    marginBottom: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  routineType: { fontSize: 14, fontWeight: '600', color: '#FFA500', marginBottom: 6 },
  routineTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
  routineDescription: { fontSize: 16, color: '#ccc', marginBottom: 15, fontStyle: 'italic' },
  progressContainer: { marginTop: 10 },
  progressText: { fontSize: 14, color: '#fff', marginBottom: 8, fontWeight: '500' },
  progressBar: { height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFA500' },
  listContainer: { padding: 20, paddingTop: 0 },
  exerciseCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCard: { backgroundColor: '#2A2A2A', borderColor: '#FFA500', borderWidth: 1 },
  exerciseInfo: { flex: 1, marginRight: 15 },
  exerciseName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#fff' },
  completedText: { color: '#FFA500', textDecorationLine: 'line-through' },
  exerciseDescription: { fontSize: 14, color: '#ccc', marginBottom: 5 },
  exerciseDetails: { fontSize: 13, color: '#aaa' },
  exerciseImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  videoContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    height: 200, 
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  completeButton: { backgroundColor: '#FFA500', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  completedButton: { backgroundColor: '#555' },
  completeButtonText: { color: '#121212', fontSize: 14, fontWeight: 'bold' },
  completedButtonText: { color: '#FFA500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { fontSize: 18, color: '#FFA500' },
  dayCompletedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  dayCompletedText: { fontSize: 18, fontWeight: 'bold', color: '#FFA500', marginBottom: 20 },
  restartButton: { backgroundColor: '#FFA500', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginBottom: 10 },
  restartButtonText: { color: '#121212', fontSize: 16, fontWeight: 'bold' },
  keepCompletedButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  keepCompletedButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  lockedText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 10 },
  restartAnytimeButton: { marginTop: 20, padding: 12, borderRadius: 10, backgroundColor: '#333', alignItems: 'center' },
  restartAnytimeText: { fontSize: 16, fontWeight: '600', color: '#FFA500' },
});

export default RoutineDetailScreen;
