import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

const StepItem = ({ icon, title, description, isLast }) => (
    <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={28} color={COLORS.primary} />
        </View>
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepDesc}>{description}</Text>
        </View>
        {!isLast && <View style={styles.connector} />}
    </View>
);

const WhiteLabelIntroScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="globe-outline" size={40} color={COLORS.white} />
                    </View>
                    <Text style={styles.title}>Devenez Revendeur</Text>
                    <Text style={styles.subtitle}>
                        Créez votre propre site de vente de services SMM et commencez à générer des revenus.
                    </Text>
                </View>

                <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>Comment ça marche ?</Text>

                    <StepItem
                        icon="create-outline"
                        title="1. Configurez votre site"
                        description="Choisissez un nom de domaine ou utilisez un sous-domaine gratuit. Personnalisez le nom et la devise."
                    />

                    <StepItem
                        icon="pricetag-outline"
                        title="2. Définissez vos prix"
                        description="Vous accédez à un panel administrateur pour fixer vos marges sur nos services (ex: +30%)."
                    />

                    <StepItem
                        icon="rocket-outline"
                        title="3. Automatisation totale"
                        description="Tout est automatique. Vos clients commandent chez vous, le système traite la commande via IzyBoost."
                        isLast
                    />
                </View>

                <View style={styles.pricingCard}>
                    <Text style={styles.pricingTitle}>Tarifs Simples</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceItem}>
                            <Text style={styles.priceAmount}>3 000 FCFA</Text>
                            <Text style={styles.pricePeriod}>/ mois</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.priceItem}>
                            <Text style={styles.priceAmount}>15 000 FCFA</Text>
                            <Text style={styles.pricePeriod}>/ an</Text>
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>ÉCONOUISEZ</Text>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.domainNote}>
                        +8 000 FCFA (optionnel) pour un nom de domaine personnalisé (.com, .net)
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('CreateSite')}
                >
                    <Text style={styles.startButtonText}>Commencer Maintenant</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        zIndex: 10,
        backgroundColor: COLORS.white,
        padding: 8,
        borderRadius: 20,
        ...SHADOWS.small,
    },
    header: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.white,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        ...SHADOWS.medium,
        marginBottom: SPACING.l,
    },
    headerIcon: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.primary,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 24,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    subtitle: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 14,
        lineHeight: 22,
        paddingHorizontal: SPACING.m,
    },
    stepsSection: {
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.l,
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
        zIndex: 2,
    },
    stepContent: {
        flex: 1,
        paddingTop: 4,
    },
    stepTitle: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
    },
    connector: {
        position: 'absolute',
        top: 50,
        left: 25,
        width: 2,
        height: 30,
        backgroundColor: COLORS.gray[200],
        zIndex: 1,
    },
    pricingCard: {
        margin: SPACING.l,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: SPACING.l,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    pricingTitle: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
        marginBottom: SPACING.m,
        opacity: 0.9,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
    },
    priceItem: {
        alignItems: 'center',
    },
    priceAmount: {
        color: COLORS.white,
        fontSize: 20,
        ...FONTS.bold,
    },
    pricePeriod: {
        color: COLORS.white,
        opacity: 0.8,
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.white,
        opacity: 0.3,
        marginHorizontal: SPACING.xl,
    },
    saveBadge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    saveText: {
        color: COLORS.primary,
        fontSize: 10,
        ...FONTS.bold,
    },
    domainNote: {
        color: COLORS.white,
        opacity: 0.8,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    startButtonText: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
    }
});

export default WhiteLabelIntroScreen;
