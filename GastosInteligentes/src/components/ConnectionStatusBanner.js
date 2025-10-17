import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";

const ConnectionStatusBanner = () => {
  const netInfo = useNetInfo();
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState("");
  const [bgColor, setBgColor] = useState("#ff5555");

  useEffect(() => {
    if (netInfo.isConnected === false) {
      setMessage("No tienes conexión a Internet");
      setBgColor("#ff5555");
      setShowBanner(true);
    } else if (netInfo.isConnected === true) {
      setMessage("Conexión restablecida");
      setBgColor("#4CAF50");
      setShowBanner(true);

      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [netInfo.isConnected]);

  if (!showBanner) return null;

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    marginTop: 20,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ConnectionStatusBanner;
