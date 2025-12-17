
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
    Linking
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const AddFundsScreen = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [methods, setMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState(null);

    useEffect(() => {
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            // GET /api/wallet/deposit-methods
            const response = await client.get('/wallet/deposit-methods');
            const data = response.data.data ? response.data.data : response.data;
            if (Array.isArray(data) && data.length > 0) {
                setMethods(data);
                setSelectedMethod(data[0].id);
            }
        } catch (error) {
            console.log('Error fetching methods:', error);
            // Fallback methods if API fails or is empty for dev
            setMethods([
                { id: 1, name: 'Mobile Money / Carte (CinetPay)', type: 'automatic' },
                { id: 2, name: 'Cryptomonnaie', type: 'manual' }
            ]);
            setSelectedMethod(1);
        } finally {
            setLoadingMethods(false);
        }
    };

    const handleDeposit = async () => {
        if (!amount || isNaN(amount) || Number(amount) < 100) {
            Alert.alert("Erreur", "Le montant minimum est de 100.");
            return;
        }
        if (!selectedMethod) {
            Alert.alert("Erreur", "Veuillez choisir une méthode.");
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/wallet/deposit', {
                amount: Number(amount),
                payment_method_id: selectedMethod
            });

            // Handle Response based on backend logic
            // Scenario A: Backend returns a URL to redirect (CinetPay, Stripe, etc.)
            // Scenario B: Backend returns textual instructions (Manual)

            const result = response.data;

            if (result.payment_url || result.url) {
                // Open URL in browser
                const url = result.payment_url || result.url;
                await Linking.openURL(url);
                Alert.alert("Paiement initié", "Veuillez finaliser le paiement dans votre navigateur.");
            } else if (result.instructions || result.message) {
                Alert.alert("Instructions", result.instructions || result.message);
            } else {
                Alert.alert("Succès", "Demande de dépôt initiée.");
                navigation.goBack();
            }

        } catch (error) {
            console.log('Deposit error:', error);
            const msg = error.response?.data?.message || "Une erreur est survenue.";
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
                <Text style={styles.headerTitle}>Recharger mon compte</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {loadingMethods ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <Text style={styles.label}>Montant à recharger</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 5000"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                autoFocus
                            />
                            {/* Currency symbol could be dynamic based on user currency */}
                            <Text style={styles.currency}>FCFA</Text>
                        </View>

                        <Text style={styles.label}>Moyen de paiement</Text>
                        {methods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.methodCard,
                                    selectedMethod === method.id && styles.selectedCard
                                ]}
                                onPress={() => setSelectedMethod(method.id)}
                            >
                                <View style={styles.methodIcon}>
                                    <Ionicons
                                        name={method.name.toLowerCase().includes('crypto') ? 'logo-bitcoin' : 'card-outline'}
                                        size={24}
                                        color={COLORS.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.methodName}>{method.name}</Text>
                                    {method.type === 'manual' && (
                                        <Text style={styles.methodType}>Manuel (Vérification requise)</Text>
                                    )}
                                </View>
                                {selectedMethod === method.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleDeposit}
                            disabled={loading || !selectedMethod}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>Payer {amount ? `${amount}` : ''}</Text>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.note}>
                            En cliquant sur Payer, vous serez redirigé vers la page de paiement sécurisée ou recevrez les instructions.
                        </Text>
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
    headerTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
    },
    content: {
        padding: SPACING.l,
    },
    label: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: SPACING.m,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        ...SHADOWS.small,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.primary,
    },
    currency: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.medium,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
    },
    selectedCard: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    methodIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    methodName: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.medium,
    },
    methodType: {
        fontSize: 12,
        color: COLORS.warning,
        marginTop: 2,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
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
        fontSize: 18,
        ...FONTS.bold,
    },
    note: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 12,
        marginTop: SPACING.xl,
        marginHorizontal: SPACING.l,
    }
});

export default AddFundsScreen;
