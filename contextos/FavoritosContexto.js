import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritosContexto = createContext();

export const ProveedorFavoritos = ({ children }) => {
  const [favoritos, setFavoritos] = useState([]);

  
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

  
  useEffect(() => {
    AsyncStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = (receta) => {
    db.transaccion(tx=>{
      tx.executeSql(
        'update recetas set favorito = ? where id = ? and usuarioId = ?',
        [receta.favorito ? 0 : 1, receta.id, currentUserId],
        (_, result)=>{
          setFavoritos(prev=> 
            prev.some(f => f.id === receta.id) ? prev.filter(f=> f.id !== receta.id) : [...prev, receta] 
          );
        }
      );
    });
  };

  const esFavorito = (id) => favoritos.some((fav) => fav.id === id);

  return (
    <FavoritosContexto.Provider value={{ favoritos, toggleFavorito, esFavorito }}>
      {children}
    </FavoritosContexto.Provider>
  );
};

export const useFavoritos = () => useContext(FavoritosContexto);
