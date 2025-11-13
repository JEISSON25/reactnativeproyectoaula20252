import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useOffline } from "../context/OfflineContext";
import { db } from "../firebaseConfig";


// hecho por camilo pa listar las rutinas del usuario
const MyRoutinesScreen = ({ navigation }) => {

  const { user, loading } = useAuth();
  const { isAppOnline, setIsSyncing } = useOffline();

  const [routines, setRoutines] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!loading) {
      fetchRoutines();

      // si esta online sincroniza las locales
      if (isAppOnline && user) syncOfflineRoutines();
    }
  }, [user, loading, isAppOnline]);



  const fetchRoutines = async () => {
    try {
      let firebaseRoutines = [];
      let offlineRoutines = [];

      if (user && isAppOnline) {
        const q = query(collection(db, "customRoutines"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        firebaseRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      const stored = await AsyncStorage.getItem("offlineRoutines");
      offlineRoutines = stored ? JSON.parse(stored) : [];

      // combinar las rutinas sin repetir
      const combined = [
        ...firebaseRoutines,
        ...offlineRoutines.filter((local) => !firebaseRoutines.some((fb) => fb.id === local.id)),
      ];

      setRoutines(combined);
      console.log("rutinas cargadas:", combined.length);

    } catch (err) {
      console.log("error cargando rutinas:", err);
    }
  };



  // sincroniza las rutinas locales al volver online
  // att brahian: esto aveces se cuelga si hay muchas rutinas pendientes
  const syncOfflineRoutines = async () => {
    if (!user || !isAppOnline) return;

    if (typeof setIsSyncing === "function") setIsSyncing(true);
    setSyncing(true);

    try {
      const stored = await AsyncStorage.getItem("offlineRoutines");
      const offlineRoutines = stored ? JSON.parse(stored) : [];

      if (offlineRoutines.length > 0) {
        console.log("subiendo rutinas pendientes:", offlineRoutines.length);

        for (const routine of offlineRoutines) {
          if (routine.isOffline || !routine.userId) {
            await addDoc(collection(db, "customRoutines"), {
              ...routine,
              userId: user.uid,
              isOffline: false,
            });
          }
        }

        await AsyncStorage.removeItem("offlineRoutines");
        fetchRoutines();
        console.log("rutinas sincronizadas ok");
      }

    } catch (error) {
      console.log("error sincronizando rutinas:", error);
    } finally {
      if (typeof setIsSyncing === "function") setIsSyncing(false);
      setSyncing(false);
    }
  };



  const renderRoutine = ({ item }) => {
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
        <Text style={styles.textSmall}>{item.level || "sin nivel"}</Text>
        <Text style={styles.textSmall}>duracion: {item.duration} min</Text>
        <Text style={styles.textSmall}>
          ejercicios: {item.exercises ? item.exercises.length : 0}
        </Text>
        <Text style={styles.textSmall}>calorias: {totalCalories} kcal</Text>
      </TouchableOpacity>
    );
  };



  if (loading || syncing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF6B00" />
        <Text style={styles.text}>
          {syncing ? "sincronizando rutinas..." : "cargando rutinas..."}
        </Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Text style={styles.title}>mis rutinas</Text>

      {routines.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.textSmall}>no tienes rutinas guardadas</Text>

          <TouchableOpacity
            style={styles.buttonGreen}
            onPress={() => navigation.navigate("CreateRoutine")}
          >
            <Text style={styles.buttonText}>crear nueva rutina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={renderRoutine}
        />
      )}
    </View>
  );
};



// att camilo: si esto no muestra nada revisa los datos locales del asyncstorage
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#121212", padding: 10 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { color: "#FF6B00", fontSize: 20, textAlign: "center", marginBottom: 10 },

  item: { backgroundColor: "#1a1a1a", padding: 10, marginVertical: 6 },

  name: { color: "#FF6B00", fontSize: 16, marginBottom: 4 },

  text: { color: "#fff" },

  textSmall: { color: "#ccc", fontSize: 13, marginBottom: 2 },

  buttonGreen: { backgroundColor: "#34C759", padding: 10, marginTop: 10, alignItems: "center" },

  buttonText: { color: "#fff" },

});

export default MyRoutinesScreen;
