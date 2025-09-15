import React from "react";
import { View, Text } from 'react-native';

const  DetailsScreen = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>Pantalla Detalles </Text>
      <Text style={{fontSize: 13,color: 'gray'}}>Cargando detalles de la aplicación.......</Text>
    </View>
  );
}

export default DetailsScreen;