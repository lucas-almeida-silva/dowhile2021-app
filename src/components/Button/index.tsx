import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  ColorValue
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { styles } from './styles';

type Props = TouchableOpacityProps & {
  title: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  icon?: React.ComponentProps<typeof AntDesign>['name'];
  isLoading?: boolean;
}

export function Button({
  title,
  color,
  backgroundColor,
  icon,
  isLoading = false,
  ...props
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      activeOpacity={0.7}
      disabled={isLoading}
      {...props}
    >

      {isLoading ? <ActivityIndicator color={color} /> :
        <>
          {icon && <AntDesign name={icon} size={24} style={styles.icon} />}
          <Text style={[styles.title, { color }]}>
            {title}
          </Text>
        </>
      }
    </TouchableOpacity>
  );
}