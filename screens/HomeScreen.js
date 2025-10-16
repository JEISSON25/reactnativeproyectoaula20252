import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [realName, setRealName] = useState("");
  const [lastRoutine, setLastRoutine] = useState(null);

  // Obtener el nombre real desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setRealName(docSnap.data().realName);
      } catch (error) {
        console.error("Error obteniendo nombre:", error);
      }
    };
    fetchUserData();
  }, [user]);

  // Obtener la última rutina creada del usuario
  useEffect(() => {
    const fetchLastRoutine = async () => {
      if (!user) return;
      try {
        const routinesRef = collection(db, "routines");
        const q = query(
          routinesRef,
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        let latest = null;
        querySnapshot.forEach((doc) => {
          if (doc.data().userId === user.uid) {
            latest = doc.data();
          }
        });
        setLastRoutine(latest);
      } catch (error) {
        console.error("Error obteniendo última rutina:", error);
      }
    };
    fetchLastRoutine();
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Bienvenida */}
      <Text style={styles.welcome}>¡Bienvenido!</Text>
      {realName ? <Text style={styles.name}>{realName}</Text> : null}

      {/* Última rutina */}
      <View style={styles.lastRoutineContainer}>
        <Text style={styles.lastRoutineTitle}>Última Rutina</Text>
        {lastRoutine ? (
          <>
            <Text style={styles.lastRoutineName}>{lastRoutine.name}</Text>
            <Text style={styles.lastRoutineDate}>
              {new Date(lastRoutine.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          </>
        ) : (
          <Text style={styles.noRoutine}>No tienes rutinas recientes</Text>
        )}
      </View>

      {/* Botón de acceso rápido */}
      <TouchableOpacity
        style={styles.routineButton}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Routines")}
      >
        <Text style={styles.routineText}>Ver Rutinas</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  welcome: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    color: "#E5E5EA",
    marginBottom: 30,
  },
  lastRoutineContainer: {
    backgroundColor: "#1C1C1E",
    padding: 20,
    borderRadius: 14,
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lastRoutineTitle: {
    color: "#FF6B00",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  lastRoutineName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  lastRoutineDate: {
    color: "#E5E5EA",
    fontSize: 14,
    marginTop: 4,
  },
  noRoutine: {
    color: "#AAAAAA",
    fontSize: 14,
    fontStyle: "italic",
  },
  routineButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 18,
    borderRadius: 14,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  routineText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default HomeScreen;
