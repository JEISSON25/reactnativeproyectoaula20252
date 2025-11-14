import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    useColorScheme
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const gradientColors = colorScheme === 'dark'
        ? ['#0f172a', '#1e293b', '#334155']
        : ['#ffffff', '#f8fafc', '#f1f5f9'];

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                {/* Icono/Logo */}
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={styles.iconText}>📦</Text>
                </View>

                {/* Título */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Gestión de Inventario
                </Text>

                {/* Subtítulo */}
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Controla tu inventario de forma simple y eficiente
                </Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <FeatureItem
                        icon="✓"
                        text="Control en tiempo real"
                        colors={colors}
                    />
                    <FeatureItem
                        icon="✓"
                        text="Reportes detallados"
                        colors={colors}
                    />
                    <FeatureItem
                        icon="✓"
                        text="Sincronización automática"
                        colors={colors}
                    />
                </View>

                {/* Botón Principal */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Login")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Comenzar</Text>
                </TouchableOpacity>

                {/* Versión */}
                <Text style={[styles.version, { color: colors.textSecondary }]}>
                    Versión 1.0.0
                </Text>
            </Animated.View>
        </LinearGradient>
    );
}

function FeatureItem({ icon, text, colors }) {
    return (
        <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.featureIconText, { color: colors.primary }]}>
                    {icon}
                </Text>
            </View>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconText: {
        fontSize: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    featuresContainer: {
        width: '100%',
        maxWidth: 350,
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureIconText: {
        fontSize: 16,
        fontWeight: '600',
    },
    featureText: {
        fontSize: 15,
        flex: 1,
    },
    button: {
        width: '100%',
        maxWidth: 350,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    version: {
        fontSize: 12,
        marginTop: 30,
        opacity: 0.6,
    },
});