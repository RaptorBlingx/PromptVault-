// ============================================
// Search Screen — full-text search + filters
// ============================================

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { fontSize, fontWeight } from '../../src/theme/typography';
import { getAllPrompts, type PromptRecord } from '../../src/db';
import { PromptCard } from '../../src/components/PromptCard';
import { Prompt } from '../../src/shared/types';
import * as Clipboard from 'expo-clipboard';

type FilterType = 'all' | 'favorites' | 'pinned';

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [allPrompts, setAllPrompts] = useState<PromptRecord[]>([]);

  // Auto-focus search on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    loadAllPrompts();
  }, []);

  const loadAllPrompts = async () => {
    const all = await getAllPrompts();
    setAllPrompts(all.filter((p) => p.syncStatus !== 'deleted'));
  };

  // Filter + search
  const results = useMemo(() => {
    let filtered = allPrompts;

    // Type filters
    if (filter === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    } else if (filter === 'pinned') {
      filtered = filtered.filter((p) => p.isPinned);
    }

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          JSON.parse(p.tags || '[]').some((t: string) =>
            t.toLowerCase().includes(q),
          ),
      );
    }

    // Sort by relevance (title match first) then newest
    filtered.sort((a, b) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const aTitle = a.title.toLowerCase().includes(q);
        const bTitle = b.title.toLowerCase().includes(q);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
      }
      return b.updatedAt - a.updatedAt;
    });

    return filtered;
  }, [allPrompts, query, filter]);

  const toCardData = (p: PromptRecord): Prompt => ({
    id: p.id,
    title: p.title,
    content: p.content,
    tags: JSON.parse(p.tags || '[]'),
    isFavorite: p.isFavorite,
    isPinned: p.isPinned,
    folderId: p.folderId || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    versions: JSON.parse(p.versions || '[]'),
  });

  const handleCopy = useCallback(async (p: PromptRecord) => {
    await Clipboard.setStringAsync(p.content);
  }, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'favorites', label: '⭐ Favorites' },
    { key: 'pinned', label: '📌 Pinned' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Search input */}
      <View style={[styles.searchRow, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={{ color: colors.textSecondary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Search prompts, tags..."
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Text style={{ color: colors.textTertiary }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.accent : colors.bgTertiary,
                borderColor: filter === f.key ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filter === f.key ? '#ffffff' : colors.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
        {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <PromptCard
            prompt={toCardData(item)}
            syncStatus={(item.syncStatus as any) || 'synced'}
            onPress={() => router.push(`/(app)/${item.id}` as any)}
            onCopy={() => handleCopy(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {query ? 'No matches found' : 'Start typing to search'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  clearButton: {
    padding: spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  resultCount: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    fontSize: fontSize.xs,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing[12],
    gap: spacing[3],
  },
  emptyText: {
    fontSize: fontSize.base,
  },
});
