import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useOffline } from '../OfflineContext';

export default function SpecialistsScreen() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { isOnline, cacheData, getCachedData } = useOffline();

  useEffect(() => {
    loadSpecialists();
  }, []);

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
        setLoading(false);
      } catch (error) {
        console.error('Error loading specialists:', error);
        setLoading(false);
      }
    } else {
      const cached = await getCachedData('specialists');
      if (cached) {
        setSpecialists(cached);
      }
      setLoading(false);
    }
  };

  const loadAvailability = async (specialistId) => {
    if (isOnline) {
      try {
        const availabilityQuery = query(
          collection(db, 'appointments'),
          where('specialistId', '==', specialistId)
        );
        const snapshot = await getDocs(availabilityQuery);
        const bookedSlots = snapshot.docs.map(doc => ({
          date: doc.data().date,
          time: doc.data().time
        }));
        setAvailability(bookedSlots);
      } catch (error) {
        console.error('Error loading availability:', error);
      }
    }
  };

  const handleViewAvailability = async (specialist) => {
    setSelectedSpecialist(specialist);
    await loadAvailability(specialist.id);
    setModalVisible(true);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const isSlotAvailable = (date, time) => {
    return !availability.some(slot => slot.date === date && slot.time === time);
  };

  const getNextDays = (numDays = 7) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < numDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      days.push(formattedDate);
    }
    return days;
  };

  const renderSpecialist = ({ item }) => (
    <View style={styles.specialistCard}>
      <View style={styles.specialistInfo}>
        <Text style={styles.specialistName}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        {item.experience && (
          <Text style={styles.experience}>Experiencia: {item.experience} años</Text>
        )}
        {item.rating && (
          <Text style={styles.rating}>⭐ {item.rating}/5.0</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => handleViewAvailability(item)}
      >
        <Text style={styles.viewButtonText}>Ver Disponibilidad</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando especialistas...</Text>
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
        <Text style={styles.title}>Especialistas Veterinarios</Text>
      </View>

      {specialists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay especialistas disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={specialists}
          renderItem={renderSpecialist}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal de Disponibilidad */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {selectedSpecialist?.name}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedSpecialist?.specialty}
              </Text>

              <Text style={styles.sectionTitle}>Disponibilidad próximos 7 días</Text>

              {getNextDays().map(date => (
                <View key={date} style={styles.dateSection}>
                  <Text style={styles.dateTitle}>📅 {date}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.timeSlotsContainer}>
                      {generateTimeSlots().map(time => {
                        const available = isSlotAvailable(date, time);
                        return (
                          <View
                            key={`${date}-${time}`}
                            style={[
                              styles.timeSlot,
                              available ? styles.availableSlot : styles.unavailableSlot
                            ]}
                          >
                            <Text style={[
                              styles.timeText,
                              !available && styles.unavailableText
                            ]}>
                              {time}
                            </Text>
                            <Text style={[
                              styles.statusText,
                              !available && styles.unavailableText
                            ]}>
                              {available ? '✓ Disponible' : '✗ Ocupado'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ))}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  specialistCard: {
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
  specialistInfo: {
    marginBottom: 15,
  },
  specialistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  specialty: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 5,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  rating: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  unavailableSlot: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#666',
  },
  unavailableText: {
    color: '#999',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});