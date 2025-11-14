import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    Alert,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from "expo-image-picker";
import { useProducts } from "../contexts/ProductsContext";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function AddProductScreens({ navigation }) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [quantity, setQuantity] = useState("");
    const [minStock, setMinStock] = useState("");
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de foco
    const [nameFocused, setNameFocused] = useState(false);
    const [codeFocused, setCodeFocused] = useState(false);
    const [quantityFocused, setQuantityFocused] = useState(false);
    const [minStockFocused, setMinStockFocused] = useState(false);

    const { addProduct } = useProducts();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    async function pickImage() {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo seleccionar la imagen");
        }
    }

    async function handleSave() {
        if (!name || !code || !quantity) {
            Alert.alert("Error", "Completa todos los campos obligatorios");
            return;
        }

        const quantityInt = parseInt(quantity, 10);
        if (isNaN(quantityInt) || quantityInt < 0) {
            Alert.alert("Error", "La cantidad debe ser un número válido (cero o más).");
            return;
        }

        let minStockInt = 0;
        if (minStock) {
            minStockInt = parseInt(minStock, 10);
            if (isNaN(minStockInt) || minStockInt < 0) {
                Alert.alert("Error", "El stock mínimo debe ser un número válido (cero o más).");
                return;
            }
        }

        setIsLoading(true);
        try {
            const newProduct = {
                id: Date.now().toString(),
                name,
                code,
                quantity: quantityInt,
                minStock: minStockInt,
                imageUrl: image || "https://placehold.co/50x50",
            };

            await addProduct(newProduct);

            Alert.alert("Éxito", "Producto guardado correctamente");

            setName("");
            setCode("");
            setQuantity("");
            setMinStock("");
            setImage(null);
            navigation.navigate("Home");

        } catch (error) {
            console.error("Error guardando producto:", error);
            Alert.alert("Error", "No se pudo guardar el producto");
        } finally {
            setIsLoading(false);
        }
    }

    const gradientColors = colorScheme === 'dark'
        ? ['#0f172a', '#1e293b']
        : ['#ffffff', '#f8fafc'];

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                <Text style={styles.iconText}>📦</Text>
                            </View>
                            <Text style={[styles.title, { color: colors.text, fontSize: 32 }]}>
                                Agregar Producto
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: 20 }]}>
                                Completa la información del nuevo producto
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Nombre */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Nombre del producto <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: nameFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <TextInput
                                        placeholder="Ej: Laptop Dell"
                                        placeholderTextColor={colors.textSecondary}
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setNameFocused(true)}
                                        onBlur={() => setNameFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            {/* Código */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Código <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: codeFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <TextInput
                                        placeholder="Ej: PROD-001"
                                        placeholderTextColor={colors.textSecondary}
                                        value={code}
                                        onChangeText={setCode}
                                        onFocus={() => setCodeFocused(true)}
                                        onBlur={() => setCodeFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            {/* Cantidad */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Cantidad (stock inicial) <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: quantityFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <TextInput
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                        onFocus={() => setQuantityFocused(true)}
                                        onBlur={() => setQuantityFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            {/* Stock Mínimo */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Stock mínimo (opcional)
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: minStockFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <TextInput
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={minStock}
                                        onChangeText={setMinStock}
                                        keyboardType="numeric"
                                        onFocus={() => setMinStockFocused(true)}
                                        onBlur={() => setMinStockFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                                <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                    Se te alertará cuando el stock llegue a este nivel
                                </Text>
                            </View>

                            {/* Imagen */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
                                    Imagen del producto
                                </Text>

                                <TouchableOpacity
                                    style={[
                                        styles.imageButton,
                                        {
                                            backgroundColor: colors.backgroundSecondary,
                                            borderColor: colors.border,
                                        }
                                    ]}
                                    onPress={pickImage}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.imageButtonText, { color: colors.text }]}>
                                        {image ? "Cambiar imagen" : "Seleccionar imagen"}
                                    </Text>
                                </TouchableOpacity>

                                {image && (
                                    <View style={[styles.imagePreview, { backgroundColor: colors.backgroundSecondary }]}>
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.previewImage}
                                        />
                                        <TouchableOpacity
                                            style={[styles.removeImageButton, { backgroundColor: colors.danger }]}
                                            onPress={() => setImage(null)}
                                        >
                                            <Text style={styles.removeImageText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Botón Guardar */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.primary },
                                    isLoading && styles.buttonDisabled
                                ]}
                                onPress={handleSave}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? "Guardando..." : "Guardar Producto"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 35,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    helperText: {
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
    },
    imageButtonIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    imageButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    imagePreview: {
        marginTop: 16,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});