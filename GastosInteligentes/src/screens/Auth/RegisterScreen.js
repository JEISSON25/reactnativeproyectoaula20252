import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if(!email || !password){
        Alert.alert("Error", "Por favor ingrese email y contraseña")
        return;
    }
    setLoading(true);
    try {
      const user = await register(email, password);
      console.log('Usuario registrado:', user.email);
      Alert.alert('Éxito', 'Usuario registrado correctamente');
    } catch (error) {
      console.log('Error:', error.message);
      Alert.alert('Error', error.message);   
    }finally{
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Registrarse</Text>

        <TextInput
            style={styles.input}
            placeholder='Email'
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
        />
        <TextInput
            style={styles.input}
            placeholder='Contraseña'
            secureTextEntry
            onChangeText={setPassword}
            value={password}
        />
        <Button 
            style={styles.Button}
            title={loading ? "Cargando" : "Registrarse" }
            disabled = {loading}
            onPress={handleSignUp} 
        />

        <View style={styles.footer}>
            <Text>¿Ya tienes cuenta? </Text>
            <Text
                style={styles.link}
                onPress={() => navigation.goBack()}
                >
                Iniciar Sesión
            </Text>
        </View>

    </View>

    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  link: {
    color: '#0A84FF',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;