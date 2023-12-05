import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckoutScreen from './Views/CheckoutScreen';
import HomePage from './Views/HomePage';
import Scan from './Views/ScanScreen';
import Panier from './Views/Panier';
import Historique from './Views/Historique';


const Stack = createNativeStackNavigator();

export default function App() {
  const stripePK = Constants.expoConfig.extra.stripePK;

  return (
    <StripeProvider
      publishableKey={stripePK}
      merchantIdentifier="merchant.com.example"
    >
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomePage">
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Scan" component={Scan} />
          <Stack.Screen name="Panier" component={Panier} />
          <Stack.Screen name="Historique" component={Historique} />


        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
