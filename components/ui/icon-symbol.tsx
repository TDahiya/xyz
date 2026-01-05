// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock.fill': 'access-time',
  'creditcard.fill': 'credit-card',
  'person.fill': 'person',
  'bicycle': 'pedal-bike',
  'checkmark.circle': 'check-circle',
  'xmark.circle': 'cancel',
  'heart.fill': 'favorite',
  'questionmark.circle.fill': 'help',
  'doc.text.fill': 'description',
  'gift.fill': 'card-giftcard',
  'briefcase.fill': 'work',
  'gearshape.fill': 'settings',
  'doc.plaintext': 'article',
  'rectangle.portrait.and.arrow.right': 'logout',
  'share': 'share',
  'map.fill': 'map',
  'location.fill': 'location-on',
  'flag.fill': 'flag',
  'xmark.circle': 'cancel',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
