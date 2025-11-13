// Script para inicializar datos de especialistas en Firebase
// Ejecutar: node initializeData.js (una sola vez)

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHd0a1mEBrpMyXylM0eLLbbiGwwuSqpEY",
  authDomain: "vetapp-3720c.firebaseapp.com",
  projectId: "vetapp-3720c",
  storageBucket: "vetapp-3720c.firebasestorage.app",
  messagingSenderId: "260297994785",
  appId: "1:260297994785:web:c8328c8f9424e7f4e02960"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const specialists = [
  {
    name: "Dr. Carlos Méndez",
    specialty: "Medicina General",
    experience: 15,
    rating: 4.8,
    schedule: {
      monday: ["08:00-18:00"],
      tuesday: ["08:00-18:00"],
      wednesday: ["08:00-18:00"],
      thursday: ["08:00-18:00"],
      friday: ["08:00-18:00"],
      saturday: ["09:00-13:00"]
    }
  },
  {
    name: "Dra. María González",
    specialty: "Cirugía Veterinaria",
    experience: 12,
    rating: 4.9,
    schedule: {
      monday: ["09:00-17:00"],
      tuesday: ["09:00-17:00"],
      wednesday: ["09:00-17:00"],
      thursday: ["09:00-17:00"],
      friday: ["09:00-17:00"]
    }
  },
  {
    name: "Dr. Juan Pérez",
    specialty: "Dermatología",
    experience: 8,
    rating: 4.7,
    schedule: {
      monday: ["10:00-16:00"],
      tuesday: ["10:00-16:00"],
      thursday: ["10:00-16:00"],
      friday: ["10:00-16:00"],
      saturday: ["10:00-14:00"]
    }
  },
  {
    name: "Dra. Ana Ramírez",
    specialty: "Cardiología",
    experience: 10,
    rating: 4.9,
    schedule: {
      monday: ["08:00-14:00"],
      wednesday: ["08:00-14:00"],
      friday: ["08:00-14:00"]
    }
  },
  {
    name: "Dr. Roberto Silva",
    specialty: "Oftalmología",
    experience: 7,
    rating: 4.6,
    schedule: {
      tuesday: ["09:00-17:00"],
      thursday: ["09:00-17:00"],
      saturday: ["09:00-13:00"]
    }
  }
];

async function initializeSpecialists() {
  console.log('Inicializando especialistas...');
  
  try {
    for (const specialist of specialists) {
      const docRef = await addDoc(collection(db, 'specialists'), specialist);
      console.log(`✓ Especialista agregado: ${specialist.name} (ID: ${docRef.id})`);
    }
    console.log('\n✅ Todos los especialistas han sido agregados exitosamente!');
  } catch (error) {
    console.error('❌ Error al agregar especialistas:', error);
  }
}

initializeSpecialists();