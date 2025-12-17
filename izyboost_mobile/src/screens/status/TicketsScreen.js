
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TicketsScreen = ({ navigation }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState(''); // Initial message
    const [submitting, setSubmitting] = useState(false);

    // Priorities (hardcoded for now as per usual SMM panels)
    const priorities = [
        { label: 'Faible', value: 'low', color: COLORS.success },
        { label: 'Moyenne', value: 'medium', color: COLORS.warning },
        { label: 'Haute', value: 'high', color: COLORS.error },
    ];
    const [selectedPriority, setSelectedPriority] = useState('medium');

    const fetchTickets = async () => {
        try {
            const response = await client.get('/user/tickets');
            // Assuming response.data.data or response.data contains the array
            const data = response.data.data ? response.data.data : response.data;
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Error fetching tickets:', error);
            // Alert.alert('Erreur', 'Impossible de charger les tickets.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir le sujet et le message.');
            return;
        }

        setSubmitting(true);
        try {
            await client.post('/user/tickets', {
                subject: newSubject,
                message: newMessage,
                priority: selectedPriority,
                // related_service_id could be added if needed
            });
            setModalVisible(false);
            setNewSubject('');
            setNewMessage('');
            setSelectedPriority('medium');
            fetchTickets(); // Refresh list
            Alert.alert('Succès', 'Ticket créé avec succès.');
        } catch (error) {
            console.log('Create ticket error:', error);
            Alert.alert('Erreur', 'Impossible de créer le ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
            case 'ouvert':
                return COLORS.success;
            case 'answered':
            case 'répondu':
                return COLORS.info;
            case 'closed':
            case 'fermé':
                return COLORS.gray[400];
            default:
                return COLORS.gray[400];
        }
    };

    const getStatusLabel = (status) => {
        const map = {
            'open': 'Ouvert',
            'answered': 'Répondu',
            'customer_reply': 'Répondu par vous',
            'closed': 'Fermé',
        };
        return map[status?.toLowerCase()] || status;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.ticketId}>#{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>

            <View style={styles.footer}>
                <Text style={styles.date}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Aucun ticket de support.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>

            {/* Create Ticket Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouveau Ticket</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Sujet</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Problème avec une commande"
                            value={newSubject}
                            onChangeText={setNewSubject}
                        />

                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Décrivez votre problème..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.button, submitting && styles.buttonDisabled]}
                            onPress={handleCreateTicket}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Envoyer</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    list: {
        padding: SPACING.m,
        paddingBottom: 80, // Space for FAB
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    ticketId: {
        fontSize: 12,
        color: COLORS.textLight,
        ...FONTS.medium,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        ...FONTS.bold,
    },
    subject: {
        fontSize: 16,
        color: COLORS.text,
        ...FONTS.bold,
        marginBottom: SPACING.s,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 5,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SPACING.l,
        minHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        ...FONTS.bold,
        color: COLORS.text,
    },
    label: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        ...FONTS.medium,
    },
    input: {
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    textArea: {
        height: 100,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        ...FONTS.bold,
    }
});

export default TicketsScreen;
