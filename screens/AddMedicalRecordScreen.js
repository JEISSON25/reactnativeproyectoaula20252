import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { collection, addDoc, getDocs, query, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useOffline } from '../OfflineContext';

export default function AddMedicalRecordScreen({ route, navigation }) {
  const { pet } = route.params;
  const [formData, setFormData] = useState({
    type: 'Consulta General',
    diagnosis: '',
    treatment: '',
    notes: '',
    weight: '',
    temperature: '',
    specialistId: '',
    specialistName: '',
    specialistSpecialty: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attachments, setAttachments] = useState([]);
  const [specialists, setEspecialistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { isOnline, addPendingAction, cacheData, getCachedData } = useOffline();

  const consultTypes = [
    'Consulta General',
    'Vacunación',
    'Cirugía',
    'Emergencia',
    'Control',
    'Laboratorio',
    'Radiografía',
    'Desparasitación',
    'Otro'
  ];

  useEffect(() => {
    cargarEspecialistas();
  }, []);

  const cargarEspecialistas = async () => {
    if (isOnline) {
      try {
        const specialistsQuery = query(collection(db, 'specialists'));
        const snapshot = await getDocs(specialistsQuery);
        const specialistsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEspecialistas(specialistsData);
        await cacheData('specialists', specialistsData);
      } catch (error) {
        console.error('Error carga especialista:', error);
      }
    } else {
      const cached = await getCachedData('specialists');
      if (cached) setEspecialistas(cached);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const seleccionarEspecialista = (specialist) => {
    setFormData(prev => ({
      ...prev,
      specialistId: specialist.id,
      specialistName: specialist.name,
      specialistSpecialty: specialist.specialty
    }));
  };

 
  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos Necesarios',
          'Necesitamos acceso a tu galería para seleccionar fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const selectImage = async () => {
    console.log('📸 Seleccionando imágenes para registro médico...');
    
    if (!isOnline) {
      Alert.alert(
        'Sin Conexión',
        'Las fotos solo se pueden adjuntar cuando hay conexión a internet.'
      );
      return;
    }

    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      console.log('Resultado de ImagePicker:', result);

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg'
        }));
        
        console.log('Imágenes seleccionadas:', newAttachments.length);
        setAttachments(prev => [...prev, ...newAttachments]);
      } else {
        console.log('Selección cancelada');
      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes: ' + error.message);
    }
  };

  const selectDocument = async () => {
    console.log('Seleccionando documentos...');
    
    if (!isOnline) {
      Alert.alert(
        'Sin Conexión',
        'Los documentos solo se pueden adjuntar cuando hay conexión a internet.'
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      console.log('Resultado de DocumentPicker:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment = {
          uri: asset.uri,
          name: asset.name,
          type: 'document',
          mimeType: asset.mimeType || 'application/pdf'
        };
        console.log('Documento seleccionado:', newAttachment.name);
        setAttachments(prev => [...prev, newAttachment]);
      } else {
        console.log('Selección de documento cancelada');
      }
    } catch (error) {
      console.error('Error al seleccionar documento:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento: ' + error.message);
    }
  };

  const removeAttachment = (index) => {
    console.log('Eliminando adjunto en índice:', index);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachment = async (attachment) => {
    console.log('⬆Subiendo adjunto:', attachment.name);
    const filename = `medical_records/${pet.id}/${Date.now()}_${attachment.name}`;
    const storageRef = ref(storage, filename);

    try {
      const response = await fetch(attachment.uri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Adjunto subido:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir adjunto:', error);
      throw error;
    }
  };

  const handleSaveRecord = async () => {
    const { diagnosis, treatment } = formData;

    if (!diagnosis.trim()) {
      Alert.alert('Error', 'Por favor ingresa un diagnóstico');
      return;
    }

    if (!treatment.trim()) {
      Alert.alert('Error', 'Por favor ingresa un tratamiento');
      return;
    }

    setLoading(true);

    try {
      let uploadedAttachments = [];

      // Subir archivos adjuntos solo si hay conexión
      if (isOnline && attachments.length > 0) {
        console.log('Subiendo', attachments.length, 'adjuntos...');
        try {
          uploadedAttachments = await Promise.all(
            attachments.map(async (attachment) => {
              const url = await uploadAttachment(attachment);
              return {
                url,
                name: attachment.name,
                type: attachment.type,
                mimeType: attachment.mimeType
              };
            })
          );
          console.log('Todos los adjuntos subidos exitosamente');
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          Alert.alert(
            'Advertencia',
            'Algunos archivos no se pudieron subir. ¿Deseas continuar sin ellos?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false) },
              { text: 'Continuar', onPress: () => saveRecordData([]) }
            ]
          );
          return;
        }
      }

      await saveRecordData(uploadedAttachments);

    } catch (error) {
      console.error('Error al guardar registro médico:', error);
      Alert.alert('Error', 'No se pudo guardar el registro médico: ' + error.message);
      setLoading(false);
    }
  };

  const saveRecordData = async (uploadedAttachments) => {
    const recordData = {
      petId: pet.id,
      petName: pet.name,
      userId: currentUser.uid,
      type: formData.type,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      notes: formData.notes,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      specialistId: formData.specialistId || null,
      specialistName: formData.specialistName || null,
      specialistSpecialty: formData.specialistSpecialty || null,
      date: Timestamp.fromDate(selectedDate),
      attachments: uploadedAttachments,
      createdAt: Timestamp.now()
    };

    if (isOnline) {
      try {
        console.log('Guardando registro médico en Firestore...');
        await addDoc(collection(db, 'medicalRecords'), recordData);
        console.log('Registro médico guardado exitosamente');
        Alert.alert('Éxito', 'Registro médico guardado correctamente', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        throw error;
      }
    } else {

      console.log('Guardando en modo offline...');
      await addPendingAction({
        type: 'ADD_MEDICAL_RECORD',
        data: recordData
      });


      const cacheKey = `medical_records_${pet.id}`;
      const cached = await getCachedData(cacheKey) || [];
      const newRecord = {
        ...recordData,
        id: `temp_${Date.now()}`,
        offline: true
      };
      const updatedRecords = [newRecord, ...cached];
      await cacheData(cacheKey, updatedRecords);

      Alert.alert(
        'Modo Offline',
        'El registro se sincronizará cuando haya conexión',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }

    setLoading(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineWarningText}>🔵 Modo sin conexión</Text>
          <Text style={styles.offlineWarningSubText}>
            Los archivos adjuntos se subirán al reconectarse
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Nuevo Registro Médico</Text>
        <Text style={styles.subtitle}>Para: {pet.name}</Text>

        {/* Tipo de Consulta */}
        <Text style={styles.label}>Tipo de Consulta: *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {consultTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.type === type && styles.selectedTypeButton
              ]}
              onPress={() => handleInputChange('type', type)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === type && styles.selectedTypeText
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fecha */}
        <Text style={styles.label}>Fecha: *</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>📅 {formatDate(selectedDate)}</Text>
          <TouchableOpacity
            style={styles.changeDateButton}
            onPress={() => {
              Alert.alert('Fecha', 'Por defecto se usa la fecha actual');
            }}
          >
            <Text style={styles.changeDateButtonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Especialista (Opcional) */}
        {specialists.length > 0 && (
          <>
            <Text style={styles.label}>Especialista (Opcional):</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {specialists.map((specialist) => (
                <TouchableOpacity
                  key={specialist.id}
                  style={[
                    styles.specialistCard,
                    formData.specialistId === specialist.id &&
                      styles.selectedSpecialistCard
                  ]}
                  onPress={() => seleccionarEspecialista(specialist)}
                >
                  <Text
                    style={[
                      styles.specialistName,
                      formData.specialistId === specialist.id &&
                        styles.selectedText
                    ]}
                  >
                    {specialist.name}
                  </Text>
                  <Text
                    style={[
                      styles.specialistSpecialty,
                      formData.specialistId === specialist.id &&
                        styles.selectedText
                    ]}
                  >
                    {specialist.specialty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Diagnóstico */}
        <Text style={styles.label}>Diagnóstico: *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el diagnóstico del veterinario"
          value={formData.diagnosis}
          onChangeText={(value) => handleInputChange('diagnosis', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Tratamiento */}
        <Text style={styles.label}>Tratamiento: *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el tratamiento prescrito"
          value={formData.treatment}
          onChangeText={(value) => handleInputChange('treatment', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Peso y Temperatura */}
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Peso (kg):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5.5"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Temperatura (°C):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 38.5"
              value={formData.temperature}
              onChangeText={(value) => handleInputChange('temperature', value)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Notas Adicionales:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Cualquier información adicional relevante"
          value={formData.notes}
          onChangeText={(value) => handleInputChange('notes', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Archivos Adjuntos:</Text>
        <View style={styles.attachmentButtons}>
          <TouchableOpacity
            style={[styles.attachButton, !isOnline && styles.disabledAttachButton]}
            onPress={selectImage}
            disabled={!isOnline}
          >
            <Text style={styles.attachButtonText}>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.attachButton, !isOnline && styles.disabledAttachButton]}
            onPress={selectDocument}
            disabled={!isOnline}
          >
            <Text style={styles.attachButtonText}>Documentos</Text>
          </TouchableOpacity>
        </View>

        {!isOnline && (
          <Text style={styles.offlineAttachmentNote}>
            Los archivos adjuntos solo están disponibles con conexión
          </Text>
        )}

        {}
        {attachments.length > 0 && (
          <View style={styles.attachmentsPreview}>
            <Text style={styles.attachmentsTitle}>
              Adjuntos ({attachments.length}):
            </Text>
            {attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentPreviewItem}>
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={styles.attachmentPreviewImage}
                  />
                ) : (
                  <View style={styles.documentPreview}>
                    <Text style={styles.documentPreviewIcon}></Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeAttachmentButton}
                  onPress={() => removeAttachment(index)}
                >
                  <Text style={styles.removeAttachmentText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Botones de Acción */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveRecord}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Registro</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: 14,
  },
  offlineWarningSubText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  typeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  changeDateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeDateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  specialistCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpecialistCard: {
    backgroundColor: '#34C759',
    borderColor: '#28A745',
  },
  specialistName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  specialistSpecialty: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  selectedText: {
    color: '#fff',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attachButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  disabledAttachButton: {
    backgroundColor: '#ccc',
  },
  attachButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  offlineAttachmentNote: {
    fontSize: 12,
    color: '#FF9500',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  attachmentsPreview: {
    marginBottom: 20,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  attachmentPreviewItem: {
    width: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  attachmentPreviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  documentPreview: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentPreviewIcon: {
    fontSize: 40,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  attachmentName: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#34C759',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    height: 50,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});