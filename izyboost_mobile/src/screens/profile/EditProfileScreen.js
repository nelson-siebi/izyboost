
import React, { useState, useContext } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Alert, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs de mot de passe.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Erreur", "Le nouveau mot de passe et la confirmation ne correspondent pas.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        setLoading(true);
        try {
            // PUT /api/user/password or /api/user/update-password
            // Assumption: endpoint is /user/update-password based on common Laravel practices or backend docs
            // If not explicit in docs, we try /user/update-password or similar.
            await client.put('/user/update-password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword
            });

            Alert.alert("Succès", "Mot de passe mis à jour. Veuillez vous reconnecter.", [
                { text: "OK", onPress: () => logout() }
            ]);

        } catch (error) {
            console.log('Update password error:', error.response?.data);
            const msg = error.response?.data?.message || "Erreur lors de la mise à jour.";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier mon profil</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    
                    {/* Read Only Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations Personnelles</Text>
                        <Text style={styles.infoText}>Nom d'utilisateur: <Text style={styles.bold}>{userInfo?.username}</Text></Text>
                        <Text style={styles.infoText}>Email: <Text style={styles.bold}>{userInfo?.email}</Text></Text>
                        <Text style={styles.note}>Pour modifier ces informations, veuillez contacter le support.</Text>
                    </View>

                    {/* Change Password */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
                        
                        <Text style={styles.label}>Mot de passe actuel</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            placeholder="********"
                        />

                        <Text style={styles.label}>Nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="********"
                        />

                        <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="********"
                        />

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleUpdatePassword}
                            disabled={loading}
                        >
                             {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Mettre à jour le mot de passe</Text>
                            )}
                        </TouchableOpacity>
                    </View>

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
    section: { // Fixed: using a valid view style
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.l,
        ...SHADOWS.small,
    },
    sectionTitle: {
        fontSize: 18,
        ...FONTS.bold,
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    infoText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    bold: {
        color: COLORS.text,
        ...FONTS.bold,
    },
    note: {
        fontSize: 12,
        color: COLORS.warning,
        marginTop: 8,
        fontStyle: 'italic',
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
        borderRadius: 8,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray[200],
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.white,
        ...FONTS.bold,
        fontSize: 16,
    }
});

export default EditProfileScreen;
