import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    ScrollView
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../contexts/MyAuthContext";
import {
    verifyUserLocally,
    saveUserLocally
} from "../services/offline";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    //obtiene updateUser del Context
    const { updateUser } = useAuth();


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

        //revisa conexión
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    const handleLoginOnline = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const userData = {
                email: userCredential.user.email,
                uid: userCredential.user.uid,
                isOnline: true
            };

            //actualiza context. también guarda en AsyncStorage
            await updateUser(userData);

            try {
                await saveUserLocally(email, password);
            } catch (e) {
                console.log("Usuario ya existe localmente");
            }

            console.log("✅ Usuario logueado (online):", userCredential.user.email);
            Alert.alert("Bienvenido", userCredential.user.email);


        } catch (error) {
            console.error("Error en login online", error.message);
            throw error;
        }
    };

    const handleLoginOffline = async () => {
        try {
            const user = await verifyUserLocally(email, password);

            const userData = {
                email: user.email,
                uid: user.uid,
                isOnline: false
            };

            await updateUser(userData);

            console.log("✅ Usuario logueado (offline):", user.email);
            Alert.alert(
                "Bienvenido (Modo Offline)",
                `${user.email}\n\nEstás trabajando sin conexión. Los cambios se sincronizarán cuando vuelvas a estar online.`
            );


        } catch (error) {
            console.error("Error en login offline", error.message);
            throw error;
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return;
        }

        //intentar login
        setIsLoading(true);
        try {
            if (isOnline) {
                await handleLoginOnline();
            } else {
                await handleLoginOffline();
            }
        } catch (error) {
            if (isOnline) {
                try {
                    console.log("Login online falló, intentando offline...");
                    await handleLoginOffline();
                } catch (offlineError) {
                    Alert.alert(
                        "Error",
                        "Credenciales inválidas. Verifica tu email y contraseña."
                    );
                }
            } else {
                Alert.alert(
                    "Error",
                    "No se encontraron credenciales guardadas. Debes iniciar sesión al menos una vez con conexión a internet."
                );
            }
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
                    keyboardShouldPersistTaps="handled"
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
                                <Text style={styles.iconText}>🔐</Text>
                            </View>
                            <Text style={[styles.title, { color: colors.text, fontSize: 32 }]}>
                                Iniciar Sesión
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Ingresa tus credenciales para continuar
                            </Text>

                            {/* Indicador de estado de conexión */}
                            {!isOnline && (
                                <View style={[styles.offlineBadge, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.offlineBadgeText, { color: colors.primary }]}>
                                        📡 Modo Offline
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Correo electrónico
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: emailFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
                                        ✉️
                                    </Text>
                                    <TextInput
                                        placeholder="tu@email.com"
                                        placeholderTextColor={colors.textSecondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Contraseña
                                </Text>
                                <View style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: passwordFocused ? colors.primary : colors.border,
                                    }
                                ]}>
                                    <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
                                        🔒
                                    </Text>
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        style={[styles.input, { color: colors.text }]}
                                    />
                                </View>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.primary },
                                    isLoading && styles.buttonDisabled
                                ]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                </Text>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                                    o
                                </Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            </View>

                            {/* Register Link */}
                            <TouchableOpacity
                                style={[
                                    styles.secondaryButton,
                                    {
                                        backgroundColor: colors.backgroundSecondary,
                                        borderColor: colors.border,
                                    }
                                ]}
                                onPress={() => navigation.navigate("Register")}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                                    ¿No tienes cuenta?{' '}
                                    <Text style={{ color: colors.primary, fontWeight: '600' }}>
                                        Regístrate
                                    </Text>
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
        justifyContent: 'center',
        paddingVertical: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    offlineBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 12,
    },
    offlineBadgeText: {
        fontSize: 13,
        fontWeight: '600',
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
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    secondaryButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
});