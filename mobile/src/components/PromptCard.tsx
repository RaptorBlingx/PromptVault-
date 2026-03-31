// ============================================
// PromptVault Mobile - Prompt Card Component
// Matches web PromptCard design
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { fontSize, fontWeight } from '../theme/typography';
import { Prompt } from '../shared/types';
import { hasVariables } from '../shared/variables';
import { formatRelativeTime } from '../shared/utils';

interface PromptCardProps {
  prompt: Prompt;
  syncStatus?: string;
  onPress: () => void;
  onCopy?: () => void;
}

export function PromptCard({ prompt, syncStatus, onPress, onCopy }: PromptCardProps) {
  const { colors } = useTheme();

  const contentPreview =
    prompt.content.length > 120
      ? prompt.content.substring(0, 120) + '...'
      : prompt.content;

  const showVariableBadge = hasVariables(prompt.content);
  const displayTags = prompt.tags.slice(0, 2);
  const extraTagCount = prompt.tags.length - 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.bgElevated,
          borderColor: colors.border,
          ...shadows.sm,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {prompt.isPinned && <Text style={styles.pinIcon}>📌</Text>}
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {prompt.title}
          </Text>
        </View>
        {prompt.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
      </View>

      {/* Content Preview */}
      {contentPreview.length > 0 && (
        <Text
          style={[styles.content, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {contentPreview}
        </Text>
      )}

      {/* Tags & Badges Row */}
      <View style={styles.footer}>
        <View style={styles.tagsRow}>
          {displayTags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: colors.bgTertiary }]}
            >
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag}
              </Text>
            </View>
          ))}
          {extraTagCount > 0 && (
            <Text style={[styles.extraTags, { color: colors.textTertiary }]}>
              +{extraTagCount}
            </Text>
          )}
          {showVariableBadge && (
            <View style={[styles.badge, { backgroundColor: colors.accentBg }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                ⚡ Variables
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {syncStatus && syncStatus !== 'synced' && (
            <View style={[styles.syncBadge, { backgroundColor: colors.warningBg }]}>
              <Text style={[styles.syncBadgeText, { color: colors.warning }]}>●</Text>
            </View>
          )}
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            {formatRelativeTime(prompt.updatedAt)}
          </Text>
        </View>
      </View>

      {/* Copy Button */}
      {onCopy && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onCopy();
          }}
          style={[styles.copyButton, { backgroundColor: colors.bgTertiary }]}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.copyIcon, { color: colors.textSecondary }]}>📋</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing[4],
    marginBottom: spacing[3],
    marginHorizontal: spacing[4],
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIcon: {
    fontSize: fontSize.xs,
    marginRight: spacing[1],
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    flex: 1,
  },
  favoriteIcon: {
    fontSize: fontSize.sm,
    marginLeft: spacing[2],
  },
  content: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
    marginBottom: spacing[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  tag: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
  },
  extraTags: {
    fontSize: fontSize.xs,
    marginLeft: spacing[1],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  syncBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncBadgeText: {
    fontSize: 6,
    lineHeight: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: fontSize.xs,
  },
  copyButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    padding: spacing[1],
    borderRadius: borderRadius.sm,
  },
  copyIcon: {
    fontSize: fontSize.sm,
  },
});
