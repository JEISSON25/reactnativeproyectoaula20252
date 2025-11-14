import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Animated
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from "../contexts/ProductsContext";
import { exportToCSV, exportToPDF } from "../services/export";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function InventoryScreen() {
    const [search, setSearch] = useState("");
    const [exporting, setExporting] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { products } = useProducts();

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

    if (!products) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Cargando inventario...
                </Text>
            </View>
        );
    }

    const filteredProducts = products.filter((product) => {
        const nameMatch = product.name ? product.name.toLowerCase().includes(search.toLowerCase()) : false;
        const codeMatch = product.code ? product.code.toLowerCase().includes(search.toLowerCase()) : false;
        return nameMatch || codeMatch;
    });

    const getStockStatus = (product) => {
        if (!product.minStock) return "normal";
        if (product.quantity === 0) return "empty";
        if (product.quantity <= product.minStock) return "low";
        return "normal";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "empty": return colors.danger;
            case "low": return colors.warning;
            default: return colors.success;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "empty": return "Sin stock";
            case "low": return "Stock bajo";
            default: return "Stock normal";
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        await exportToCSV(filteredProducts.length > 0 ? filteredProducts : products);
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        await exportToPDF(filteredProducts.length > 0 ? filteredProducts : products);
        setExporting(false);
    };

    const lowStockCount = products.filter(p => getStockStatus(p) === "low").length;
    const emptyStockCount = products.filter(p => getStockStatus(p) === "empty").length;

    const gradientColors = colorScheme === 'dark'
        ? ['#0f172a', '#1e293b']
        : ['#ffffff', '#f8fafc'];

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Inventario
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {products.length} {products.length === 1 ? 'producto' : 'productos'} registrados
                    </Text>
                </View>

                {/* Botones de exportación */}
                <View style={styles.exportContainer}>
                    <TouchableOpacity
                        style={[styles.exportButton, { backgroundColor: colors.success }]}
                        onPress={handleExportCSV}
                        disabled={exporting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.exportButtonText}>
                            Exportar CSV
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.exportButton, { backgroundColor: colors.primary }]}
                        onPress={handleExportPDF}
                        disabled={exporting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.exportButtonText}>
                            Generar Reporte
                        </Text>
                    </TouchableOpacity>
                </View>

                {exporting && (
                    <View style={[styles.exportingIndicator, { backgroundColor: colors.primary + '15' }]}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.exportingText, { color: colors.primary }]}>
                            Generando archivo...
                        </Text>
                    </View>
                )}

                {/* Resumen de alertas */}
                {(lowStockCount > 0 || emptyStockCount > 0) && (
                    <View style={[
                        styles.alertsCard,
                        {
                            backgroundColor: colorScheme === 'dark' ? colors.warning + '20' : '#fff3cd',
                            borderLeftColor: colors.warning
                        }
                    ]}>
                        {emptyStockCount > 0 && (
                            <View style={styles.alertRow}>
                                <View style={[styles.alertDot, { backgroundColor: colors.danger }]} />
                                <Text style={[styles.alertText, { color: colors.danger }]}>
                                    {emptyStockCount} {emptyStockCount === 1 ? 'producto' : 'productos'} sin stock
                                </Text>
                            </View>
                        )}
                        {lowStockCount > 0 && (
                            <View style={styles.alertRow}>
                                <View style={[styles.alertDot, { backgroundColor: colors.warning }]} />
                                <Text style={[styles.alertText, { color: colors.warning }]}>
                                    {lowStockCount} {lowStockCount === 1 ? 'producto' : 'productos'} con stock bajo
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Búsqueda */}
                <View style={[
                    styles.searchContainer,
                    {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: searchFocused ? colors.primary : colors.border,
                    }
                ]}>
                    <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>
                        🔍
                    </Text>
                    <TextInput
                        placeholder="Buscar por nombre o código..."
                        placeholderTextColor={colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={[styles.searchInput, { color: colors.text }]}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Text style={[styles.clearButton, { color: colors.textSecondary }]}>
                                ✕
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista de productos */}
                {filteredProducts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
                            📦
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {search ? 'No se encontraron productos' : 'No hay productos registrados'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const status = getStockStatus(item);
                            const statusColor = getStatusColor(status);
                            const statusLabel = getStatusLabel(status);

                            return (
                                <View style={[
                                    styles.productCard,
                                    {
                                        backgroundColor: colors.background,
                                        borderLeftColor: statusColor,
                                    }
                                ]}>
                                    <View style={styles.productContent}>
                                        {item.imageUrl && (
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                style={styles.productImage}
                                            />
                                        )}
                                        <View style={styles.productInfo}>
                                            <Text style={[styles.productName, { color: colors.text }]}>
                                                {item.name}
                                            </Text>
                                            <Text style={[styles.productCode, { color: colors.textSecondary }]}>
                                                Código: {item.code}
                                            </Text>

                                            <View style={styles.stockRow}>
                                                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                                    <Text style={[styles.statusText, { color: statusColor }]}>
                                                        {statusLabel}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={[styles.stockQuantity, { color: statusColor }]}>
                                                Stock: {item.quantity}
                                            </Text>

                                            {item.minStock > 0 && (
                                                <Text style={[styles.minStock, { color: colors.textSecondary }]}>
                                                    Mínimo: {item.minStock}
                                                </Text>
                                            )}

                                            {status === "low" && (
                                                <Text style={[styles.warningText, { color: colors.warning }]}>
                                                    Reabastecer pronto
                                                </Text>
                                            )}
                                            {status === "empty" && (
                                                <Text style={[styles.warningText, { color: colors.danger }]}>
                                                    Reabastecer urgente
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
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
    exportContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 15,
    },
    exportButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    exportButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    exportingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    exportingText: {
        marginLeft: 10,
        fontWeight: "600",
        fontSize: 14,
    },
    alertsCard: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderLeftWidth: 4,
    },
    alertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    alertDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    alertText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 15,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    clearButton: {
        fontSize: 20,
        padding: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    productCard: {
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
    productContent: {
        flexDirection: "row",
        alignItems: "center",
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
    productName: {
        fontWeight: "700",
        fontSize: 17,
        marginBottom: 4,
    },
    productCode: {
        fontSize: 13,
        marginBottom: 8,
    },
    stockRow: {
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    stockQuantity: {
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 2,
    },
    minStock: {
        fontSize: 12,
        marginBottom: 4,
    },
    warningText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});