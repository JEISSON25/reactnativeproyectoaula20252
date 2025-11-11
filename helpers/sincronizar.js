import { firestore } from '../firebaseConfig';
import db from '../database';
import { doc, setDoc } from 'firebase/firestore';

export const sincronizarConFirestore = () => {
  const currentUserId = 'usuarioActual';
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM recetas WHERE usuarioId = ? AND sincronizado = 0',
      [currentUserId],
      (_, { rows }) => {
        rows._array.forEach(async r => {
          await setDoc(doc(firestore, 'recetas', r.id), {
            nombre: r.nombre,
            descripcion: r.descripcion,
            categoria: r.categoria,
            foto: r.foto,
            ingredientes: JSON.parse(r.ingredientes),
            pasos: JSON.parse(r.pasos),
            usuarioId: r.usuarioId,
            favorito: r.favorito,
          });
          //para corrovorar sincronia
          db.transaction(tx2 => {
            tx2.executeSql('UPDATE recetas SET sincronizado = 1 WHERE id = ?', [r.id]);
          });
        });
      }
    );
  });
};
