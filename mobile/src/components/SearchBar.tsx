// ============================================
// PromptVault Mobile - Search Bar Component
// ============================================

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../theme';
import { spacing, borderRadius } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search prompts...',
  onClear,
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
      <Text style={[styles.icon, { color: colors.textTertiary }]}>🔍</Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.clearIcon, { color: colors.textTertiary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    height: 44,
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
  },
  icon: {
    fontSize: fontSize.base,
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    padding: 0,
  },
  clearIcon: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    padding: spacing[1],
  },
});
