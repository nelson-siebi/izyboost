
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
    const navigation = useNavigation();

    // Fade-in animations
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const illustrationOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(illustrationOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brandName}>IzyBoost</Text>
                </Animated.View>

                <Animated.View style={[styles.illustrationContainer, { opacity: illustrationOpacity }]}>
                    <Image
                        source={require('../../../assets/adaptive-icon.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    <Text style={styles.title}>Boostez votre présence digitale</Text>
                    <Text style={styles.subtitle}>
                        La solution tout-en-un pour gérer et accroître votre visibilité sur les réseaux sociaux.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>Se Connecter</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>Créer un compte</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: SPACING.l,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: SPACING.s,
    },
    brandName: {
        fontSize: 24,
        color: COLORS.text,
        ...FONTS.bold,
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    illustration: {
        width: width * 0.8,
        height: width * 0.8,
    },
    textContainer: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.s,
        ...FONTS.bold,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 24,
        ...FONTS.regular,
    },
    buttonContainer: {
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: COLORS.gray[100],
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontSize: 16,
        ...FONTS.medium,
    },
});

export default WelcomeScreen;
