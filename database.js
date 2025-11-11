import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'recetas';

export async function getOfflineRecipes() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error obteniendo recetas offline:', error);
    return [];
  }
}

export async function saveOfflineRecipe(receta) {
  try {
    const existentes = await getOfflineRecipes();
    const actualizadas = [
      ...existentes.filter(r => r.id !== receta.id),
      { ...receta, synced: false },
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  } catch (error) {
    console.error('Error guardando receta offline:', error);
  }
}

export async function clearSyncedRecipes() {
  try {
    const existentes = await getOfflineRecipes();
    const noSincronizadas = existentes.filter(r => !r.synced);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(noSincronizadas));
  } catch (error) {
    console.error('Error limpiando recetas sincronizadas:', error);
  }
}

export async function markRecipeSynced(id) {
  try {
    const existentes = await getOfflineRecipes();
    const actualizadas = existentes.map(r =>
      r.id === id ? { ...r, synced: true } : r
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  } catch (error) {
    console.error('Error marcando receta sincronizada:', error);
  }
}
