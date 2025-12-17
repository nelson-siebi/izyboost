import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [splashLoading, setSplashLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

    const login = async (email_or_username, password) => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/login', {
                email_or_username,
                password,
            });

            const { access_token, user } = response.data;

            setUserInfo(user);
            setUserToken(access_token);
            await SecureStore.setItemAsync('userToken', access_token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

        } catch (e) {
            console.log(`Login error ${e}`);
            throw e; // Propagate error to UI
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username, email, password, password_confirmation, sponsor_code = null) => {
        setIsLoading(true);
        try {
            const response = await client.post('/auth/register', {
                username,
                email,
                password,
                password_confirmation,
                sponsor_code
            });

            const { access_token, user } = response.data;

            setUserInfo(user);
            setUserToken(access_token);
            await SecureStore.setItemAsync('userToken', access_token);
            await SecureStore.setItemAsync('userInfo', JSON.stringify(user));

        } catch (e) {
            console.log(`Register error ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Optional: Call API to revoke token
            // await client.post('/user/logout');
        } catch (e) {
            console.log(e);
        }

        setUserToken(null);
        setUserInfo(null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userInfo');
        setIsLoading(false);
    };

    const checkOnboarding = async () => {
        try {
            // We use SecureStore for token, but Async Storage (or SecureStore) for onboarding flag
            const value = await SecureStore.getItemAsync('hasSeenOnboarding');
            if (value) {
                setHasSeenOnboarding(true);
            } else {
                setHasSeenOnboarding(false);
            }
        } catch (e) {
            console.log(`checkOnboarding error ${e}`);
            setHasSeenOnboarding(false);
        }
    };

    const completeOnboarding = async () => {
        await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
        setHasSeenOnboarding(true);
    };

    const isLoggedIn = async () => {
        try {
            setSplashLoading(true);

            // Check Onboarding
            await checkOnboarding();

            // Check Token
            let userToken = await SecureStore.getItemAsync('userToken');
            let userInfo = await SecureStore.getItemAsync('userInfo');

            if (userToken) {
                setUserToken(userToken);
                setUserInfo(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
        } finally {
            setSplashLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            register,
            isLoading,
            splashLoading,
            userToken,
            userInfo,
            hasSeenOnboarding,
            completeOnboarding
        }}>
            {children}
        </AuthContext.Provider>
    );
};
