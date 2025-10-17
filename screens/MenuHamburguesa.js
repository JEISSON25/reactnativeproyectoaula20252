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

  // Cerrar menu automáticamente
  useFocusEffect(
    useCallback(() => {
      setOpen(false);
    }, [])
  );

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.hamburgerButton}
      >
        <Text style={styles.hamburgerIcon}>☰</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("MyRoutines")}
          >
            <Text style={styles.menuItemText}>Mis Rutinas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("Routines")}
          >
            <Text style={styles.menuItemText}>Ver Rutinas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("CreateRoutine")}
          >
            <Text style={styles.menuItemText}>Crear Rutina</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("Nutricion")}
          >
            <Text style={styles.menuItemText}>Nutrición</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("SaludBienestar")}
          >
            <Text style={styles.menuItemText}>Salud y Bienestar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo("Motivacion")}
          >
            <Text style={styles.menuItemText}>Motivación</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    marginRight: 10,
    position: "relative",
  },
  hamburgerButton: {
    backgroundColor: "#121212",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerIcon: {
    color: "#FF6B00",
    fontSize: 20,
    fontWeight: "bold",
  },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#121212",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 10,
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B00",
  },
  separator: {
    height: 1,
    backgroundColor: "#FF6B00",
    marginVertical: 8,
  },
});

export default MenuHamburguesa;
