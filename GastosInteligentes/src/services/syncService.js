import { getDB } from "./database";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../config/firebase";

export const syncOfflineUsers = async () => {
  try {
    const db = await getDB();
    const unsynced = await db.getAllAsync("SELECT * FROM users WHERE synced = 0;");

    for (const user of unsynced) {
      try {
        //Verificar si ya existe en Firebase
        const methods = await fetchSignInMethodsForEmail(auth, user.email);

        if (methods.length > 0) {
          console.log("Usuario ya existe en Firebase:", user.email);
          await db.runAsync("UPDATE users SET synced = 1 WHERE email = ?;", [user.email]);
          continue;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        const { uid } = userCredential.user;

        await db.runAsync("UPDATE users SET uid = ?, synced = 1 WHERE email = ?;", [
          uid,
          user.email,
        ]);

        console.log("Usuario sincronizado correctamente:", user.email);
      } catch (error) {
        console.error("Error sincronizando usuario:", user.email, error.message);
      }
    }
  } catch (error) {
    console.error("Error leyendo usuarios offline:", error);
  }
};
