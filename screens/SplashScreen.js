import { Image, StyleSheet, View } from "react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/LOGO-SPLASH.png")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  logo: {
    width: 550,
    height: 550,
    resizeMode: "contain",
  },
});
