
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (SPACING.l * 2) - SPACING.m) / 2; // 2 columns with padding

const PlatformCard = ({ platform, onPress, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
                delay: index * 50 // Stagger effect
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                delay: index * 50
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: platform.bgColor || COLORS.white }]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: COLORS.white }]}>
                    <Ionicons name={platform.icon} size={32} color={platform.color} />
                </View>

                <Text style={styles.name}>{platform.name === 'X' ? 'Twitter/X' : platform.name}</Text>

                <Text style={styles.count}>
                    {platform.totalServices > 0 ? `${platform.totalServices} Services` : 'Disponible'}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        padding: SPACING.m,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.s,
        ...SHADOWS.medium,
    },
    name: {
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
        ...FONTS.bold,
        textAlign: 'center',
    },
    count: {
        fontSize: 12,
        color: COLORS.textLight,
        ...FONTS.medium,
    }
});

export default PlatformCard;
