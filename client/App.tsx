import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckoutScreen from './Views/CheckoutScreen';
import HomePage from './Views/HomePage';
import Scan from './Views/ScanItem';
import Panier from './Views/Panier';
import Historique from './Views/Historique';
import { DarkModeProvider } from './Views/DarkModeContext'; // Import the DarkModeProvider

const Stack = createNativeStackNavigator();

export default function App() {
  const stripePK = Constants.expoConfig.extra.stripePK;

  return (
    <DarkModeProvider>
      <StripeProvider
        publishableKey={stripePK}
        merchantIdentifier="merchant.com.example"
      >
        <NavigationContainer>
          <Stack.Navigator initialRouteName="HomePage">
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
            <Stack.Screen name="Scan" component={Scan} />
            <Stack.Screen name="Panier" component={Panier} />
            <Stack.Screen name="Historique" component={Historique} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </DarkModeProvider>
  );
}
