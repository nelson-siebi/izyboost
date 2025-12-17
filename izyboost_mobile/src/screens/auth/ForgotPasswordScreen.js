
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Animated,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert("Erreur", "Veuillez entrer votre adresse email.");
            return;
        }

        setLoading(true);
        try {
            await client.post('/forgot-password', { email });
            Alert.alert(
                "Email Envoyé",
                "Si un compte est associé à cette adresse, vous recevrez un lien de réinitialisation.",
                [{ text: "Retour à la connexion", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const msg = error.response?.data?.message || "Une erreur est survenue.";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                {/* Decorative BG */}
                <View style={styles.circle1} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-open-outline" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.title}>Mot de passe oublié ?</Text>
                        <Text style={styles.subtitle}>
                            Entrez votre email pour recevoir les instructions de réinitialisation.
                        </Text>
                    </Animated.View>

                    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'email' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={focusedInput === 'email' ? COLORS.primary : COLORS.gray[400]}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="exemple@email.com"
                                placeholderTextColor={COLORS.gray[400]}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Envoyer le lien</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    circle1: {
        position: 'absolute',
        top: -height * 0.1,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: COLORS.primary + '08',
    },
    content: {
        flex: 1,
        padding: SPACING.l,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginLeft: -8,
        marginBottom: SPACING.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    title: {
        fontSize: 24,
        color: COLORS.text,
        marginBottom: SPACING.s,
        ...FONTS.bold,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.regular,
        textAlign: 'center',
        paddingHorizontal: SPACING.l,
    },
    form: {
        gap: SPACING.m,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        height: 60,
        borderWidth: 1.5,
        borderColor: 'transparent',
        ...SHADOWS.light,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    inputIcon: {
        marginRight: SPACING.s,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        height: '100%',
    },
    button: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
    }
});

export default ForgotPasswordScreen;
