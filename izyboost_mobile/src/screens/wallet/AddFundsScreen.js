
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    Modal
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const { width } = Dimensions.get('window');

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

const AddFundsScreen = ({ navigation }) => {
    // UI States
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [methods, setMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState(null);

    // Polling States
    const [isPolling, setIsPolling] = useState(false);
    const [pollingMessage, setPollingMessage] = useState('');
    const [attempts, setAttempts] = useState(0);

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const pollingInterval = useRef(null);

    const selectedMethodData = methods.find(m => m.id === selectedMethod);

    useEffect(() => {
        fetchMethods();
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, []);

    const fetchMethods = async () => {
        try {
            const response = await client.get('/user/wallet/deposit-methods');
            const data = response.data.data ? response.data.data : response.data;
            if (Array.isArray(data) && data.length > 0) {
                setMethods(data);
                setSelectedMethod(data[0].id);
            }
        } catch (error) {
            console.log('Error fetching methods:', error);
            setMethods([
                { id: 1, name: 'Orange / MTN Money', type: 'mobile_money', code: 'cinetpay' },
                { id: 2, name: 'Cryptomonnaie', type: 'crypto', code: 'usdt_trc20' }
            ]);
            setSelectedMethod(1);
        } finally {
            setLoadingMethods(false);
        }
    };

    const startPolling = (reference) => {
        setIsPolling(true);
        setPollingMessage('Attente de validation sur votre mobile...');
        setAttempts(0);

        const maxAttempts = 20;
        let currentAttempts = 0;

        pollingInterval.current = setInterval(async () => {
            currentAttempts++;
            setAttempts(currentAttempts);

            if (currentAttempts > maxAttempts) {
                stopPolling();
                Alert.alert("Délai expiré", "La confirmation prend du temps. Votre solde sera mis à jour dès réception du paiement.");
                return;
            }

            try {
                const response = await client.get(`/user/wallet/transactions/${reference}/status`);
                const data = response.data;

                if (data.is_completed || data.status === 'completed') {
                    stopPolling();
                    Alert.alert("Succès !", "Votre compte a été rechargé. Profitez de nos services !");
                    navigation.navigate('Home');
                } else if (['failed', 'declined', 'expired'].includes(data.status)) {
                    stopPolling();
                    Alert.alert("Échec du paiement", "La transaction a été annulée ou a échoué.");
                } else {
                    setPollingMessage(`Vérification en cours... (${currentAttempts}/${maxAttempts})`);
                }
            } catch (error) {
                console.log('Polling error:', error);
            }
        }, 6000);
    };

    const stopPolling = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        setIsPolling(false);
    };

    const handleDeposit = async () => {
        if (!amount || isNaN(amount) || Number(amount) < 100) {
            Alert.alert("Montant invalide", "Le montant minimum est de 100 FCFA.");
            return;
        }

        if (selectedMethodData?.type === 'mobile_money' && !phone) {
            Alert.alert("Numéro requis", "Veuillez saisir votre numéro Mobile Money.");
            return;
        }

        setLoading(true);
        try {
            const response = await client.post('/user/wallet/deposit', {
                amount: Number(amount),
                payment_method_id: selectedMethod,
                phone: phone
            });

            const result = response.data;
            const ref = result.reference || result.transaction?.gateway_transaction_id || result.data?.reference;

            if (ref) {
                // Utiliser le message du serveur s'il est présent, sinon message par défaut
                const msg = result.message || result.instructions || 'Attente de validation sur votre mobile...';
                setPollingMessage(msg);
                startPolling(ref);

                const url = result.payment_url || result.url || result.checkout_url || result.data?.payment_url;
                if (url) {
                    await Linking.openURL(url);
                }
            } else {
                const url = result.payment_url || result.url || result.checkout_url;
                if (url) {
                    await Linking.openURL(url);
                    Alert.alert("Paiement initié", "Veuillez terminer votre paiement dans le navigateur.");
                } else {
                    Alert.alert("Information", result.message || "Demande de dépôt enregistrée.");
                }
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Erreur de connexion au serveur.";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recharger</Text>
            <View style={{ width: 44 }} />
        </View>
    );

    const renderQuickAmounts = () => (
        <View style={styles.quickAmountsContainer}>
            {PRESET_AMOUNTS.map((val) => (
                <TouchableOpacity
                    key={val}
                    style={[styles.quickAmountBtn, amount === val.toString() && styles.quickAmountBtnActive]}
                    onPress={() => setAmount(val.toString())}
                >
                    <Text style={[styles.quickAmountText, amount === val.toString() && styles.quickAmountTextActive]}>
                        {val.toLocaleString()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPollingUI = () => (
        <Modal
            visible={isPolling}
            transparent={true}
            animationType="slide"
            onRequestClose={() => stopPolling()}
        >
            <View style={styles.pollingOverlay}>
                <View style={styles.pollingCard}>
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>

                    <Text style={styles.pollingTitle}>Traitement en cours</Text>
                    <Text style={styles.pollingSub}>{pollingMessage}</Text>

                    {/* Instructions USSD Cameroon */}
                    <View style={styles.instructionBox}>
                        <Ionicons name="phone-portrait-outline" size={20} color={COLORS.secondary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.instructionTitle}>Instruction sur votre mobile :</Text>
                            <Text style={styles.instructionText}>
                                Si vous ne recevez pas de notification, composez :{"\n"}
                                <Text style={{ ...FONTS.bold, color: COLORS.secondary }}>*126#</Text> (Orange ou MTN)
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
                        <Text style={styles.infoBadgeText}>Transaction protégée par NelsiusPay</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.cancelLink}
                        onPress={() => {
                            Alert.alert(
                                "Arrêter le suivi ?",
                                "Si vous avez payé, votre recharge sera validée dès réception de la confirmation du réseau. Quitter maintenant ?",
                                [
                                    { text: "Rester", style: "cancel" },
                                    { text: "Oui, Quitter", onPress: () => { stopPolling(); navigation.goBack(); } }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.cancelLinkText}>Retourner à l'accueil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {renderHeader()}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Montant du dépôt</Text>
                        <View style={styles.amountInputWrapper}>
                            <Text style={styles.currencyPrefix}>FCFA</Text>
                            <TextInput
                                style={styles.mainInput}
                                placeholder="0"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                placeholderTextColor={COLORS.gray[300]}
                            />
                        </View>
                        {renderQuickAmounts()}
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Moyen de paiement</Text>
                        {loadingMethods ? (
                            <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
                        ) : (
                            methods.map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[styles.methodItem, selectedMethod === method.id && styles.methodItemActive]}
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View style={[styles.methodIcon, { backgroundColor: selectedMethod === method.id ? COLORS.primary + '15' : COLORS.gray[100] }]}>
                                        <Ionicons
                                            name={method.type === 'mobile_money' ? "phone-portrait-outline" : "logo-bitcoin"}
                                            size={22}
                                            color={selectedMethod === method.id ? COLORS.primary : COLORS.gray[500]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.methodName, selectedMethod === method.id && styles.methodNameActive]}>
                                            {method.name}
                                        </Text>
                                        <Text style={styles.methodTag}>{method.type === 'mobile_money' ? 'Paiement Instantané' : 'Vérification Manuelle'}</Text>
                                    </View>
                                    <View style={styles.radioCircle}>
                                        {selectedMethod === method.id && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    {selectedMethodData?.type === 'mobile_money' && (
                        <Animated.View style={styles.card}>
                            <Text style={styles.sectionTitle}>Votre numéro de téléphone</Text>
                            <View style={styles.phoneInputRow}>
                                <View style={styles.prefixBox}>
                                    <Text style={styles.prefixText}>+237</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="6xx xxx xxx"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                    maxLength={9}
                                />
                            </View>
                            <Text style={styles.hintText}>Saisissez le numéro qui sera débité.</Text>
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={[styles.payButton, (loading || !amount) && styles.payButtonDisabled]}
                        onPress={handleDeposit}
                        disabled={loading || !amount}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>Continuer</Text>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {renderPollingUI()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.text,
    },
    scrollContent: {
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.xl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING.l,
        marginTop: SPACING.m,
        ...SHADOWS.light,
    },
    sectionTitle: {
        fontSize: 15,
        ...FONTS.medium,
        color: COLORS.textLight,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    amountInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary + '30',
        paddingBottom: SPACING.xs,
    },
    currencyPrefix: {
        fontSize: 24,
        ...FONTS.bold,
        color: COLORS.gray[400],
        marginRight: SPACING.s,
    },
    mainInput: {
        flex: 1,
        fontSize: 36,
        ...FONTS.bold,
        color: COLORS.primary,
        padding: 0,
    },
    quickAmountsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.l,
        marginHorizontal: -SPACING.xs,
    },
    quickAmountBtn: {
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: 10,
        backgroundColor: COLORS.gray[100],
        margin: SPACING.xs,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    quickAmountBtnActive: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    quickAmountText: {
        fontSize: 14,
        ...FONTS.medium,
        color: COLORS.text,
    },
    quickAmountTextActive: {
        color: COLORS.primary,
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.gray[100],
        marginBottom: SPACING.s,
    },
    methodItemActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    methodIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    methodName: {
        fontSize: 16,
        ...FONTS.medium,
        color: COLORS.text,
    },
    methodNameActive: {
        color: COLORS.primary,
    },
    methodTag: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    prefixBox: {
        paddingHorizontal: SPACING.m,
        borderRightWidth: 1,
        borderRightColor: COLORS.gray[200],
    },
    prefixText: {
        fontSize: 16,
        ...FONTS.bold,
        color: COLORS.text,
    },
    phoneInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: SPACING.m,
        fontSize: 18,
        letterSpacing: 2,
        ...FONTS.medium,
        color: COLORS.text,
    },
    hintText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: SPACING.s,
    },
    payButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        ...SHADOWS.medium,
    },
    payButtonDisabled: {
        opacity: 0.6,
        backgroundColor: COLORS.gray[400],
    },
    payButtonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
        marginRight: SPACING.s,
    },
    pollingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fond semi-transparent sombre pour voir l'app par-derrière
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pollingCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...SHADOWS.medium,
        position: 'relative', // Pour positionner la croix de fermeture
    },
    closeModalIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    loaderContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    pollingTitle: {
        fontSize: 22,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    pollingSub: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    instructionBox: {
        width: '100%',
        backgroundColor: COLORS.accent + '10',
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.accent + '30',
        marginBottom: 24,
    },
    instructionTitle: {
        fontSize: 14,
        ...FONTS.bold,
        color: COLORS.accent,
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    instructionText: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
        textAlign: 'center',
        ...FONTS.medium,
    },
    highlightCode: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.accent,
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success + '10',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 20,
    },
    infoBadgeText: {
        fontSize: 13,
        ...FONTS.medium,
        color: COLORS.success,
        marginLeft: 6,
    },
    cancelLink: {
        padding: SPACING.m,
    },
    cancelLinkText: {
        fontSize: 15,
        color: COLORS.error,
        ...FONTS.medium,
    }
});

export default AddFundsScreen;
