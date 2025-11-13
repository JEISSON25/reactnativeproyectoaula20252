import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

const MenuHamburguesa = () => {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
    setOpen(false);
  };

  useFocusEffect(
    useCallback(() => {
      setOpen(false);
    }, [])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.button}>
        <Text style={styles.icon}>≡</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("MyRoutines")}>
            <Text style={styles.text}>Mis Rutinas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("Routines")}>
            <Text style={styles.text}>Ver Rutinas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("Grafics")}>
            <Text style={styles.text}>Ver Progreso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigateTo("CreateRoutine")}>
            <Text style={styles.text}>Crear Rutina</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <Text style={[styles.text, styles.logout]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "relative" },
  button: {
    backgroundColor: "#121212",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { color: "#FF6B00", fontSize: 20 },
  menu: {
    position: "absolute",
    top: 38,
    right: 0,
    backgroundColor: "#121212",
    padding: 6,
    width: 160,
  },
  item: { paddingVertical: 8, alignItems: "center" },
  text: { color: "#FF6B00", fontSize: 14 },
  logout: { color: "#FF3B30" },
});

export default MenuHamburguesa;
