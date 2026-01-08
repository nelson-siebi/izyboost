
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
    Alert,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login, isLoading } = useContext(AuthContext);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

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
            }),
            Animated.spring(logoAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                delay: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!identifier || !password) {
            Alert.alert('Champs requis', 'Veuillez entrer votre identifiant et mot de passe.');
            return;
        }

        // Button Animation
        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true })
        ]).start();

        try {
            await login(identifier, password);
        } catch (error) {
            let msg = 'Vérifiez vos identifiants.';
            if (error.response?.data?.message) msg = error.response.data.message;
            Alert.alert('Échec de connexion', msg);
        }
    };

    const InputField = ({ icon, placeholder, value, onChangeText, isPassword, fieldName }) => {
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
                    autoCapitalize="none"
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setFocusedInput(fieldName)}
                    onBlur={() => setFocusedInput(null)}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={COLORS.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* Decorative Background Elements */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />

                <SafeAreaView style={styles.content}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >

                        {/* Logo & Header */}
                        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ scale: logoAnim }] }]}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require('../../../assets/icon.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.welcomeText}>Bon retour !</Text>
                            <Text style={styles.subtitleText}>Connectez-vous à IzyBoost</Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                            <InputField
                                icon="person-outline"
                                placeholder="Email ou Nom d'utilisateur"
                                value={identifier}
                                onChangeText={setIdentifier}
                                fieldName="identifier"
                            />

                            <View style={{ height: SPACING.m }} />

                            <InputField
                                icon="lock-closed-outline"
                                placeholder="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                                fieldName="password"
                            />

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                            </TouchableOpacity>

                            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.9}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Text style={styles.loginButtonText}>Se Connecter</Text>
                                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Footer / Register Link */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Pas encore de compte ? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.registerLink}>Créer un compte</Text>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>

                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Clean background
    },
    // Decorative circles
    circle1: {
        position: 'absolute',
        top: -height * 0.1,
        left: -width * 0.2,
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        backgroundColor: COLORS.primary + '10', // 10% opacity
    },
    circle2: {
        position: 'absolute',
        top: height * 0.1,
        right: -width * 0.2,
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: COLORS.secondary + '10', // 10% opacity
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.l,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    logo: {
        width: 50,
        height: 50,
    },
    welcomeText: {
        fontSize: 28,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: SPACING.xs,
    },
    subtitleText: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.regular,
    },
    formContainer: {
        width: '100%',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: SPACING.s,
        marginBottom: SPACING.l,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: 14,
        ...FONTS.medium,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    registerLink: {
        color: COLORS.primary,
        fontSize: 14,
        ...FONTS.bold,
    },
});

export default LoginScreen;
