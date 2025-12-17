import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';
import { Ionicons } from '@expo/vector-icons';

const TransactionsScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransactions = async () => {
        try {
            // Docs say GET /api/wallet/transactions
            const response = await client.get('/wallet/transactions');
            const data = response.data.data ? response.data.data : response.data;
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Error fetching transactions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTransactions();
    };

    const getTransactionIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'deposit':
            case 'dépôt':
                return 'arrow-down-circle';
            case 'order':
            case 'commande':
                return 'cart-outline';
            case 'refund':
            case 'remboursement':
                return 'arrow-undo-circle';
            default:
                return 'wallet-outline';
        }
    };

    const getTransactionColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'deposit':
            case 'dépôt':
            case 'refund':
            case 'remboursement':
                return COLORS.success;
            case 'order':
            case 'commande':
                return COLORS.error;
            default:
                return COLORS.text;
        }
    };

    const renderItem = ({ item }) => {
        const isPositive = ['deposit', 'refund', 'dépôt', 'remboursement'].includes(item.type?.toLowerCase());
        const color = getTransactionColor(item.type);

        return (
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={getTransactionIcon(item.type)} size={24} color={color} />
                </View>
                <View style={styles.details}>
                    <Text style={styles.type}>{item.type || 'Transaction'}</Text>
                    <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
                    {item.description && <Text style={styles.description}>{item.description}</Text>}
                </View>
                <Text style={[styles.amount, { color }]}>
                    {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Aucune transaction trouvée.</Text>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    details: {
        flex: 1,
    },
    type: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
        textTransform: 'capitalize',
    },
    date: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: COLORS.gray[400],
    },
    amount: {
        fontSize: 16,
        ...FONTS.bold,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
    }
});

export default TransactionsScreen;
