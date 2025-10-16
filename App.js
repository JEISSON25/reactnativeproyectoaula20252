import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./contexts/MyAuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import AppNavigator from "./navigation/AppNavigator";


export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [forceOffline, setForceOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!forceOffline) {
        setIsOnline(state.isConnected);
      }
    });
    return () => unsubscribe();
  }, [forceOffline]);

  const toggleOffline = () => {
    setForceOffline(!forceOffline);
    setIsOnline(!forceOffline);
  };

  return (
    <AuthProvider>
      <ProductsProvider>
        <NavigationContainer>

          <View style={{ flex: 1 }}>
            {!isOnline && (
              <View style={{ backgroundColor: "red", padding: 10 }}>
                <Text style={{ color: "white", textAlign: "center" }}>
                  ⚠️ Modo Offline — Los cambios se sincronizarán cuando estés en línea
                </Text>
              </View>
            )}
            <Button
              title={forceOffline ? "Volver a modo Online" : "Forzar modo Offline"}
              onPress={toggleOffline}
            />
            <AppNavigator />
          </View>

        </NavigationContainer>
      </ProductsProvider>
    </AuthProvider>
  );
}
