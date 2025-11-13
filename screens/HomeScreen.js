import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [realName, setRealName] = useState("Usuario");

  useEffect(() => {
    if (!user) return;

    const loadUserName = async () => {
      try {
        const cachedName = await AsyncStorage.getItem("cachedUserName");
        if (cachedName) setRealName(cachedName);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const name =
            data.realName ||
            data.username ||
            user.displayName ||
            user.email.split("@")[0];
          setRealName(name);
          await AsyncStorage.setItem("cachedUserName", name);
        } else {
          const fallback = user.displayName || user.email.split("@")[0];
          setRealName(fallback);
          await AsyncStorage.setItem("cachedUserName", fallback);
        }
      } catch (error) {
        console.error("Error obteniendo nombre:", error);
      }
    };

    loadUserName();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido, {realName}</Text>

      <TouchableOpacity
        style={[styles.button, styles.orange]}
        onPress={() => navigation.navigate("Routines")}
      >
        <Text style={styles.buttonText}>Ver Rutinas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.green]}
        onPress={() => navigation.navigate("CreateRoutine")}
      >
        <Text style={styles.buttonText}>Crear Rutina</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  welcome: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  orange: {
    backgroundColor: "#FF6B00",
  },
  green: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#fff",
  },
});

export default HomeScreen;
