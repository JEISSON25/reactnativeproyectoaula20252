import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Alert,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ActivityIndicator
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from "@react-native-picker/picker";
import NetInfo from "@react-native-community/netinfo";
import { useProducts } from "../contexts/ProductsContext";
import {
    addPendingMovement,
    getPendingMovements,
    savePendingMovements,
    clearPendingMovements,
} from "../services/offline";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function MovementScreen() {
    const [productName, setProductName] = useState("");
    const [type, setType] = useState("entrada");
    const [quantity, setQuantity] = useState("");
    const [isConnected, setIsConnected] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [productFocused, setProductFocused] = useState(false);
    const [quantityFocused, setQuantityFocused] = useState(false);

    const { products, updateProductQuantity } = useProducts();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected = !!state.isConnected;
            setIsConnected(connected);
            if (connected) {
                doSyncPending();
            }
        })

        return () => {
            unsubscribe();
        };
    }, []);

    async function doSyncPending() {
        setSyncing(true);
        try {
            const pending = await getPendingMovements();
            if (pending.length === 0) {
                setSyncing(false);
                return;
            }

            await clearPendingMovements();

            Alert.alert("Sincronización", "Movimientos pendientes sincronizados correctamente.");
        } catch (e) {
            console.error("doSyncPending error", e);
        } finally {
            setSyncing(false);
        }
    }

    const handleRegisterMovement = async () => {
        if (!productName || !quantity) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        const q = parseInt(quantity, 10);
        if (isNaN(q) || q <= 0) {
            Alert.alert("Error", "La cantidad debe ser un número entero positivo");
            return;
        }

        const productToUpdate = products.find(p =>
            p.name.toLowerCase() === productName.toLowerCase()
        );

        if (!productToUpdate) {
            Alert.alert("Error", "Producto no encontrado. Revisa el nombre.");
            return;
        }

        const currentQuantity = Number(productToUpdate.quantity);
        let newQuantity;

        if (type === "entrada") {
            newQuantity = currentQuantity + q;
        } else {
            if (currentQuantity < q) {
                Alert.alert("Error", `Cantidad insuficiente. Stock actual de ${productToUpdate.name}: ${currentQuantity}`);
                return;
            }
            newQuantity = currentQuantity - q;
        }

        setIsLoading(true);
        try {
            await updateProductQuantity(productToUpdate.id, newQuantity);

            const newMovement = {
                id: Date.now().toString(),
                productId: productToUpdate.id,
                productName: productToUpdate.name,
                type,
                quantity: q,
                date: new Date().toISOString(),
                synced: isConnected,
            };

            if (isConnected) {
                await addPendingMovement(newMovement);
                await doSyncPending();
            } else {
                await addPendingMovement({ ...newMovement, synced: false });
                Alert.alert("Offline", "Movimiento guardado localmente y se sincronizará cuando vuelvas a tener conexión.");
            }

            Alert.alert("Éxito", `Movimiento de ${q} unidades de ${productToUpdate.name} registrado.`);

            setProductName("");
            setQuantity("");
            setType("entrada");

        } catch (error) {
            console.error("Error registrando movimiento:", error);
            Alert.alert("Error", "No se pudo registrar el movimiento de stock.");
        } finally {
            setIsLoading(false);
        }
    };

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
                            { opacity: fadeAnim }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text, fontSize: 30, marginTop: 100 }]}>
                                Registrar Movimiento
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Gestiona las entradas y salidas de inventario
                            </Text>
                        </View>

                        {/* Estado de conexión */}
                        <View style={[
                            styles.connectionCard,
                            {
                                backgroundColor: isConnected
                                    ? (colorScheme === 'dark' ? colors.success + '20' : '#d4edda')
                                    : (colorScheme === 'dark' ? colors.warning + '20' : '#fff3cd'),
                                borderLeftColor: isConnected ? colors.success : colors.warning
                            }
                        ]}>
                            <View style={styles.connectionContent}>
                                <View style={[
                                    styles.connectionDot,
                                    { backgroundColor: isConnected ? colors.success : colors.warning }
                                ]} />
                                <Text style={[
                                    styles.connectionText,
                                    { color: isConnected ? colors.success : colors.warning }
                                ]}>
                                    {isConnected ? 'Conectado' : 'Sin conexión (offline)'}
                                </Text>
                            </View>
                            {syncing && (
                                <View style={styles.syncingRow}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={[styles.syncingText, { color: colors.primary }]}>
                                        Sincronizando pendientes...
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Nombre del producto */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Nombre del producto <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: productFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
                                        📦
                                    </Text>
                                    <TextInput
                                        placeholder="Escribe el nombre exacto"
                                        placeholderTextColor={colors.textSecondary}
                                        value={productName}
                                        onChangeText={setProductName}
                                        onFocus={() => setProductFocused(true)}
                                        onBlur={() => setProductFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                                <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                    Debe coincidir con el nombre registrado
                                </Text>
                            </View>

                            {/* Tipo de movimiento */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Tipo de movimiento <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.pickerContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: colors.border,
                                    }
                                ]}>
                                    <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
                                        {type === 'entrada' ? '📥' : '📤'}
                                    </Text>
                                    <Picker
                                        selectedValue={type}
                                        onValueChange={(v) => setType(v)}
                                        style={[styles.picker, { color: colors.text }]}
                                        dropdownIconColor={colors.textSecondary}
                                    >
                                        <Picker.Item label="Entrada (Aumentar stock)" value="entrada" />
                                        <Picker.Item label="Salida (Disminuir stock)" value="salida" />
                                    </Picker>
                                </View>
                            </View>

                            {/* Cantidad */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Cantidad <Text style={{ color: colors.danger }}>*</Text>
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: quantityFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <TextInput
                                        placeholder="Ingresa la cantidad"
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

                            {/* Tipo de movimiento visual */}
                            <View style={[
                                styles.movementTypeCard,
                                {
                                    backgroundColor: type === 'entrada'
                                        ? (colorScheme === 'dark' ? colors.success + '20' : '#d4edda')
                                        : (colorScheme === 'dark' ? colors.danger + '20' : '#f8d7da'),
                                    borderColor: type === 'entrada' ? colors.success : colors.danger
                                }
                            ]}>
                                <Text style={[
                                    styles.movementTypeText,
                                    { color: type === 'entrada' ? colors.success : colors.danger }
                                ]}>
                                    {type === 'entrada'
                                        ? 'El stock aumentará'
                                        : 'El stock disminuirá'}
                                </Text>
                            </View>

                            {/* Botón */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.primary },
                                    isLoading && styles.buttonDisabled
                                ]}
                                onPress={handleRegisterMovement}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? "Registrando..." : "Registrar Movimiento"}
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
        marginBottom: 20,
        marginTop: 10,
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
    connectionCard: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
    },
    connectionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectionDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    connectionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    syncingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    syncingText: {
        fontSize: 13,
        marginLeft: 8,
        fontWeight: '500',
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
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingLeft: 16,
        height: 56,
        overflow: 'hidden',
    },
    picker: {
        flex: 1,
        marginLeft: 12,
    },
    movementTypeCard: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        marginBottom: 20,
    },
    movementTypeText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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