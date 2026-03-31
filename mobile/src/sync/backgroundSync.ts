// ============================================
// PromptVault Mobile - Background Sync
// Uses expo-background-fetch + expo-task-manager
// to sync every ~15 minutes when app is backgrounded
// ============================================

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncEngine } from './syncEngine';

const BACKGROUND_SYNC_TASK = 'PROMPTVAULT_BACKGROUND_SYNC';

// Define the background task
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const result = await syncEngine.sync();
    const hasChanges = result.pushed > 0 || result.pulled > 0;
    return hasChanges
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background sync registered');
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
}

export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
  }
}

export async function isBackgroundSyncRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
}
