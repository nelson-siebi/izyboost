
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import PlatformDetailsScreen from '../screens/services/PlatformDetailsScreen';
import ServiceOrderScreen from '../screens/services/ServiceOrderScreen';
import AddFundsScreen from '../screens/wallet/AddFundsScreen';

// New Screens
import TicketsScreen from '../screens/status/TicketsScreen';
import TicketDetailScreen from '../screens/status/TicketDetailScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import NotificationsScreen from '../screens/status/NotificationsScreen';
import TransactionsScreen from '../screens/wallet/TransactionsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import DeveloperScreen from '../screens/profile/DeveloperScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import WhiteLabelScreen from '../screens/whitelabel/WhiteLabelScreen';
import CreateSiteScreen from '../screens/whitelabel/CreateSiteScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { splashLoading, userToken, hasSeenOnboarding, completeOnboarding } = useContext(AuthContext);
    const [showSplashAnimation, setShowSplashAnimation] = React.useState(true);

    if (splashLoading || showSplashAnimation) {
        return (
            <SplashScreen
                onFinish={() => setShowSplashAnimation(false)}
            />
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasSeenOnboarding ? (
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                        initialParams={{ onComplete: completeOnboarding }}
                    />
                ) : userToken === null ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    // App Stack
                    <>
                        <Stack.Screen name="MainTabs" component={TabNavigator} />
                        <Stack.Screen name="PlatformDetails" component={PlatformDetailsScreen} />
                        <Stack.Screen name="ServiceOrder" component={ServiceOrderScreen} />
                        <Stack.Screen name="AddFunds" component={AddFundsScreen} />

                        {/* New Core Features */}
                        <Stack.Screen
                            name="Tickets"
                            component={TicketsScreen}
                            options={{ headerShown: true, title: 'Support' }}
                        />
                        <Stack.Screen
                            name="TicketDetail"
                            component={TicketDetailScreen}
                            options={{ headerShown: true, title: 'Détail Ticket' }}
                        />
                        <Stack.Screen
                            name="Referral"
                            component={ReferralScreen}
                            options={{ headerShown: true, title: 'Parrainage' }}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                            options={{ headerShown: true, title: 'Notifications' }}
                        />
                        <Stack.Screen
                            name="Transactions"
                            component={TransactionsScreen}
                            options={{ headerShown: true, title: 'Historique' }}
                        />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Developer"
                            component={DeveloperScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="WhiteLabel"
                            component={WhiteLabelScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="CreateSite"
                            component={CreateSiteScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
