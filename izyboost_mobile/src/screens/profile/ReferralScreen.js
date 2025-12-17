import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Clipboard,
    ActivityIndicator,
    Alert,
    Share
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const ReferralScreen = () => {
    const [stats, setStats] = useState(null);
    const [referralLink, setReferralLink] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, linkRes] = await Promise.all([
                client.get('/user/referrals/stats'),
                client.get('/user/referrals/link')
            ]);
            setStats(statsRes.data);
            setReferralLink(linkRes.data.link || linkRes.data);
        } catch (error) {
            console.log('Referral fetch error:', error);
            // Fallback for demo if API not ready
            setReferralLink('https://izyboost.com/ref/user123');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const copyToClipboard = () => {
        Clipboard.setString(referralLink);
        Alert.alert('Copié', 'Lien de parrainage copié dans le presse-papier.');
    };

    const shareLink = async () => {
        try {
            await Share.share({
                message: `Rejoins IzyBoost avec mon lien de parrainage : ${referralLink}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header Card */}
                <View style={styles.headerCard}>
                    <Text style={styles.headerTitle}>Programme de Parrainage</Text>
                    <Text style={styles.headerSubtitle}>Gagnez de l'argent en invitant vos amis</Text>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
                        <View style={styles.linkActions}>
                            <TouchableOpacity onPress={copyToClipboard} style={styles.iconButton}>
                                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={shareLink} style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{stats?.total_referrals || 0}</Text>
                                <Text style={styles.statLabel}>Filleuls</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="cash-outline" size={24} color={COLORS.success} />
                                <Text style={styles.statValue}>{formatCurrency(stats?.total_earnings || 0)}</Text>
                                <Text style={styles.statLabel}>Gains Totaux</Text>
                            </View>
                        </View>

                        {/* Info Section */}
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}><Text style={styles.stepText}>1</Text></View>
                                <Text style={styles.stepDesc}>Partagez votre lien unique.</Text>
                            </View>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}><Text style={styles.stepText}>2</Text></View>
                                <Text style={styles.stepDesc}>Vos amis s'inscrivent et commandent.</Text>
                            </View>
                            <View style={styles.step}>
                                <View style={styles.stepNumber}><Text style={styles.stepText}>3</Text></View>
                                <Text style={styles.stepDesc}>Vous recevez une commission sur chaque dépôt.</Text>
                            </View>
                        </View>
                    </>
                )}
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
        padding: SPACING.m,
    },
    headerCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        alignItems: 'center',
        ...SHADOWS.medium,
        marginBottom: SPACING.l,
    },
    headerTitle: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    linkContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray[100],
        borderRadius: 12,
        padding: SPACING.s,
        alignItems: 'center',
        width: '100%',
    },
    linkText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        marginHorizontal: SPACING.s,
    },
    linkActions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        alignItems: 'center',
        marginHorizontal: 4,
        ...SHADOWS.small,
    },
    statValue: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.text,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    infoSection: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.l,
        ...SHADOWS.small,
    },
    sectionTitle: {
        fontSize: 16,
        ...FONTS.bold,
        marginBottom: SPACING.m,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    stepText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    stepDesc: {
        fontSize: 14,
        color: COLORS.text,
    }
});

export default ReferralScreen;
