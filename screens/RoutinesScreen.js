import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOffline } from "../context/OfflineContext";
import { db } from "../firebaseConfig";

const RoutinesScreen = ({ navigation }) => {
  const { isAppOnline } = useOffline();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, [isAppOnline]);

  const loadRoutines = async () => {
    setLoading(true);
    let firestoreRoutines = [];
    let offlineCustomRoutines = [];

    if (isAppOnline) {
      try {
        const routinesCollection = collection(db, "routines");
        const routinesSnapshot = await getDocs(routinesCollection);

        firestoreRoutines = routinesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          exercises: (doc.data().exercises || []).map((ex) => ({
            ...ex,
            CaloriasQuemadas: ex.CaloriasQuemadas ?? 0,
          })),
        }));
      } catch (error) {
        if (!error.message.includes("Missing or insufficient permissions")) {
          console.log("Error al cargar rutinas:", error.message);
        }
      }
    } else {
      try {
        const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
        offlineCustomRoutines = storedRoutines ? JSON.parse(storedRoutines) : [];
        Alert.alert("Modo Offline", "Cargando rutinas guardadas localmente.");
      } catch (error) {
        console.log("Error cargando rutinas offline:", error.message);
      }
    }

    const combined = [...firestoreRoutines, ...offlineCustomRoutines];
    const normalized = combined.map((r) => ({
      ...r,
      exercises: (r.exercises || []).map((ex) => ({
        ...ex,
        CaloriasQuemadas: ex.CaloriasQuemadas ?? 0,
      })),
    }));

    setRoutines(normalized);
    setLoading(false);
  };

  const renderRoutineItem = ({ item }) => {
    const totalCalories = (item.exercises || []).reduce(
      (sum, ex) => sum + (ex.CaloriasQuemadas || 0),
      0
    );

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("RoutineDetail", { routine: item })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.description}</Text>
        <Text style={styles.textSmall}>
          {item.duration} min | Nivel: {item.level}
        </Text>
        <Text style={styles.textSmall}>Calorías: {totalCalories} kcal</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Cargando rutinas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>

      {routines.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.text}>No hay rutinas disponibles</Text>
          <TouchableOpacity style={styles.button} onPress={loadRoutines}>
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  title: { color: "#fff", fontSize: 20, textAlign: "center", marginBottom: 15 },
  item: { marginBottom: 12, backgroundColor: "#1a1a1a", padding: 10 },
  name: { color: "#FF6B00", fontSize: 16, marginBottom: 4 },
  text: { color: "#ccc", fontSize: 13, marginBottom: 2 },
  textSmall: { color: "#999", fontSize: 12 },
  button: { backgroundColor: "#FF6B00", padding: 10, marginTop: 15, alignItems: "center" },
  buttonText: { color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 },
});

export default RoutinesScreen;
