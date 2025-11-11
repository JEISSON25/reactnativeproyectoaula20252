import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const firestore = getFirestore(app);
const auth = getAuth(app);

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PlanesCreadosScreen = ({ navigation }) => {
  const [usuario, setUsuario] = useState(null);
  const [planGuardado, setPlanGuardado] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
          Alert.alert('Error', 'No hay usuario autenticado.');
          setLoading(false);
          return;
        }
        setUsuario(usuarioActual);

        const q = query(collection(firestore, 'plan_semanal'), where('usuario', '==', usuarioActual.email));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          if (!snapshot.empty) {
            let ultimoPlan = null;
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (!ultimoPlan || data.fecha.toDate() > ultimoPlan.fecha?.toDate()) {
                ultimoPlan = data;
              }
            });
            if (ultimoPlan?.plan) {
              setPlanGuardado(ultimoPlan.plan);
              await AsyncStorage.setItem(`plan_${usuarioActual.email}`, JSON.stringify(ultimoPlan.plan));
            }
          } else {
            const planLocal = await AsyncStorage.getItem(`plan_${usuarioActual.email}`);
            if (planLocal) setPlanGuardado(JSON.parse(planLocal));
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error cargando planes:', error);
        Alert.alert('Error', 'No se pudo cargar el plan. Revisa tu conexión.');
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Tu Plan Semanal</Text>

      {DIAS_SEMANA.map((dia) => (
        <TouchableOpacity
          key={dia}
          style={styles.card}
          onPress={() => {
            if (planGuardado[dia]) {
              navigation.navigate('DetalleRecetaScreen', { receta: planGuardado[dia] });
            } else {
              Alert.alert('No hay receta', 'No hay receta seleccionada para este día.');
            }
          }}
        >
          <Text style={styles.dia}>{dia}</Text>
          {planGuardado[dia] ? (
            <View style={styles.recetaInfo}>
              <Image source={{ uri: planGuardado[dia].foto || planGuardado[dia].imagen }} style={styles.imagen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreReceta}>{planGuardado[dia].nombre}</Text>
                <Text style={styles.categoria}>{planGuardado[dia].categoria}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>No hay receta seleccionada</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff8f0', flex: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#22c55e' },
  card: {
    backgroundColor: '#fffaf0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#d9cbb7',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 2,
  },
  dia: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  recetaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  imagen: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  nombreReceta: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  categoria: { fontSize: 14, color: '#22c55e' },
  placeholder: { color: '#888', marginTop: 8 },
});

export default PlanesCreadosScreen;
