
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';
import BalanceCard from '../components/BalanceCard';
import PlatformCard from '../components/PlatformCard';
import { groupCategoriesByPlatform } from '../utils/serviceHelpers';

const HomeScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState(userInfo);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Services - Independent Block
            try {
                const servicesRes = await client.get('/services');
                const grouped = groupCategoriesByPlatform(servicesRes.data);
                setPlatforms(grouped);
            } catch (serviceError) {
                console.log('Service fetch error:', serviceError);
            }

            // Fetch User Data - Independent Block
            try {
                const userRes = await client.get('/user/me');
                setUserData(userRes.data);
            } catch (userError) {
                console.log('User fetch error:', userError);
            }

        } catch (error) {
            console.log('General Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handlePlatformPress = (platform) => {
        navigation.navigate('PlatformDetails', { platform });
    };

    const handleAddFunds = () => {
        navigation.navigate('AddFunds');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

            {/* Fixed Header Section */}
            <View style={styles.fixedHeader}>
                <View style={styles.headerTop}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>IzyBoost</Text>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userData?.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                </View>

                {/* Static Balance Card */}
                <View style={styles.balanceContainer}>
                    <BalanceCard
                        balance={userData?.balance}
                        username={userData?.username}
                        onAddFunds={handleAddFunds}
                        onNavigate={navigation.navigate}
                    />
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                <Text style={styles.sectionTitle}>Catalogue</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {platforms.length > 0 ? (
                            platforms.map((platform, index) => (
                                <PlatformCard
                                    key={platform.key}
                                    platform={platform}
                                    index={index}
                                    onPress={() => handlePlatformPress(platform)}
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Aucun service disponible pour le moment.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background || '#F8F9FA',
    },
    fixedHeader: {
        backgroundColor: COLORS.background, // Match container background or make it white if desired
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.s,
        zIndex: 10, // Ensure it stays on top visually if shadows overlap
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 32,
        height: 32,
        marginRight: SPACING.s,
    },
    appName: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.text,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    balanceContainer: {
        marginBottom: SPACING.s,
    },
    scrollContent: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.s,
        paddingBottom: 100, // Space for bottom tab
    },
    sectionTitle: {
        fontSize: 18,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: SPACING.m,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        marginTop: SPACING.xl,
        width: '100%',
    }
});

export default HomeScreen;
