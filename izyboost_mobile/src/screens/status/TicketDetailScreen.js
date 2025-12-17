import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import client from '../../api/client';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TicketDetailScreen = ({ route, navigation }) => {
    const { ticket } = route.params;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchTicketDetails = async () => {
        try {
            // Using UUID as per docs: GET /api/tickets/{uuid}
            // If ticket.uuid is not available, try ticket.id, but docs say UUID usually for detail
            const id = ticket.uuid || ticket.id;
            const response = await client.get(`/user/tickets/${id}`);

            const data = response.data.data ? response.data.data : response.data;
            // Assuming messages are included in the ticket object or a separate field
            setMessages(data.messages || []);
        } catch (error) {
            console.log('Error fetching ticket details:', error);
            Alert.alert('Erreur', 'Impossible de charger les messages.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, []);

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;

        setSending(true);
        try {
            const id = ticket.uuid || ticket.id;
            await client.post(`/user/tickets/${id}/reply`, {
                message: replyMessage
            });
            setReplyMessage('');
            fetchTicketDetails(); // Refresh messages
        } catch (error) {
            console.log('Reply error:', error);
            Alert.alert('Erreur', 'Impossible d\'envoyer la réponse.');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        // Determine if message is from user or admin
        // This depends on backend response structure.
        // Assuming 'is_admin' or 'user_id' check.
        // Let's assume there's a flag or strict sender type
        const isUser = !item.is_admin; // Adjust logic based on actual API

        return (
            <View style={[
                styles.messageContainer,
                isUser ? styles.userMessage : styles.adminMessage
            ]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.adminText]}>
                    {item.message}
                </Text>
                <Text style={styles.messageDate}>
                    {new Date(item.created_at).toLocaleString()}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.subject}>{ticket.subject}</Text>
                <View style={[styles.badge, styles[`status${ticket.status}`]]}>
                    <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.list}
                    inverted // Often chat lists are inverted, or we scroll to bottom. 
                // If backend sends oldest first, removed inverted. Usually newest is last.
                // Let's assume standard order (oldest first) and NOT inverted for now, but auto-scroll would be better.
                // Actually, simple list is safer.
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Votre réponse..."
                    value={replyMessage}
                    onChangeText={setReplyMessage}
                    multiline
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendReply}
                    disabled={sending}
                >
                    {sending ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Ionicons name="send" size={20} color={COLORS.white} />
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[100],
    },
    subject: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.m,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.m,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    adminMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.gray[200],
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 14,
        ...FONTS.medium,
    },
    userText: {
        color: COLORS.white,
    },
    adminText: {
        color: COLORS.text,
    },
    messageDate: {
        fontSize: 10,
        marginTop: 4,
        color: 'rgba(0,0,0,0.5)',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
        borderRadius: 20,
        paddingHorizontal: SPACING.m,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: SPACING.m,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: COLORS.gray[200],
    },
    statusText: {
        fontSize: 12,
        color: COLORS.text,
    }
});

export default TicketDetailScreen;
