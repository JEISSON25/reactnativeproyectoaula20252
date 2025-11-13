import React, { useState, useEffect } from 'react'; /////S
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useOffline } from '../OfflineContext';

export default function AppointmentScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { currentUser } = useAuth();
  const { isOnline, addPendingAction, cacheData, getCachedData } = useOffline();

  useEffect(() => {
    if (!currentUser) return;

    loadSpecialists();
    loadUserPets();
    loadAppointments();
  }, [currentUser]);

  const loadSpecialists = async () => {
    if (isOnline) {
      try {
        const specialistsQuery = query(collection(db, 'specialists'));
        const snapshot = await getDocs(specialistsQuery);
        const specialistsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSpecialists(specialistsData);
        await cacheData('specialists', specialistsData);
      } catch (error) {
        console.error('Error loading specialists:', error);
      }
    } else {
      const cached = await getCachedData('specialists');
      if (cached) setSpecialists(cached);
    }
  };

  const loadUserPets = async () => {
    if (isOnline) {
      try {
        const petsQuery = query(
          collection(db, 'pets'),
          where('userId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(petsQuery);
        const petsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPets(petsData);
        await cacheData('userPets', petsData);
      } catch (error) {
        console.error('Error loading pets:', error);
      }
    } else {
      const cached = await getCachedData('userPets');
      if (cached) setPets(cached);
    }
  };

  const loadAppointments = () => {
    if (isOnline) {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(appointmentsQuery, async (snapshot) => {
        const appointmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(appointmentsData);
        setLoading(false);
        await cacheData('appointments', appointmentsData);
      });

      return unsubscribe;
    } else {
      getCachedData('appointments').then(cached => {
        if (cached) {
          setAppointments(cached);
        }
        setLoading(false);
      });
    }
  };

  // Generar próximos 30 días
  const getNextDays = (numDays = 30) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
      days.push({
        formatted: `${day}/${month}/${year}`,
        display: `${dayName} ${day}/${month}`,
        date: date
      });
    }
    return days;
  };

  // Generar horarios (8:00 AM - 6:00 PM)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleCreateAppointment = async () => {
    console.log('Validando campos...', {
      specialist: selectedSpecialist?.name,
      pet: selectedPet?.name,
      date: selectedDate,
      time: selectedTime,
      reason: reason
    });

    if (!selectedSpecialist) {
      Alert.alert('Error', 'Por favor selecciona un especialista');
      return;
    }
    if (!selectedPet) {
      Alert.alert('Error', 'Por favor selecciona una mascota');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Por favor selecciona una hora');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Error', 'Por favor describe el motivo de la consulta');
      return;
    }

    const appointmentData = {
      userId: currentUser.uid,
      specialistId: selectedSpecialist.id,
      specialistName: selectedSpecialist.name,
      specialistSpecialty: selectedSpecialist.specialty,
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: selectedDate,
      time: selectedTime,
      reason: reason,
      status: 'pending',
      createdAt: Timestamp.now()
    };

    if (isOnline) {
      try {
        await addDoc(collection(db, 'appointments'), appointmentData);
        Alert.alert('Éxito', 'Cita agendada correctamente');
        resetForm();
      } catch (error) {
        console.error('Error creating appointment:', error);
        Alert.alert('Error', 'No se pudo crear la cita: ' + error.message);
      }
    } else {
      await addPendingAction({
        type: 'ADD_APPOINTMENT',
        data: appointmentData
      });
      
      const newAppointment = {
        ...appointmentData,
        id: `temp_${Date.now()}`,
        offline: true
      };
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      await cacheData('appointments', updatedAppointments);
      
      Alert.alert('Modo Offline', 'La cita se sincronizará cuando haya conexión');
      resetForm();
    }
  };

  const handleCancelAppointment = async (appointmentId, isOffline) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            if (isOnline && !isOffline) {
              try {
                await deleteDoc(doc(db, 'appointments', appointmentId));
                Alert.alert('Éxito', 'Cita cancelada');
              } catch (error) {
                console.error('Error canceling appointment:', error);
                Alert.alert('Error', 'No se pudo cancelar la cita');
              }
            } else {
              await addPendingAction({
                type: 'DELETE_APPOINTMENT',
                id: appointmentId
              });
              
              const updatedAppointments = appointments.filter(a => a.id !== appointmentId);
              setAppointments(updatedAppointments);
              await cacheData('appointments', updatedAppointments);
              
              Alert.alert('Modo Offline', 'La cancelación se sincronizará cuando haya conexión');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setModalVisible(false);
    setSelectedSpecialist(null);
    setSelectedPet(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const renderAppointment = ({ item }) => (
    <View style={[styles.appointmentCard, item.offline && styles.offlineCard]}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.specialistName}>{item.specialistName}</Text>
        {item.offline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>Sin conexión</Text>
          </View>
        )}
      </View>
      <Text style={styles.specialty}>{item.specialistSpecialty}</Text>
      <Text style={styles.petName}>Mascota: {item.petName}</Text>
      <Text style={styles.dateTime}>📅 {item.date} - ⏰ {item.time}</Text>
      <Text style={styles.reason}>Motivo: {item.reason}</Text>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelAppointment(item.id, item.offline)}
      >
        <Text style={styles.cancelButtonText}>Cancelar Cita</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando citas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineWarningText}>📵 Modo sin conexión</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Mis Citas</Text>
        <TouchableOpacity
          style={styles.specialistsButton}
          onPress={() => navigation.navigate('Specialists')}
        >
          <Text style={styles.specialistsButtonText}>Ver Especialistas</Text>
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes citas agendadas</Text>
          <Text style={styles.emptySubText}>¡Agenda tu primera cita!</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Agendar Cita</Text>
      </TouchableOpacity>

      {/* Modal para crear cita */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nueva Cita</Text>

              {/* Seleccionar Especialista */}
              <Text style={styles.label}>1. Selecciona un Especialista: *</Text>
              {specialists.length === 0 ? (
                <Text style={styles.warningText}>No hay especialistas disponibles</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {specialists.map(specialist => (
                    <TouchableOpacity
                      key={specialist.id}
                      style={[
                        styles.optionCard,
                        selectedSpecialist?.id === specialist.id && styles.selectedOption
                      ]}
                      onPress={() => setSelectedSpecialist(specialist)}
                    >
                      <Text style={[styles.optionName, selectedSpecialist?.id === specialist.id && styles.selectedText]}>
                        {specialist.name}
                      </Text>
                      <Text style={[styles.optionDetail, selectedSpecialist?.id === specialist.id && styles.selectedText]}>
                        {specialist.specialty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Seleccionar Mascota */}
              <Text style={styles.label}>2. Selecciona una Mascota: *</Text>
              {pets.length === 0 ? (
                <Text style={styles.warningText}>No tienes mascotas registradas</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {pets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.optionCard,
                        selectedPet?.id === pet.id && styles.selectedOption
                      ]}
                      onPress={() => setSelectedPet(pet)}
                    >
                      <Text style={[styles.optionName, selectedPet?.id === pet.id && styles.selectedText]}>
                        {pet.name}
                      </Text>
                      <Text style={[styles.optionDetail, selectedPet?.id === pet.id && styles.selectedText]}>
                        {pet.species}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Seleccionar Fecha */}
              <Text style={styles.label}>3. Selecciona una Fecha: *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <Text style={styles.dateTimeButtonText}>
                  {selectedDate || '📅 Toca para seleccionar fecha'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                  {getNextDays().map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateOption,
                        selectedDate === day.formatted && styles.selectedDateOption
                      ]}
                      onPress={() => {
                        setSelectedDate(day.formatted);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        selectedDate === day.formatted && styles.selectedDateText
                      ]}>
                        {day.display}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Seleccionar Hora */}
              <Text style={styles.label}>4. Selecciona una Hora: *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <Text style={styles.dateTimeButtonText}>
                  {selectedTime || '⏰ Toca para seleccionar hora'}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
                  {getTimeSlots().map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeOption,
                        selectedTime === time && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        setSelectedTime(time);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        selectedTime === time && styles.selectedTimeText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Motivo */}
              <Text style={styles.label}>5. Motivo de la consulta: *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe el motivo de la cita (mínimo 10 caracteres)"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelModalButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCreateAppointment}
                >
                  <Text style={styles.confirmButtonText}>Agendar Cita</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineWarning: {
    backgroundColor: '#FF9500',
    padding: 10,
    alignItems: 'center',
  },
  offlineWarningText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  specialistsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  specialistsButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offlineCard: {
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  specialistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  offlineBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offlineBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  specialty: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  petName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  optionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  optionDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  selectedText: {
    color: '#fff',
  },
  dateTimeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  pickerScroll: {
    marginBottom: 15,
  },
  dateOption: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateOption: {
    backgroundColor: '#34C759',
    borderColor: '#28A745',
  },
  dateOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeOption: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeOption: {
    backgroundColor: '#FF9500',
    borderColor: '#FF8800',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedTimeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelModalButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 8,
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});