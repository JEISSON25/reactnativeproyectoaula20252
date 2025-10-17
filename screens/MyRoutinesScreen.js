import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useOffline } from "../context/OfflineContext"; // Importar contexto offline
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";

const MyRoutinesScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  const { isAppOnline, isForcedOffline, setIsSyncing } = useOffline(); // Usar el contexto offline
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        let allRoutines = [];
        // Cargar rutinas de Firebase si está online y hay usuario
        if (user && isAppOnline) {
          const q = query(
            collection(db, "customRoutines"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const firebaseRoutines = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          allRoutines = [...firebaseRoutines];
        }

        // Cargar rutinas de AsyncStorage
        const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
        const localRoutines = storedRoutines ? JSON.parse(storedRoutines) : [];
        
        // Combinar y eliminar duplicados (si los hay)
        // Las rutinas de Firebase tienen prioridad sobre las locales
        const combinedRoutines = [...allRoutines, ...localRoutines.filter(local => !allRoutines.find(fb => fb.id === local.id))];
        setRoutines(combinedRoutines);

      } catch (error) {
        console.error("Error obteniendo rutinas:", error);
      }
    };

    if (!loading) {
      fetchRoutines();
      // Sincronizar si está online y logueado
      if (isAppOnline && user) {
        syncOfflineRoutines();
      }
    }
  }, [user, loading, isAppOnline]); // Dependencia de isAppOnline en lugar de isOffline
  
  // Función de sincronización
  const syncOfflineRoutines = async () => {
    if (!user || !isAppOnline) return;
    
    setIsSyncing(true);
    try {
      const storedRoutines = await AsyncStorage.getItem("offlineRoutines");
      const offlineRoutines = storedRoutines ? JSON.parse(storedRoutines) : [];

      if (offlineRoutines.length > 0) {
        for (const routine of offlineRoutines) {
          // Sincronizar solo las rutinas que no tienen ID de Firebase (es decir, creadas offline)
          // O las que tienen isOffline: true (aunque en CreateRoutineScreen ya se maneja)
          if (routine.isOffline || !routine.userId) { 
            await addDoc(collection(db, "customRoutines"), {
              ...routine,
              userId: user.uid,
              isOffline: false,
            });
          }
        }
        // Limpiar el almacenamiento local después de la sincronización exitosa
        await AsyncStorage.removeItem("offlineRoutines");
        fetchRoutines(); // Volver a cargar las rutinas para reflejar los cambios
      }
    } catch (error) {
      console.error("Error sincronizando rutinas:", error);
    } finally {
      setIsSyncing(false);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Rutinas</Text>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("RoutineDetail", { routine: item })
            }
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.text}>{`Nivel: ${item.level}`}</Text>
            <Text style={styles.text}>{`Duración: ${item.duration} min`}</Text>
            <Text style={styles.text}>{`Ejercicios: ${item.exercises.length}`}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default MyRoutinesScreen;

// Estilos con Paleta Naranja & Negro
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212", // negro de fondo
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFA500", // naranja fuerte
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E1E1E", // gris oscuro para contraste
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#FFA500", // naranja
  },
  text: {
    fontSize: 14,
    color: "#E0E0E0", // gris claro
    marginBottom: 2,
  },
});
