import React, { useState } from 'react';
import {
  ChatProvider,
  useChat,
} from './context/ChatContext';
import { SplashWelcome } from './components/SplashWelcome';
import { TopAppBar } from './components/TopAppBar';
import { ChatsTab } from './components/ChatsTab';
import { UpdatesTab } from './components/UpdatesTab';
import { CommunitiesTab } from './components/CommunitiesTab';
import { CallsTab } from './components/CallsTab';
import { ChatScreen } from './components/ChatScreen';
import { CallScreenModal } from './components/CallScreenModal';
import { BusinessCatalogModal } from './components/BusinessCatalogModal';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { SearchModal } from './components/SearchModal';
import { CameraModal } from './components/CameraModal';
import { AdminPanel } from './components/AdminPanel';
import { AppLockScreen } from './components/AppLockScreen';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { User, Chat } from './types';
import { Lock, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { isAuthorizedMasterAdmin } from './utils/adminAuth';

const MainAppContent: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    activeChat,
    setActiveChat,
    startCall,
    theme,
    isAdminMode,
    setIsAdminMode,
    isAppLocked,
  } = useChat();

  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [newChatInitialMode, setNewChatInitialMode] = useState<'chat' | 'group' | 'contact'>('contact');
  const [selectedBusinessUser, setSelectedBusinessUser] = useState<User | null>(null);

  // 1. If not authenticated, render the Sign In / Sign Up flow
  if (!currentUser) {
    return <SplashWelcome />;
  }

  // 2. Immediately after signup, redirect to mandatory profile setup screen
  if (!currentUser.isProfileCompleted) {
    return <ProfileSetupModal />;
  }

  // 3. If app PIN lock is active, render AppLockScreen
  if (isAppLocked) {
    return <AppLockScreen />;
  }

  // 4. If in Admin Console mode, render the AdminPanel ONLY if authenticated as authorized master admin
  if (isAdminMode && isAuthorizedMasterAdmin(currentUser)) {
    return <AdminPanel onExit={() => setIsAdminMode(false)} />;
  }

  return (
    <div
      className={`w-full h-screen flex flex-col select-none overflow-hidden ${
        theme === 'dark' ? 'bg-[#0b141a] text-slate-100' : 'bg-[#f0f2f5] text-slate-900'
      }`}
    >
      {/* Top Application Bar */}
      <TopAppBar
        onOpenSettings={() => setShowSettings(true)}
        onOpenNewChat={() => {
          setNewChatInitialMode('chat');
          setShowNewChatModal(true);
        }}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenCamera={() => setShowCameraModal(true)}
      />

      {/* Main App Layout: Responsive Mobile (single screen switch) vs Desktop (split pane) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Primary Navigation Pane */}
        <aside
          className={`flex flex-col h-full border-r ${
            theme === 'dark' ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200'
          } ${
            activeChat
              ? 'hidden md:flex md:w-[380px] lg:w-[420px] shrink-0'
              : 'w-full md:w-[380px] lg:w-[420px] shrink-0'
          }`}
        >
          {activeTab === 'chats' && (
            <ChatsTab
              onSelectChat={(chat) => setActiveChat(chat)}
              onOpenNewChat={() => {
                setNewChatInitialMode('chat');
                setShowNewChatModal(true);
              }}
              onOpenNewGroup={() => {
                setNewChatInitialMode('group');
                setShowNewChatModal(true);
              }}
              onOpenNewCommunity={() => setActiveTab('communities')}
            />
          )}

          {activeTab === 'updates' && <UpdatesTab />}
          {activeTab === 'communities' && <CommunitiesTab />}
          {activeTab === 'calls' && <CallsTab />}
        </aside>

        {/* Right / Secondary Chat Screen Pane */}
        <main
          className={`flex-1 flex flex-col h-full ${
            !activeChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat ? (
            <ChatScreen
              chat={activeChat}
              onBack={() => setActiveChat(null)}
              onStartVoiceCall={(targetUser) => startCall(targetUser, 'voice')}
              onStartVideoCall={(targetUser) => startCall(targetUser, 'video')}
              onViewBusinessCatalog={(businessUser) => setSelectedBusinessUser(businessUser)}
            />
          ) : (
            /* Desktop Welcome Empty State */
            <div
              className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${
                theme === 'dark' ? 'bg-[#111b21]' : 'bg-[#f0f2f5]'
              }`}
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 shadow-inner">
                <MessageSquare className="w-10 h-10" />
              </div>

              <h2
                className={`text-2xl font-bold tracking-tight mb-2 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                }`}
              >
                Download MyChat for Web & Mobile
              </h2>

              <p className="max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Send and receive real-time messages, voice notes, media, and encrypted calls.
                Sign in with your Google Account anytime without sharing your phone number or Google password.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 text-slate-400 text-xs border border-slate-700/50">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>End-to-end encrypted messaging</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <CallScreenModal />

      {selectedBusinessUser && (
        <BusinessCatalogModal
          businessUser={selectedBusinessUser}
          onClose={() => setSelectedBusinessUser(null)}
        />
      )}

      {showNewChatModal && (
        <NewChatModal
          initialMode={newChatInitialMode}
          onClose={() => setShowNewChatModal(false)}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setShowNewChatModal(false);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setShowSearchModal(false);
          }}
        />
      )}

      {showCameraModal && (
        <CameraModal
          onClose={() => setShowCameraModal(false)}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            setShowCameraModal(false);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <MainAppContent />
    </ChatProvider>
  );
}
