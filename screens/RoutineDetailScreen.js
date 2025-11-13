import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";

const RoutineDetailScreen = ({ route }) => {
  const { routine } = route.params;
  const { user, loading: authLoading } = useAuth();

  const [isOffline, setIsOffline] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [lockedCompleted, setLockedCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // hecho por camilo pa manejar la logica del progreso, tanto online como offline
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    if (routine.exercises && routine.exercises.length > 0) {
      loadProgress();
    }

    return () => unsubscribe();
  }, [user, routine]);

  const loadProgress = async () => {
    try {
      console.log("cargando progreso de la rutina...");
      let completedIds = [];

      if (user && !isOffline) {
        const progressQuery = query(
          collection(db, "progress"),
          where("userId", "==", user.uid),
          where("routineId", "==", routine.id)
        );
        const snapshot = await getDocs(progressQuery);
        completedIds = snapshot.docs.map((doc) => doc.data().exerciseId);
      }

      const local = await AsyncStorage.getItem(
        `offlineProgress_${routine.id}_${user ? user.uid : "guest"}`
      );
      const offlineCompleted = local ? JSON.parse(local) : [];

      const merged = [...new Set([...completedIds, ...offlineCompleted])];
      setCompletedExercises(merged);
      if (merged.length === routine.exercises.length) setDayCompleted(true);
    } catch (e) {
      console.log("error cargando progreso:", e);
    } finally {
      setLoading(false);
    }
  };

  const markExerciseCompleted = async (exerciseId) => {
    try {
      if (completedExercises.includes(exerciseId)) return;
      const updated = [...completedExercises, exerciseId];
      setCompletedExercises(updated);

      const key = `offlineProgress_${routine.id}_${user ? user.uid : "guest"}`;
      await AsyncStorage.setItem(key, JSON.stringify(updated));

      console.log("ejercicio marcado:", exerciseId);

      if (updated.length === routine.exercises.length) {
        console.log("rutina completada, guardando...");
        setDayCompleted(true);
        await markRoutineCompleted();
      }
    } catch (e) {
      console.log("error guardando progreso:", e);
      Alert.alert("error", "no se pudo guardar el progreso");
    }
  };

  const markRoutineCompleted = async () => {
    try {
      const data = {
        userId: user ? user.uid : "guest",
        routineId: routine.id,
        routineName: routine.name || "rutina",
        CaloriasTotales: routine.CaloriasTotales || 0,
        duration: routine.duration || 0,
        level: routine.level || "desconocido",
        completedAt: new Date(),
        status: "completed",
      };

      if (isOffline || !user) {
        console.log("guardando rutina completada localmente...");
        const key = `offlineProgress_${routine.id}_${user ? user.uid : "guest"}_summary`;
        await AsyncStorage.setItem(key, JSON.stringify(data));
      } else {
        console.log("guardando rutina completada en firebase...");
        await addDoc(collection(db, "progress"), data);
      }
    } catch (e) {
      console.log("error al guardar rutina completa:", e);
    }
  };

  const restartDay = async () => {
    try {
      console.log("reiniciando rutina pa empezar de cero...");
      setCompletedExercises([]);
      setDayCompleted(false);
      setLockedCompleted(false);
      await AsyncStorage.removeItem(`offlineProgress_${routine.id}_${user ? user.uid : "guest"}`);
      await AsyncStorage.removeItem(`offlineProgress_${routine.id}_${user ? user.uid : "guest"}_summary`);
    } catch (e) {
      console.log("error reiniciando progreso:", e);
    }
  };

  const keepCompleted = () => setLockedCompleted(true);

  const total = routine.exercises.length;
  const completed = completedExercises.length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  if (loading || authLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>cargando rutina...</Text>
      </View>
    );
  }

  const renderExerciseItem = ({ item }) => {
    const isCompleted = completedExercises.includes(item.id);
    return (
      <View style={styles.exerciseBox}>
        <Text style={[styles.text, isCompleted && styles.textGreen]}>{item.name}</Text>
        <Text style={styles.textSmall}>{item.description}</Text>
        <Text style={styles.textSmall}>
          {item.sets} series x {item.reps} repeticiones
        </Text>

        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        )}
        {item.videoUrl && (
          <WebView
            style={styles.video}
            source={{ uri: item.videoUrl.replace("watch?v=", "embed/") }}
          />
        )}

        <TouchableOpacity
          style={[styles.button, isCompleted && styles.buttonGray]}
          onPress={() => markExerciseCompleted(item.id)}
          disabled={isCompleted}
        >
          <Text style={styles.buttonText}>
            {isCompleted ? "completado" : "marcar"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routine.name}</Text>
      <Text style={styles.textSmall}>duracion: {routine.duration} min</Text>
      <Text style={styles.textSmall}>nivel: {routine.level}</Text>
      <Text style={styles.textSmall}>
        calorias: {routine.CaloriasTotales || "N/A"} kcal
      </Text>
      <Text style={styles.textSmall}>
        progreso: {completed}/{total} ({Math.round(progressPercent)}%)
      </Text>

      {dayCompleted ? (
        <View style={styles.center}>
          <Text style={styles.textGreen}>rutina completada</Text>
          {!lockedCompleted ? (
            <>
              <TouchableOpacity style={styles.buttonOrange} onPress={restartDay}>
                <Text style={styles.buttonText}>reiniciar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGreen} onPress={keepCompleted}>
                <Text style={styles.buttonText}>guardar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.textSmall}>guardada como completada</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={routine.exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

// att brahian: se dejo asi pa que los colores combinaran con los demas screens
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  title: { color: "#fff", fontSize: 20, marginBottom: 8 },
  text: { color: "#fff" },
  textSmall: { color: "#ccc", fontSize: 13, marginBottom: 4 },
  textGreen: { color: "#4CAF50" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  exerciseBox: { marginBottom: 12 },
  image: { width: "100%", height: 180, marginVertical: 8 },
  video: { width: "100%", height: 180, marginVertical: 8 },
  button: { backgroundColor: "#FF6B00", padding: 10, marginTop: 6, alignItems: "center" },
  buttonGray: { backgroundColor: "#444" },
  buttonOrange: { backgroundColor: "#FF6B00", padding: 10, marginTop: 10 },
  buttonGreen: { backgroundColor: "#34C759", padding: 10, marginTop: 10 },
  buttonText: { color: "#fff" },
});

export default RoutineDetailScreen;
