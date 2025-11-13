import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useOffline } from '../OfflineContext';

export default function MedicalHistoryScreen({ route, navigation }) {
  const { pet } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const { currentUser } = useAuth();
  const { isOnline, addPendingAction, cacheData, getCachedData } = useOffline();

  useEffect(() => {
    if (!currentUser || !pet) return;

    loadMedicalRecords();
  }, [currentUser, pet]);

  const loadMedicalRecords = () => {
    const cacheKey = `medical_records_${pet.id}`;
    
    if (isOnline) {
      // SOLUCIÓN: Removemos orderBy de la query y ordenamos en el cliente
      const recordsQuery = query(
        collection(db, 'medicalRecords'),
        where('petId', '==', pet.id)
        // orderBy('date', 'desc') ← COMENTADO TEMPORALMENTE
      );

      const unsubscribe = onSnapshot(
        recordsQuery, 
        async (snapshot) => {
          let recordsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Ordenar por fecha en el cliente (descendente - más reciente primero)
          recordsData.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA; // Orden descendente
          });
          
          console.log('Registros médicos cargados:', recordsData.length);
          setRecords(recordsData);
          setLoading(false);
          await cacheData(cacheKey, recordsData);
        },
        (error) => {
          console.error('Error loading medical records:', error);
          setLoading(false);
          Alert.alert('Error', 'No se pudieron cargar los registros médicos');
        }
      );

      return unsubscribe;
    } else {
      getCachedData(cacheKey).then(cached => {
        if (cached) {
          // También ordenar datos del caché
          const sortedCached = [...cached].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA;
          });
          setRecords(sortedCached);
        }
        setLoading(false);
      });
    }
  };

  const handleDeleteRecord = async (recordId, isOffline) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro de eliminar este registro médico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (isOnline && !isOffline) {
              try {
                await deleteDoc(doc(db, 'medicalRecords', recordId));
                Alert.alert('Éxito', 'Registro eliminado');
              } catch (error) {
                console.error('Error deleting record:', error);
                Alert.alert('Error', 'No se pudo eliminar el registro');
              }
            } else {
              await addPendingAction({
                type: 'DELETE_MEDICAL_RECORD',
                id: recordId
              });

              const cacheKey = `medical_records_${pet.id}`;
              const updatedRecords = records.filter(r => r.id !== recordId);
              setRecords(updatedRecords);
              await cacheData(cacheKey, updatedRecords);

              Alert.alert('Modo Offline', 'La eliminación se sincronizará cuando haya conexión');
            }
          }
        }
      ]
    );
  };

  const viewRecordDetails = (record) => {
    console.log('Abriendo detalles del registro:', record.id);
    console.log('Adjuntos:', record.attachments);
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const handleImageError = (attachmentIndex) => {
    console.error('Error cargando imagen en índice:', attachmentIndex);
    setImageLoadErrors(prev => ({
      ...prev,
      [attachmentIndex]: true
    }));
  };

  const renderAttachmentImage = (attachment, index) => {
    if (!attachment || !attachment.url) {
      console.warn('Adjunto sin URL:', attachment);
      return (
        <View style={styles.attachmentError}>
          <Text style={styles.errorText}>URL no disponible</Text>
        </View>
      );
    }

    if (imageLoadErrors[index]) {
      return (
        <View style={styles.attachmentError}>
          <Text style={styles.errorText}>Error al cargar imagen</Text>
          <Text style={styles.errorSubText}>{attachment.name}</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: attachment.url }}
          style={styles.attachmentImage}
          resizeMode="cover"
          onError={() => handleImageError(index)}
          onLoadStart={() => console.log('Cargando imagen:', attachment.url)}
          onLoadEnd={() => console.log('Imagen cargada:', attachment.url)}
        />
        <ActivityIndicator
          style={styles.imageLoader}
          size="large"
          color="#007AFF"
        />
      </View>
    );
  };

  const renderRecord = ({ item }) => (
    <TouchableOpacity
      style={[styles.recordCard, item.offline && styles.offlineCard]}
      onPress={() => viewRecordDetails(item)}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleContainer}>
          <Text style={styles.recordType}>{item.type || 'Consulta General'}</Text>
          {item.offline && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>Sin conexión</Text>
            </View>
          )}
        </View>
        <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
      </View>

      {item.specialistName && (
        <Text style={styles.specialist}>👨‍⚕️ {item.specialistName}</Text>
      )}

      <Text style={styles.diagnosis} numberOfLines={2}>
        Diagnóstico: {item.diagnosis || 'No especificado'}
      </Text>

      {item.attachments && item.attachments.length > 0 && (
        <View style={styles.attachmentIndicator}>
          <Text style={styles.attachmentText}>
            📎 {item.attachments.length} archivo(s) adjunto(s)
          </Text>
        </View>
      )}

      <View style={styles.recordActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => viewRecordDetails(item)}
        >
          <Text style={styles.viewButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecord(item.id, item.offline)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
        <Text style={styles.loadingText}>Cargando historial médico...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineWarningText}>🔵 Modo sin conexión</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.petInfo}>
          {pet.photoURL ? (
            <Image 
              source={{ uri: pet.photoURL }} 
              style={styles.petImage}
              onError={(e) => console.error('❌ Error cargando foto de mascota:', e.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.petImage, styles.petImagePlaceholder]}>
              <Text style={styles.petImagePlaceholderText}>🐾</Text>
            </View>
          )}
          <View>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petDetails}>{pet.species} - {pet.breed}</Text>
          </View>
        </View>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin historial médico</Text>
          <Text style={styles.emptySubText}>
            ¡Registra la primera consulta de {pet.name}!
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddMedicalRecord', { pet })}
      >
        <Text style={styles.addButtonText}>+ Registrar Consulta</Text>
      </TouchableOpacity>

      {/* Modal de Detalles */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setImageLoadErrors({});
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Detalles del Registro</Text>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Tipo de Consulta:</Text>
                <Text style={styles.detailValue}>
                  {selectedRecord?.type || 'Consulta General'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(selectedRecord?.date)}
                </Text>
              </View>

              {selectedRecord?.specialistName && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Especialista:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRecord.specialistName}
                  </Text>
                  <Text style={styles.detailSubValue}>
                    {selectedRecord.specialistSpecialty}
                  </Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Diagnóstico:</Text>
                <Text style={styles.detailValue}>
                  {selectedRecord?.diagnosis || 'No especificado'}
                </Text>
              </View>

              {selectedRecord?.treatment && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tratamiento:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.treatment}</Text>
                </View>
              )}

              {selectedRecord?.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notas Adicionales:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.notes}</Text>
                </View>
              )}

              {selectedRecord?.weight && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Peso:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.weight} kg</Text>
                </View>
              )}

              {selectedRecord?.temperature && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Temperatura:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.temperature} °C</Text>
                </View>
              )}

              {selectedRecord?.attachments && selectedRecord.attachments.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Archivos Adjuntos:</Text>
                  {selectedRecord.attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentItem}>
                      {attachment.type === 'image' ? (
                        renderAttachmentImage(attachment, index)
                      ) : (
                        <View style={styles.documentIcon}>
                          <Text style={styles.documentIconText}>📄</Text>
                          <Text style={styles.documentName}>{attachment.name || 'Documento'}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setImageLoadErrors({});
                }}
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
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  petImagePlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImagePlaceholderText: {
    fontSize: 24,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  petDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
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
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100,
  },
  recordCard: {
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
  recordHeader: {
    marginBottom: 10,
  },
  recordTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recordType: {
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
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  specialist: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  diagnosis: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  attachmentIndicator: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  attachmentText: {
    fontSize: 12,
    color: '#666',
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
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
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  detailSubValue: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 2,
  },
  attachmentItem: {
    marginTop: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  attachmentError: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorSubText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  documentIcon: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  documentIconText: {
    fontSize: 40,
    marginBottom: 5,
  },
  documentName: {
    fontSize: 14,
    color: '#333',
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