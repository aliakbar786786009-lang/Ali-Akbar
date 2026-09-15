import React, { useState } from 'react';
import {
  Camera,
  Search,
  MoreVertical,
  ShieldAlert,
  Moon,
  Sun,
  Globe,
  Settings,
  UserPlus,
  Users,
  Building2,
  Lock,
  LogOut,
  X,
  Terminal,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { isAuthorizedMasterAdmin } from '../utils/adminAuth';
import { AdminPasscodeModal } from './AdminPasscodeModal';

interface TopAppBarProps {
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenCamera: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenNewChat,
  onOpenSettings,
  onOpenSearch,
  onOpenCamera,
}) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    isAdminMode,
    setIsAdminMode,
    chats,
    logout,
    isOnline,
    isSyncingQueue,
    pendingOfflineCount,
    toggleSimulatedOffline,
  } = useChat();

  const [showMenu, setShowMenu] = useState(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState(false);

  const isMasterAdmin = isAuthorizedMasterAdmin(currentUser);

  // Total unread messages for current user
  const totalUnread = chats.reduce((acc, c) => {
    if (currentUser && c.unreadCount[currentUser.id]) {
      return acc + c.unreadCount[currentUser.id];
    }
    return acc;
  }, 0);

  const tabs = [
    { id: 'chats' as const, label: language === 'ur' ? 'چیٹس' : 'Chats', badge: totalUnread },
    { id: 'updates' as const, label: language === 'ur' ? 'اسٹیٹس' : 'Updates', badge: 0 },
    { id: 'communities' as const, label: language === 'ur' ? 'کمیونٹیز' : 'Communities', badge: 0 },
    { id: 'calls' as const, label: language === 'ur' ? 'کالز' : 'Calls', badge: 0 },
  ];

  return (
    <header
      id="top-app-bar"
      className={`sticky top-0 z-30 transition-colors ${
        theme === 'dark' ? 'bg-[#111b21] border-[#222e35] text-slate-100' : 'bg-[#008069] text-white shadow-md'
      } border-b`}
    >
      {/* Upper bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">MyChat</h1>
            <span className={`text-[10px] font-medium tracking-wide ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-100'}`}>
              Encrypted Private Messaging
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Connection Status / Offline Queue Toggle Badge */}
          <button
            id="btn-connection-status"
            onClick={toggleSimulatedOffline}
            title={
              isSyncingQueue
                ? 'Syncing offline messages with Firebase Cloud...'
                : isOnline
                ? 'Online Mode: Click to test Offline Queue in IndexedDB'
                : 'Offline Mode: Click to reconnect and sync messages to Firebase'
            }
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-xs ${
              isSyncingQueue
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 animate-pulse'
                : isOnline
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-amber-500/25 text-amber-200 border border-amber-500/40 hover:bg-amber-500/35'
            }`}
          >
            {isSyncingQueue ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />
                <span className="hidden sm:inline">Syncing</span>
              </>
            ) : isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-semibold">
                  {pendingOfflineCount > 0 ? `${pendingOfflineCount} Queued` : 'Offline'}
                </span>
              </>
            )}
          </button>

          {/* Admin Panel Switcher - Strictly gated to authorized admin email */}
          {isMasterAdmin && (
            <button
              id="btn-toggle-admin-panel"
              title="Restricted Master Console"
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                } else {
                  setShowAdminPasscodeModal(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isAdminMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAdminMode ? 'Exit Console' : 'Admin Core'}</span>
            </button>
          )}

          {/* Camera Button */}
          <button
            id="btn-open-camera"
            onClick={onOpenCamera}
            title="Camera"
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#202c33] text-slate-300' : 'hover:bg-emerald-700 text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Search Button */}
          <button
            id="btn-search-chats"
            onClick={onOpenSearch}
            title="Search"
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#202c33] text-slate-300' : 'hover:bg-emerald-700 text-white'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            title="Toggle theme"
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#202c33] text-amber-300' : 'hover:bg-emerald-700 text-white'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              id="btn-more-options"
              onClick={() => setShowMenu(!showMenu)}
              title="More options"
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-[#202c33] text-slate-300' : 'hover:bg-emerald-700 text-white'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl z-50 py-1.5 text-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#202c33] border-[#2f3b43] text-slate-200'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  {/* Current user badge */}
                  <div className={`px-3 py-2.5 border-b flex items-center gap-2.5 ${theme === 'dark' ? 'border-[#2a373f]' : 'border-slate-100'}`}>
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={currentUser?.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                    />
                    <div className="overflow-hidden text-left">
                      <div className="font-semibold text-xs truncate">{currentUser?.name}</div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate">
                        @{currentUser?.username}
                      </div>
                    </div>
                  </div>

                  {/* Admin Console entry ONLY visible to authorized admin */}
                  {isMasterAdmin && (
                    <button
                      id="btn-menu-admin-console"
                      onClick={() => {
                        setShowMenu(false);
                        if (isAdminMode) {
                          setIsAdminMode(false);
                        } else {
                          setShowAdminPasscodeModal(true);
                        }
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                    >
                      <Terminal className="w-4 h-4" />
                      <span className="font-semibold">{isAdminMode ? 'Exit Admin Console' : 'Master Admin Console'}</span>
                    </button>
                  )}

                  <button
                    id="btn-menu-settings"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{language === 'ur' ? 'سیٹنگز' : 'Settings'}</span>
                  </button>

                  <div className={`border-t my-1 ${theme === 'dark' ? 'border-[#2a373f]' : 'border-slate-100'}`} />

                  <button
                    id="btn-menu-logout"
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation row */}
      <nav className="flex items-center px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all relative ${
                isActive
                  ? theme === 'dark'
                    ? 'text-emerald-400'
                    : 'text-white'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {tab.label}
                {tab.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>

              {isActive && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.75 ${
                    theme === 'dark' ? 'bg-emerald-400' : 'bg-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>
      {/* Admin Passcode Authentication Modal */}
      {showAdminPasscodeModal && (
        <AdminPasscodeModal
          isOpen={showAdminPasscodeModal}
          onClose={() => setShowAdminPasscodeModal(false)}
          onSuccess={() => {
            setShowAdminPasscodeModal(false);
            setIsAdminMode(true);
          }}
        />
      )}
    </header>
  );
};
