import React from "react";
import { Pressable, Text } from "react-native";

const Chip = ({ active, label, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: active ? "#0A84FF" : "#ccc",
      backgroundColor: active ? "#E8F2FF" : "white",
      marginRight: 8,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: active ? "#0A84FF" : "#333" }}>{label}</Text>
  </Pressable>
);

export default Chip;
