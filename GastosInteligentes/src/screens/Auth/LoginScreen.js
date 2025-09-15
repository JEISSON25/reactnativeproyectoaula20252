import React, {useState} from 'react'
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../context/AuthContext'

const  LoginScreen = ({navigation}) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if(!email || !password){
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }
        setLoading(true);
        try{
            const user = await login(email, password);
            console.log('Usuario logeado:', user.email);
        } catch(error) {
            Alert.alert('Error', error.message);
            console.log('Error Login:', error);
        } finally{
            setLoading(false);
        }
    };

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
        
            <TextInput
                style={styles.input}
                placeholder='Email'
                keyboardType='email-adress'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder='Contraseña'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button
                title={loading ? 'Cargando' : 'Ingresar'}
                onPress={handleLogin}
                disabled={loading}
            />

            <View style={styles.footer}>
                <Text>¿No tienes cuenta? </Text>
                <Text
                    style={styles.link}
                    onPress={() => navigation.navigate('Register')}
                    >
                    Regístrate
                </Text>
            </View>
        </View>
    )
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

export default LoginScreen;