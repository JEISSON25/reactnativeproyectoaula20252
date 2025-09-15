import React from 'react';
import { View, Text, button } from 'react-native';

const DetailsScreen = () => {
     return (
         <View style={{ flex: 1, justifyContent: 'center', alignItems:'center' }}>
             <Text> Pantalla de Detalles</Text>
             <Button title="Ir a Detalles" onPress={() =>
navigation.navigate('Details')} />
         </View>
     );
};
export default DetailsScreen;