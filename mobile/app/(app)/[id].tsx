// ============================================
// Prompt Detail/Editor Screen
// Dynamic route [id].tsx — edit existing prompt
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { spacing } from '../../src/theme/spacing';
import { fontSize, fontWeight } from '../../src/theme/typography';
import {
  getPromptById, getAllFolders, updatePrompt,
  type PromptRecord, type FolderRecord,
} from '../../src/db';
import { PromptEditor } from '../../src/components/PromptEditor';
import { VariableModal } from '../../src/components/VariableModal';
import { Prompt, Folder } from '../../src/shared/types';
import * as Clipboard from 'expo-clipboard';

export default function PromptDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [prompt, setPrompt] = useState<PromptRecord | null>(null);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVariables, setShowVariables] = useState(false);

  const loadPrompt = useCallback(async () => {
    try {
      const p = await getPromptById(id!);
      const allFolders = await getAllFolders();
      setPrompt(p || null);
      setFolders(allFolders.filter((f) => f.syncStatus !== 'deleted'));
    } catch (err) {
      console.error('Prompt not found:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const handleSave = useCallback(
    async (updates: Partial<Prompt>) => {
      if (!prompt) return;
      await updatePrompt(prompt.id, (p) => ({
        ...p,
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.tags !== undefined && { tags: JSON.stringify(updates.tags) }),
        ...(updates.folderId !== undefined && { folderId: updates.folderId || null }),
        ...(updates.isFavorite !== undefined && { isFavorite: updates.isFavorite }),
        ...(updates.isPinned !== undefined && { isPinned: updates.isPinned }),
        ...(updates.versions !== undefined && { versions: JSON.stringify(updates.versions) }),
        updatedAt: Date.now(),
        syncStatus: p.serverId ? 'updated' : 'created',
      }));
      loadPrompt();
    },
    [prompt, loadPrompt],
  );

  const handleDelete = useCallback(async () => {
    if (!prompt) return;
    await updatePrompt(prompt.id, (p) => ({
      ...p,
      syncStatus: 'deleted',
      updatedAt: Date.now(),
    }));
    router.back();
  }, [prompt, router]);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;
    await Clipboard.setStringAsync(prompt.content);
  }, [prompt]);

  const handleCopyWithVariables = useCallback(
    async (filledContent: string) => {
      await Clipboard.setStringAsync(filledContent);
      setShowVariables(false);
    },
    [],
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!prompt) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.bgPrimary }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
          Prompt not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.accent }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const promptData: Prompt = {
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    tags: JSON.parse(prompt.tags || '[]'),
    isFavorite: prompt.isFavorite,
    isPinned: prompt.isPinned,
    folderId: prompt.folderId || null,
    createdAt: prompt.createdAt,
    updatedAt: prompt.updatedAt,
    versions: JSON.parse(prompt.versions || '[]'),
  };

  const folderData: Folder[] = folders.map((f) => ({
    id: f.id,
    name: f.name,
    icon: f.icon,
    color: f.color,
    createdAt: f.createdAt,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { borderBottomColor: colors.border }]}
      >
        <Text style={[styles.backArrow, { color: colors.textSecondary }]}>← Back</Text>
      </TouchableOpacity>

      <PromptEditor
        prompt={promptData}
        folders={folderData}
        onSave={handleSave}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onFillVariables={() => setShowVariables(true)}
      />

      {/* Variable fill modal */}
      <VariableModal
        visible={showVariables}
        content={prompt.content}
        onDismiss={() => setShowVariables(false)}
        onCopy={handleCopyWithVariables}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  backArrow: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: fontSize.lg,
    marginBottom: spacing[4],
  },
  backLink: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
});
