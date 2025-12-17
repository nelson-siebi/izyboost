import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await client.get('/user/notifications');
            const data = response.data.data ? response.data.data : response.data;
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await client.post(`/user/notifications/${id}/read`);
            // Update local state to show read status (optional, if visual change needed)
            fetchNotifications();
        } catch (error) {
            console.log('Mark read error:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, !item.read_at && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={!item.read_at ? COLORS.primary : COLORS.gray[400]}
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.read_at && styles.unreadTitle]}>
                    {item.data?.title || 'Notification'}
                </Text>
                <Text style={styles.message}>
                    {item.data?.message || item.data?.content || JSON.stringify(item.data)}
                </Text>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Aucune notification.</Text>
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
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        marginRight: SPACING.m,
        width: 40,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.medium,
        marginBottom: 4,
    },
    unreadTitle: {
        ...FONTS.bold,
        color: COLORS.primary,
    },
    message: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: COLORS.gray[300],
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 16,
    }
});

export default NotificationsScreen;
