
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const ProfileScreen = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Se déconnecter", onPress: logout, style: "destructive" }
            ]
        );
    };

    const MenuItem = ({ icon, title, onPress, color = COLORS.text }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: color + '10' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.menuTitle, { color }]}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <Text style={styles.username}>{userInfo?.username}</Text>
                    <Text style={styles.email}>{userInfo?.email}</Text>
                </View>

                {/* Balance Card Section */}
                <View style={styles.balanceSection}>
                    <Text style={styles.sectionTitle}>Portefeuille</Text>
                    <View style={styles.balanceCard}>
                        <View>
                            <Text style={styles.balanceLabel}>Solde Actuel</Text>
                            <Text style={styles.balanceValue}>{formatCurrency(userInfo?.balance)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addFundsButton}
                            onPress={() => navigation.navigate('AddFunds')}
                        >
                            <Ionicons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    <MenuItem
                        icon="wallet-outline"
                        title="Recharger mon compte"
                        color={COLORS.primary}
                        onPress={() => navigation.navigate('AddFunds')}
                    />

                    <MenuItem
                        icon="person-outline"
                        title="Modifier mon profil"
                        onPress={() => navigation.navigate('EditProfile')}
                    />

                    <MenuItem
                        icon="people-outline"
                        title="Parrainage"
                        onPress={() => navigation.navigate('Referral')}
                    />

                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        onPress={() => navigation.navigate('Notifications')}
                    />

                    <MenuItem
                        icon="chatbubble-ellipses-outline"
                        title="Support & Aide"
                        onPress={() => navigation.navigate('Tickets')}
                    />

                    <MenuItem
                        icon="code-slash-outline"
                        title="Espace Développeur"
                        onPress={() => navigation.navigate('Developer')}
                    />

                    <MenuItem
                        icon="globe-outline"
                        title="Espace Revendeur"
                        onPress={() => navigation.navigate('WhiteLabel')}
                    />

                    <View style={styles.divider} />

                    <MenuItem
                        icon="log-out-outline"
                        title="Se déconnecter"
                        color={COLORS.error}
                        onPress={handleLogout}
                    />
                </View>

                <Text style={styles.version}>IzyBoost v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    avatarText: {
        fontSize: 32,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    username: {
        fontSize: 20,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.textLight,
        ...FONTS.regular,
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.bold,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceSection: {
        marginBottom: SPACING.xl,
    },
    balanceCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    balanceLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    balanceValue: {
        fontSize: 24,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    addFundsButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    menuSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.m,
        ...SHADOWS.small,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        ...FONTS.medium,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[100],
        marginVertical: SPACING.s,
    },
    version: {
        textAlign: 'center',
        color: COLORS.gray[300],
        marginTop: SPACING.xl,
        fontSize: 12,
    }
});

export default ProfileScreen;
