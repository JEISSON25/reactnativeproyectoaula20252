/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

const Stack = createStackNavigator();

export default function App() {
   return (
     <NavigationContainer>
       <Stack.Navigator>
       <Stack.Screen name="Home" component={HomeScreen} />
       <Stack.Screen name="Details" component={DetailsScreen} />
       </Stack.Navigator>
     </NavigationContainer>
 );
}
*/
/*
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function App() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 
 const handleSignUp = () => {
 createUserWithEmailAndPassword(auth, email, password)
 .then((userCredential) => {
 console.log('Usuario registrado:', userCredential.user);
 })
 .catch(error => console.log('Error:', error.message));
 };
 return (
 <View style={{ padding: 20 }}>
 <Text>Email:</Text>
 <TextInput onChangeText={setEmail} style={{ borderWidth: 1,
marginBottom: 10 }} />
 <Text>Contraseña:</Text>
 <TextInput secureTextEntry onChangeText={setPassword} style={{
borderWidth: 1, marginBottom: 10 }} />
 <Button title="Registrarse" onPress={handleSignUp} />
 </View>
 );
}
*/

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import NavegacionStack from './navegacion/NavegacionStack';
import AuthStack from './navegacion/AuthStack';
import { ProveedorAuth, AuthContexto } from './contextos/AuthContexto';
import { ProveedorFavoritos } from './contextos/FavoritosContexto';

const Rutas = () => {
  const { usuario } = useContext(AuthContexto);
  return usuario ? <NavegacionStack /> : <AuthStack />;
};

export default function App() {
  return (
    <ProveedorAuth>
      <ProveedorFavoritos>
        <NavigationContainer>
          <Rutas />
        </NavigationContainer>
      </ProveedorFavoritos>
    </ProveedorAuth>
  );
}
