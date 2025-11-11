import React, { useState, useEffect } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,ScrollView,Modal,FlatList,Image,Alert,ActivityIndicator,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore,collection,query,where,getDocs,doc,getDoc,setDoc,serverTimestamp,} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const firestore = getFirestore(app);
const auth = getAuth(app);

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PlanSemanalScreen = () => {
  const [usuario, setUsuario] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [plan, setPlan] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuarioActual = auth.currentUser;
        if (!usuarioActual) {
          Alert.alert('Error', 'No hay usuario autenticado.');
          setCargando(false);
          return;
        }
        setUsuario(usuarioActual);

        //cargar recetas de firestore por usuario
        const recetasQuery = query(
          collection(firestore, 'recetas'),
          where('usuario', '==', usuarioActual.email)
        );
        const recetasSnapshot = await getDocs(recetasQuery);
        const recetasUsuario = recetasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRecetas(recetasUsuario);

        //cargar el plan por usuario
        const planDocRef = doc(firestore, 'plan_semanal', usuarioActual.email);
        const planSnap = await getDoc(planDocRef);

        if (planSnap.exists()) {
          const data = planSnap.data();
          setPlan(data.plan || {});
          await AsyncStorage.setItem(`plan_${usuarioActual.email}`, JSON.stringify(data.plan || {}));
        } else {
          // si no se conecta a firestore cargar desde async storage
          const planLocal = await AsyncStorage.getItem(`plan_${usuarioActual.email}`);
          if (planLocal) setPlan(JSON.parse(planLocal));
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        Alert.alert('Error', 'No se pudo cargar los datos. Revisa tu conexión.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const abrirSelector = (dia) => {
    setDiaSeleccionado(dia);
    setModalVisible(true);
  };

  const seleccionarReceta = (receta) => {
    setPlan((prev) => ({
      ...prev,
      [diaSeleccionado]: receta,
    }));
    setModalVisible(false);
  };

  const guardarPlan = async () => {
    if (!usuario) return;

    setGuardando(true);
    try {
      await AsyncStorage.setItem(`plan_${usuario.email}`, JSON.stringify(plan));
      await setDoc(doc(firestore, 'plan_semanal', usuario.email), {
        usuario: usuario.email,
        plan,
        fecha: serverTimestamp(),
      });
      Alert.alert('✅ Éxito', 'Plan semanal guardado correctamente');
    } catch (error) {
      console.error('Error guardando plan:', error);
      Alert.alert('Error', 'No se pudo guardar el plan');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, marginBottom: 100 }}>
        <Text style={styles.titulo}>🍽️ Plan Semanal</Text>

        {DIAS_SEMANA.map((dia) => (
          <TouchableOpacity key={dia} style={styles.card} onPress={() => abrirSelector(dia)}>
            <Text style={styles.dia}>{dia}</Text>
            {plan[dia] ? (
              <View style={styles.recetaInfo}>
                <Image source={{ uri: plan[dia].imagen }} style={styles.imagen} />
                <Text style={styles.nombreReceta}>{plan[dia].nombre}</Text>
              </View>
            ) : (
              <Text style={styles.placeholder}>Toca para seleccionar una receta</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarPlan} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>💾 Guardar Plan</Text>}
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>Selecciona una receta para {diaSeleccionado}</Text>
          <FlatList
            data={recetas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemReceta} onPress={() => seleccionarReceta(item)}>
                <Image source={{ uri: item.imagen }} style={styles.imagenLista} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.categoria}>{item.categoria}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.cerrarModal} onPress={() => setModalVisible(false)}>
            <Text style={styles.textoCerrar}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#22c55e' },
  card: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 16, marginBottom: 10 },
  dia: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  recetaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  imagen: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  nombreReceta: { fontSize: 16, color: '#333', flexShrink: 1 },
  placeholder: { color: '#888', marginTop: 8 },
  botonGuardar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  textoBoton: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  itemReceta: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8, backgroundColor: '#f9fafb', borderRadius: 8 },
  imagenLista: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  categoria: { fontSize: 14, color: '#22c55e' },
  cerrarModal: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  textoCerrar: { color: '#fff', fontSize: 16 },
});

export default PlanSemanalScreen;
