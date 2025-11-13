import React from 'react';
import { View, Text, Button } from 'react-native';
const TreeScreen = ({ navigation }) => {
 return (
 <View style={{ flex: 1, justifyContent: 'center', alignItems:
'center' }}>
 <Text> Pantalla 3</Text>
   <Button title="Home" onPress={() =>
  navigation.navigate('Home')}
   />
 </View>
 );
};
export default TreeScreen;