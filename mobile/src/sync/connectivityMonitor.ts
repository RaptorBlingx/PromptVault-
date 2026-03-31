// ============================================
// PromptVault Mobile - Connectivity Monitor
// Google Keep-style: detect online/offline, trigger sync
// ============================================

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { checkHealth } from '../api/client';

export type ConnectivityStatus = 'online' | 'offline' | 'checking';

type ConnectivityListener = (status: ConnectivityStatus) => void;

class ConnectivityMonitor {
  private status: ConnectivityStatus = 'checking';
  private listeners: Set<ConnectivityListener> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  start() {
    // Subscribe to NetInfo for instant connectivity changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(
      this.handleNetInfoChange.bind(this),
    );

    // Also do periodic health checks (every 30s like web app)
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Initial check
    this.performHealthCheck();
  }

  stop() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getStatus(): ConnectivityStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current status
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleNetInfoChange(state: NetInfoState) {
    if (state.isConnected && state.isInternetReachable !== false) {
      // Network is available — verify with health check
      this.performHealthCheck();
    } else {
      this.setStatus('offline');
    }
  }

  private async performHealthCheck() {
    try {
      await checkHealth();
      this.setStatus('online');
    } catch {
      this.setStatus('offline');
    }
  }

  private setStatus(newStatus: ConnectivityStatus) {
    const oldStatus = this.status;
    this.status = newStatus;
    if (oldStatus !== newStatus) {
      this.listeners.forEach((listener) => listener(newStatus));
    }
  }

  /** Force a connectivity check and return the result */
  async check(): Promise<ConnectivityStatus> {
    this.setStatus('checking');
    await this.performHealthCheck();
    return this.status;
  }
}

// Singleton instance
export const connectivity = new ConnectivityMonitor();
export const connectivityMonitor = connectivity;
