import React from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./contexts/MyAuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ProductsProvider>
    </AuthProvider>
  );
}