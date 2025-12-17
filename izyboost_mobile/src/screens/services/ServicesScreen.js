import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const ServicesScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await client.get('/services');
            // Expected structure: List of services with category_id or grouped object
            // Let's assume the API returns a flat list of services, or categories with services.
            // Based on typical SMM APIs: often a flat list properly ordered.
            // Or response.data might be [{ name: "Category 1", services: [...] }]

            const data = response.data.data ? response.data.data : response.data;

            // If data is flat list, we need to group. If it's already grouped, great.
            // Let's assume it's a flat list of Services which have a 'category' string or object.
            // But usually for /services public endpoint, it might be a list of Service objects.

            // ADAPTATION: We'll organize logic based on inspection of data in console or assumption
            // Logic: Group by category name.

            const grouped = {};
            if (Array.isArray(data)) {
                data.forEach(service => {
                    const catName = service.category || service.category_name || "Autres";
                    if (!grouped[catName]) {
                        grouped[catName] = [];
                    }
                    grouped[catName].push(service);
                });
            }

            // Convert to array for FlatList
            const groupArray = Object.keys(grouped).map(key => ({
                name: key,
                services: grouped[key]
            }));

            setCategories(groupArray);
        } catch (error) {
            console.log('Error fetching services:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const handleServicePress = (service, categoryName) => {
        // Navigate to Order Screen, passing the service details
        // We might want to pass the WHOLE category if ServiceOrderScreen expects it (as seen in previous file view)
        // Previous view of ServiceOrderScreen: const { service } = route.params; (where service seemed to be the category or parent)
        // Wait, ServiceOrderScreen lines: 
        // const ServiceOrderScreen = ({ route, navigation }) => {
        //    const { service } = route.params; // This is the Category (e.g. Tiktok Vues) containing .services[] list
        //    const [selectedService, setSelectedService] = useState(service.services?.[0] || null);

        // It seems ServiceOrderScreen expects a "Category" object with a .services array.
        // So we should pass the category object.

        // But if user clicks a SPECIFIC service in this list, we want to pre-select it.
        // I might need to update ServiceOrderScreen to accept a pre-selected service ID.

        // For now, let's construct a "Category-like" object that simply has this one service, OR pass the real category.

        // Better: Pass the category object `item` (from renderCategory) and maybe an `initialServiceId`.
        // But renderCategory item matches the structure expected by ServiceOrder.

        navigation.navigate('ServiceOrder', { service: { name: categoryName, services: [service] } });
    };

    const filteredCategories = categories.map(cat => {
        // Filter services inside category
        const filteredServices = cat.services.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toString().includes(searchQuery)
        );
        return { ...cat, services: filteredServices };
    }).filter(cat => cat.services.length > 0);

    const toggleCategory = (name) => {
        if (expandedCategory === name) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(name);
        }
    };

    const renderServiceItem = (service, categoryName) => (
        <TouchableOpacity
            key={service.id}
            style={styles.serviceItem}
            onPress={() => handleServicePress(service, categoryName)}
        >
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceMeta}>
                    <Text style={styles.serviceId}>ID: {service.id}</Text>
                    <Text style={styles.serviceRate}>{formatCurrency(service.rate)} / 1000</Text>
                </View>
                <View style={styles.limits}>
                    <Text style={styles.limitText}>Min: {service.min_quantity}</Text>
                    <Text style={styles.limitText}>Max: {service.max_quantity}</Text>
                </View>
            </View>
            <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    );

    const renderCategory = ({ item }) => {
        const isExpanded = expandedCategory === item.name || searchQuery.length > 0;

        return (
            <View style={styles.categoryCard}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(item.name)}
                >
                    <Text style={styles.categoryTitle}>{item.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.services.length}</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.textLight}
                        style={{ marginLeft: 'auto' }}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.servicesList}>
                        {item.services.map(service => renderServiceItem(service, item.name))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Services</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Chercher un service..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.gray[400]}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => item.name}
                    renderItem={renderCategory}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Aucun service trouvé.</Text>
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
    headerTitle: {
        fontSize: 24,
        ...FONTS.bold,
        color: COLORS.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: SPACING.m,
        paddingHorizontal: SPACING.m,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        height: '100%',
    },
    list: {
        padding: SPACING.m,
        paddingTop: 0,
        paddingBottom: 80,
    },
    categoryCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        overflow: 'hidden',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
    },
    categoryTitle: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
        flex: 1,
    },
    badge: {
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginHorizontal: 8,
    },
    badgeText: {
        fontSize: 12,
        color: COLORS.textLight,
        ...FONTS.medium,
    },
    servicesList: {
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[50],
    },
    serviceInfo: {
        flex: 1,
        marginRight: SPACING.m,
    },
    serviceName: {
        fontSize: 14,
        color: COLORS.text,
        ...FONTS.medium,
        marginBottom: 4,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    serviceId: {
        fontSize: 10,
        color: COLORS.textLight,
        marginRight: 8,
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    serviceRate: {
        fontSize: 14,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    limits: {
        flexDirection: 'row',
    },
    limitText: {
        fontSize: 10,
        color: COLORS.textLight,
        marginRight: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: COLORS.textLight,
        fontSize: 16,
    }
});

export default ServicesScreen;
