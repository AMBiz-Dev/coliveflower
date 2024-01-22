import React from "react";
import { TouchableOpacity, Text } from "react-native";

import { defaultStyles } from "@/constants/Styles";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
}

const TextButton = ({ title, onPress, style, textStyle }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{ ...defaultStyles.btn, ...style }}
      onPress={onPress}
    >
      <Text style={{ ...defaultStyles.btnText, ...textStyle }}>{title}</Text>
    </TouchableOpacity>
  );
};

export default TextButton;
