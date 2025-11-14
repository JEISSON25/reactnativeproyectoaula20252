import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/MyAuthContext';

import AddProductScreens from "./AddProductScreens";
import InventoryScreen from "./InventoryScreen";
import MovementScreen from "./MovementScreen";
import ReportsScreen from "./ReportsScreen";
import AlertsScreen from "./AlertsScreen";

function DashboardScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error("Error al cerrar sesión:", error);
                            Alert.alert("Error", "No se pudo cerrar sesión. Intenta nuevamente.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.dashboardContainer, { backgroundColor: colors.background }]}>
            <View style={styles.dashboardContent}>
                <View style={[styles.welcomeCard, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[styles.welcomeTitle, { color: colors.text, fontSize: 38 }]}>
                        ¡Bienvenido!
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                        Gestiona tu inventario de forma eficiente
                    </Text>

                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.primary }]}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: -4,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                🏠
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Inicio',
                }}
            />
            <Tab.Screen
                name="Agregar Producto"
                component={AddProductScreens}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                ➕
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Agregar',
                }}
            />
            <Tab.Screen
                name="Inventario"
                component={InventoryScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                📦
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Inventario',
                }}
            />
            <Tab.Screen
                name="Alertas"
                component={AlertsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                🔔
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Alertas',
                    tabBarBadge: undefined,
                }}
            />
            <Tab.Screen
                name="Movimientos"
                component={MovementScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                📊
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Movimientos',
                }}
            />
            <Tab.Screen
                name="Reportes"
                component={ReportsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[
                            styles.iconContainer,
                            focused && { backgroundColor: colors.primary + '15' }
                        ]}>
                            <Text style={[styles.tabIcon, { fontSize: size - 2 }]}>
                                📈
                            </Text>
                        </View>
                    ),
                    tabBarLabel: 'Reportes',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIcon: {
        textAlign: 'center',
    },
    dashboardContainer: {
        flex: 1,
    },
    dashboardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    welcomeCard: {
        width: '100%',
        maxWidth: 400,
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});