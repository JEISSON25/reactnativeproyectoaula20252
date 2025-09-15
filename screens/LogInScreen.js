import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContexto } from '../contextos/AuthContexto';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { iniciarSesion } = useContext(AuthContexto);

  const handleLogin = async () => {
    try {
      const credenciales = await signInWithEmailAndPassword(auth, email, password);

      
      iniciarSesion(credenciales.user);

    } catch (error) {
      Alert.alert("Error", "❌ Usuario o contraseña incorrectos");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Iniciar sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          width: '80%',
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          width: '80%',
        }}
        secureTextEntry
      />

      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
