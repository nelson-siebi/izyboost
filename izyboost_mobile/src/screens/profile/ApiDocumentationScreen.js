import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';

const LANGUAGES = [
    { id: 'php', label: 'PHP' },
    { id: 'python', label: 'Python' },
    { id: 'node', label: 'Node.js' }
];

const CODE_EXAMPLES = {
    php: `
$url = 'https://api.izyboost.com/api/v1/orders';
$data = [
    'service_id' => 105,
    'link' => 'https://instagram.com/p/xyz',
    'quantity' => 1000
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
print_r(json_decode($response, true));
`,
    python: `
import requests

url = "https://api.izyboost.com/api/v1/orders"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "service_id": 105,
    "link": "https://instagram.com/p/xyz",
    "quantity": 1000
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
`,
    node: `
const axios = require('axios');

const url = 'https://api.izyboost.com/api/v1/orders';
const apiKey = 'YOUR_API_KEY';
const data = {
    service_id: 105,
    link: 'https://instagram.com/p/xyz',
    quantity: 1000
};

axios.post(url, data, {
    headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error(error);
});
`
};

const ApiDocumentationScreen = ({ navigation }) => {
    const [selectedLang, setSelectedLang] = useState('php');
    const { width } = useWindowDimensions();

    const renderCodeBlock = (code) => (
        <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{code.trim()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Documentation API</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentification</Text>
                    <Text style={styles.text}>
                        Toutes les requêtes API doivent inclure votre clé API unique dans l'en-tête HTTP <Text style={styles.bold}>X-API-Key</Text>.
                    </Text>
                    <View style={styles.endpointCard}>
                        <Text style={styles.method}>HEADER</Text>
                        <Text style={styles.endpointUrl}>X-API-Key: sk_votre_cle_api...</Text>
                    </View>
                </View>

                {/* Endpoints */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Endpoints Principaux</Text>

                    <View style={styles.apiCard}>
                        <View style={styles.methodBadge}>
                            <Text style={styles.methodText}>POST</Text>
                        </View>
                        <View>
                            <Text style={styles.apiPath}>/api/v1/orders</Text>
                            <Text style={styles.apiDesc}>Créer une nouvelle commande</Text>
                        </View>
                    </View>

                    <View style={styles.apiCard}>
                        <View style={[styles.methodBadge, { backgroundColor: '#10B981' }]}>
                            <Text style={styles.methodText}>GET</Text>
                        </View>
                        <View>
                            <Text style={styles.apiPath}>/api/v1/services</Text>
                            <Text style={styles.apiDesc}>Lister tous les services et tarifs</Text>
                        </View>
                    </View>

                    <View style={styles.apiCard}>
                        <View style={[styles.methodBadge, { backgroundColor: '#10B981' }]}>
                            <Text style={styles.methodText}>GET</Text>
                        </View>
                        <View>
                            <Text style={styles.apiPath}>/api/v1/balance</Text>
                            <Text style={styles.apiDesc}>Consulter votre solde</Text>
                        </View>
                    </View>
                </View>

                {/* Code Examples */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exemples d'Intégration</Text>

                    {/* Language Tabs */}
                    <View style={styles.tabsContainer}>
                        {LANGUAGES.map(lang => (
                            <TouchableOpacity
                                key={lang.id}
                                style={[
                                    styles.tab,
                                    selectedLang === lang.id && styles.activeTab
                                ]}
                                onPress={() => setSelectedLang(lang.id)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    selectedLang === lang.id && styles.activeTabText
                                ]}>
                                    {lang.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Code Display */}
                    {renderCodeBlock(CODE_EXAMPLES[selectedLang])}
                </View>

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
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    text: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 22,
        marginBottom: SPACING.s,
    },
    bold: {
        ...FONTS.bold,
        color: COLORS.primary,
    },
    endpointCard: {
        backgroundColor: COLORS.gray[100],
        padding: SPACING.m,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    method: {
        ...FONTS.bold,
        color: COLORS.primary,
        marginRight: SPACING.m,
        fontSize: 12,
    },
    endpointUrl: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 13,
        color: COLORS.text,
    },
    apiCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    methodBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: SPACING.m,
        minWidth: 50,
        alignItems: 'center',
    },
    methodText: {
        color: COLORS.white,
        fontSize: 12,
        ...FONTS.bold,
    },
    apiPath: {
        fontSize: 14,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    apiDesc: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.m,
        backgroundColor: COLORS.gray[100],
        padding: 4,
        borderRadius: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    },
    tabText: {
        fontSize: 14,
        color: COLORS.textLight,
        ...FONTS.medium,
    },
    activeTabText: {
        color: COLORS.primary,
        ...FONTS.bold,
    },
    codeBlock: {
        backgroundColor: '#1E1E1E',
        padding: SPACING.m,
        borderRadius: 12,
    },
    codeText: {
        color: '#D4D4D4',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 12,
        lineHeight: 18,
    }
});

export default ApiDocumentationScreen;
