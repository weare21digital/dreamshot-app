import React from 'react';
import { View, TextInput, StyleSheet, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../contexts/ThemeContext';
import { MaterialIcons as Icon } from '@expo/vector-icons';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChangeText,
  leftIcon = 'search',
  rightIcon,
  onRightIconPress,
  style,
}: SearchInputProps): React.JSX.Element {
  const { palette, brand } = useAppTheme();

  return (
    <View style={[styles.container, {
      backgroundColor: `${brand.primary}08`,
      borderColor: `${brand.primary}12`,
    }, style]}>
      <Icon name={leftIcon as keyof typeof Icon.glyphMap} size={22} color={palette.textSecondary} style={styles.leftIcon} />
      <TextInput
        style={[styles.input, { color: palette.text }]}
        placeholder={placeholder}
        placeholderTextColor={palette.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      {rightIcon && (
        <Icon
          name={rightIcon as keyof typeof Icon.glyphMap}
          size={20}
          color={palette.textSecondary}
          style={styles.rightIcon}
          onPress={onRightIconPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  rightIcon: {
    marginLeft: 12,
  },
});
