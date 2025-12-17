
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const { register, isLoading } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [sponsorCode, setSponsorCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
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

    const handleRegister = async () => {
        if (!username || !email || !password || !passwordConfirm) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (password !== passwordConfirm) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await register(username, email, password, passwordConfirm, sponsorCode);
        } catch (error) {
            let msg = 'Une erreur est survenue';
            if (error.response?.data?.message) msg = error.response.data.message;
            else if (error.message) msg = error.message;
            Alert.alert('Erreur d\'inscription', msg);
        }
    };

    const InputField = ({ icon, placeholder, value, onChangeText, isPassword, fieldName, secureTextEntry, toggleSecure, keyboardType, autoCapitalize }) => {
        const isFocused = focusedInput === fieldName;
        return (
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused
            ]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.gray[400]}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray[400]}
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize={autoCapitalize || "none"}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    onFocus={() => setFocusedInput(fieldName)}
                    onBlur={() => setFocusedInput(null)}
                />
                {isPassword && (
                    <TouchableOpacity onPress={toggleSecure}>
                        <Ionicons
                            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={COLORS.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Decorative BG */}
            <View style={styles.circle1} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>

                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.title}>Créer un compte</Text>
                        <Text style={styles.subtitle}>Commencez votre aventure IzyBoost</Text>
                    </Animated.View>

                    <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        <InputField
                            icon="person-outline"
                            placeholder="Nom d'utilisateur"
                            value={username}
                            onChangeText={setUsername}
                            fieldName="username"
                        />

                        <InputField
                            icon="mail-outline"
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            fieldName="email"
                            keyboardType="email-address"
                        />

                        <InputField
                            icon="lock-closed-outline"
                            placeholder="Mot de passe (Min. 8 caractères)"
                            value={password}
                            onChangeText={setPassword}
                            fieldName="password"
                            isPassword
                            secureTextEntry={!showPassword}
                            toggleSecure={() => setShowPassword(!showPassword)}
                        />

                        <InputField
                            icon="lock-closed-outline"
                            placeholder="Confirmer le mot de passe"
                            value={passwordConfirm}
                            onChangeText={setPasswordConfirm}
                            fieldName="passwordConfirm"
                            isPassword
                            secureTextEntry={!showConfirm}
                            toggleSecure={() => setShowConfirm(!showConfirm)}
                        />

                        <InputField
                            icon="gift-outline"
                            placeholder="Code parrain (Optionnel)"
                            value={sponsorCode}
                            onChangeText={setSponsorCode}
                            fieldName="sponsorCode"
                            autoCapitalize="characters"
                        />

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.registerButtonText}>S'inscrire</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Déjà un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Se Connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
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
    circle1: {
        position: 'absolute',
        top: -height * 0.15,
        right: -width * 0.25,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: COLORS.primary + '08',
    },
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginLeft: -8,
        marginBottom: SPACING.m,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 32,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        ...FONTS.bold,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.regular,
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
    registerButton: {
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
    registerButtonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 14,
        ...FONTS.bold,
    }
});

export default RegisterScreen;
