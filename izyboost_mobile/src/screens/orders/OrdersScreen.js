
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/serviceHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { userToken } = useContext(AuthContext);

    const fetchOrders = async () => {
        try {
            const response = await client.get('/user/orders');
            // Assuming backend returns { data: [...] } or just [...]
            // Adjust based on actual API response structure. 
            // Usually valid Laravel resource response is { data: [...] }
            const data = response.data.data ? response.data.data : response.data;
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Fetch Orders Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'timinė': // Potential French backend response
                return COLORS.success || '#4CD964';
            case 'pending':
            case 'en attente':
                return COLORS.warning || '#FFCC00';
            case 'processing':
            case 'en cours':
                return COLORS.info || '#5AC8FA';
            case 'canceled':
            case 'annulé':
                return COLORS.error || '#FF3B30';
            case 'partial':
            case 'partiel':
                return '#AF52DE'; // Purple
            default:
                return COLORS.gray[400];
        }
    };

    const getStatusLabel = (status) => {
        const map = {
            'completed': 'Terminé',
            'pending': 'En attente',
            'processing': 'En cours',
            'canceled': 'Annulé',
            'partial': 'Partiel',
            'inprogress': 'En cours',
        };
        return map[status?.toLowerCase()] || status || 'Inconnu';
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>ID: {item.id}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            {/* Service Name if available. Sometimes it's in a relationship 'service' object */}
            <Text style={styles.serviceName}>{item.service?.name || 'Service inconnu'}</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Lien:</Text>
                <Text style={styles.value} numberOfLines={1}>{item.link}</Text>
            </View>

            <View style={styles.detailsRow}>
                <View>
                    <Text style={styles.label}>Quantité</Text>
                    <Text style={styles.value}>{item.quantity}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Prix</Text>
                    <Text style={styles.price}>{formatCurrency(item.charge)}</Text>
                </View>
            </View>

            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Commandes</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Aucune commande trouvée.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    title: {
        fontSize: 24,
        ...FONTS.bold,
        color: COLORS.text,
    },
    list: {
        padding: SPACING.m,
        paddingBottom: 100, // Space for tab bar
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    orderId: {
        fontSize: 12,
        color: COLORS.textLight,
        ...FONTS.regular,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        ...FONTS.bold,
    },
    serviceName: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: SPACING.s,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    label: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    value: {
        fontSize: 14,
        color: COLORS.text,
        ...FONTS.medium,
        flex: 1,
    },
    price: {
        fontSize: 16,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    date: {
        fontSize: 10,
        color: COLORS.textLight,
        marginTop: SPACING.s,
        textAlign: 'right',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.medium,
    }
});

export default OrdersScreen;
