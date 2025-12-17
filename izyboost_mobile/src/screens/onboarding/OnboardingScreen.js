
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Boostez votre Visibilité',
        description: 'Augmentez votre présence sur les réseaux sociaux avec nos outils puissants et automatisés.',
        image: require('../../../assets/adaptive-icon.png'),
    },
    {
        id: '2',
        title: 'Analyses en Temps Réel',
        description: 'Suivez vos performances et optimisez vos stratégies avec des statistiques détaillées.',
        image: require('../../../assets/icon.png'),
    },
    {
        id: '3',
        title: 'Gestion Simplifiée',
        description: 'Gérez tous vos comptes et commandes depuis une seule application intuitive.',
        image: require('../../../assets/splash-icon.png'),
    }
];

const OnboardingScreen = ({ navigation, route }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { onComplete } = route.params || {};

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true
            });
        } else {
            if (onComplete) onComplete();
        }
    };

    const handleSkip = () => {
        if (onComplete) onComplete();
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.slide}>
                <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                </Animated.View>
                <View style={styles.textContainer}>
                    <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
                        {item.title}
                    </Animated.Text>
                    <Animated.Text style={[styles.description, { opacity: fadeAnim }]}>
                        {item.description}
                    </Animated.Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Passer</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: currentIndex === index ? COLORS.primary : COLORS.gray[300],
                                    width: currentIndex === index ? 20 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? "Commencer" : "Suivant"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        padding: SPACING.m,
        alignItems: 'flex-end',
    },
    skipText: {
        color: COLORS.gray[500],
        fontSize: 16,
        ...FONTS.medium,
    },
    slide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
    },
    imageContainer: {
        height: height * 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width * 0.8,
        height: width * 0.8,
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.m,
        ...FONTS.bold,
    },
    description: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
        lineHeight: 24,
        ...FONTS.regular,
    },
    footer: {
        padding: SPACING.l,
        paddingBottom: SPACING.xxl,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.l,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
    }
});

export default OnboardingScreen;
