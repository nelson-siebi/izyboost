
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import { formatCurrency } from '../utils/serviceHelpers';

const BalanceCard = ({ balance, username, onAddFunds, onNavigate }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => onNavigate('Transactions')}>
                    <Text style={styles.label}>Solde disponible (Historique)</Text>
                    <Text style={styles.balance}>{formatCurrency(balance)}</Text>
                    <Text style={styles.username}>@{username}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton} onPress={onAddFunds}>
                    <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Decorative circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: SPACING.l,
        overflow: 'hidden',
        position: 'relative',
        height: 140,
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        ...FONTS.medium,
        marginBottom: 4,
    },
    balance: {
        color: COLORS.white,
        fontSize: 32,
        ...FONTS.bold,
        marginBottom: 4,
    },
    username: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        ...FONTS.medium,
    },
    addButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.white,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    circle1: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    circle2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
});

export default BalanceCard;
