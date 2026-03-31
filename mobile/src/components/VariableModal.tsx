// ============================================
// PromptVault Mobile - Variable Modal
// Port of web VariableModal — fills {{vars}} before copy
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme';
import { spacing, borderRadius } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';
import { extractVariables, replaceVariables } from '../shared/variables';

interface VariableModalProps {
  visible: boolean;
  content: string;
  onDismiss: () => void;
  onCopy: (filledContent: string) => void;
}

export function VariableModal({
  visible,
  content,
  onDismiss,
  onCopy,
}: VariableModalProps) {
  const { colors } = useTheme();
  const variables = useMemo(() => extractVariables(content), [content]);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variables) {
      initial[v.name] = v.defaultValue || '';
    }
    return initial;
  });

  const filledContent = replaceVariables(content, values);

  const handleCopy = () => {
    onCopy(filledContent);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modal, { backgroundColor: colors.bgElevated }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              ⚡ Fill Variables
            </Text>
            <TouchableOpacity onPress={onDismiss}>
              <Text style={[styles.closeButton, { color: colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Variable Inputs */}
            {variables.map((variable) => (
              <View key={variable.name} style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {`{{${variable.name}}}`}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.bgTertiary,
                      borderColor: colors.border,
                    },
                  ]}
                  value={values[variable.name]}
                  onChangeText={(text) =>
                    setValues((prev) => ({ ...prev, [variable.name]: text }))
                  }
                  placeholder={variable.defaultValue || `Enter ${variable.name}...`}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            ))}

            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                Preview
              </Text>
              <View
                style={[
                  styles.preview,
                  { backgroundColor: colors.bgTertiary, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.previewText, { color: colors.textPrimary }]}
                  numberOfLines={8}
                >
                  {filledContent}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onDismiss}
              style={[styles.button, { backgroundColor: colors.bgTertiary }]}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.button, styles.primaryButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                📋 Copy with Values
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  closeButton: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    padding: spacing[1],
  },
  body: {
    padding: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[1],
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSize.base,
  },
  previewSection: {
    marginTop: spacing[2],
  },
  previewLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[2],
  },
  preview: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  previewText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {},
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
