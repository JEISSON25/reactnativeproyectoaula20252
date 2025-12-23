import React from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function HeaderApp({ title = "Inventario" }) {
  const { online, setUserOnlineMode, user, cerrarSesion } = useAppContext();

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f5d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.left}>
        <Ionicons name="cube-outline" size={28} color="#fff" />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.statusText}>
          {online ? "Online" : "Offline"}
        </Text>

        <Switch
          value={online}
          onValueChange={(v) => setUserOnlineMode(v)}
          thumbColor={online ? "#4cd964" : "#ff3b30"}
        />

        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
            <Ionicons name="exit-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingHorizontal: 15,
    paddingTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 6,
    borderRadius: 8,
  },
});
