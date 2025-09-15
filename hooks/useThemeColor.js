import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

/**
 * @param {{light?: string, dark?: string}} props
 * @param {'text'|'background'|'tint'|'icon'|'tabIconDefault'|'tabIconSelected'} colorName
 */
export function useThemeColor(props, colorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
