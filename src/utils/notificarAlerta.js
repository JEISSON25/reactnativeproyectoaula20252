// src/utils/notificarAlerta.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import * as Notifications from 'expo-notifications';

// Nombres bonitos para los parámetros
const nombresParametros = {
  temperature_2m: 'Temperatura',
  apparent_temperature: 'Sensación térmica',
  relative_humidity_2m: 'Humedad relativa',
  wind_speed_10m: 'Velocidad del viento',
  precipitation: 'Precipitación',
  uv_index: 'Índice UV',
};

export const notificarSiCumpleAlerta = async (observacion, uid) => {
  try {
    // 1. Buscar alertas activas del usuario
    const q = query(
      collection(db, 'alertasClima'),
      where('uid', '==', uid),
      where('activa', '==', true)
    );

    const snapshot = await getDocs(q);
    const alertas = snapshot.docs.map(doc => doc.data());

    // 2. Revisar cada alerta
    for (const alerta of alertas) {
      // Ciudad debe coincidir (ignorar mayúsculas)
      const ciudadIgual = alerta.ciudad.toLowerCase() === observacion.ubicacion.toLowerCase();
      if (!ciudadIgual) continue;

      // Valor actual del parámetro
      const valorActual = observacion[alerta.parametro];
      if (valorActual == null) continue;

      // Verificar condición
      let cumple = false;
      if (alerta.condicion === 'mayor' && valorActual > alerta.valor) cumple = true;
      if (alerta.condicion === 'menor' && valorActual < alerta.valor) cumple = true;
      if (alerta.condicion === 'igual' && valorActual === alerta.valor) cumple = true;

      if (cumple) {
        const nombreParam = nombresParametros[alerta.parametro] || alerta.parametro;

        // ENVIAR NOTIFICACIÓN
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `¡ALERTA! ${alerta.titulo}`,
            body: `${nombreParam}: ${valorActual} en ${observacion.ubicacion}`,
            sound: 'default',
          },
          trigger: { seconds: 1 }, // ahora mismo
        });

        console.log('Notificación enviada:', alerta.titulo);
      }
    }
  } catch (error) {
    console.error('Error al verificar alertas:', error);
  }
};