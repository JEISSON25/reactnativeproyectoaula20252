import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      // Mensaje de confirmación y redirección al Login
      Alert.alert('Registro exitoso', 'Tu cuenta fue creada correctamente', [
        { text: 'Continuar', onPress: () => navigation.navigate('Login') },
      ]);

      setMensaje('✅ Usuario registrado correctamente');
    } catch (error) {
      setMensaje('❌ Usuario en uso o datos inválidos');
    }
  };

  const inicioSes = async () => {
      // redireccion a iniciar sesion
      Alert.alert('Redireccion', 'en un momento te llevaremos', [
        { text: 'Continuar', onPress: () => navigation.navigate('Login') },
      ]);


  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Registrate </Text>
      

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

      <Pressable
        onPress={handleRegister}
        style={{
          marginTop: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: 'blue',
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Registrar</Text>
      </Pressable>

      <Pressable
        onPress={inicioSes}
        style={{
          marginTop: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: 'blue',
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Ir a inicio de sesión</Text>
      </Pressable>

      {mensaje ? <Text style={{ marginTop: 20 }}>{mensaje}</Text> : null}
    </View>
  );
};

export default Register;
