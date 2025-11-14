import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from "@react-navigation/native";
import { getPendingMovements } from "../services/offline";
import { exportMovementsToCSV } from "../services/export";
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function ReportsScreen() {
    const [movements, setMovements] = useState([]);
    const [dateFilter, setDateFilter] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [dateFocused, setDateFocused] = useState(false);

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

    useFocusEffect(
        useCallback(() => {
            const fetchMovements = async () => {
                const stored = await getPendingMovements();
                const sorted = (stored || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setMovements(sorted);
                setFiltered(sorted);
            };

            fetchMovements();
            setDateFilter("");

            return () => { };
        }, [])
    );

    // Función mejorada para convertir fecha a formato local YYYY-MM-DD
    const getLocalDateString = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filterByDate = () => {
        if (!dateFilter || dateFilter.trim() === "") {
            setFiltered(movements);
            return;
        }

        // Limpiar el filtro de espacios
        const cleanFilter = dateFilter.trim();

        // Validar formato básico (debe ser YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(cleanFilter)) {
            alert("Por favor ingresa una fecha válida en formato YYYY-MM-DD (Ej: 2025-11-13)");
            return;
        }

        const filteredList = movements.filter((m) => {
            const moveDate = getLocalDateString(m.date);
            return moveDate === cleanFilter;
        });

        setFiltered(filteredList);
    };

    const clearFilter = () => {
        setDateFilter("");
        setFiltered(movements);
    };

    const handleExportMovements = async () => {
        setExporting(true);
        await exportMovementsToCSV(filtered.length > 0 ? filtered : movements);
        setExporting(false);
    };

    const getMovementStats = () => {
        const entradas = filtered.filter(m => m.type === 'entrada').length;
        const salidas = filtered.filter(m => m.type === 'salida').length;
        return { entradas, salidas };
    };

    const stats = getMovementStats();

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
                        Reportes
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {movements.length} {movements.length === 1 ? 'movimiento' : 'movimientos'} registrados
                    </Text>
                </View>

                {/* Estadísticas */}
                {filtered.length > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
                            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                                <Text style={styles.statIconText}>📥</Text>
                            </View>
                            <Text style={[styles.statValue, { color: colors.success }]}>
                                {stats.entradas}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Entradas
                            </Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
                            <View style={[styles.statIcon, { backgroundColor: colors.danger + '20' }]}>
                                <Text style={styles.statIconText}>📤</Text>
                            </View>
                            <Text style={[styles.statValue, { color: colors.danger }]}>
                                {stats.salidas}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Salidas
                            </Text>
                        </View>
                    </View>
                )}

                {/* Botón de exportación */}
                <TouchableOpacity
                    style={[
                        styles.exportButton,
                        { backgroundColor: colors.success },
                        (exporting || movements.length === 0) && styles.buttonDisabled
                    ]}
                    onPress={handleExportMovements}
                    disabled={exporting || movements.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.exportButtonText}>
                        {exporting ? "Exportando..." : "Exportar a CSV"}
                    </Text>
                </TouchableOpacity>

                {exporting && (
                    <View style={[styles.exportingIndicator, { backgroundColor: colors.success + '15' }]}>
                        <ActivityIndicator size="small" color={colors.success} />
                        <Text style={[styles.exportingText, { color: colors.success }]}>
                            Generando archivo CSV...
                        </Text>
                    </View>
                )}

                {/* Filtro por fecha */}
                <View style={styles.filterSection}>
                    <Text style={[styles.filterLabel, { color: colors.text }]}>
                        Filtrar por fecha
                    </Text>
                    <View style={[
                        styles.dateInputContainer,
                        {
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: dateFocused ? colors.primary : colors.border,
                        }
                    ]}>
                        <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
                            📅
                        </Text>
                        <TextInput
                            placeholder="YYYY-MM-DD (Ej: 2025-11-10)"
                            placeholderTextColor={colors.textSecondary}
                            value={dateFilter}
                            onChangeText={setDateFilter}
                            onFocus={() => setDateFocused(true)}
                            onBlur={() => setDateFocused(false)}
                            style={[styles.dateInput, { color: colors.text }]}
                            maxLength={10}
                        />
                        {dateFilter.length > 0 && (
                            <TouchableOpacity onPress={clearFilter}>
                                <Text style={[styles.clearButton, { color: colors.textSecondary }]}>
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.filterButtons}>
                        <TouchableOpacity
                            style={[styles.filterButton, { backgroundColor: colors.primary }]}
                            onPress={filterByDate}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.filterButtonText}>Aplicar Filtro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                {
                                    backgroundColor: colors.backgroundSecondary,
                                    borderWidth: 2,
                                    borderColor: colors.border,
                                }
                            ]}
                            onPress={clearFilter}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.filterButtonTextSecondary, { color: colors.text }]}>
                                Limpiar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Indicador de filtro activo */}
                    {dateFilter && filtered.length !== movements.length && (
                        <View style={[styles.filterActiveIndicator, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.filterActiveText, { color: colors.primary }]}>
                                📌 Mostrando {filtered.length} de {movements.length} movimientos para la fecha: {dateFilter}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Lista de movimientos */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.movementCard,
                            {
                                backgroundColor: colors.background,
                                borderLeftColor: item.type === 'entrada' ? colors.success : colors.danger,
                            }
                        ]}>
                            <View style={styles.movementHeader}>
                                <View style={[
                                    styles.typeBadge,
                                    {
                                        backgroundColor: item.type === 'entrada'
                                            ? colors.success + '20'
                                            : colors.danger + '20'
                                    }
                                ]}>
                                    <Text style={styles.typeIcon}>
                                        {item.type === 'entrada' ? '📥' : '📤'}
                                    </Text>
                                    <Text style={[
                                        styles.typeText,
                                        { color: item.type === 'entrada' ? colors.success : colors.danger }
                                    ]}>
                                        {item.type === 'entrada' ? 'Entrada' : 'Salida'}
                                    </Text>
                                </View>

                                <View style={[
                                    styles.syncBadge,
                                    { backgroundColor: item.synced ? colors.success + '20' : colors.warning + '20' }
                                ]}>
                                    <View style={[
                                        styles.syncDot,
                                        { backgroundColor: item.synced ? colors.success : colors.warning }
                                    ]} />
                                    <Text style={[
                                        styles.syncText,
                                        { color: item.synced ? colors.success : colors.warning }
                                    ]}>
                                        {item.synced ? 'Sincronizado' : 'Pendiente'}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.productName, { color: colors.text }]}>
                                {item.productName}
                            </Text>

                            <View style={styles.movementDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Cantidad:
                                    </Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {item.quantity}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                                        Fecha:
                                    </Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {new Date(item.date).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>
                                📊
                            </Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {dateFilter
                                    ? 'No hay movimientos que coincidan con el filtro'
                                    : 'No hay movimientos registrados'}
                            </Text>
                            {dateFilter && (
                                <TouchableOpacity
                                    style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                                    onPress={clearFilter}
                                >
                                    <Text style={styles.emptyButtonText}>
                                        Ver todos los movimientos
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
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
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statIconText: {
        fontSize: 20,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    exportButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    exportButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
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
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        marginBottom: 12,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    dateInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 0,
    },
    clearButton: {
        fontSize: 20,
        padding: 4,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    filterButtonTextSecondary: {
        fontWeight: '600',
        fontSize: 14,
    },
    filterActiveIndicator: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
    },
    filterActiveText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    movementCard: {
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
    movementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    syncDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    syncText: {
        fontSize: 11,
        fontWeight: '600',
    },
    productName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
    },
    movementDetails: {
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 13,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyState: {
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
        marginBottom: 16,
    },
    emptyButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});