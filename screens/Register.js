import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      Alert.alert('Registro exitoso', 'Tu cuenta fue creada correctamente', [
        { text: 'Continuar', onPress: () => navigation.navigate('Login') },
      ]);

      setMensaje('Usuario registrado correctamente');
    } catch (error) {
      setMensaje('Usuario en uso o datos inválidos');
    }
  };

  const inicioSes = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Únete a CookApp 🍳</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#a69f94"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#a69f94"
      />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.buttonOutline]} onPress={inicioSes}>
        <Text style={[styles.buttonText, styles.buttonOutlineText]}>Ir a inicio de sesión</Text>
      </Pressable>

      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#d35400',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fffaf0',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f5d6b5',
    marginVertical: 10,
    fontSize: 16,
    shadowColor: '#d9cbb7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    width: '100%',
    backgroundColor: '#f39c12', 
    paddingVertical: 15,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#f1c40f',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fffef9',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: '#fffaf0',
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  buttonOutlineText: {
    color: '#f39c12',
  },
  mensaje: {
    marginTop: 20,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default Register;
