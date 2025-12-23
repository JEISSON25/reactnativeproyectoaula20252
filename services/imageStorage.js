import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export async function saveLocalImage(uriOriginal, codigo) {
  try {
    if (!uriOriginal) return null;

    const result = await ImageManipulator.manipulateAsync(
      uriOriginal,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    const fileName = `prod_${codigo}_${Date.now()}.jpg`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: result.uri,
      to: newPath,
    });

    return newPath;
  } catch (e) {
    console.log("Error guardando foto:", e);
    return null;
  }
}

export async function deleteLocalImage(uri) {
  try {
    if (!uri) return;

    await FileSystem.deleteAsync(uri, { idempotent: true });

  } catch (e) {
    console.log("Error eliminando foto:", e);
  }
}
