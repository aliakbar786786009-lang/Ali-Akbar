import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  Chat,
  Message,
  MessageType,
  MessageStatus,
  StatusUpdate,
  CallRecord,
  ModerationReport,
  AuditLog,
  AdminStats,
  CatalogItemData,
  PollData,
  RegisteredAccount,
} from '../types';
import {
  INITIAL_USER,
  MOCK_USERS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_STATUSES,
  INITIAL_CALLS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMIN_STATS,
} from '../data/mockData';
import { soundManager } from '../utils/audio';
import {
  getStoredAccounts,
  saveStoredAccounts,
  isUsernameTaken,
  generateUsernameSuggestions,
  normalizeUsername,
  validateUsernameFormat,
} from '../utils/userAuth';
import {
  MASTER_ADMIN_EMAIL,
  isAuthorizedMasterAdmin,
  getAdminPasscode,
  setAdminPasscode,
  verifyAdminPasscode,
} from '../utils/adminAuth';
import { offlineMessageDB } from '../utils/indexedDB';

interface ActiveCallState {
  record: CallRecord;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
  duration: number;
}

interface ChatContextType {
  // Auth & Profile
  currentUser: User | null;
  users: User[];
  registeredAccounts: RegisteredAccount[];
  signIn: (email: string, password: string) => { success: boolean; error?: string };
  signUp: (email: string, password: string) => { success: boolean; error?: string };
  completeProfileSetup: (profileData: {
    name: string;
    username: string;
    avatar: string;
    bio: string;
  }) => { success: boolean; error?: string };
  checkUsernameAvailable: (username: string, excludeUserId?: string) => boolean;
  suggestUsernames: (username: string) => string[];
  loginWithGoogle: (account?: Partial<User>) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => { success: boolean; error?: string };
  addContactByUsername: (username: string) => { success: boolean; error?: string; chat?: Chat };
  changeAdminPasscode: (newPasscode: string) => { success: boolean; error?: string };

  // Navigation & Tabs
  activeTab: 'chats' | 'updates' | 'communities' | 'calls';
  setActiveTab: (tab: 'chats' | 'updates' | 'communities' | 'calls') => void;
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;

  // Messages & Chats
  chats: Chat[];
  messages: Record<string, Message[]>;
  sendMessage: (
    chatId: string,
    text: string,
    type?: MessageType,
    extra?: {
      mediaUrl?: string;
      duration?: number;
      fileName?: string;
      fileSize?: string;
      replyTo?: { id: string; senderName: string; text: string };
      catalogData?: CatalogItemData;
      pollData?: PollData;
    }
  ) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  starMessage: (chatId: string, messageId: string) => void;
  deleteMessage: (chatId: string, messageId: string, forEveryone?: boolean) => void;
  votePoll: (chatId: string, messageId: string, optionId: string) => void;
  createChat: (targetUserId: string) => Chat;
  createGroup: (name: string, participantIds: string[], description?: string) => Chat;
  createCommunity: (name: string, description: string, channelNames: string[]) => Chat;

  // Calls
  calls: CallRecord[];
  activeCall: ActiveCallState | null;
  startCall: (targetUser: User, type: 'voice' | 'video') => void;
  answerCall: () => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallCamera: () => void;
  toggleCallSpeaker: () => void;
  clearCallHistory: () => void;

  // Statuses
  statuses: StatusUpdate[];
  addStatus: (type: 'text' | 'image', content: string, mediaUrl?: string, bgColor?: string) => void;
  viewStatus: (statusId: string) => void;

  // Business
  sendCatalogInquiry: (chatId: string, item: CatalogItemData, message?: string) => void;

  // App Settings & Preferences
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: 'en' | 'ur';
  toggleLanguage: () => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  chatWallpaper: string;
  setChatWallpaper: (wallpaper: string) => void;
  readReceipts: boolean;
  setReadReceipts: (val: boolean) => void;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  setLastSeenPrivacy: (val: 'everyone' | 'contacts' | 'nobody') => void;
  isAppLocked: boolean;
  unlockApp: (pin: string) => boolean;
  pinLockEnabled: boolean;
  setPinLockEnabled: (enabled: boolean, pin?: string) => void;

  // Chat Actions & Moderation
  toggleMuteChat: (chatId: string) => void;
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  blockedUserIds: string[];
  submitReport: (
    targetUserId: string,
    targetUserName: string,
    reason: ModerationReport['reason'],
    details: string
  ) => void;

  // Admin Panel
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  adminStats: AdminStats;
  reports: ModerationReport[];
  auditLogs: AuditLog[];
  resolveReport: (reportId: string, actionText: string) => void;
  dismissReport: (reportId: string) => void;
  toggleUserSuspension: (userId: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  verifyBusinessAccount: (userId: string) => void;

  // Contact & Chat Management
  addContact: (contactData: {
    name: string;
    emailOrPhone: string;
    bio?: string;
    role?: 'user' | 'business';
    avatar?: string;
    businessCategory?: string;
  }) => User;
  deleteContact: (userId: string) => void;
  clearAllChats: () => void;
  resetApp: () => void;

  // Offline Queue & Firebase Synchronization
  isOnline: boolean;
  isSyncingQueue: boolean;
  pendingOfflineCount: number;
  toggleSimulatedOffline: () => void;
  syncOfflineQueue: () => Promise<number>;
}

const STORAGE_VERSION_KEY = 'mychat_clean_slate_v9_production';

// Purge all legacy dummy accounts, mock users, and pre-logged-in states for a 100% clean slate
if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem('mychat_app_version');
    if (currentVer !== STORAGE_VERSION_KEY) {
      localStorage.removeItem('mychat_user');
      localStorage.removeItem('mychat_all_users');
      localStorage.removeItem('mychat_chats');
      localStorage.removeItem('mychat_messages');
      localStorage.removeItem('mychat_statuses');
      localStorage.removeItem('mychat_calls');
      localStorage.removeItem('mychat_reports');
      localStorage.removeItem('mychat_audit_logs');
      localStorage.setItem('mychat_app_version', STORAGE_VERSION_KEY);
    }
  } catch {
    // ignore
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Accounts registry
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    return getStoredAccounts();
  });

  // Current session: null on first load, requires user to sign in or sign up
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mychat_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const accounts = getStoredAccounts();
    return accounts.map((a) => a.user);
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('mychat_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('mychat_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [statuses, setStatuses] = useState<StatusUpdate[]>(() => {
    const saved = localStorage.getItem('mychat_statuses');
    return saved ? JSON.parse(saved) : [];
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('mychat_calls');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem('mychat_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mychat_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [adminStats, setAdminStats] = useState<AdminStats>(INITIAL_ADMIN_STATS);

  const [activeTab, setActiveTab] = useState<'chats' | 'updates' | 'communities' | 'calls'>('chats');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // Settings
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [chatWallpaper, setChatWallpaper] = useState<string>('default');
  const [readReceipts, setReadReceipts] = useState<boolean>(true);
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone');
  const [pinLockEnabled, setPinLockEnabledState] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('1234');
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);

  // Blocked users
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mychat_blocked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin View
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Network connection & IndexedDB Offline Queue state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);

  // Read initial count of offline queued items from IndexedDB
  useEffect(() => {
    offlineMessageDB.getQueueCount().then((cnt) => {
      setPendingOfflineCount(cnt);
    }).catch(() => {});
  }, []);

  // Sync offline queue to cloud / Firebase
  const syncOfflineQueue = useCallback(async (): Promise<number> => {
    try {
      const queued = await offlineMessageDB.getQueuedMessages();
      if (queued.length === 0) {
        setPendingOfflineCount(0);
        return 0;
      }

      setIsSyncingQueue(true);
      let count = 0;

      for (const item of queued) {
        // Transition message status from 'pending' to 'sent'
        setMessages((prev) => {
          const chatMsgs = prev[item.chatId] || [];
          return {
            ...prev,
            [item.chatId]: chatMsgs.map((m) =>
              m.id === item.id ? { ...m, status: 'sent' } : m
            ),
          };
        });

        // Remove from IndexedDB
        await offlineMessageDB.removeMessage(item.id);
        count++;

        // Simulate delivery acknowledgment from Firebase
        const itemId = item.id;
        const itemChatId = item.chatId;
        setTimeout(() => {
          setMessages((prev) => {
            const chatMsgs = prev[itemChatId] || [];
            return {
              ...prev,
              [itemChatId]: chatMsgs.map((m) =>
                m.id === itemId ? { ...m, status: 'delivered' } : m
              ),
            };
          });
        }, 700);
      }

      const remaining = await offlineMessageDB.getQueueCount();
      setPendingOfflineCount(remaining);

      // Add audit log record for admin visibility
      setAuditLogs((prev) => [
        {
          id: `audit_${Date.now()}`,
          adminEmail: 'System (Sync Engine)',
          action: 'OFFLINE_QUEUE_SYNCED',
          details: `Synchronized ${count} offline queued message(s) from IndexedDB to Firebase/Cloud`,
          timestamp: Date.now(),
          severity: 'info',
        },
        ...prev,
      ]);

      setIsSyncingQueue(false);
      return count;
    } catch (err) {
      console.error('[IndexedDB Sync error]', err);
      setIsSyncingQueue(false);
      return 0;
    }
  }, []);

  // Listen to window online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically trigger synchronization when network connectivity returns!
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue]);

  // Simulated toggle for manual testing and verification
  const toggleSimulatedOffline = useCallback(() => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next) {
        // Reconnected -> sync pending items
        setTimeout(() => {
          syncOfflineQueue();
        }, 150);
      }
      return next;
    });
  }, [syncOfflineQueue]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mychat_blocked_users', JSON.stringify(blockedUserIds));
  }, [blockedUserIds]);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mychat_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mychat_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mychat_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('mychat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('mychat_statuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('mychat_calls', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('mychat_all_users', JSON.stringify(users));
  }, [users]);

  // Handle active call timer
  useEffect(() => {
    let timer: number;
    if (activeCall && activeCall.isConnected) {
      timer = window.setInterval(() => {
        setActiveCall((prev) => (prev ? { ...prev, duration: prev.duration + 1 } : null));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.isConnected]);

  // Sign In with Email and Password
  const signIn = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        error: 'No account found with this email. Please click Sign Up to create your account.',
      };
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    if (account.user.isSuspended || account.user.status === 'suspended') {
      return { success: false, error: 'This account has been suspended by administration.' };
    }

    const onlineUser: User = { ...account.user, isOnline: true, lastSeen: Date.now() };
    setCurrentUser(onlineUser);
    localStorage.setItem('mychat_user', JSON.stringify(onlineUser));
    return { success: true };
  };

  // Sign Up with Email and Password
  const signUp = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email is already registered. Please sign in instead.',
      };
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      id: newId,
      email: cleanEmail,
      name: '',
      username: '',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      bio: 'Hey there! I am using MyChat.',
      country: 'PK',
      role: isMaster ? 'admin' : 'user',
      isOnline: true,
      lastSeen: Date.now(),
      verified: isMaster,
      isSuspended: false,
      isProfileCompleted: false,
      createdAt: Date.now(),
    };

    const newAccount: RegisteredAccount = {
      id: newId,
      email: cleanEmail,
      password,
      isProfileCompleted: false,
      user: newUser,
    };

    const updatedAccounts = [...accounts, newAccount];
    setRegisteredAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);
    setUsers(updatedAccounts.map((a) => a.user));
    setCurrentUser(newUser);
    localStorage.setItem('mychat_user', JSON.stringify(newUser));

    const auditEntry: AuditLog = {
      id: `log_${Date.now()}`,
      adminEmail: 'system',
      action: 'USER_REGISTERED',
      target: cleanEmail,
      details: `Account registered: ${cleanEmail}`,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    return { success: true };
  };

  // Mandatory Profile Setup completion
  const completeProfileSetup = (profileData: {
    name: string;
    username: string;
    avatar: string;
    bio: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'No active session.' };

    const cleanUsername = normalizeUsername(profileData.username);
    const formatCheck = validateUsernameFormat(cleanUsername);
    if (!formatCheck.isValid) {
      return { success: false, error: formatCheck.error };
    }

    if (isUsernameTaken(cleanUsername, currentUser.id)) {
      return {
        success: false,
        error: `Username already taken. Please try adding numbers or characters (e.g., ${cleanUsername}123 or ${cleanUsername}_ali).`,
      };
    }

    const updatedUser: User = {
      ...currentUser,
      name: profileData.name.trim(),
      username: cleanUsername,
      avatar: profileData.avatar,
      bio: profileData.bio.trim(),
      isProfileCompleted: true,
    };

    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((a) =>
      a.user.id === currentUser.id
        ? { ...a, isProfileCompleted: true, user: updatedUser }
        : a
    );

    setRegisteredAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);
    setUsers(updatedAccounts.map((a) => a.user));
    setCurrentUser(updatedUser);
    localStorage.setItem('mychat_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  // Check unique username availability in real-time
  const checkUsernameAvailable = (username: string, excludeUserId?: string): boolean => {
    return !isUsernameTaken(username, excludeUserId);
  };

  // Generate suggestions for taken usernames
  const suggestUsernames = (username: string): string[] => {
    return generateUsernameSuggestions(username);
  };

  // Add contact strictly by unique username
  const addContactByUsername = (
    targetUsername: string
  ): { success: boolean; error?: string; chat?: Chat } => {
    if (!currentUser) return { success: false, error: 'Please sign in first.' };

    const clean = normalizeUsername(targetUsername);
    if (!clean) return { success: false, error: 'Please enter a username.' };

    if (normalizeUsername(currentUser.username) === clean) {
      return { success: false, error: 'You cannot add your own username as a contact.' };
    }

    const accounts = getStoredAccounts();
    const targetAccount = accounts.find(
      (a) => normalizeUsername(a.user.username) === clean
    );

    if (!targetAccount) {
      return {
        success: false,
        error: `No user found with username @${clean}. Please check the spelling and try again.`,
      };
    }

    const targetUser = targetAccount.user;

    // Check if chat already exists
    let existingChat = chats.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(currentUser.id) &&
        c.participants.includes(targetUser.id)
    );

    if (!existingChat) {
      existingChat = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'direct',
        name: targetUser.name || `@${targetUser.username}`,
        avatar: targetUser.avatar,
        participants: [currentUser.id, targetUser.id],
        unreadCount: { [currentUser.id]: 0, [targetUser.id]: 0 },
        createdAt: Date.now(),
        businessUserId: targetUser.role === 'business' ? targetUser.id : undefined,
      };
      setChats((prev) => [existingChat!, ...prev]);
    }

    setActiveChat(existingChat);
    return { success: true, chat: existingChat };
  };

  // Update Admin Passcode
  const changeAdminPasscode = (newPasscode: string): { success: boolean; error?: string } => {
    if (!isAuthorizedMasterAdmin(currentUser)) {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }
    if (!newPasscode || newPasscode.trim().length < 4) {
      return { success: false, error: 'Passcode must be at least 4 characters.' };
    }
    setAdminPasscode(newPasscode.trim());
    return { success: true };
  };

  // Google Login fallback
  const loginWithGoogle = (account?: Partial<User>) => {
    const email = account?.email || 'user@example.com';
    signUp(email, 'GoogleAuth#123');
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveChat(null);
    setIsAdminMode(false);
    localStorage.removeItem('mychat_user');
  };

  const updateProfile = (updates: Partial<User>): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'No user session.' };

    if (updates.username) {
      const clean = normalizeUsername(updates.username);
      const formatCheck = validateUsernameFormat(clean);
      if (!formatCheck.isValid) {
        return { success: false, error: formatCheck.error };
      }
      if (isUsernameTaken(clean, currentUser.id)) {
        return {
          success: false,
          error: `Username already taken. Please try adding numbers or characters (e.g., ${clean}123 or ${clean}_ali).`,
        };
      }
      updates.username = clean;
    }

    const updated: User = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('mychat_user', JSON.stringify(updated));

    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((a) =>
      a.user.id === currentUser.id ? { ...a, user: updated } : a
    );
    setRegisteredAccounts(updatedAccounts);
    saveStoredAccounts(updatedAccounts);
    setUsers(updatedAccounts.map((a) => a.user));

    return { success: true };
  };

  // Send Message
  const sendMessage = useCallback(
    async (
      chatId: string,
      text: string,
      type: MessageType = 'text',
      extra?: {
        mediaUrl?: string;
        duration?: number;
        fileName?: string;
        fileSize?: string;
        replyTo?: { id: string; senderName: string; text: string };
        catalogData?: CatalogItemData;
        pollData?: PollData;
      }
    ) => {
      if (!currentUser) return;

      const messageStatus: MessageStatus = isOnline ? 'sent' : 'pending';

      const newMsg: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        chatId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text,
        type,
        status: messageStatus,
        timestamp: Date.now(),
        ...extra,
      };

      // Play sent sound
      soundManager.playSent();

      // Update messages immediately in state so user sees it right away
      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMsg],
      }));

      // Update chat last message
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, lastMessage: newMsg } : c))
      );

      // If OFFLINE: queue into IndexedDB for persistent storage
      if (!isOnline) {
        await offlineMessageDB.enqueueMessage({
          id: newMsg.id,
          chatId: newMsg.chatId,
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          senderAvatar: newMsg.senderAvatar,
          text: newMsg.text,
          type: newMsg.type,
          mediaUrl: newMsg.mediaUrl,
          duration: newMsg.duration,
          fileName: newMsg.fileName,
          fileSize: newMsg.fileSize,
          replyTo: newMsg.replyTo,
          pollData: newMsg.pollData,
          catalogData: newMsg.catalogData,
          timestamp: newMsg.timestamp,
        });

        const count = await offlineMessageDB.getQueueCount();
        setPendingOfflineCount(count);
        return; // Don't trigger delivery ticks or bot reply while offline!
      }

      // If ONLINE:
      // Increment admin message stats
      setAdminStats((prev) => ({ ...prev, totalMessagesSent: prev.totalMessagesSent + 1 }));

      // Simulate status transition: delivered after 800ms
      setTimeout(() => {
        setMessages((prev) => {
          const chatMsgs = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: chatMsgs.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)),
          };
        });
      }, 800);

      // Simulate intelligent automated response from the contact
      const chat = chats.find((c) => c.id === chatId);
      if (chat && chat.type === 'direct') {
        const otherParticipantId = chat.participants.find((p) => p !== currentUser.id);
        const otherUser = users.find((u) => u.id === otherParticipantId);

        if (otherUser) {
          setTimeout(() => {
            let replyText = `Thanks for your message! Received on MyChat. 👍`;
            const lower = text.toLowerCase();
            if (otherUser.role === 'business') {
              replyText = `Thank you for contacting ${otherUser.name}! Our representative has received your request and will respond shortly. You can also view our product catalog!`;
            } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('salam') || lower.includes('سلام') || lower.includes('اسلام')) {
              replyText = `Walaikum Assalam / Hello! Great to hear from you. How are you doing? 😊`;
            } else if (lower.includes('kaise') || lower.includes('how are you') || lower.includes('کیسے') || lower.includes('kya hal')) {
              replyText = `I am doing great! Alhamdulillah. How is everything going with you?`;
            } else if (lower.includes('call') || lower.includes('کال')) {
              replyText = `Sure, feel free to start a voice or video call anytime! 📞`;
            } else if (type === 'voice') {
              replyText = `Listened to your voice note! Loud and clear. 🎙️`;
            } else if (type === 'image') {
              replyText = `Nice photo! Thanks for sharing. 📸`;
            }

            const contactReply: Message = {
              id: `msg_rep_${Date.now()}`,
              chatId,
              senderId: otherUser.id,
              senderName: otherUser.name,
              senderAvatar: otherUser.avatar,
              text: replyText,
              type: 'text',
              status: 'read',
              timestamp: Date.now(),
            };
            setMessages((prev) => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), contactReply],
            }));
            setChats((prev) =>
              prev.map((c) => (c.id === chatId ? { ...c, lastMessage: contactReply } : c))
            );
            soundManager.playReceived();
          }, 1800);
        }
      }
    },
    [currentUser, chats, users, isOnline]
  );

  // Add Emoji Reaction
  const addReaction = (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = { ...(msg.reactions || {}) };
          const userList = reactions[emoji] || [];
          if (userList.includes(currentUser.id)) {
            reactions[emoji] = userList.filter((uid) => uid !== currentUser.id);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...userList, currentUser.id];
          }
          return { ...msg, reactions };
        }),
      };
    });
  };

  // Star message
  const starMessage = (chatId: string, messageId: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => (m.id === messageId ? { ...m, isStarred: !m.isStarred } : m)),
      };
    });
  };

  // Delete message
  const deleteMessage = (chatId: string, messageId: string, forEveryone = false) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      if (forEveryone) {
        return {
          ...prev,
          [chatId]: list.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: '🚫 This message was deleted',
                  type: 'system',
                  mediaUrl: undefined,
                  pollData: undefined,
                  catalogData: undefined,
                }
              : m
          ),
        };
      } else {
        return {
          ...prev,
          [chatId]: list.filter((m) => m.id !== messageId),
        };
      }
    });
  };

  // Vote on Poll
  const votePoll = (chatId: string, messageId: string, optionId: string) => {
    if (!currentUser) return;
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id !== messageId || !m.pollData) return m;
          const updatedOptions = m.pollData.options.map((opt) => {
            const hasVoted = opt.votes.includes(currentUser.id);
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: hasVoted
                  ? opt.votes.filter((id) => id !== currentUser.id)
                  : [...opt.votes, currentUser.id],
              };
            } else if (!m.pollData?.allowMultiple) {
              return {
                ...opt,
                votes: opt.votes.filter((id) => id !== currentUser.id),
              };
            }
            return opt;
          });
          return {
            ...m,
            pollData: {
              ...m.pollData,
              options: updatedOptions,
            },
          };
        }),
      };
    });
  };

  // Create Chat with a contact
  const createChat = (targetUserId: string): Chat => {
    if (!currentUser) throw new Error('Not logged in');
    // Check if chat already exists
    const existing = chats.find(
      (c) => c.type === 'direct' && c.participants.includes(targetUserId) && c.participants.includes(currentUser.id)
    );
    if (existing) {
      setActiveChat(existing);
      return existing;
    }

    const targetUser = users.find((u) => u.id === targetUserId);
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      type: 'direct',
      name: targetUser?.name || 'Contact',
      avatar: targetUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      participants: [currentUser.id, targetUserId],
      unreadCount: { [currentUser.id]: 0 },
      createdAt: Date.now(),
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    return newChat;
  };

  // Create Group
  const createGroup = (name: string, participantIds: string[], description?: string): Chat => {
    if (!currentUser) throw new Error('Not logged in');
    const allParticipants = Array.from(new Set([currentUser.id, ...participantIds]));
    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      type: 'group',
      name,
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      description: description || 'New MyChat Group',
      participants: allParticipants,
      groupAdmins: [currentUser.id],
      unreadCount: { [currentUser.id]: 0 },
      createdAt: Date.now(),
      lastMessage: {
        id: `sys_${Date.now()}`,
        chatId: `group_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `${currentUser.name} created group "${name}"`,
        type: 'system',
        status: 'read',
        timestamp: Date.now(),
      },
    };

    setChats((prev) => [newGroup, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newGroup.id]: [newGroup.lastMessage!],
    }));
    setActiveChat(newGroup);
    setAdminStats((prev) => ({ ...prev, totalGroups: prev.totalGroups + 1 }));
    return newGroup;
  };

  // Create Community
  const createCommunity = (name: string, description: string, channelNames: string[]): Chat => {
    if (!currentUser) throw new Error('Not logged in');
    const newComm: Chat = {
      id: `community_${Date.now()}`,
      type: 'community',
      name,
      avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
      description,
      participants: [currentUser.id],
      groupAdmins: [currentUser.id],
      unreadCount: { [currentUser.id]: 0 },
      createdAt: Date.now(),
      communityChannels: [
        { id: `ch_ann_${Date.now()}`, name: '📢 Announcements', isAnnouncement: true },
        ...channelNames.map((ch, idx) => ({ id: `ch_${idx}_${Date.now()}`, name: ch, isAnnouncement: false })),
      ],
      lastMessage: {
        id: `sys_comm_${Date.now()}`,
        chatId: `community_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `Community "${name}" initialized.`,
        type: 'system',
        status: 'read',
        timestamp: Date.now(),
      },
    };

    setChats((prev) => [newComm, ...prev]);
    setActiveChat(newComm);
    return newComm;
  };

  // Chat Actions & Moderation
  const toggleMuteChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isMuted: !c.isMuted } : c))
    );
    if (activeChat && activeChat.id === chatId) {
      setActiveChat((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
    }
  };

  const clearChat = (chatId: string) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [],
    }));
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, lastMessage: undefined } : c))
    );
    if (activeChat && activeChat.id === chatId) {
      setActiveChat((prev) => (prev ? { ...prev, lastMessage: undefined } : null));
    }
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessages((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
    if (activeChat && activeChat.id === chatId) {
      setActiveChat(null);
    }
  };

  const blockUser = (userId: string) => {
    setBlockedUserIds((prev) => {
      if (prev.includes(userId)) return prev;
      const updated = [...prev, userId];
      localStorage.setItem('mychat_blocked_users', JSON.stringify(updated));
      return updated;
    });
  };

  const unblockUser = (userId: string) => {
    setBlockedUserIds((prev) => {
      const updated = prev.filter((id) => id !== userId);
      localStorage.setItem('mychat_blocked_users', JSON.stringify(updated));
      return updated;
    });
  };

  const isUserBlocked = (userId: string) => {
    return blockedUserIds.includes(userId);
  };

  const submitReport = (
    targetUserId: string,
    targetUserName: string,
    reason: ModerationReport['reason'],
    details: string
  ) => {
    if (!currentUser) return;
    const newReport: ModerationReport = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reportedUserId: targetUserId,
      reportedUserName: targetUserName,
      reason,
      details,
      status: 'pending',
      timestamp: Date.now(),
    };
    setReports((prev) => {
      const updated = [newReport, ...prev];
      localStorage.setItem('mychat_reports', JSON.stringify(updated));
      return updated;
    });
    setAdminStats((prev) => ({ ...prev, pendingReports: prev.pendingReports + 1 }));

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      adminEmail: currentUser.email,
      action: 'USER_REPORT_SUBMITTED',
      target: targetUserName,
      details: `Reported for ${reason}: ${details || 'No additional remarks'}`,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Calling
  const startCall = (targetUser: User, type: 'voice' | 'video') => {
    if (!currentUser) return;
    const newRecord: CallRecord = {
      id: `call_${Date.now()}`,
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      receiverId: targetUser.id,
      receiverName: targetUser.name,
      receiverAvatar: targetUser.avatar,
      type,
      direction: 'outgoing',
      status: 'completed',
      duration: 0,
      timestamp: Date.now(),
    };

    soundManager.startOutgoingRing();

    setActiveCall({
      record: newRecord,
      isConnected: false,
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: true,
      duration: 0,
    });

    // Automatically simulate recipient answering after 3.5 seconds
    setTimeout(() => {
      soundManager.stopCallRing();
      setActiveCall((prev) => (prev ? { ...prev, isConnected: true } : null));
    }, 3500);
  };

  const answerCall = () => {
    soundManager.stopCallRing();
    setActiveCall((prev) => (prev ? { ...prev, isConnected: true } : null));
  };

  const endCall = () => {
    soundManager.stopCallRing();
    if (activeCall) {
      const finishedRecord = {
        ...activeCall.record,
        duration: activeCall.duration,
        status: activeCall.isConnected ? ('completed' as const) : ('missed' as const),
      };
      setCalls((prev) => [finishedRecord, ...prev]);
      setAdminStats((prev) => ({ ...prev, totalCallsMade: prev.totalCallsMade + 1 }));
    }
    setActiveCall(null);
  };

  const toggleCallMute = () => {
    setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  };

  const toggleCallCamera = () => {
    setActiveCall((prev) => (prev ? { ...prev, isCameraOff: !prev.isCameraOff } : null));
  };

  const toggleCallSpeaker = () => {
    setActiveCall((prev) => (prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null));
  };

  const clearCallHistory = () => {
    setCalls([]);
  };

  // Statuses
  const addStatus = (type: 'text' | 'image', content: string, mediaUrl?: string, bgColor?: string) => {
    if (!currentUser) return;
    const newStatus: StatusUpdate = {
      id: `status_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type,
      content,
      mediaUrl,
      bgColor: bgColor || 'from-teal-700 to-emerald-900',
      timestamp: Date.now(),
      viewers: [],
    };
    setStatuses((prev) => [newStatus, ...prev]);
  };

  const viewStatus = (statusId: string) => {
    if (!currentUser) return;
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.id !== statusId) return s;
        const alreadyViewed = s.viewers.some((v) => v.userId === currentUser.id);
        if (alreadyViewed) return s;
        return {
          ...s,
          viewers: [
            ...s.viewers,
            {
              userId: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              time: Date.now(),
            },
          ],
        };
      })
    );
  };

  // Business Catalog Inquiry
  const sendCatalogInquiry = (chatId: string, item: CatalogItemData, customNote?: string) => {
    if (!currentUser) return;
    sendMessage(chatId, customNote || `Hi! I am interested in purchasing "${item.name}" ($${item.price}). Is this currently in stock?`, 'catalog_item', {
      catalogData: item,
    });
  };

  // Theme & Language
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const unlockApp = (pin: string): boolean => {
    if (pin === pinCode) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const setPinLockEnabled = (enabled: boolean, newPin?: string) => {
    setPinLockEnabledState(enabled);
    if (newPin) setPinCode(newPin);
  };

  // Admin moderation
  const resolveReport = (reportId: string, actionText: string) => {
    if (!currentUser) return;
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved', actionTaken: actionText } : r))
    );
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      adminEmail: currentUser.email,
      action: 'REPORT_RESOLVED',
      target: reportId,
      details: actionText,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const dismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
    );
  };

  const toggleUserSuspension = (userId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isNowSuspended = !u.isSuspended;
          const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            adminEmail: currentUser.email,
            action: isNowSuspended ? 'USER_SUSPENDED' : 'USER_RESTORED',
            target: `${u.name} (${u.email})`,
            details: isNowSuspended ? 'Account suspended for policy review.' : 'Account restored by admin.',
            timestamp: Date.now(),
          };
          setAuditLogs((l) => [newLog, ...l]);
          return { ...u, isSuspended: isNowSuspended, status: isNowSuspended ? 'suspended' : 'active' };
        }
        return u;
      })
    );
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'banned') => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            adminEmail: currentUser.email,
            action: `USER_STATUS_${(status || 'ACTIVE').toUpperCase()}`,
            target: `${u.name} (${u.email})`,
            details: `Account status updated to ${status}.`,
            timestamp: Date.now(),
          };
          setAuditLogs((l) => [newLog, ...l]);
          return { ...u, status, isSuspended: status !== 'active' };
        }
        return u;
      })
    );
  };

  const verifyBusinessAccount = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verified: true, role: 'business' } : u))
    );
  };

  // Add Contact
  const addContact = (contactData: {
    name: string;
    emailOrPhone: string;
    bio?: string;
    role?: 'user' | 'business';
    avatar?: string;
    businessCategory?: string;
  }): User => {
    const isEmail = contactData.emailOrPhone.includes('@');
    const newId = `contact_${Date.now()}`;
    const avatar =
      contactData.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        contactData.name
      )}&backgroundColor=059669,0284c7,d97706,e11d48,7c3aed`;

    const newContact: User = {
      id: newId,
      name: contactData.name,
      email: isEmail
        ? contactData.emailOrPhone
        : `${contactData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: !isEmail ? contactData.emailOrPhone : '+92 300 1234567',
      country: 'PK',
      status: 'active',
      createdAt: Date.now(),
      avatar,
      bio: contactData.bio || 'Hey there! I am using MyChat.',
      username: contactData.name.toLowerCase().replace(/\s+/g, '_'),
      role: contactData.role || 'user',
      isOnline: true,
      lastSeen: Date.now(),
      verified: contactData.role === 'business',
      businessProfile:
        contactData.role === 'business'
          ? {
              businessName: contactData.name,
              category: contactData.businessCategory || 'Store & Services',
              description: contactData.bio || 'Official Business Account on MyChat',
              email: isEmail ? contactData.emailOrPhone : 'store@business.com',
              website: 'https://mychat-business.example.com',
              workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
              address: 'Commercial Market, Suite 10',
              greetingMessage: `Hello! 👋 Thank you for messaging ${contactData.name}. How can we assist you today?`,
              awayMessage: 'We are currently offline. Leave your order details and we will reply as soon as possible!',
              catalog: [
                {
                  id: `prod_${Date.now()}_1`,
                  name: `${contactData.name} Special Item`,
                  price: '19.99',
                  currency: 'USD',
                  description: 'Featured original item with warranty & instant support',
                  imageUrl:
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
                },
              ],
            }
          : undefined,
    };

    setUsers((prev) => {
      const filtered = prev.filter(
        (u) => u.email !== newContact.email && u.phone !== newContact.phone
      );
      return [...filtered, newContact];
    });

    // Automatically create and select a clean direct conversation with this new contact
    if (currentUser) {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        type: 'direct',
        name: newContact.name,
        avatar: newContact.avatar,
        participants: [currentUser.id, newContact.id],
        unreadCount: { [currentUser.id]: 0 },
        createdAt: Date.now(),
        businessUserId: newContact.role === 'business' ? newContact.id : undefined,
      };
      setChats((prev) => [newChat, ...prev.filter((c) => !c.participants.includes(newContact.id))]);
      setActiveChat(newChat);
    }

    return newContact;
  };

  // Delete Contact
  const deleteContact = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setChats((prev) => prev.filter((c) => !(c.type === 'direct' && c.participants.includes(userId))));
    if (activeChat && activeChat.type === 'direct' && activeChat.participants.includes(userId)) {
      setActiveChat(null);
    }
  };

  // Clear all chats
  const clearAllChats = () => {
    setChats([]);
    setMessages({});
    setActiveChat(null);
  };

  // Reset App completely
  const resetApp = () => {
    try {
      localStorage.removeItem('mychat_user');
      localStorage.removeItem('mychat_all_users');
      localStorage.removeItem('mychat_chats');
      localStorage.removeItem('mychat_messages');
      localStorage.removeItem('mychat_statuses');
      localStorage.removeItem('mychat_calls');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUsers([]);
    setChats([]);
    setMessages({});
    setStatuses([]);
    setCalls([]);
    setActiveChat(null);
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        users,
        registeredAccounts,
        signIn,
        signUp,
        completeProfileSetup,
        checkUsernameAvailable,
        suggestUsernames,
        addContactByUsername,
        changeAdminPasscode,
        loginWithGoogle,
        logout,
        updateProfile,
        activeTab,
        setActiveTab,
        activeChat,
        setActiveChat,
        chats,
        messages,
        sendMessage,
        addReaction,
        starMessage,
        deleteMessage,
        votePoll,
        createChat,
        createGroup,
        createCommunity,
        calls,
        activeCall,
        startCall,
        answerCall,
        endCall,
        toggleCallMute,
        toggleCallCamera,
        toggleCallSpeaker,
        clearCallHistory,
        statuses,
        addStatus,
        viewStatus,
        sendCatalogInquiry,
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        fontSize,
        setFontSize,
        chatWallpaper,
        setChatWallpaper,
        readReceipts,
        setReadReceipts,
        lastSeenPrivacy,
        setLastSeenPrivacy,
        isAppLocked,
        unlockApp,
        pinLockEnabled,
        setPinLockEnabled,
        toggleMuteChat,
        clearChat,
        deleteChat,
        blockUser,
        unblockUser,
        isUserBlocked,
        blockedUserIds,
        submitReport,
        isAdminMode,
        setIsAdminMode,
        adminStats,
        reports,
        auditLogs,
        resolveReport,
        dismissReport,
        toggleUserSuspension,
        updateUserStatus,
        verifyBusinessAccount,
        addContact,
        deleteContact,
        clearAllChats,
        resetApp,
        isOnline,
        isSyncingQueue,
        pendingOfflineCount,
        toggleSimulatedOffline,
        syncOfflineQueue,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
