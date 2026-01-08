import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const WhiteLabelScreen = ({ navigation }) => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSites = async () => {
        try {
            const response = await client.get('/user/white-label/sites');
            const data = response.data.data ? response.data.data : response.data;
            setSites(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Error fetching sites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSites();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return COLORS.success;
            case 'pending': return COLORS.warning;
            case 'suspended': return COLORS.error;
            default: return COLORS.gray[400];
        }
    };

    const renderSiteItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.domain}>{item.domain}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Expire le:</Text>
                <Text style={styles.value}>{new Date(item.expiry_date || item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Devise:</Text>
                <Text style={styles.value}>{item.currency}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mes Sites White Label</Text>
                <TouchableOpacity onPress={() => navigation.navigate('WhiteLabelIntro')}>
                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={sites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSiteItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Aucun site configuré.</Text>
                            <TouchableOpacity
                                style={styles.ctaButton}
                                onPress={() => navigation.navigate('WhiteLabelIntro')}
                            >
                                <Text style={styles.ctaText}>Créer mon site</Text>
                            </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    headerTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
    },
    backButton: {
        padding: 4,
    },
    list: {
        padding: SPACING.m,
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
        marginBottom: SPACING.m,
    },
    domain: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        ...FONTS.bold,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    value: {
        color: COLORS.text,
        fontSize: 14,
        ...FONTS.medium,
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
        marginBottom: SPACING.m,
    },
    ctaButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s,
        borderRadius: 8,
    },
    ctaText: {
        color: COLORS.white,
        ...FONTS.bold,
    }
});

export default WhiteLabelScreen;
