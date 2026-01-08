import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Switch
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const CreateSiteScreen = ({ navigation }) => {
    // Form State
    const [domain, setDomain] = useState('');
    const [siteName, setSiteName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Config State
    const [interval, setInterval] = useState('monthly'); // 'monthly' or 'yearly'
    const [hasCustomDomain, setHasCustomDomain] = useState(false);
    const [customDomainName, setCustomDomainName] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);

    // Pricing Constants
    const PRICES = {
        monthly: 3000,
        yearly: 15000,
        customDomain: 8000
    };

    const calculateTotal = () => {
        let total = PRICES[interval];
        if (hasCustomDomain) {
            total += PRICES.customDomain;
        }
        return total;
    };

    const handleSubmit = async () => {
        if (!domain || !siteName) {
            Alert.alert("Erreur", "Veuillez remplir le nom du site et le sous-domaine.");
            return;
        }

        if (hasCustomDomain && !customDomainName) {
            Alert.alert("Erreur", "Veuillez entrer le nom de domaine personnalisé souhaité.");
            return;
        }

        setLoading(true);
        try {
            await client.post('/user/white-label/purchase', {
                site_name: siteName,
                subdomain: domain,
                interval: interval,
                custom_domain: hasCustomDomain,
                domain_name: hasCustomDomain ? customDomainName : null,
                template_id: 1, // Default template
                // Admin credentials not actually used in this endpoint v1
                // but good to collect if backend requires it. Not in updated controller though.
            });

            Alert.alert(
                "Succès !",
                "Votre site est en cours de création. Vous recevrez les accès par email.",
                [{ text: "Voir mes sites", onPress: () => navigation.popToTop() }] // Go back to root (WhiteLabelScreen)
            );
        } catch (error) {
            console.log('Purchase Site Error:', error);
            const msg = error.response?.data?.message ||
                (error.response?.data?.errors ? Object.values(error.response.data.errors)[0][0] : "Erreur inconnue");
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuration du Site</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Plan Selection */}
                    <Text style={styles.sectionTitle}>1. Choisissez votre forfait</Text>
                    <View style={styles.planSelector}>
                        <TouchableOpacity
                            style={[styles.planOption, interval === 'monthly' && styles.selectedPlan]}
                            onPress={() => setInterval('monthly')}
                        >
                            <Text style={[styles.planName, interval === 'monthly' && styles.selectedText]}>Mensuel</Text>
                            <Text style={[styles.planPrice, interval === 'monthly' && styles.selectedText]}>{formatCurrency(PRICES.monthly)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.planOption, interval === 'yearly' && styles.selectedPlan]}
                            onPress={() => setInterval('yearly')}
                        >
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>PROMO</Text>
                            </View>
                            <Text style={[styles.planName, interval === 'yearly' && styles.selectedText]}>Annuel</Text>
                            <Text style={[styles.planPrice, interval === 'yearly' && styles.selectedText]}>{formatCurrency(PRICES.yearly)}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Site Info */}
                    <Text style={[styles.sectionTitle, { marginTop: SPACING.l }]}>2. Informations du Site</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nom du site</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Super Boost"
                            value={siteName}
                            onChangeText={setSiteName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Sous-domaine IzyBoost (Gratuit)</Text>
                        <View style={styles.domainInputContainer}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                placeholder="mon-site"
                                value={domain}
                                onChangeText={setDomain}
                                autoCapitalize="none"
                            />
                            <View style={styles.domainSuffix}>
                                <Text style={styles.domainSuffixText}>.izyboost.com</Text>
                            </View>
                        </View>
                    </View>

                    {/* Custom Domain Option */}
                    <View style={styles.optionCard}>
                        <View style={styles.optionHeader}>
                            <View>
                                <Text style={styles.optionTitle}>Nom de domaine personnalisé</Text>
                                <Text style={styles.optionPrice}>+ {formatCurrency(PRICES.customDomain)}</Text>
                            </View>
                            <Switch
                                value={hasCustomDomain}
                                onValueChange={setHasCustomDomain}
                                trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
                            />
                        </View>

                        {hasCustomDomain && (
                            <View style={styles.customDomainInput}>
                                <Text style={styles.label}>Votre nom de domaine souhaité</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="exemple.com"
                                    value={customDomainName}
                                    onChangeText={setCustomDomainName}
                                    autoCapitalize="none"
                                />
                                <Text style={styles.helperText}>Nous nous occuperons de l'achat et de la configuration.</Text>
                            </View>
                        )}
                    </View>

                    {/* Total & Submit */}
                    <View style={styles.totalContainer}>
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Total à payer :</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirmer et Payer</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
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
    content: {
        padding: SPACING.l,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    planSelector: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    planOption: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray[200],
        alignItems: 'center',
        position: 'relative',
    },
    selectedPlan: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    planName: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
    },
    selectedText: {
        color: COLORS.primary,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: 10,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        ...FONTS.bold,
    },
    formGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderRadius: 8,
        padding: SPACING.m,
        fontSize: 16,
    },
    domainInputContainer: {
        flexDirection: 'row',
    },
    domainSuffix: {
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderLeftWidth: 0,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    domainSuffixText: {
        color: COLORS.textLight,
        fontWeight: 'bold',
    },
    optionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginTop: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 14,
        ...FONTS.bold,
        color: COLORS.text,
    },
    optionPrice: {
        fontSize: 14,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    customDomainInput: {
        marginTop: SPACING.m,
        paddingTop: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 4,
        fontStyle: 'italic',
    },
    totalContainer: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.text,
    },
    totalAmount: {
        fontSize: 24,
        ...FONTS.bold,
        color: COLORS.primary,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
    },
    disabledButton: {
        opacity: 0.7,
    }
});

export default CreateSiteScreen;
