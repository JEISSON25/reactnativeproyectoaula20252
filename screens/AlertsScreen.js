import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    Animated
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from "../contexts/ProductsContext";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function AlertsScreen() {
    const { getLowStockProducts } = useProducts();
    const lowStockProducts = getLowStockProducts();

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

    const gradientColors = colorScheme === 'dark'
        ? ['#0f172a', '#1e293b']
        : ['#ffffff', '#f8fafc'];

    const getAlertLevel = (product) => {
        if (product.quantity === 0) return 'critical';
        return 'warning';
    };

    const getAlertColor = (level) => {
        return level === 'critical' ? colors.danger : colors.warning;
    };

    const getAlertLabel = (level) => {
        return level === 'critical' ? 'Crítico' : 'Advertencia';
    };

    const getAlertMessage = (level) => {
        return level === 'critical'
            ? 'Sin stock - Reabastecer urgente'
            : 'Stock bajo - Reabastecer pronto';
    };

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Alertas de Stock
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Productos que requieren atención
                    </Text>
                </View>

                {lowStockProducts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: colors.success + '20' }]}>
                            <Text style={styles.emptyIcon}>✓</Text>
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            ¡Todo en orden!
                        </Text>
                        <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                            No hay productos con stock bajo
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Resumen de alertas */}
                        <View style={[
                            styles.summaryCard,
                            {
                                backgroundColor: colorScheme === 'dark' ? colors.warning + '20' : '#fff3cd',
                            }
                        ]}>
                            <View style={styles.summaryContent}>
                                <View style={[styles.summaryIcon, { backgroundColor: colors.warning }]}>
                                    <Text style={styles.summaryIconText}>
                                        {lowStockProducts.length}
                                    </Text>
                                </View>
                                <View style={styles.summaryText}>
                                    <Text style={[styles.summaryTitle, { color: colors.text }]}>
                                        Productos con alerta
                                    </Text>
                                    <Text style={[styles.summarySubtitle, { color: colors.textSecondary }]}>
                                        Requieren reabastecimiento
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Lista de productos con alerta */}
                        <FlatList
                            data={lowStockProducts}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const alertLevel = getAlertLevel(item);
                                const alertColor = getAlertColor(alertLevel);
                                const alertLabel = getAlertLabel(alertLevel);
                                const alertMessage = getAlertMessage(alertLevel);

                                return (
                                    <View style={[
                                        styles.alertCard,
                                        {
                                            backgroundColor: colors.background,
                                            borderLeftColor: alertColor,
                                        }
                                    ]}>
                                        <View style={styles.alertContent}>
                                            {item.imageUrl && (
                                                <Image
                                                    source={{ uri: item.imageUrl }}
                                                    style={styles.productImage}
                                                />
                                            )}
                                            <View style={styles.productInfo}>
                                                {/* Badge de nivel de alerta */}
                                                <View style={[
                                                    styles.alertBadge,
                                                    { backgroundColor: alertColor + '20' }
                                                ]}>
                                                    <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
                                                    <Text style={[styles.alertBadgeText, { color: alertColor }]}>
                                                        {alertLabel}
                                                    </Text>
                                                </View>

                                                <Text style={[styles.productName, { color: colors.text }]}>
                                                    {item.name}
                                                </Text>
                                                <Text style={[styles.productCode, { color: colors.textSecondary }]}>
                                                    Código: {item.code}
                                                </Text>

                                                {/* Stock info */}
                                                <View style={styles.stockInfo}>
                                                    <View style={styles.stockRow}>
                                                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
                                                            Stock actual:
                                                        </Text>
                                                        <Text style={[styles.stockValue, { color: alertColor }]}>
                                                            {item.quantity}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.stockRow}>
                                                        <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>
                                                            Stock mínimo:
                                                        </Text>
                                                        <Text style={[styles.stockValue, { color: colors.text }]}>
                                                            {item.minStock}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Mensaje de acción */}
                                                <View style={[
                                                    styles.actionMessage,
                                                    { backgroundColor: alertColor + '15' }
                                                ]}>
                                                    <Text style={[styles.actionText, { color: alertColor }]}>
                                                        {alertMessage}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    </>
                )}
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 50,
        color: '#4caf50',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: 'center',
    },
    summaryCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    summaryIconText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    summaryText: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    summarySubtitle: {
        fontSize: 14,
    },
    alertCard: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    alertContent: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    productImage: {
        width: 70,
        height: 70,
        marginRight: 16,
        borderRadius: 10,
    },
    productInfo: {
        flex: 1,
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    alertDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    alertBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    productName: {
        fontWeight: "700",
        fontSize: 17,
        marginBottom: 4,
    },
    productCode: {
        fontSize: 13,
        marginBottom: 12,
    },
    stockInfo: {
        marginBottom: 10,
    },
    stockRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    stockLabel: {
        fontSize: 13,
    },
    stockValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionMessage: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});