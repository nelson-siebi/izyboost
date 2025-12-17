import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sponsorCode, setSponsorCode] = useState('');

    const { register } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password, confirmPassword, sponsorCode);
        } catch (e) {
            const msg = e.response?.data?.message || "Erreur d'inscription";
            Alert.alert('Echec', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.wrapper}>
                <Text style={styles.title}>IzyBoost</Text>
                <Text style={styles.subtitle}>Créer un compte</Text>

                <TextInput
                    style={styles.input}
                    value={username}
                    placeholder="Nom d'utilisateur"
                    onChangeText={text => setUsername(text)}
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    placeholder="Mot de passe"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    placeholder="Confirmer mot de passe"
                    onChangeText={text => setConfirmPassword(text)}
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    value={sponsorCode}
                    placeholder="Code Parrain (Optionnel)"
                    onChangeText={text => setSponsorCode(text)}
                    autoCapitalize="characters"
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>S'inscrire</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.row}>
                    <Text>Déjà un compte ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        justifyContent: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CD964',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    input: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4CD964',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
    },
    link: {
        color: '#4CD964',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
