import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {

  return (

    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Button title="TRANSACCIONES" onPress={() => navigation.navigate('Transactions')} />
      <Button title="AÑADIR TRANSACCION" onPress={() => navigation.navigate('TransactionForm')} />
    </View>

  );
}

export default HomeScreen;