import React, { useState } from 'react';
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
    Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '../../utils/serviceHelpers';

const CreateSiteScreen = ({ navigation }) => {
    const [domain, setDomain] = useState('');
    const [currency, setCurrency] = useState('XOF');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded price for now, typically fetched from /plans
    const SITE_PRICE = 25000;

    const handleSubmit = async () => {
        if (!domain || !adminEmail || !adminPassword) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        try {
            await client.post('/user/white-label/purchase', {
                domain_name: domain,
                currency: currency,
                admin_email: adminEmail,
                admin_password: adminPassword,
                plan_id: 1 // Default plan
            });

            Alert.alert(
                "Succès",
                "Votre site a été commandé avec succès. Il sera activé sous peu.",
                [{ text: "Voir mes sites", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.log('Purchase Site Error:', error);
            const msg = error.response?.data?.message || "Erreur lors de la commande du site.";
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
                <Text style={styles.headerTitle}>Nouveau Site</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            Lancez votre propre plateforme SMM en quelques clics.
                            Coût d'activation: <Text style={{ fontWeight: 'bold' }}>{formatCurrency(SITE_PRICE)}</Text>
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Configuration du Domaine</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nom de domaine (sans http)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="mon-site-smm.com"
                            value={domain}
                            onChangeText={setDomain}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Devise du site</Text>
                        <TextInput
                            style={styles.input}
                            value={currency}
                            onChangeText={setCurrency} // Could use a picker here
                            placeholder="XOF, USD, EUR..."
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: SPACING.l }]}>Compte Administrateur</Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Admin</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="admin@mon-site.com"
                            value={adminEmail}
                            onChangeText={setAdminEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mot de passe Admin</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="********"
                            value={adminPassword}
                            onChangeText={setAdminPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Payer & Créer ({formatCurrency(SITE_PRICE)})</Text>
                        )}
                    </TouchableOpacity>
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
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '15',
        padding: SPACING.m,
        borderRadius: 8,
        marginBottom: SPACING.l,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: SPACING.s,
        color: COLORS.text,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.m,
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
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SPACING.l,
        ...SHADOWS.medium,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
    }
});

export default CreateSiteScreen;
