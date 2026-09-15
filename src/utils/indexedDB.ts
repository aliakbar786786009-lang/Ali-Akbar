/**
 * IndexedDB Local Database Storage & Offline Queue Mechanism
 * 
 * Provides persistent local queueing for text and voice messages
 * created while the client is offline or disconnected, and automatically
 * triggers synchronization with the backend / Firebase when connection is restored.
 */

import { Message, MessageType } from '../types';

export interface QueuedOfflineMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  duration?: number;
  fileName?: string;
  fileSize?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  pollData?: any;
  catalogData?: any;
  timestamp: number;
  queuedAt: number;
  retryAttempts: number;
}

const DB_NAME = 'MyChatOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_message_queue';

class OfflineMessageDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp', { unique: false });
          store.createIndex('by_chatId', 'chatId', { unique: false });
          store.createIndex('by_type', 'type', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Store a message in the offline IndexedDB queue
   */
  async enqueueMessage(message: Omit<QueuedOfflineMessage, 'queuedAt' | 'retryAttempts'>): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const queuedItem: QueuedOfflineMessage = {
          ...message,
          queuedAt: Date.now(),
          retryAttempts: 0,
        };

        const req = store.put(queuedItem);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('[IndexedDB] Error enqueuing offline message:', err);
      // Fallback to localStorage if IndexedDB is blocked in sandboxed frames
      try {
        const raw = localStorage.getItem('mychat_offline_fallback_queue') || '[]';
        const list = JSON.parse(raw);
        list.push({ ...message, queuedAt: Date.now(), retryAttempts: 0 });
        localStorage.setItem('mychat_offline_fallback_queue', JSON.stringify(list));
      } catch (fallbackErr) {
        console.error('[IndexedDB Fallback] Failed saving to localStorage:', fallbackErr);
      }
    }
  }

  /**
   * Retrieve all messages currently queued in the local database
   */
  async getQueuedMessages(): Promise<QueuedOfflineMessage[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const items: QueuedOfflineMessage[] = req.result || [];
          // Sort chronologically by timestamp
          items.sort((a, b) => a.timestamp - b.timestamp);
          resolve(items);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Reading from fallback storage due to:', err);
      try {
        const raw = localStorage.getItem('mychat_offline_fallback_queue') || '[]';
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
  }

  /**
   * Delete an item from the queue once it has successfully synced to Firebase
   */
  async removeMessage(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      try {
        const raw = localStorage.getItem('mychat_offline_fallback_queue') || '[]';
        const list: QueuedOfflineMessage[] = JSON.parse(raw);
        const filtered = list.filter((m) => m.id !== id);
        localStorage.setItem('mychat_offline_fallback_queue', JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Clear entire queue
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.removeItem('mychat_offline_fallback_queue');
    }
  }

  /**
   * Get count of pending offline messages
   */
  async getQueueCount(): Promise<number> {
    const list = await this.getQueuedMessages();
    return list.length;
  }
}

export const offlineMessageDB = new OfflineMessageDB();
