
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Clipboard,
    Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';

const DeveloperScreen = ({ navigation }) => {
    const [apiKey, setApiKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        fetchApiKey();
    }, []);

    const fetchApiKey = async () => {
        try {
            // GET /api/user/api-keys
            const response = await client.get('/user/api-keys');
            // Assuming response data structure. If list, take first one.
            const data = response.data.data ? response.data.data : response.data;

            if (Array.isArray(data) && data.length > 0) {
                setApiKey(data[0].key || data[0].token); // Adjust based on actual API Key object
            } else if (data.key) {
                setApiKey(data.key);
            }
        } catch (error) {
            console.log('Fetch API Key error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateKey = async () => {
        setGenerating(true);
        try {
            const response = await client.post('/user/api-keys', { name: "Mobile App Generated" });
            const data = response.data.data ? response.data.data : response.data;
            if (data.key || data.token) {
                setApiKey(data.key || data.token);
                Alert.alert("Succès", "Nouvelle clé API générée.");
            } else {
                // Refresh list if return format is different
                fetchApiKey();
            }
        } catch (error) {
            console.log('Generate API Key error:', error);
            const msg = error.response?.data?.message || "Erreur lors de la génération.";
            Alert.alert("Erreur", msg);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (apiKey) {
            Clipboard.setString(apiKey);
            Alert.alert("Copié", "Clé API copiée dans le presse-papier.");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Espace Développeur</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoCard}>
                    <Ionicons name="code-slash" size={32} color={COLORS.primary} style={{ marginBottom: SPACING.m }} />
                    <Text style={styles.infoTitle}>Intégrez IzyBoost</Text>
                    <Text style={styles.infoText}>
                        Utilisez notre API RESTful pour automatiser vos commandes et synchroniser vos services.
                        Consultez la documentation complète sur notre site web.
                    </Text>
                </View>

                <View style={styles.keySection}>
                    <Text style={styles.sectionTitle}>Votre Clé API</Text>

                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
                    ) : apiKey ? (
                        <View style={styles.keyCard}>
                            <Text style={styles.keyLabel}>Clé active</Text>
                            <View style={styles.keyDisplay}>
                                <Text style={styles.keyValue} numberOfLines={1}>
                                    {showKey ? apiKey : 'sk_••••••••••••••••••••••••'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowKey(!showKey)}>
                                    <Ionicons name={showKey ? "eye-off" : "eye"} size={20} color={COLORS.gray[400]} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                                <Text style={styles.copyText}>Copier la clé</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Aucune clé API active.</Text>
                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={handleGenerateKey}
                                disabled={generating}
                            >
                                {generating ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.generateText}>Générer une clé</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {apiKey && (
                    <TouchableOpacity
                        style={styles.regenerateLink}
                        onPress={handleGenerateKey}
                        disabled={generating}
                    >
                        <Text style={styles.regenerateText}>
                            {generating ? "Génération..." : "Générer une nouvelle clé"}
                        </Text>
                    </TouchableOpacity>
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
    infoCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
    },
    infoTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    infoText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    keyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    keyLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    keyDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.gray[100],
        padding: SPACING.s,
        borderRadius: 8,
        marginBottom: SPACING.m,
    },
    keyValue: {
        flex: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 16,
        marginRight: SPACING.s,
        color: COLORS.text,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    copyText: {
        color: COLORS.primary,
        ...FONTS.bold,
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.gray[100],
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.gray[300],
    },
    emptyText: {
        color: COLORS.textLight,
        marginBottom: SPACING.m,
    },
    generateButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.m,
        borderRadius: 8,
    },
    generateText: {
        color: COLORS.white,
        ...FONTS.bold,
    },
    regenerateLink: {
        marginTop: SPACING.l,
        alignItems: 'center',
    },
    regenerateText: {
        color: COLORS.error,
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});

export default DeveloperScreen;
