import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContexto } from '../contextos/AuthContexto';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { iniciarSesion } = useContext(AuthContexto);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      iniciarSesion(userCredential.user);
    } catch (err) {
      setError('Correo o contraseña incorrecta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a CookApp 🍳</Text>

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

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  error: {
    marginTop: 15,
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
