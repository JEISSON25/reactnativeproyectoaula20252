import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Register from '../screens/Register';
import LoginScreen from '../screens/LogInScreen';
const Stack = createStackNavigator();
const AuthStack = () => {
 return (
 <Stack.Navigator initialRouteName="Register">
 <Stack.Screen name="Register" component={Register} options={{
headerShown: false }} />
<Stack.Screen name="Login" component={LoginScreen} options={{
headerShown: false }} />
 </Stack.Navigator>
 );
};
export default AuthStack;