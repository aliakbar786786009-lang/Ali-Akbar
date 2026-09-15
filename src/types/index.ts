export type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'video'
  | 'document'
  | 'location'
  | 'poll'
  | 'catalog_item'
  | 'system';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
}

export interface CatalogItemData {
  id: string;
  name: string;
  price: string;
  currency: string;
  imageUrl: string;
  description: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  duration?: number; // for audio/video in seconds
  fileName?: string;
  fileSize?: string;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  pollData?: PollData;
  catalogData?: CatalogItemData;
  isStarred?: boolean;
  status: MessageStatus;
  timestamp: number;
  isEdited?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  username: string;
  phone?: string;
  country: string;
  role: 'user' | 'business' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  createdAt?: number;
  isOnline: boolean;
  lastSeen: number;
  verified?: boolean;
  isSuspended?: boolean;
  isProfileCompleted?: boolean;
  businessProfile?: {
    businessName: string;
    category: string;
    description: string;
    email: string;
    website: string;
    workingHours: string;
    address: string;
    greetingMessage?: string;
    awayMessage?: string;
    catalog?: CatalogItemData[];
  };
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'community';
  name: string;
  avatar: string;
  description?: string;
  participants: string[]; // user IDs
  groupAdmins?: string[];
  lastMessage?: Message;
  unreadCount: Record<string, number>; // userId -> count
  isPinned?: boolean;
  isMuted?: boolean;
  businessUserId?: string;
  labels?: string[]; // e.g. 'Customer', 'Lead', 'Family'
  communityChannels?: {
    id: string;
    name: string;
    isAnnouncement?: boolean;
  }[];
  createdAt: number;
}

export interface StatusUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image';
  content: string;
  mediaUrl?: string;
  bgColor?: string;
  timestamp: number;
  viewers: {
    userId: string;
    name: string;
    avatar: string;
    time: number;
  }[];
}

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  status: 'completed' | 'missed' | 'declined';
  duration: number; // in seconds
  timestamp: number;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'spam' | 'harassment' | 'impersonation' | 'inappropriate_content' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: number;
  actionTaken?: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: number;
  details: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalGroups: number;
  totalBusinesses: number;
  totalMessagesSent: number;
  totalCallsMade: number;
  pendingReports: number;
  suspendedAccounts: number;
  storageUsageMB: number;
  serverUptimePercent: number;
  serverHealth?: 'optimal' | 'warning' | 'degraded';
}

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  isProfileCompleted: boolean;
  user: User;
}
