
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import { formatCurrency } from '../../utils/serviceHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';

const ServiceOrderScreen = ({ route, navigation }) => {
    const { service } = route.params; // This is the Category (e.g. Tiktok Vues) containing .services[] list

    // Default to first service variant if available
    const [selectedService, setSelectedService] = useState(service.services?.[0] || null);
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const min = selectedService ? Number(selectedService.min_quantity) : 0;
    const max = selectedService ? Number(selectedService.max_quantity) : 0;
    const rate = selectedService ? Number(selectedService.rate) : 0; // Rate per 1000

    // Calculate total price
    const qtyNum = Number(quantity);
    const totalPrice = (qtyNum * rate) / 1000;

    const handleSubmit = async () => {
        if (!selectedService) return;
        if (!link) {
            Alert.alert("Erreur", "Veuillez entrer le lien de votre publication.");
            return;
        }
        if (qtyNum < min || qtyNum > max) {
            Alert.alert("Erreur", `La quantité doit être comprise entre ${min} et ${max}.`);
            return;
        }

        setLoading(true);
        try {
            await client.post('/user/orders', {
                service_id: selectedService.id,
                link: link,
                quantity: qtyNum
            });
            Alert.alert(
                "Succès",
                "Votre commande a été reçue avec succès !",
                [{ text: "OK", onPress: () => navigation.popToTop() }]
            );
        } catch (error) {
            console.log('Order Error:', error.response?.data || error.message);
            const msg = error.response?.data?.message || "Une erreur est survenue lors de la commande.";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    if (!selectedService) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ textAlign: 'center', marginTop: 20 }}>Service non disponible.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header */}
                <Text style={styles.title}>{service.name}</Text>
                <Text style={styles.subtitle}>{selectedService.name}</Text>

                {/* Form */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Lien</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://..."
                        value={link}
                        onChangeText={setLink}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Quantité (Min: {min} - Max: {max})</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={min.toString()}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                    />
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Prix Total:</Text>
                    <Text style={styles.summaryPrice}>
                        {qtyNum > 0 ? formatCurrency(totalPrice) : formatCurrency(0)}
                    </Text>
                </View>

                <Text style={styles.rateInfo}>
                    Taux: {formatCurrency(rate)} / 1000
                </Text>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Commander</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        padding: SPACING.l,
    },
    title: {
        fontSize: 24,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        ...FONTS.medium,
        marginBottom: SPACING.xl,
    },
    formGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 8,
        ...FONTS.medium,
    },
    input: {
        backgroundColor: COLORS.gray[100],
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        fontSize: 16,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10', // 10% opacity hex
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
    },
    summaryLabel: {
        fontSize: 18,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    summaryPrice: {
        fontSize: 24,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    rateInfo: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 12,
        marginBottom: SPACING.xl,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        ...FONTS.bold,
    }
});

export default ServiceOrderScreen;
