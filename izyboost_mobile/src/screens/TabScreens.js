
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import OrdersScreen from './orders/OrdersScreen';
import ProfileScreen from './profile/ProfileScreen';

const PlaceholderScreen = ({ title }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.subtext}>Bientôt disponible</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary, // Using primary color
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
        color: COLORS.textLight, // Assuming textLight exists in theme
    }
});

export const ServicesScreen = () => <PlaceholderScreen title="Services" />;
// Exporting the actual components now
export { OrdersScreen, ProfileScreen };
