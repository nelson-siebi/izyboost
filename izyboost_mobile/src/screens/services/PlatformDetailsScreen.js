
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme';
import { formatCurrency } from '../../utils/serviceHelpers';

const PlatformDetailsScreen = ({ route, navigation }) => {
    const { platform } = route.params;

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => navigation.navigate('ServiceOrder', { service: item })}
        >
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>
                    À partir de {formatCurrency(item.services?.[0]?.rate / 1000)} / 1000
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray[400]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{platform.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={platform.subCategories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderServiceItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Aucun service trouvé pour cette catégorie.</Text>
                }
            />
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
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.m,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    serviceInfo: {
        flex: 1,
        marginRight: SPACING.m,
    },
    serviceName: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.medium,
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 14,
        color: COLORS.primary,
        ...FONTS.regular,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: SPACING.xl,
        ...FONTS.medium,
    }
});

export default PlatformDetailsScreen;
