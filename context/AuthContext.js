// Importaciones necesarias de React y Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

// Se crea un contexto vacío para almacenar la información de autenticación
const AuthContext = createContext({});

// Hook personalizado para acceder fácilmente al contexto en cualquier componente
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para guardar el usuario autenticado (si existe)
  const [user, setUser] = useState(null);
  // Estado para saber si la app está cargando la información de autenticación
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta al montar el componente
  useEffect(() => {
    // Suscribirse a los cambios de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Si hay usuario logueado, se guarda en el estado
      setUser(user);
      // Una vez detectado el usuario (o no), se quita el estado de carga
      setLoading(false);
    });

    // Importante: devolver la función unsubscribe para limpiar la suscripción
    // cuando el componente se desmonte
    return unsubscribe;
  }, []);

  // Objeto que se compartirá a todos los componentes que consuman el contexto
  const value = {
    user,     // Usuario autenticado (o null si no hay sesión)
    loading,  // Estado de carga (true mientras Firebase valida sesión)
  };

  // Se envuelve a los hijos de este provider con el contexto
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
