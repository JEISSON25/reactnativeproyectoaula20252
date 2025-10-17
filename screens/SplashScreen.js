import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function Splash() {
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // tamaño inicial
  const opacityAnim = useRef(new Animated.Value(0)).current; // opacidad inicial

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1, // escala normal
        friction: 1,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, // completamente visible
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/LOGO-SPLASH.png")}
        style={[
          styles.logo,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", // negro principal
  },
  logo: {
    width: 550,
    height: 550,
    resizeMode: "contain",
    marginBottom: 20,
     // aplica un color naranja al logo si es PNG transparente
  },
});
