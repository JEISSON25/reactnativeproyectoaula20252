import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritosContexto = createContext();

export const ProveedorFavoritos = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);

  // 🔹 Cargar favoritos desde almacenamiento local al iniciar la app
  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const data = await AsyncStorage.getItem('favoritos');
        if (data) setFavoritos(JSON.parse(data));
      } catch (error) {
        console.warn('Error cargando favoritos:', error);
      }
    };
    cargarFavoritos();
  }, []);

  // 🔹 Guardar favoritos en almacenamiento local cada vez que cambian
  useEffect(() => {
    AsyncStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = (receta) => {
    const existe = favoritos.some((fav) => fav.id === receta.id);
    if (existe) {
      setFavoritos(favoritos.filter((fav) => fav.id !== receta.id));
    } else {
      setFavoritos([...favoritos, receta]);
    }
  };

  const esFavorito = (id) => favoritos.some((fav) => fav.id === id);

  return (
    <FavoritosContexto.Provider value={{ favoritos, toggleFavorito, esFavorito }}>
      {children}
    </FavoritosContexto.Provider>
  );
};

export const useFavoritos = () => useContext(FavoritosContexto);
