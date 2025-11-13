import React from 'react';
import { View, Text, Button } from 'react-native';
const DetailsScreen = ({ navigation }) => {
 return (
 <View style={{ flex: 1, justifyContent: 'center', alignItems:
'center' }}>
 <Text> Pantalla de Detalles</Text>
  <Button title="Ir a 3 Pantalla" onPress={() =>
 navigation.navigate('Tree')}
  />
 </View>
 );
};
export default DetailsScreen;